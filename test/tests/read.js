'use strict';

const { assert } = require('chai');
const { By } = require('selenium-webdriver');

const Sa11y = require('../..');
const lifecycle = require('../tools/lifecycle');

suite('read', () => {
  let sa11y, webdriver;

  lifecycle((url) => sa11y = new Sa11y({ url: url }));

  setup(function() {
    webdriver = this.webdriver;

    return sa11y.get(this.baseUrl + '/fixtures/read.html');
  });

  test('unfound', async () => {
    try {
      await sa11y.read('[aria-label="Non-existent element"]');
    } catch (err) {
      assert.equal(err.name, 'Sa11yError', err.message);
      assert.equal(err.code, 'SA11Y-ELEMENT-NOT-FOUND');
      return;
    }

    assert(false, 'Expected an error, but no error was thrown');
  });

  test('block-level element', async () => {
    assert.equal(
      await sa11y.read('[aria-label="Block-level element"]'),
      'Content of a block-level element'
    );
  });

  test('inline element', async () => {
    assert.equal(
      await sa11y.read('[aria-label="Inline element"]'),
      'Content of an inline element'
    );
  });

  test('nested markup', async () => {
    assert.equal(
      await sa11y.read('[aria-label="Nested markup"]'),
      'Element with nested markup.'
    );
  });

  test('whitespace', async () => {
    assert.equal(
      await sa11y.read('[aria-label="Whitespace"]'),
      'Element with insignificant whitespace.'
    );
  });

  test('Text input elements', async () => {
    assert.equal(
      await sa11y.read('[aria-label="Text input element (no type)"]'),
      'Content of text input element (without a `type` attribute)'
    );

    assert.equal(
      await sa11y.read('[aria-label="Text input element (explicit type)"]'),
      'Content of text input element (with an explicit `type` attribute)'
    );
  });
});
