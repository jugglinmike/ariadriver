'use strict';

const Sa11yError = exports.Sa11yError = class Sa11yError extends Error {
  constructor(message) {
    super();
    this.message = message;

    if (this.references) {
      this.message += '\n\nReferences:\n' + this.references.join('\n');
    }
  }

  get name() { return 'Sa11yError'; }
};

exports.AmbiguousReferenceError = class AmbiguousReferenceError extends Sa11yError {
  constructor(locator) {
	super(`Ambiguous element reference: "${locator}"`);
  }

  get code() { return 'SA11Y-AMBIGUOUS-REFERENCE'; }
};

exports.ElementNotFoundError = class ElementNotFoundError extends Sa11yError {
  constructor(locator) {
    super(`No element found at "${locator}".`);
  }

  get code() { return 'SA11Y-ELEMENT-NOT-FOUND'; }
};

exports.ElementUnfocusableError = class ElementUnfocusableError extends Sa11yError {
  constructor(locator) {
    super(`Element at "${locator}" cannot receive focus.`);
  }

  get code() { return 'SA11Y-ELEMENT-UNFOCUSABLE'; }

  get references() {
    return [
      'https://www.w3.org/TR/html5/editing.html#sequential-focus-navigation-and-the-tabindex-attribute'
    ];
  }
};
