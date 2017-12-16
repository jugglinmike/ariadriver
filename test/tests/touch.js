'use strict';

const { assert } = require('chai');
const { WebDriver: { attachToSession }, By } = require('selenium-webdriver');
const { Executor, HttpClient } = require('selenium-webdriver/http');

const Sa11y = require('../..');
const createServers = require('../tools/create-servers');

suite('touch', () => {
  let sa11y, webdriver, baseUrl, closeServers;

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

    return sa11y.get(baseUrl + '/fixtures/touch.html');
  });

  teardown(function() {
    sa11y.removeAllListeners();

    assert.deepEqual(this.warnings, [], 'No unrecognized warnings');
  });

  test('unfound', async () => {
    try {
      await sa11y.touch('[aria-label="Non-existent element"]');
    } catch (err) {
      assert.equal(err.name, 'Sa11yError', err.message);
      assert.equal(err.code, 'SA11Y-ELEMENT-NOT-FOUND');
      return;
    }

    assert(false, 'Expected an error, but no error was thrown');
  });

  test('duplicated', async function() {
    await sa11y.touch('[aria-label="Duplicated anchor"]');

    assert.deepEqual(this.warnings, ['SA11Y-AMBIGUOUS-REFERENCE']);
    this.warnings.length = 0;
  });

  test('valid', async () => {
    await sa11y.touch('[aria-label="Anchor with href"]');
    //await sa11y.touch('[aria-label="Link with href"]');
    await sa11y.touch('[aria-label="Button"]');
    await sa11y.touch('[aria-label="Input without type"]');
    await sa11y.touch('[aria-label="Text input"]');
    await sa11y.touch('[aria-label="Button input"]');
    await sa11y.touch('[aria-label="Select"]');
    await sa11y.touch('[aria-label="Textarea"]');
    //await sa11y.touch('[aria-label="Menuitem"]');
    //await sa11y.touch('[aria-label="Draggable div"]');
    await sa11y.touch('[aria-label="Editing host"]');
    await sa11y.touch('[aria-label="Browsing context container"]');
    await sa11y.touch('[aria-label="Div with tabindex"]');
  });

  suite('invalid', () => {
    const assertInvalid = async (locator, code) => {
      const elements = await webdriver.findElements(By.css(locator));

      // Tests for "imperceptible" elements would be satisfied by locators that
      // had no corresponding element, but this is not the intention of these
      // tests. The following assertion guaruntees that the referenced elements
      // are technically present, proving that the subsequent assertion actually
      // demonstrates the case of "technically present by not perceptible".
      assert.equal(
        elements.length, 1, `Element "${locator}" is present in the document.`
      );

      try {
        await sa11y.touch(locator);
      } catch (err) {
        assert(err);
        assert.equal(err.name, 'Sa11yError', err.message);
        assert.equal(err.code, code, locator);
        return;
      }
      assert(false, 'Expected an error, but no error was thrown');
    };

    test('unfocusable', async () => {
      await assertInvalid('[aria-label="Div"]', 'SA11Y-ELEMENT-UNFOCUSABLE');
      await assertInvalid('[aria-label="Span"]', 'SA11Y-ELEMENT-UNFOCUSABLE');
      await assertInvalid('[aria-label="Anchor without href"]', 'SA11Y-ELEMENT-UNFOCUSABLE');
      await assertInvalid('[aria-label="Link without href"]', 'SA11Y-ELEMENT-UNFOCUSABLE');
      await assertInvalid('[aria-label="Disabled button"]', 'SA11Y-ELEMENT-UNFOCUSABLE');
    });

    test('imperceptible', async () => {
      await assertInvalid('[aria-label="Hidden anchor"]', 'SA11Y-ELEMENT-NOT-FOUND');
      await assertInvalid('[aria-label="Hidden link"]', 'SA11Y-ELEMENT-NOT-FOUND');
      await assertInvalid('[aria-label="Hidden child anchor"]', 'SA11Y-ELEMENT-NOT-FOUND');
      await assertInvalid('[aria-label="Hidden child link"]', 'SA11Y-ELEMENT-NOT-FOUND');
      await assertInvalid('[aria-label="Hidden grandchild anchor"]', 'SA11Y-ELEMENT-NOT-FOUND');
      await assertInvalid('[aria-label="Hidden grandchild link"]', 'SA11Y-ELEMENT-NOT-FOUND');
      await assertInvalid('[aria-label="Invisible anchor"]', 'SA11Y-ELEMENT-NOT-FOUND');
      await assertInvalid('[aria-label="Invisible link"]', 'SA11Y-ELEMENT-NOT-FOUND');
      await assertInvalid('[aria-label="Invisible child anchor"]', 'SA11Y-ELEMENT-NOT-FOUND');
      await assertInvalid('[aria-label="Invisible child link"]', 'SA11Y-ELEMENT-NOT-FOUND');
      await assertInvalid('[aria-label="Invisible grandchild anchor"]', 'SA11Y-ELEMENT-NOT-FOUND');
      await assertInvalid('[aria-label="Invisible grandchild link"]', 'SA11Y-ELEMENT-NOT-FOUND');
    });
  });
});
