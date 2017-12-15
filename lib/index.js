'use strict';
const EventEmitter = require('events');

const {Builder, By, Key} = require('selenium-webdriver');

const Sa11yError = require('./error');
const momentWhen = require('./util/moment-when');

const defaults = {
  url: undefined,
  patience: 1000
};

const selectors = {
  openModals: '[role="dialog"]:not([aria-hidden="true"])'
};
const popupRoles = new Set(['menu', 'listbox', 'tree', 'grid', 'dialog']);

module.exports = class Sa11y extends EventEmitter {
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

  get(url) {
    return this._driver.get(url);
  }

  async count(locator) {
    return (await this._driver.findElements(By.css(locator))).length;
  }

  async _findOne(locator) {
    const targets = await this._driver.findElements(By.css(locator));

    if (targets.length === 0) {
      throw new Sa11yError('SA11Y-ELEMENT-NOT-FOUND', [locator]);
    }

    if (targets.length > 1) {
      this.emit('warning', new Sa11yError('SA11Y-AMBIGUOUS-REFERENCE', [locator]));
    }

    return targets[0];
  }

  async touch(locator) {
    return this._touchElement(locator, await this._findOne(locator));
  }

  async _touchElement(locator, target) {
    // UAs that are not screen readers may accept focus on elements that bear
    // the `aria-hidden` attribute but which are visually rendered. This makes
    // an explicit verification necessary.
    if (await target.getAttribute('aria-hidden') === 'true') {
      throw new Sa11yError('SA11Y-ELEMENT-UNFOCUSABLE', [locator]);
    }

    const accepted = await this._driver.executeScript(function() {
      arguments[0].focus();
      return document.activeElement === arguments[0];
    }, target);

    if (!accepted) {
      throw new Sa11yError('SA11Y-ELEMENT-UNFOCUSABLE', [locator]);
    }

    await target.sendKeys(Key.ENTER);
  }

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
        throw new Sa11yError(
          'SA11Y-INVALID-MARKUP',
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

  async openModal(locator) {
    await this.openPopup(locator)

    const dialogs =
      await this._driver.findElements(By.css(selectors.openModals));

    const attrQueries =
      dialogs.map((dialog) => dialog.getAttribute('aria-modal'));
    const usesAttr = (await Promise.all(attrQueries))
      .some((value) => value === 'true');

    if (!usesAttr) {
      const warning = new Sa11yError(
        'SA11Y-POOR-SEMANTICS',
        null,
        'Specify the `aria-modal` attribute intdoduced in ARIA 1.1',
        'https://www.w3.org/TR/wai-aria-practices-1.1/#h-dialog_modal'
      );

      this.emit('warning', warning);
    }
  }

  async closeModal() {
    const count = () => this.count(selectors.openModals);
    const initialCount = await count();

    if (initialCount === 0) {
      throw new Sa11yError('SA11Y-ELEMENT-NOT-FOUND', [selectors.openModals]);
    }

    const target = await this._driver.executeScript(() => { return document.activeElement || document.body; });
    await target.sendKeys(Key.ESCAPE);

    const hasClosed = async () => (await count()) === initialCount - 1;

    await momentWhen('modal dialog has closed', hasClosed, this._patience);
  }

  quit() {
    return this._driver.quit();
  }
};
