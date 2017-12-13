'use strict';

const Sa11yError = require('./sa11y-error');

module.exports = function(value, message) {
  if (!value) {
    throw new Sa11yError(message);
  }
};
