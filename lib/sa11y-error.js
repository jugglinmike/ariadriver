'use strict';

module.exports = class Sa11yError extends Error {
  get name() {
	return 'Sa11yError';
  }
};
