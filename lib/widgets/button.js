'use strict';

const AriaDriverError = require('../error');
const momentWhen = require('../util/moment-when');
const inferRole = require('../util/infer-role');

/**
 * @lends AriaDriver.prototype
 */
module.exports = {
  /**
   * Operate a {@link https://w3c.github.io/aria-practices/#button button}.
   * This method waits for "toggle" buttons to change state.
   *
   * @param {string} selector - a CSS selector describing the element to {@link
   *                            AriaDriver#use use} in order to operate the
   *                            button.
   *
   * @throws When the target element does not have an {@link
   *         https://w3c.github.io/accname/ accessible name}
   * @throws When the target element is not {@link
   *         https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element
   *         a button element} and does not bear {@link
   *         https://w3c.github.io/aria/#button the button role}
   * @throws When a "toggle" button does not change state within {@link
   *         AriaDriver#patience the "patience" duration}
   */
  async pushButton(selector) {
    const target = await this._findOne(selector);
    /* istanbul ignore next */
    const {
      ariaPressed, ariaLabel, ariaLabelledBy, innerText
    } = await this._driver.executeScript(function() {
      return {
        ariaPressed: arguments[0].getAttribute('aria-pressed'),
        ariaLabel: arguments[0].getAttribute('aria-label'),
        ariaLabelledBy: arguments[0].getAttribute('aria-labelledby'),
        innerText: arguments[0].innerText
      };
    }, target);

    if (!innerText && !ariaLabel && !ariaLabelledBy) {
      throw new AriaDriverError(
        'ARIADRIVER-INVALID-MARKUP',
        null,
        'Ensure that the target element has an accessible name',
        'https://w3c.github.io/accname/'
      );
    }

    const role = await this._driver.executeScript(inferRole, target);

    if (role !== 'button') {
      throw new AriaDriverError(
        'ARIADRIVER-INVALID-MARKUP',
        null,
        'Target element is not a button',
        'https://w3c.github.io/aria-practices/#button'
      );
    }

    await this._use(selector, target);

    if (!/^(true|false)$/i.test(ariaPressed)) {
      return;
    }
    const expectedAriaPressed = ariaPressed === 'true' ? 'false' : 'true';

    const hasToggled = async () => {
      return expectedAriaPressed === await target.getAttribute('aria-pressed');
    };
    await momentWhen('toggle button state changes', hasToggled, this._patience);
  }
};
