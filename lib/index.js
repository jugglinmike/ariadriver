'use strict';
/**
 * The Node.js EventEmitter class.
 *
 * @external EventEmitter
 * @see {@link https://nodejs.org/dist/latest-v10.x/docs/api/events.html#events_class_eventemitter}
 */
const EventEmitter = require('events');

const {Builder, By, Key} = require('selenium-webdriver');

const AriaDriverError = require('./error');
const momentWhen = require('./util/moment-when');

const defaults = {
  url: undefined,
  patience: 1000
};

const selectors = {
  openModals: '[role="dialog"]:not([aria-hidden="true"])'
};
const popupRoles = new Set(['menu', 'listbox', 'tree', 'grid', 'dialog']);

/**
 * An interface for interacting with a web page using the design patterns and
 * widgets defined in the WAI-ARIA Authoring Practices Guide.
 *
 * @see {@link https://www.w3.org/TR/wai-aria-practices-1.1/}
 * @extends external:EventEmitter
 *
 * @param {object} [options]
 * @param {string} [options.url] - location of a running WebDriver server
 * @param {number} [options.patience] - number of milliseconds to wait for
 *                                      expected UI events before reporting a
 *                                      timeout error (default: 1000).
 */
class AriaDriver extends EventEmitter {
  constructor(options) {
    super();

    options = Object.assign({}, defaults, options);

    this._patience = options.patience;

    this._driver = new Builder()
      .forBrowser('firefox')
      .usingServer(options.url)
      .build();
  }

  async getSessionId() {
    const session = await this._driver.getSession();
    return session.getId();
  }

  /**
   * Navigate the browser to the specified URL.
   *
   * @param {string} url - the desired location
   */
  get(url) {
    return this._driver.get(url);
  }

  async count(locator) {
    return (await this._driver.findElements(By.css(locator))).length;
  }

  async _findOne(locator) {
    const targets = await this._driver.findElements(By.css(locator));

    if (targets.length === 0) {
      throw new AriaDriverError('ARIADRIVER-ELEMENT-NOT-FOUND', [locator]);
    }

    if (targets.length > 1) {
      this.emit('warning', new AriaDriverError('ARIADRIVER-AMBIGUOUS-REFERENCE', [locator]));
    }

    const tabIndex = await targets[0].getAttribute('tabindex');
    if (parseInt(tabIndex, 10) > 0) {
      this.emit('warning', new AriaDriverError(
        'ARIADRIVER-POOR-SEMANTICS',
        null,
        `The tabindex property is set to ${tabIndex}, but it should not exceed 0.`,
        'https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_general_between'
      ));
    }

    return targets[0];
  }

  /**
   * Grant focus to the specified element.
   *
   * @param {string} locator - CSS selector describing an element on the page
   */
  async touch(locator) {
    await this._touchElement(locator, await this._findOne(locator));
  }

  async _touchElement(locator, target) {
    // UAs that are not screen readers may accept focus on elements that bear
    // the `aria-hidden` attribute but which are visually rendered. This makes
    // an explicit verification necessary.
    if (await target.getAttribute('aria-hidden') === 'true') {
      throw new AriaDriverError('ARIADRIVER-ELEMENT-UNFOCUSABLE', [locator]);
    }

    /* istanbul ignore next */
    const accepted = await this._driver.executeScript(function() {
      // jshint browser: true
      arguments[0].focus();
      return document.activeElement === arguments[0];
    }, target);

    if (!accepted) {
      throw new AriaDriverError('ARIADRIVER-ELEMENT-UNFOCUSABLE', [locator]);
    }

    await target.sendKeys(Key.ENTER);
  }

  /**
   * Open an interactive popup element as described by WAI-ARIA 1.1.
   *
   * @param {string} locator - a CSS selector describing the element to touch
   *                           in order to open the popup. This element must
   *                           bear the `aria-haspopup` attribute, and its
   *                           value must describe the role of the popup
   *                           element.
   *
   * @see {@link https://www.w3.org/TR/wai-aria-1.1/#aria-haspopup}
   * @see {@link https://www.w3.org/TR/wai-aria-1.1/#usage_intro}
   */
  async openPopup(locator) {
    const target = await this._findOne(locator);
    const attrValue = await target.getAttribute('aria-haspopup');
    // > To provide backward compatibility with ARIA 1.0 content, user agents
    // > MUST treat an `aria-haspopup` value of true as equivalent to a value
    // > of `menu`.
    //
    // https://www.w3.org/TR/wai-aria-1.1/#aria-haspopup
    const role = attrValue === "true" ? "menu" : attrValue;

    if (!popupRoles.has(role)) {
        throw new AriaDriverError(
          'ARIADRIVER-INVALID-MARKUP',
          null,
          'Specify a valid value for the `aria-haspopup` attribute',
          'https://www.w3.org/TR/wai-aria-1.1/#aria-haspopup'
        );
    }

    const popupLocator = `[role="${role}"]:not([aria-hidden="true"])`;
    const count = () => this.count(popupLocator);
    const initialCount = await count();

    await this._touchElement(locator, target);

    const hasOpened = async () => (await count()) === initialCount + 1;
    await momentWhen(`${role} popup has opened`, hasOpened, this._patience);
  }

  /**
   * Open a dialog as described by WAI-ARIA Authoring Practices 1.1.
   *
   * @param {string} locator - a CSS selector describing the element to touch
   *                           in order to open the modal.
   *
   * @see {@link https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal}
   */
  async openModal(locator) {
    await this.openPopup(locator);

    const dialogs =
      await this._driver.findElements(By.css(selectors.openModals));

    const attrQueries =
      dialogs.map((dialog) => dialog.getAttribute('aria-modal'));
    const usesAttr = (await Promise.all(attrQueries))
      .some((value) => value === 'true');

    if (!usesAttr) {
      const warning = new AriaDriverError(
        'ARIADRIVER-POOR-SEMANTICS',
        null,
        'Specify the `aria-modal` attribute introduced in ARIA 1.1',
        'https://www.w3.org/TR/wai-aria-practices-1.1/#h-dialog_modal'
      );

      this.emit('warning', warning);
    }
  }

  /**
   * Close the currently-active dialog as described by WAI-ARIA Authoring
   * Practices 1.1. This method will fail in the absence of such a dialog.
   *
   * @see {@link https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal}
   */
  async closeModal() {
    const count = () => this.count(selectors.openModals);
    const initialCount = await count();

    if (initialCount === 0) {
      throw new AriaDriverError('ARIADRIVER-ELEMENT-NOT-FOUND', [selectors.openModals]);
    }

    /* istanbul ignore next */
    const target = await this._driver.executeScript(() => { return document.activeElement || document.body; });
    await target.sendKeys(Key.ESCAPE);

    const hasClosed = async () => (await count()) === initialCount - 1;

    await momentWhen('modal dialog has closed', hasClosed, this._patience);
  }

  quit() {
    return this._driver.quit();
  }
}

module.exports = AriaDriver;
