'use strict';

const createGeckodriverServer = require('./create-geckodriver-server');
const createFileServer = require('./create-file-server');

module.exports = () => {
  return Promise.all([createGeckodriverServer(), createFileServer()])
    .then(([geckodriverServer, fileServer]) => {
      const closeAll = () => {
        return Promise.all([geckodriverServer.close(), fileServer.close()]);
      };

      return {
        geckodriverUrl: geckodriverServer.url,
        fileUrl: fileServer.url,
        close: closeAll
      };
    });
};
