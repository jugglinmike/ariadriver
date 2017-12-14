'use strict';

const { assert } = require('chai');
const { WebDriver: { attachToSession }, By } = require('selenium-webdriver');
const { Executor, HttpClient } = require('selenium-webdriver/http');

const Sa11y = require('../..');
const createServers = require('../tools/create-servers');

suite('modal dialogs', () => {
  let sa11y, webdriver, baseUrl, closeServers;
  const countOpen = async () => {
    const selector ='[role="dialog"]:not([aria-hidden="true"])';
    const els = await webdriver.findElements(By.css(selector));
    return els.length;
  };
  const open = async (id) => {
    const initialCount = await countOpen();
    const openBtn = await webdriver.findElement(By.css(`[for="${id}"]`));
    await openBtn.click();
    while (initialCount === await countOpen()) {}
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

    return sa11y.get(baseUrl + '/fixtures/modal-dialogs.html');
  });

  teardown(function() {
    sa11y.removeAllListeners();

    assert.deepEqual(this.warnings, [], 'No unrecognized warnings');
  });

  suite('#openModal', () => {
    test('opens well-formed modal as expected', async () => {
      const initialCount = await countOpen();

      await sa11y.openModal('[for="good"]');

      assert.equal(await countOpen(), initialCount + 1);
    });

    test('reports error when dialog is not opened', async () => {
      try {
        await sa11y.openModal('[for="non-modal-1"]');
      } catch (err) {
        assert.equal(err.name, 'Sa11yError', err.message);
        assert.equal(err.code, 'SA11Y-TIMEOUT');
        return;
      }

      assert(false, 'Expected an error, but no error was thrown');
    });

    test('waits for slow dialogs to open', async () => {
      const initialCount = await countOpen();

      await sa11y.openModal('[for="good-slow"]');

      assert.equal(await countOpen(), initialCount + 1);
    });

    test('warns when dialog does not specify `aria-modal`', async function() {
      await sa11y.openModal('[for="good-poor-semantics"]');

      assert.deepEqual(this.warnings, ['SA11Y-POOR-SEMANTICS']);
      this.warnings.length = 0;
    });

    test.skip('reports an error when focus is not bound to the dialog');
  });

  suite('#closeModal', () => {
    test('reports an error when no modal dialog is open', async () => {
      await sa11y.get(baseUrl + '/fixtures/modal-dialogs-all-closed.html');

      try {
        await sa11y.closeModal();
      } catch (err) {
        assert.equal(err.name, 'Sa11yError', err.message);
        assert.equal(err.code, 'SA11Y-ELEMENT-NOT-FOUND');
        return;
      }

      assert(false, 'Expected an error, but no error was thrown');
    });

    test('closes open modal dialog as expected', async () => {
      await open('good');
      const initialCount = await countOpen();

      await sa11y.closeModal();

      assert.equal(await countOpen(), initialCount - 1);
    });

    test('reports an error when dialog is not closed', async () => {
      await open('no-escape-binding');

      try {
        await sa11y.closeModal();
      } catch (err) {
        assert.equal(err.name, 'Sa11yError', err.message);
        assert.equal(err.code, 'SA11Y-TIMEOUT');
        return;
      }

      assert(false, 'Expected an error, but no error was thrown');
    });

    test('waits for slow dialogs to close', async () => {
      await open('good-slow');
      const initialCount = await countOpen();

      await sa11y.closeModal();

      assert.equal(await countOpen(), initialCount - 1);
    });

    test.skip('returns focus to the previously-focused element');
  });
});
