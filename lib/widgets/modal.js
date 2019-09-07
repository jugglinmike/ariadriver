'use strict';

const {By, Key} = require('selenium-webdriver');

const AriaDriverError = require('../error');
const momentWhen = require('../util/moment-when');

const selectors = {
  openModals: '[role="dialog"]:not([aria-hidden="true"])'
};

/**
 * @lends AriaDriver.prototype
 */
module.exports = {
  /**
   * Open a {@link https://w3c.github.io/aria-practices/#dialog_modal dialog}.
   *
   * @param {string} selector - a CSS selector describing the element to {@link
   *                            AriaDriver#use use} in order to open the modal.
   *
   * @see {@link https://w3c.github.io/aria-practices/#dialog_modal}
   */
  async openModal(selector) {
    await this.openPopup(selector);

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
  },

  /**
   * Close the currently-active {@link
   * https://w3c.github.io/aria-practices/#dialog_modal dialog}
   *
   * @see {@link https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal}
   *
   * @throws When there is no active dialog
   */
  async closeModal() {
    const count = () => this.count(selectors.openModals);
    const initialCount = await count();

    if (initialCount === 0) {
      throw new AriaDriverError('ARIADRIVER-ELEMENT-NOT-FOUND', [selectors.openModals]);
    }

    /* istanbul ignore next */
    const target = await this._driver.executeScript(() => {
      // jshint browser: true
      return document.activeElement || document.body;
    });
    await target.sendKeys(Key.ESCAPE);

    const hasClosed = async () => (await count()) === initialCount - 1;

    await momentWhen('modal dialog has closed', hasClosed, this._patience);
  }
};
