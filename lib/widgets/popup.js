'use strict';

const popupRoles = new Set(['menu', 'listbox', 'tree', 'grid', 'dialog']);

const AriaDriverError = require('../error');
const momentWhen = require('../util/moment-when');

/**
 * @lends AriaDriver.prototype
 */
module.exports = {
  /**
   * Open {@link https://w3c.github.io/aria/#aria-haspopup an interactive popup
   * element}.
   *
   * @param {string} selector - a CSS selector describing the element to {@link
   *                            AriaDriver#use use} in order to open the popup.
   *
   * @see {@link https://w3c.github.io/aria/#aria-haspopup}
   * @see {@link https://www.w3.org/TR/wai-aria-1.1/#usage_intro}
   *
   * @throws When {@link https://w3c.github.io/aria/#aria-haspopup the
   *         aria-haspopup attribute} of the target element is unspecified or
   *         invalid
   * @throws When the number of visible popups does not increase within {@link
   *         AriaDriver#patience the "patience" duration}
   */
  async openPopup(selector) {
    const target = await this._findOne(selector);
    const attrValue = await target.getAttribute('aria-haspopup');
    // > To provide backward compatibility with ARIA 1.0 content, user agents
    // > MUST treat an `aria-haspopup` value of true as equivalent to a value
    // > of `menu`.
    //
    // https://www.w3.org/TR/wai-aria-1.1/#aria-haspopup
    const role = attrValue === 'true' ? 'menu' : attrValue;

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

    await this._use(selector, target);

    const hasOpened = async () => (await count()) === initialCount + 1;
    await momentWhen(`${role} popup has opened`, hasOpened, this._patience);
  }
};
