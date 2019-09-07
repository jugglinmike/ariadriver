'use strict';

const { assert } = require('chai');
const { rejects: assertRejects } = require('assert').strict;
const { WebDriver, By } = require('selenium-webdriver');
const { Executor, HttpClient } = require('selenium-webdriver/http');

const AriaDriver = require('../..');
const createServers = require('../tools/create-servers');

suite('dialog', () => {
  let ariadriver, webdriver, baseUrl, closeServers;
  const countOpen = async () => {
    const selector = '[role="dialog"]:not([aria-hidden="true"])';
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
    ariadriver = new AriaDriver({ url: servers.geckodriverUrl });

    const sessionId = await ariadriver.getSessionId();
    const executor = new Executor(new HttpClient(servers.geckodriverUrl));
    webdriver = new WebDriver(sessionId, executor);
    // W3C compliance is typically inferred during session creation, so it must
    // be explicitly enabled here.
    webdriver.w3c = true;
  });
  suiteTeardown(async () => {
    await ariadriver.quit();
    await closeServers();
  });

  setup(function() {
    this.warnings = [];

    ariadriver.on('warning', (warning) => this.warnings.push(warning.code));

    return ariadriver.get(baseUrl + '/fixtures/dialog.html');
  });

  teardown(function() {
    ariadriver.removeAllListeners();

    assert.deepEqual(this.warnings, [], 'No unrecognized warnings');
  });

  suite('#openDialog', () => {
    test('opens well-formed modal as expected', async () => {
      const initialCount = await countOpen();

      await ariadriver.openDialog('[for="good"]');

      assert.equal(await countOpen(), initialCount + 1);
    });

    test('reports error when dialog is not opened', async () => {
      await assertRejects(
        () => ariadriver.openDialog('[for="non-modal-1"]'),
        (err) => {
          assert.equal(err.name, 'AriaDriverError', err.message);
          assert.equal(err.code, 'ARIADRIVER-TIMEOUT');
          return true;
        }
      );
    });

    test('waits for slow dialogs to open', async () => {
      const initialCount = await countOpen();

      await ariadriver.openDialog('[for="good-slow"]');

      assert.equal(await countOpen(), initialCount + 1);
    });

    test('warns when dialog does not specify `aria-modal`', async function() {
      await ariadriver.openDialog('[for="good-poor-semantics"]');

      assert.deepEqual(this.warnings, ['ARIADRIVER-POOR-SEMANTICS']);
      this.warnings.length = 0;
    });

    test('reports an error in the absence of `aria-haspopup`', async () => {
      await assertRejects(
        () => ariadriver.openDialog('[for="no-haspopup"]'),
        (err) => {
          assert.equal(err.name, 'AriaDriverError', err.message);
          assert.equal(err.code, 'ARIADRIVER-INVALID-MARKUP');
          return true;
        }
      );
    });

    test.skip('reports an error when dialog lacks both the `aria-labelledby` property and the `aria-label` property');

    test.skip('reports an error when focus is not bound to the dialog');
  });

  suite('#closeDialog', () => {
    test('reports an error when no modal dialog is open', async () => {
      await ariadriver.get(baseUrl + '/fixtures/dialog-all-closed.html');

      await assertRejects(
        () => ariadriver.closeDialog(),
        (err) => {
          assert.equal(err.name, 'AriaDriverError', err.message);
          assert.equal(err.code, 'ARIADRIVER-ELEMENT-NOT-FOUND');
          return true;
        }
      );
    });

    test('closes open modal dialog as expected', async () => {
      await open('good');
      const initialCount = await countOpen();

      await ariadriver.closeDialog();

      assert.equal(await countOpen(), initialCount - 1);
    });

    test('reports an error when dialog is not closed', async () => {
      await open('no-escape-binding');

      await assertRejects(
        () => ariadriver.closeDialog(),
        (err) => {
          assert.equal(err.name, 'AriaDriverError', err.message);
          assert.equal(err.code, 'ARIADRIVER-TIMEOUT');
          return true;
        }
      );
    });

    test('waits for slow dialogs to close', async () => {
      await open('good-slow');
      const initialCount = await countOpen();

      await ariadriver.closeDialog();

      assert.equal(await countOpen(), initialCount - 1);
    });

    test.skip('returns focus to the previously-focused element');
  });
});
