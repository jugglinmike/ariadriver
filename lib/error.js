'use strict';

const errors = require('./errors');

function expand(code, data, recommendation, reference) {
  const error = errors[code];
  let count = 0;

  if (!recommendation) {
    recommendation = error[1];
  }

  if (!reference) {
    reference = error[2];
  }

  return [
      error[0].replace(/%s/g, () => data[count++]),
      recommendation ? 'Recommendation: ' + recommendation : null,
      reference ? 'Reference: ' + reference : null
    ]
    .filter((line) => line)
    .join('\n');
}

module.exports = class Sa11yError extends Error {
  constructor(code, data, recommendation, reference) {
    super();
    this.code = code;
    this.message = expand(code, data, recommendation, reference);
  }

  get name() { return 'Sa11yError'; }
};
