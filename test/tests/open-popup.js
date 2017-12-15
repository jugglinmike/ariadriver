'use strict';

const { assert } = require('chai');
const { WebDriver: { attachToSession }, By } = require('selenium-webdriver');
const { Executor, HttpClient } = require('selenium-webdriver/http');

const Sa11y = require('../..');
const createServers = require('../tools/create-servers');

suite('#openPopup', () => {
  let sa11y, webdriver, baseUrl, closeServers;
  const countOpen = async () => {
    const selector ='[role]:not([aria-hidden="true"])';
    const els = await webdriver.findElements(By.css(selector));
    return els.length;
  };

  suiteSetup(async () => {
    const servers = await createServers();
    baseUrl = servers.fileUrl;
    closeServers = servers.close;
    sa11y = new Sa11y({ url: servers.geckodriverUrl });

    const sessionId = await sa11y.getSessionId();
    const executor = new Executor(new HttpClient(servers.geckodriverUrl));
    webdriver = attachToSession(executor, sessionId);
  });

  suiteTeardown(async () => {
    await sa11y.quit();
    await closeServers();
  });

  setup(function() {
    this.warnings = [];

    sa11y.on('warning', (warning) => this.warnings.push(warning.code));

    return sa11y.get(baseUrl + '/fixtures/popups.html');
  });

  teardown(function() {
    sa11y.removeAllListeners();

    assert.deepEqual(this.warnings, [], 'No unrecognized warnings');
  });

  suite('valid popups', () => {
    test('true', async () => {
      await sa11y.openPopup('[aria-label="Value true"]');
      assert.equal(await countOpen(), 1);
    });

    test('menu', async () => {
      await sa11y.openPopup('[aria-label="Value menu"]');
      assert.equal(await countOpen(), 1);
    });

    test('listbox', async () => {
      await sa11y.openPopup('[aria-label="Value listbox"]');
      assert.equal(await countOpen(), 1);
    });

    test('tree', async () => {
      await sa11y.openPopup('[aria-label="Value tree"]');
      assert.equal(await countOpen(), 1);
    });

    test('grid', async () => {
      await sa11y.openPopup('[aria-label="Value grid"]');
      assert.equal(await countOpen(), 1);
    });

    test('dialog', async () => {
      await sa11y.openPopup('[aria-label="Value dialog"]');
      assert.equal(await countOpen(), 1);
    });

    test('slow popups', async () => {
      await sa11y.openPopup('[aria-label="Slow"]');
      assert.equal(await countOpen(), 1);
    });
  });

  suite('invalid popups', () => {
    const assertFailure = async (locator, code) => {
      try {
        await sa11y.openPopup(locator);
      } catch (err) {
        assert(err);
        assert.equal(err.name, 'Sa11yError');
        assert.equal(err.code, code);
        return;
      }
      assert(false, 'Expected an error, but no error was thrown');
    };

    test(
      'value: false',
      () => assertFailure('[aria-label="False"]', 'SA11Y-INVALID-MARKUP')
    );

    test(
      'Invalid value',
      () => assertFailure('[aria-label="Invalid value"]', 'SA11Y-INVALID-MARKUP')
    );

    test(
      'Omitted value',
      () => assertFailure('[aria-label="Omitted value"]', 'SA11Y-INVALID-MARKUP')
    );

    test(
      'Attribute omitted',
      () => assertFailure('[aria-label="Attribute omitted"]', 'SA11Y-INVALID-MARKUP')
    );

    test(
      'Invalid value',
      () => assertFailure('[aria-label="Invalid value"]', 'SA11Y-INVALID-MARKUP')
    );

    test(
      'Inaccurate valie',
      () => assertFailure('[aria-label="Inaccurate value"]', 'SA11Y-TIMEOUT')
    );
  });
});
