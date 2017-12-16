'use strict';
const { assert } = require('chai');
const { WebDriver: { attachToSession } } = require('selenium-webdriver');
const { Executor, HttpClient } = require('selenium-webdriver/http');

const createServers = require('./create-servers');

module.exports = (createInstance) => {
  const {suiteSetup, setup, teardown, suiteTeardown} = global;
  let baseUrl, closeServers, sa11y, webdriver;

  suiteSetup(async () => {
    const servers = await createServers();
    baseUrl = servers.fileUrl;
    closeServers = servers.close;
    sa11y = createInstance(servers.geckodriverUrl);

    const sessionId = await sa11y.getSessionId();
    const executor = new Executor(new HttpClient(servers.geckodriverUrl));
    webdriver = attachToSession(executor, sessionId);
  });
  suiteTeardown(async () => {
    await sa11y.quit();
    await closeServers();
  });

  setup(function() {
    this.webdriver = webdriver;
	this.baseUrl = baseUrl;
    this.warnings = [];

    sa11y.on('warning', (warning) => this.warnings.push(warning.code));
  });

  teardown(function() {
    sa11y.removeAllListeners();

    assert.deepEqual(this.warnings, [], 'No unrecognized warnings');
  });
};
