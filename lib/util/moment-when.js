'use strict';

const {Sa11yError} = require('../errors');

module.exports = async (description, probe, timeout) => {
  const start = Date.now();
  
  do {
    if (await probe()) {
      return;
    }
  } while (Date.now() - start < timeout)

  throw new Sa11yError(
    `Timeout out waiting ${timeout} milliseconds for moment when ${description}`
  );
};
