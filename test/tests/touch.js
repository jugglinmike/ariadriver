'use strict';

const { assert } = require('chai');

const AriaDriver = require('../..');
const createServers = require('../tools/create-servers');

suite('touch', () => {
  let ariadriver, baseUrl, closeServers;

  suiteSetup(async () => {
    const servers = await createServers();
    baseUrl = servers.fileUrl;
    closeServers = servers.close;
    ariadriver = new AriaDriver({ url: servers.geckodriverUrl });
  });
  suiteTeardown(async () => {
    await ariadriver.quit();
    await closeServers();
  });

  setup(function() {
    this.warnings = [];

    ariadriver.on('warning', (warning) => this.warnings.push(warning.code));

    return ariadriver.get(baseUrl + '/fixtures/touch.html');
  });

  teardown(function() {
    ariadriver.removeAllListeners();

    assert.deepEqual(this.warnings, [], 'No unrecognized warnings');
  });

  test('unfound', async () => {
    try {
      await ariadriver.touch('[aria-label="Non-existent element"]');
    } catch (err) {
      assert.equal(err.name, 'AriaDriverError', err.message);
      assert.equal(err.code, 'ARIADRIVER-ELEMENT-NOT-FOUND');
      return;
    }

    assert(false, 'Expected an error, but no error was thrown');
  });

  test('duplicated', async function() {
    await ariadriver.touch('[aria-label="Duplicated anchor"]');

    assert.deepEqual(this.warnings, ['ARIADRIVER-AMBIGUOUS-REFERENCE']);
    this.warnings.length = 0;
  });

  test('postive `tabindex` value', async function() {
    await ariadriver.touch('[aria-label="Div with positive tabindex"]');

    assert.deepEqual(this.warnings, ['ARIADRIVER-POOR-SEMANTICS']);
    this.warnings.length = 0;
  });

  test('valid', async () => {
    await ariadriver.touch('[aria-label="Anchor with href"]');
    //await ariadriver.touch('[aria-label="Link with href"]');
    await ariadriver.touch('[aria-label="Button"]');
    await ariadriver.touch('[aria-label="Input without type"]');
    await ariadriver.touch('[aria-label="Text input"]');
    await ariadriver.touch('[aria-label="Button input"]');
    await ariadriver.touch('[aria-label="Select"]');
    await ariadriver.touch('[aria-label="Textarea"]');
    //await ariadriver.touch('[aria-label="Menuitem"]');
    //await ariadriver.touch('[aria-label="Draggable div"]');
    await ariadriver.touch('[aria-label="Editing host"]');
    await ariadriver.touch('[aria-label="Browsing context container"]');
    await ariadriver.touch('[aria-label="Div with tabindex"]');
  });

  test('invalid', async () => {
    const assertUnfocusable = (locator) => {
      return ariadriver.touch(locator)
        .then(
          () => { assert(false, 'Expected an error, but no error was thrown'); },
          (err) => {
            assert(err);
            assert.equal(err.name, 'AriaDriverError', err.message);
            assert.equal(err.code, 'ARIADRIVER-ELEMENT-UNFOCUSABLE');
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
