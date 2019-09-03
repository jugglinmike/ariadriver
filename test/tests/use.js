'use strict';

const { assert } = require('chai');
const { rejects: assertRejects } = require('assert').strict;

const AriaDriver = require('../..');
const createServers = require('../tools/create-servers');

suite('#use', () => {
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

    return ariadriver.get(baseUrl + '/fixtures/use.html');
  });

  teardown(function() {
    ariadriver.removeAllListeners();

    assert.deepEqual(this.warnings, [], 'No unrecognized warnings');
  });

  test('unfound', async () => {
    await assertRejects(
      () => ariadriver.use('[aria-label="Non-existent element"]'),
      (err) => {
        assert.equal(err.name, 'AriaDriverError', err.message);
        assert.equal(err.code, 'ARIADRIVER-ELEMENT-NOT-FOUND');
        return true;
      }
    );
  });

  test('duplicated', async function() {
    await ariadriver.use('[aria-label="Duplicated anchor"]');

    assert.deepEqual(this.warnings, ['ARIADRIVER-AMBIGUOUS-REFERENCE']);
    this.warnings.length = 0;
  });

  test('postive `tabindex` value', async function() {
    await ariadriver.use('[aria-label="Div with positive tabindex"]');

    assert.deepEqual(this.warnings, ['ARIADRIVER-POOR-SEMANTICS']);
    this.warnings.length = 0;
  });

  test('valid', async () => {
    await ariadriver.use('[aria-label="Anchor with href"]');
    //await ariadriver.use('[aria-label="Link with href"]');
    await ariadriver.use('[aria-label="Button"]');
    await ariadriver.use('[aria-label="Input without type"]');
    await ariadriver.use('[aria-label="Text input"]');
    await ariadriver.use('[aria-label="Button input"]');
    await ariadriver.use('[aria-label="Select"]');
    await ariadriver.use('[aria-label="Textarea"]');
    //await ariadriver.use('[aria-label="Menuitem"]');
    //await ariadriver.use('[aria-label="Draggable div"]');
    await ariadriver.use('[aria-label="Editing host"]');
    await ariadriver.use('[aria-label="Browsing context container"]');
    await ariadriver.use('[aria-label="Div with tabindex"]');
  });

  test('invalid', async () => {
    const assertUnfocusable = (locator) => {
      return ariadriver.use(locator)
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
