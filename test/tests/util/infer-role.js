'use strict';

const { assert } = require('chai');
const {Builder, By} = require('selenium-webdriver');

const inferRole = require('../../../lib/util/infer-role');
const createServers = require('../../tools/create-servers');

suite('inferRole', () => {
  let webdriver, closeServers;
  const roleTest = (markup, expected) => {
    test(markup, async () => {
      const url = 'data:text/html;base64,' +
        Buffer.from(markup).toString('base64');
      await webdriver.get(url);
      const subject = await webdriver.findElement(By.css('[data-subject]'));
      const result = await webdriver.executeScript(inferRole, subject);
      assert.equal(result, expected);
    });
  };

  suiteSetup(async () => {
    const servers = await createServers();
    closeServers = servers.close;

    webdriver = new Builder()
      .forBrowser('firefox')
      .usingServer(servers.geckodriverUrl)
      .build();
  });
  suiteTeardown(async () => {
    await webdriver.quit();
    await closeServers();
  });

  roleTest('<div role="button" data-subject></div>', 'button');

  roleTest('<a data-subject></a>', null);
  roleTest('<a href="#" data-subject></a>', 'link');
  roleTest('<menu><a data-subject></a></menu>', null);
  roleTest('<menu><a href="#" data-subject></a></menu>', 'menuitem');
  roleTest('<div role="menu"><a data-subject></a></div>', null);
  roleTest('<div role="menu"><a href="#" data-subject></a></div>', 'menuitem');
  roleTest('<abbr data-subject></abbr>', null);
  roleTest('<address data-subject></address>', null);
  roleTest('<area data-subject></area>', null);
  roleTest('<area href="#" data-subject></area>', 'link');
  roleTest('<article data-subject></article>', 'article');
  roleTest('<aside data-subject></aside>', 'aside');
  roleTest('<audio data-subject></audio>', null);
  roleTest('<b data-subject></b>', null);
  roleTest('<base data-subject></base>', null);
  roleTest('<bdi data-subject></bdi>', null);
  roleTest('<bdo data-subject></bdo>', null);
  roleTest('<blockquote data-subject></blockquote>', null);
  roleTest('<body data-subject></body>', null);
  roleTest('<br data-subject></br>', null);
  roleTest('<button data-subject></button>', 'button');
  roleTest('<canvas data-subject></canvas>', null);
  roleTest('<table><caption data-subject></caption></table>', null);
  roleTest('<cite data-subject></cite>', null);
  roleTest('<code data-subject></code>', null);
  roleTest(
    '<table><colgroup><col data-subject></col></colgrop></table>', null
  );
  roleTest('<table><colgroup data-subject></colgroup></table>', null);
  roleTest('<datalist data-subject></datalist>', null);
  roleTest('<datalist id="suggestions" data-subject></datalist>', null);
  roleTest(
    '<a list="suggestions"></a>' +
      '<datalist id="suggestions" data-subject></datalist>',
    null
  );
  roleTest(
    '<input type="text" list=""></input><datalist data-subject></datalist>',
    null
  );
  roleTest(
    '<input type="text" list="suggestions"></input>' +
      '<datalist id="suggestions" data-subject></datalist>',
    'listbox'
  );
  roleTest('<dl><dt></dt><dd data-subject></dd></dl>', 'definition');
  roleTest('<del data-subject></del>', null);
  roleTest('<details data-subject></details>', null);
  roleTest('<dfn data-subject></dfn>', 'term');
  roleTest('<dialog data-subject></dialog>', 'dialog');
  roleTest('<div data-subject></div>', null);
  roleTest('<dl data-subject></dl>', null);
  roleTest('<dl><dt data-subject></dt><dd></dd></dl>', 'term');
  roleTest('<em data-subject></em>', null);
  roleTest('<embed data-subject></embed>', null);
  roleTest('<fieldset data-subject></fieldset>', 'group');
  roleTest('<figure><figcaption data-subject></figcaption></figure>', null);
  roleTest('<figure data-subject></figure>', 'figure');
  roleTest('<body><footer data-subject></footer></body>', 'contentinfo');
  roleTest(
    '<body><div><footer data-subject></footer></div></body>', 'contentinfo'
  );
  roleTest('<main><footer data-subject></footer></main>', null);
  roleTest('<main><div><footer data-subject></footer></div></main>', null);
  roleTest(
    '<section><div><footer data-subject></footer></div></section>', null
  );
  roleTest('<blockquote><footer data-subject></footer></blockquote>', null);
  roleTest(
    '<blockquote><div><footer data-subject></footer></div></blockquote>', null
  );
  test.skip('<form data-subject></form>');
  roleTest('<h1 data-subject></h1>', 'heading');
  roleTest('<h2 data-subject></h1>', 'heading');
  roleTest('<h3 data-subject></h1>', 'heading');
  roleTest('<h4 data-subject></h1>', 'heading');
  roleTest('<h5 data-subject></h1>', 'heading');
  roleTest('<h6 data-subject></h1>', 'heading');
  roleTest('<head data-subject></head>', null);
  roleTest(
    '<body><div><header data-subject></header></div></body>', 'banner'
  );
  roleTest('<main><header data-subject></header></main>', null);
  roleTest('<main><div><header data-subject></header></div></main>', null);
  roleTest(
    '<section><div><header data-subject></header></div></section>', null
  );
  roleTest('<blockquote><header data-subject></header></blockquote>', null);
  roleTest(
    '<blockquote><div><header data-subject></header></div></blockquote>', null
  );
  roleTest('<hr data-subject></hr>', 'separator');
  roleTest('<html data-subject></html>', null);
  roleTest('<i data-subject></i>', null);
  roleTest('<iframe data-subject></iframe>', null);
  roleTest('<img data-subject></img>', 'img');
  roleTest('<img alt data-subject></img>', 'presentation');
  roleTest('<img alt="" data-subject></img>', 'presentation');
  roleTest('<input type="button" data-subject></input>', 'button');
  roleTest(
    '<menu><input type="button" data-subject></input></menu>', 'menuitem'
  );
  roleTest(
    '<div role="menu"><input type="button" data-subject></input></div>',
    'menuitem'
  );
  roleTest('<input type="checkbox" data-subject></input>', 'checkbox');
  roleTest(
    '<menu><input type="checkbox" data-subject></input></menu>',
    'menuitemcheckbox'
  );
  roleTest(
    '<div role="menu"><input type="checkbox" data-subject></input></div>',
    'menuitemcheckbox'
  );
  roleTest('<input type="color" data-subject></input>', null);
  roleTest('<input type="date" data-subject></input>', null);
  roleTest('<input type="email" data-subject></input>', 'textbox');
  roleTest(
    '<input type="email" list="suggestions" data-subject></input>' +
      '<datalist id="suggestions"></datalist>',
    'combobox'
  );
  roleTest('<input type="file" data-subject></input>', null);
  roleTest('<input type="hidden" data-subject></input>', null);
  roleTest('<input type="image" data-subject></input>', 'button');
  roleTest(
    '<menu><input type="image" data-subject></input></menu>', 'menuitem'
  );
  roleTest(
    '<div role="menu"><input type="image" data-subject></input></div>',
    'menuitem'
  );
  roleTest('<input type="datetime-local" data-subject></input>', null);
  roleTest('<input type="month" data-subject></input>', null);
  roleTest('<input type="number" data-subject></input>', 'spinbutton');
  roleTest('<input type="password" data-subject></input>', null);
  roleTest('<input type="radio" data-subject></input>', 'radio');
  roleTest(
    '<menu><input type="radio" data-subject></input></menu>', 'menuitemradio'
  );
  roleTest(
    '<div role="menu"><input type="radio" data-subject></input></div>',
    'menuitemradio'
  );
  roleTest('<input type="range" data-subject></input>', 'slider');
  roleTest('<input type="reset" data-subject></input>', 'button');
  roleTest('<input type="search" data-subject></input>', 'searchbox');
  roleTest(
    '<input type="search" list="suggestions" data-subject></input>' +
      '<datalist id="suggestions"></datalist>',
    'combobox'
  );
  roleTest('<input type="submit" data-subject></input>', 'button');
  roleTest('<input type="telephone" data-subject></input>', 'textbox');
  roleTest(
    '<input type="telephone" list="suggestions" data-subject></input>' +
      '<datalist id="suggestions"></datalist>',
    'combobox'
  );
  roleTest('<input data-subject></input>', 'textbox');
  roleTest(
    '<input list="suggestions" data-subject></input>' +
      '<datalist id="suggestions"></datalist>',
    'combobox'
  );
  roleTest('<input type="text" data-subject></input>', 'textbox');
  roleTest(
    '<input type="text" list="suggestions" data-subject></input>' +
      '<datalist id="suggestions"></datalist>',
    'combobox'
  );
  roleTest('<input type="time" data-subject></input>', null);
  roleTest('<input type="url" data-subject></input>', 'textbox');
  roleTest(
    '<input type="url" list="suggestions" data-subject></input>' +
      '<datalist id="suggestions"></datalist>',
    'combobox'
  );
  roleTest('<input type="week" data-subject></input>', null);
  roleTest('<ins data-subject></ins>', null);
  roleTest('<kbd data-subject></kbd>', null);
  roleTest('<label data-subject></label>', null);
  roleTest('<legend data-subject></legend>', null);
  roleTest('<ul><li data-subject></li></ul>', 'listitem');
  roleTest('<link data-subject></link>', null);
  roleTest('<main data-subject></main>', 'main');
  roleTest('<map data-subject></map>', null);
  roleTest('<mark data-subject></mark>', null);
  roleTest('<math data-subject></math>', 'math');
  test.skip('<menu data-subject></menu>');
  roleTest('<meta data-subject></meta>', null);
  roleTest('<meter data-subject></meter>', null);
  roleTest('<nav data-subject></nav>', 'navigation');
  roleTest('<noscript data-subject></noscript>', null);
  roleTest('<object data-subject></object>', null);
  roleTest('<ol data-subject></ol>', 'list');
  roleTest('<select><optgroup data-subject></optgroup></select>', 'group');
  roleTest('<select><option data-subject></option></select>', 'option');
  roleTest('<output data-subject></output>', 'status');
  roleTest('<p data-subject></p>', null);
  roleTest('<param data-subject></param>', null);
  roleTest('<picture data-subject></picture>', null);
  roleTest('<pre data-subject></pre>', null);
  roleTest('<progress data-subject></progress>', 'progressbar');
  roleTest('<q data-subject></q>', null);
  roleTest('<rb data-subject></rb>', null);
  roleTest('<rp data-subject></rp>', null);
  roleTest('<rt data-subject></rt>', null);
  roleTest('<rtc data-subject></rtc>', null);
  roleTest('<ruby data-subject></ruby>', null);
  roleTest('<s data-subject></s>', null);
  roleTest('<samp data-subject></samp>', null);
  roleTest('<script data-subject></script>', null);
  test.skip('<section data-subject></section>');
  roleTest('<select data-subject multiple></select>', 'listbox');
  roleTest('<select data-subject size="2"></select>', 'listbox');
  roleTest('<select data-subject></select>', 'combobox');
  roleTest('<select data-subject size="1"></select>', 'combobox');
  roleTest('<small data-subject></small>', null);
  roleTest('<source data-subject></source>', null);
  roleTest('<span data-subject></span>', null);
  roleTest('<strong data-subject></strong>', null);
  roleTest('<style data-subject></style>', null);
  roleTest('<sub data-subject></sub>', null);
  roleTest('<summary data-subject></summary>', null);
  roleTest('<sup data-subject></sup>', null);
  roleTest('<svg data-subject></svg>', 'graphics-document');
  roleTest('<table data-subject></table>', 'table');
  roleTest('<table><tbody data-subject></tbody></table>', 'rowgroup');
  roleTest('<table><tr><td data-subject></td></tr></table>', 'cell');
  roleTest(
    '<table role="grid""><tr><td data-subject></td></tr></table>', 'gridcell'
  );
  roleTest('<template data-subject></template>', null);
  roleTest('<textarea data-subject></textarea>', 'textbox');
  roleTest('<table><tfoot data-subject></tfoot></table>', 'rowgroup');
  test.skip('<table><tr><th data-subject></th></tr></table>', 'cell');
  test.skip(
    '<table role="grid"><tr><th data-subject></th></tr></table>', 'gridcell'
  );
  roleTest('<table><tr><th data-subject></th></tr></table>', 'columnheader');
  roleTest(
    '<table><tr><th context="row" data-subject></th></tr></table>', 'rowheader'
  );
  roleTest('<table><thead data-subject></thead></table>', 'rowgroup');
  roleTest('<time data-subject></time>', null);
  roleTest('<title data-subject></title>', null);
  roleTest('<table><tr data-subject></tr></table>', 'row');
  roleTest('<track data-subject></track>', null);
  roleTest('<u data-subject></u>', null);
  roleTest('<ul data-subject></ul>', 'list');
  roleTest('<var data-subject></var>', null);
  roleTest('<video data-subject></video>', null);
  roleTest('<wbr data-subject></wbr>', null);
});
