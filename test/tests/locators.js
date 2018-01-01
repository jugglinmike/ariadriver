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
      const locator = { cssSelector: 'header', labelText: 'Control inside' };

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
      assert(await sa11y.read('section header h4'), 'A heading');
      assert(await sa11y.read('section header h5'), 'A sub-heading');
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
    test('control element declared inside `<label>` element', async () => {
      assert(
        await sa11y.read({ labelText: 'Control inside' }),
        'Value of inside input for label'
      );
    });

    test('control element declared inside `<label>` element (whitespace)', async () => {
      const locator = {
        labelText: 'Control inside (label bearing non-significant whitespace)'
      };

      assert(
        await sa11y.read(locator),
        'Value of inside input for label bearing non-significant whitespace'
      );
    });

    test('control element declared outside `<label>` element', async () => {
      assert(
        await sa11y.read({ labelText: 'Control outside' }),
        'Value of outside input'
      );
    });

    test('control element declared outside `<label>` element (whitespace)', async () => {
      const locator = {
        labelText: 'Control outside (label bearing non-significant whitespace)'
      };

      assert(
        await sa11y.read(locator),
        'Value of outside input for label bearing non-significant whitespace'
      );
    });

    test('invalid declaration of multiple control elements within `<label>` element', async () => {
      try {
        await sa11y.read({ labelText: 'Control inside - invalid' });
      } catch (err) {
        assert.equal(err.name, 'Sa11yError', err.message);
        assert.equal(err.code, 'SA11Y-POOR-SEMANTICS');
        return;
      }

      assert(false, 'Expected an error, but no error was thrown');
    });
  });
});
