'use strict';

const { assert } = require('chai');
const { rejects: assertRejects } = require('assert').strict;
const { WebDriver, By } = require('selenium-webdriver');
const { Executor, HttpClient } = require('selenium-webdriver/http');

const AriaDriver = require('../..');
const createServers = require('../tools/create-servers');

suite('#pushButton', () => {
  let ariadriver, webdriver, baseUrl, closeServers;
  const inspect = async (selector) => {
    const target = await webdriver.findElements(By.css(selector));

    return webdriver.executeScript(function() {
      return {
        clickCount: arguments[0].dataset.clickCount,
        ariaPressed: arguments[0].getAttribute('aria-pressed')
      };
    }, target[0]);
  };

  suiteSetup(async () => {
    const servers = await createServers();
    baseUrl = servers.fileUrl;
    closeServers = servers.close;
    ariadriver = new AriaDriver({ url: servers.geckodriverUrl });

    const sessionId = await ariadriver.getSessionId();
    const executor = new Executor(new HttpClient(servers.geckodriverUrl));
    executor.w3c = true;
    webdriver = new WebDriver(sessionId, executor);
  });
  suiteTeardown(async () => {
    await ariadriver.quit();
    await closeServers();
  });
  setup(() => ariadriver.get(baseUrl + '/fixtures/button.html'));

  suite('valid buttons', () => {
    test('button element, label via text content', async () => {
      await ariadriver.pushButton('#element-without-label-with-text');
      let { clickCount } = await inspect('#element-without-label-with-text');
      assert.equal(clickCount, 1);
    });

    test('button element, label via `aria-label`', async () => {
      await ariadriver.pushButton('[aria-label="Button element with label"]');
      let { clickCount } =
        await inspect('[aria-label="Button element with label"]');
      assert.equal(clickCount, 1);
    });

    test('button element, label via `aria-labelledby`', async () => {
      await ariadriver.pushButton('[aria-labelledby]');
      let { clickCount } = await inspect('[aria-labelledby]');
      assert.equal(clickCount, 1);
    });

    test('button role', async () => {
      await ariadriver.pushButton('[aria-label="Div with role"]');
      let { clickCount } = await inspect('[aria-label="Div with role"]');
      assert.equal(clickCount, 1);
    });

    test('reset input', async () => {
      await ariadriver.pushButton('[aria-label="Reset input"]');
      let { clickCount } = await inspect('[aria-label="Reset input"]');
      assert.equal(clickCount, 1);
    });

    test('toggle button - fast', async () => {
      await ariadriver.pushButton('[aria-label="Fast toggle button"]');
      let { clickCount, ariaPressed } =
        await inspect('[aria-label="Fast toggle button"]');

      assert.equal(clickCount, 1);
      assert.equal(ariaPressed, 'true');

      await ariadriver.pushButton('[aria-label="Fast toggle button"]');
      ({ clickCount, ariaPressed } =
        await inspect('[aria-label="Fast toggle button"]'));

      assert.equal(clickCount, 2);
      assert.equal(ariaPressed, 'false');
    });

    test('toggle button - slow', async () => {
      await ariadriver.pushButton('[aria-label="Slow toggle button"]');
      let { clickCount, ariaPressed } =
        await inspect('[aria-label="Slow toggle button"]');

      assert.equal(clickCount, 1);
      assert.equal(ariaPressed, 'true');

      await ariadriver.pushButton('[aria-label="Slow toggle button"]');
      ({ clickCount, ariaPressed } =
        await inspect('[aria-label="Slow toggle button"]'));

      assert.equal(clickCount, 2);
      assert.equal(ariaPressed, 'false');
    });
  });

  suite('invalid buttons', () => {
    test('button element, without label and without text', async () => {
      await assertRejects(
        () => ariadriver.pushButton('#element-without-label-without-text'),
        (err) => {
          assert.equal(err.name, 'AriaDriverError', err.message);
          assert.equal(err.code, 'ARIADRIVER-INVALID-MARKUP');
          return true;
        }
      );
      let { clickCount } =
        await inspect('#element-without-label-without-text');
      assert.equal(clickCount, null);
    });

    test('button role, without label and without text', async () => {
      await assertRejects(
        () => ariadriver.pushButton('#role-without-label-without-text'),
        (err) => {
          assert.equal(err.name, 'AriaDriverError', err.message);
          assert.equal(err.code, 'ARIADRIVER-INVALID-MARKUP');
          return true;
        }
      );
      let { clickCount } =
        await inspect('#role-without-label-without-text');
      assert.equal(clickCount, null);
    });

    test('div element without role', async () => {
      await assertRejects(
        () => ariadriver.pushButton('[aria-label="Div without role"]'),
        (err) => {
          assert.equal(err.name, 'AriaDriverError', err.message);
          assert.equal(err.code, 'ARIADRIVER-INVALID-MARKUP');
          return true;
        }
      );
      let { clickCount } =
        await inspect('[aria-label="Div without role"]');
      assert.equal(clickCount, null);
    });

    test('toggle button - unresponsive', async () => {
      await assertRejects(
        () => ariadriver.pushButton(
            '[aria-label="Unresponsive toggle button"]'
          ),
        (err) => {
          assert.equal(err.name, 'AriaDriverError', err.message);
          assert.equal(err.code, 'ARIADRIVER-TIMEOUT');
          return true;
        }
      );
      let { clickCount } =
        await inspect('[aria-label="Unresponsive toggle button"]');
      assert.equal(clickCount, 1);
    });
  });
});
