'use strict';

const {Sa11yError} = require('./errors');

module.exports = function(value, message) {
  if (!value) {
    throw new Sa11yError(message);
  }
};
