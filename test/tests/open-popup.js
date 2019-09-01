'use strict';

const { assert } = require('chai');
const { WebDriver: { attachToSession }, By } = require('selenium-webdriver');
const { Executor, HttpClient } = require('selenium-webdriver/http');

const AriaDriver = require('../..');
const createServers = require('../tools/create-servers');

suite('#openPopup', () => {
  let ariadriver, webdriver, baseUrl, closeServers;
  const countOpen = async () => {
    const selector ='[role]:not([aria-hidden="true"])';
    const els = await webdriver.findElements(By.css(selector));
    return els.length;
  };

  suiteSetup(async () => {
    const servers = await createServers();
    baseUrl = servers.fileUrl;
    closeServers = servers.close;
    ariadriver = new AriaDriver({ url: servers.geckodriverUrl });

    const sessionId = await ariadriver.getSessionId();
    const executor = new Executor(new HttpClient(servers.geckodriverUrl));
    webdriver = attachToSession(executor, sessionId);
  });

  suiteTeardown(async () => {
    await ariadriver.quit();
    await closeServers();
  });

  setup(function() {
    this.warnings = [];

    ariadriver.on('warning', (warning) => this.warnings.push(warning.code));

    return ariadriver.get(baseUrl + '/fixtures/popups.html');
  });

  teardown(function() {
    ariadriver.removeAllListeners();

    assert.deepEqual(this.warnings, [], 'No unrecognized warnings');
  });

  suite('valid popups', () => {
    test('true', async () => {
      await ariadriver.openPopup('[aria-label="Value true"]');
      assert.equal(await countOpen(), 1);
    });

    test('menu', async () => {
      await ariadriver.openPopup('[aria-label="Value menu"]');
      assert.equal(await countOpen(), 1);
    });

    test('listbox', async () => {
      await ariadriver.openPopup('[aria-label="Value listbox"]');
      assert.equal(await countOpen(), 1);
    });

    test('tree', async () => {
      await ariadriver.openPopup('[aria-label="Value tree"]');
      assert.equal(await countOpen(), 1);
    });

    test('grid', async () => {
      await ariadriver.openPopup('[aria-label="Value grid"]');
      assert.equal(await countOpen(), 1);
    });

    test('dialog', async () => {
      await ariadriver.openPopup('[aria-label="Value dialog"]');
      assert.equal(await countOpen(), 1);
    });

    test('slow popups', async () => {
      await ariadriver.openPopup('[aria-label="Slow"]');
      assert.equal(await countOpen(), 1);
    });
  });

  suite('invalid popups', () => {
    const assertFailure = async (locator, code) => {
      try {
        await ariadriver.openPopup(locator);
      } catch (err) {
        assert(err);
        assert.equal(err.name, 'AriaDriverError');
        assert.equal(err.code, code);
        return;
      }
      assert(false, 'Expected an error, but no error was thrown');
    };

    test(
      'value: false',
      () => assertFailure('[aria-label="False"]', 'ARIADRIVER-INVALID-MARKUP')
    );

    test(
      'Invalid value',
      () => assertFailure('[aria-label="Invalid value"]', 'ARIADRIVER-INVALID-MARKUP')
    );

    test(
      'Omitted value',
      () => assertFailure('[aria-label="Omitted value"]', 'ARIADRIVER-INVALID-MARKUP')
    );

    test(
      'Attribute omitted',
      () => assertFailure('[aria-label="Attribute omitted"]', 'ARIADRIVER-INVALID-MARKUP')
    );

    test(
      'Invalid value',
      () => assertFailure('[aria-label="Invalid value"]', 'ARIADRIVER-INVALID-MARKUP')
    );

    test(
      'Inaccurate valie',
      () => assertFailure('[aria-label="Inaccurate value"]', 'ARIADRIVER-TIMEOUT')
    );
  });
});
