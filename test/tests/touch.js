'use strict';

const { assert } = require('chai');

const Sa11y = require('../..');
const createServers = require('../tools/create-servers');

suite('touch', () => {
  let sa11y, webdriver, baseUrl, closeServers;

  suiteSetup(async () => {
    const servers = await createServers();
    baseUrl = servers.fileUrl;
    closeServers = servers.close;
    sa11y = new Sa11y({ url: servers.geckodriverUrl });
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

  test('invalid', async () => {
    const assertUnfocusable = (locator) => {
      return sa11y.touch(locator)
        .then(
          () => { assert(false, 'Expected an error, but no error was thrown'); },
          (err) => {
            assert(err);
            assert.equal(err.name, 'Sa11yError', err.message);
            assert.equal(err.code, 'SA11Y-ELEMENT-UNFOCUSABLE');
          });
    };

    await assertUnfocusable('[aria-label="Div"]');
    await assertUnfocusable('[aria-label="Span"]');
    await assertUnfocusable('[aria-label="Anchor without href"]');
    await assertUnfocusable('[aria-label="Hidden anchor"]');
    await assertUnfocusable('[aria-label="Invisible anchor"]');
    await assertUnfocusable('[aria-label="Link without href"]');
    await assertUnfocusable('[aria-label="Hidden link"]');
    await assertUnfocusable('[aria-label="Invisible link"]');
    await assertUnfocusable('[aria-label="Disabled button"]');
  });
});
