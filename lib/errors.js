'use strict';

const Sa11yError = exports.Sa11yError = class Sa11yError extends Error {
  constructor(message) {
    super();
    this._baseMessage = message;

    this.references = [];
  }

  get name() { return 'Sa11yError'; }

  get message() {
    let message = this._baseMessage;

    if (this.references.length) {
      message += '\n\nReferences:\n' + this.references.join('\n');
    }

    return message;
  }

  addReference(reference) {
    this.references.push(reference);
  }
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

    this.addReference('https://www.w3.org/TR/html5/editing.html#sequential-focus-navigation-and-the-tabindex-attribute');
  }

  get code() { return 'SA11Y-ELEMENT-UNFOCUSABLE'; }
};

exports.TimeoutError = class TimeoutError extends Sa11yError {
  constructor(duration, condition) {
    super(`Timeout waiting ${duration} milliseconds for mement when ${condition}.`);
  }

  get code() { return 'SA11Y-TIMEOUT'; }
};

exports.SemanticError = class SemanticError extends Sa11yError {
  constructor(recommendation) {
    const baseMessage =
      'Markup does not accurately reflect the semantic value.\n' +
      'Recommendation: ' + recommendation;
    super(baseMessage);
  }

  get code() { return 'SA11Y-POOR-SEMANTICS'; }
};
