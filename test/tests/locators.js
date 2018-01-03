'use strict';

const { assert } = require('chai');
const { By } = require('selenium-webdriver');

const Sa11y = require('../..');
const lifecycle = require('../tools/lifecycle');

suite('locators', () => {
  let sa11y, webdriver;

  lifecycle((url) => sa11y = new Sa11y({ url: url }));

  setup(function() {
    webdriver = this.webdriver;

    return sa11y.get(this.baseUrl + '/fixtures/locators.html');
  });

  suite('invalid locators', () => {
    test('empty object', async () => {
      try {
        await sa11y.read({});
      } catch (err) {
        assert.equal(err.name, 'Sa11yError', err.message);
        assert.equal(err.code, 'SA11Y-USAGE');
        return;
      }

      assert(false, 'Expected an error, but no error was thrown');
    });

    test('unrecognized strategy', async () => {
      try {
        await sa11y.read({ batman: 'cowl' });
      } catch (err) {
        assert.equal(err.name, 'Sa11yError', err.message);
        assert.equal(err.code, 'SA11Y-USAGE');
        return;
      }

      assert(false, 'Expected an error, but no error was thrown');
    });

    test('over-specified strategy', async () => {
      const locator = {
        cssSelector: 'header',
        labelText: 'Control inside - input'
      };

      try {
        await sa11y.read(locator);
      } catch (err) {
        assert.equal(err.name, 'Sa11yError', err.message);
        assert.equal(err.code, 'SA11Y-USAGE');
        return;
      }

      assert(false, 'Expected an error, but no error was thrown');
    });
  });

  suite('CSS selector', () => {
    test('default', async () => {
      assert.equal(await sa11y.read('section header h4'), 'A heading');
      assert.equal(await sa11y.read('section header h5'), 'A sub-heading');
    });

    test('default - not found', async () => {
      try {
        await sa11y.read('section header h2');
      } catch (err) {
        assert.equal(err.name, 'Sa11yError', err.message);
        assert.equal(err.code, 'SA11Y-ELEMENT-NOT-FOUND');
        return;
      }

      assert(false, 'Expected an error, but no error was thrown');
    });
  });

  suite('labelText', () => {
    test('control elements declared inside `<label>` element', async () => {
      assert.equal(
        await sa11y.read({ labelText: 'Control inside - input' }),
        'Value of inside input'
      );

      //assert.equal(
      //  await sa11y.read({ labelText: 'Control inside - button Button text' }),
      //  'Value of inside button'
      //);

      assert.equal(
        await sa11y.read({ labelText: 'Control inside - meter' }), 0.99
      );

      //assert.equal(
      //  await sa11y.read({ labelText: 'Control inside - output Value of inside output' }),
      //  'Value of inside output'
      //);

      assert.equal(
        await sa11y.read({ labelText: 'Control inside - progress' }), 64
      );

      //assert.equal(
      //  await sa11y.read({ labelText: 'Control inside - select' }),
      //  'Value of second inside option'
      //);

      //assert.equal(
      //  await sa11y.read({ labelText: 'Control inside - textarea' }),
      //  'Value of inside textarea'
      //);
    });

    test('control element declared inside `<label>` element (whitespace)', async () => {
      const locator = {
        labelText: 'Control inside (label bearing non-significant whitespace)'
      };

      assert.equal(
        await sa11y.read(locator),
        'Value of inside input for label bearing non-significant whitespace'
      );
    });

    test('control element declared outside `<label>` element', async () => {
      assert.equal(
        await sa11y.read({ labelText: 'Control outside' }),
        'Value of outside input'
      );
    });

    test('control element declared outside `<label>` element (whitespace)', async () => {
      const locator = {
        labelText: 'Control outside (label bearing non-significant whitespace)'
      };

      assert.equal(
        await sa11y.read(locator),
        'Value of outside input for label bearing non-significant whitespace'
      );
    });

    test('invalid declaration of multiple control elements within `<label>` element', async function () {
      assert.equal(
        await sa11y.read({ labelText: 'Control inside - invalid' }), '1 of 2'
      );

      assert.deepEqual(this.warnings, ['SA11Y-POOR-SEMANTICS']);
      this.warnings.length = 0;
    });

    test('invalid declaration of exterior control element (not matching element within `<label>` element)', async function() {
      assert.equal(
        await sa11y.read({ labelText: 'Control outside - invalid' }),
        'Value of outside `<input>` whose `<label>` contains another `<input>`'
      );

      assert.deepEqual(this.warnings, ['SA11Y-POOR-SEMANTICS']);
      this.warnings.length = 0;
    });
  });
});
