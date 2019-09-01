'use strict';

const http = require('http');
const path = require('path');

const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');

module.exports = function() {
  const serve = serveStatic(path.resolve(__dirname, '..'));
  const server = http.createServer((req, res) => {
    serve(req, res, finalhandler(req, res));
  });

  const close = () => {
    return new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  };

  return new Promise((resolve, reject) => {
    server.listen(0, (err) => {
      if (err) {
        reject(err);
        return;
      }
      const url = 'http://localhost:' + server.address().port;

      resolve({ close, url });
    });
  });
};
