'use strict';
const assert = require('./assert');

const {Builder, By, Key} = require('selenium-webdriver');

const momentWhen = require('./util/moment-when');

const defaults = {
  url: undefined,
  patience: 1000
};

const selectors = {
  openModals: '[role="dialog"]:not([aria-hidden="true"])'
};

module.exports = class Sa11y {
  constructor(options) {
    options = Object.assign({}, defaults, options);

    this._patience = options.patience;

    this._driver = new Builder()
      .forBrowser('firefox')
      .usingServer(options.url)
      .build();
  }

  async getSessionId() {
    const session = await this._driver.getSession();
    return session.getId();
  }

  get(url) {
    return this._driver.get(url);
  }

  async count(locator) {
    return (await this._driver.findElements(By.css(locator))).length;
  }

  async touch(locator) {
    const target = await this._driver.findElements(By.css(locator));

    await target[0].sendKeys(Key.ENTER);
  }

  async openModal(locator) {
    const count = () => this.count(selectors.openModals);
    const initialCount = await count();

    await this.touch(locator);

    const hasOpened = async () => (await count()) === initialCount + 1;

    await momentWhen('modal dialog has opened', hasOpened, this._patience);
  }

  async closeModal() {
    const count = () => this.count(selectors.openModals);
    const initialCount = await count();

    assert(
      initialCount > 0,
      'Cannot close modal: no "dialog" elements are displayed'
    );

    const target = await this._driver.executeScript(() => { return document.activeElement || document.body; });
    await target.sendKeys(Key.ESCAPE);

    const hasClosed = async () => (await count()) === initialCount - 1;

    await momentWhen('modal dialog has closed', hasClosed, this._patience);
  }

  quit() {
    return this._driver.quit();
  }
};
