'use strict';
const child_process = require('child_process');
const pollHttp = require('./poll-http');

const url = 'http://localhost:4444';

module.exports = function() {
  const child = child_process.spawn('geckodriver');
  const close = () => {
    return new Promise((resolve) => {
      child.kill();

      child.on('close', resolve);
    });
  };

  return new Promise((resolve, reject) => {
    pollHttp('http://localhost:4444/status')
      .then(() => resolve({close, url}), reject);
  });
};
