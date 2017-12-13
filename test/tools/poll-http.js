'use strict';

const http = require('http');

const test = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject();
        return;
      }

      resolve();
    }).on('error', reject);
  });
};

module.exports = async (url) => {
  while (true) {
    try {
      await test(url);
      return;
    } catch ({}) {}
  }
};
