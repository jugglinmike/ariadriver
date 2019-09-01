'use strict';

const AriaDriverError = require('../error');

module.exports = async (description, probe, duration) => {
  const start = Date.now();

  do {
    if (await probe()) {
      return;
    }
  } while (Date.now() - start < duration);

  throw new AriaDriverError('ARIADRIVER-TIMEOUT', [duration, description]);
};
