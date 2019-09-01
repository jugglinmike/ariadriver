'use strict';

const Sa11yError = require('../error');

module.exports = async (description, probe, duration) => {
  const start = Date.now();

  do {
    if (await probe()) {
      return;
    }
  } while (Date.now() - start < duration);

  throw new Sa11yError('SA11Y-TIMEOUT', [duration, description]);
};
