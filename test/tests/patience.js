'use strict';

const { assert } = require('chai');

const AriaDriver = require('../..');
const createServers = require('../tools/create-servers');

suite('#patience', function () {
  let servers, ariadriver;
  // Because these tests do not exercise WebDriver functionality, the bodies
  // complete synchronously before the underlying WebDriver session is
  // initialized. This extends the execution time of the following teardown
  // logic because session destruction is queued while initialization
  // completes. The timeout for this suite is extended to accommodate this
  // behavior.
  this.timeout(this.timeout() * 2);

  suiteSetup(async function() {
    servers = await createServers();
  });
  suiteTeardown(() => servers.close());
  teardown(() => ariadriver.quit());

  test('default value', () => {
    ariadriver = new AriaDriver({ url: servers.geckodriverUrl });
    assert.equal(ariadriver.patience, 1000);
  });

  test('custom value', () => {
    ariadriver = new AriaDriver({ url: servers.geckodriverUrl, patience: 30 });

    assert.equal(ariadriver.patience, 30);
  });

  test('read only', () => {
    ariadriver = new AriaDriver({ url: servers.geckodriverUrl });

    assert.throws(() => ariadriver.patience = 30, TypeError);

    assert.equal(ariadriver.patience, 1000);
  });
});
