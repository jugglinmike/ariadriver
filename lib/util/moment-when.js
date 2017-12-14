'use strict';

const {TimeoutError} = require('../errors');

module.exports = async (description, probe, duration) => {
  const start = Date.now();
  
  do {
    if (await probe()) {
      return;
    }
  } while (Date.now() - start < duration)

  throw new TimeoutError(duration, description);
};
