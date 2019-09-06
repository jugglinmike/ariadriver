// jshint browser: true, esversion: 5

module.exports = function(element) {
  function parentIsMenu(el) {
    return el && el.parentNode && inferRole(el.parentNode) === 'menu';
  }
  function inSectioning(el) {
    var parent = el.parentNode;
    while (parent) {
      if (/main|article|aside|nav|section|blockquote|details|dialog|fieldset|figure|td/i.test(parent.tagName)) {
        return true;
      }

      parent = parent.parentNode;
    }

    return false;
  }
  function hasList(el) {
    var listId = el.getAttribute('list');
    return listId && !!document.getElementById(listId);
  }
  function ancestorIsGrid(el) {
    var parent = el.parentNode;
    while (parent && parent.tagName !== 'TABLE') {
      parent = parent.parentNode;
    }

    return parent && inferRole(parent) === 'grid';
  }

  var tagFns = {
    A: function(el) {
      if (!el.hasAttribute('href')) {
        return null;
      }

      return parentIsMenu(el) ? 'menuitem' : 'link';
    },
    AREA: function(el) { return el.hasAttribute('href') ? 'link' : null; },
    ARTICLE: function() { return 'article'; },
    ASIDE: function() { return 'aside'; },
    BUTTON: function() { return 'button'; },
    DATALIST: function(el) {
      /**
       * > If `datalist` is not linked to a proper `input` element, then
       * > `datalist` element is not mapped to accessibility APIs.
       */
      if (!el.id || !document.querySelector('input[list="' + el.id + '"]')) {
        return null;
      }
      return 'listbox';
    },
    DD: function() { return 'definition'; },
    DFN: function() { return 'term'; },
    DIALOG: function() { return 'dialog'; },
    DT: function() { return 'term'; },
    FIELDSET: function() { return 'group'; },
    FIGURE: function() { return 'figure'; },
    // TODO: FORM
    FOOTER: function(el) { return inSectioning(el) ? null : 'contentinfo'; },
    H1: function() { return 'heading'; },
    H2: function() { return 'heading'; },
    H3: function() { return 'heading'; },
    H4: function() { return 'heading'; },
    H5: function() { return 'heading'; },
    H6: function() { return 'heading'; },
    HEADER: function(el) { return inSectioning(el) ? null : 'banner'; },
    HR: function() { return 'separator'; },
    IMG: function(el) {
      if (el.hasAttribute('alt') && !el.getAttribute('alt')) {
        return 'presentation';
      }
      return 'img';
    },
    INPUT: function(el) {
      var type = el.getAttribute('type') || 'text';
      var fn = typeFns[type.toLowerCase()];

      if (!fn) {
        return null;
      }

      return fn(el);
    },
    LI: function() { return 'listitem'; },
    MAIN: function() { return 'main'; },
    MATH: function() { return 'math'; },
    // TODO: investigate `type` attribute of `<menu>` elements
    MENU: function() { return 'menu'; },
    // TODO: MENUITEM
    NAV: function() { return 'navigation'; },
    OL: function() { return 'list'; },
    OPTGROUP: function() { return 'group'; },
    OPTION: function() { return 'option'; },
    OUTPUT: function() { return 'status'; },
    PROGRESS: function() { return 'progressbar'; },
    // TODO: SECTION
    SELECT: function(el) {
      if (el.hasAttribute('multiple')) {
        return 'listbox';
      }
      return parseInt(el.getAttribute('size') || '1', 10) > 1 ?
        'listbox' : 'combobox';
    },
    SVG: function() { return 'graphics-document'; },
    TABLE: function() { return 'table'; },
    TBODY: function() { return 'rowgroup'; },
    TD: function(el) { return ancestorIsGrid(el) ? 'gridcell' : 'cell'; },
    TEXTAREA: function() { return 'textbox'; },
    TFOOT: function() { return 'rowgroup'; },
    TH: function(el) {
      return el.getAttribute('context') === 'row' ?
        'rowheader' : 'columnheader';
    },
    THEAD: function() { return 'rowgroup'; },
    TR: function() { return 'row'; },
    UL: function() { return 'list'; }
  };
  var typeFns = {
    button: function(el) { return parentIsMenu(el) ? 'menuitem' : 'button'; },
    checkbox: function(el) {
      return parentIsMenu(el) ? 'menuitemcheckbox' : 'checkbox';
    },
    email: function(el) { return hasList(el) ? 'combobox' : 'textbox'; },
    image: function(el) { return parentIsMenu(el) ? 'menuitem' : 'button'; },
    number: function() { return 'spinbutton'; },
    radio: function(el) {
      return parentIsMenu(el) ? 'menuitemradio' : 'radio';
    },
    range: function() { return 'slider'; },
    reset: function() { return 'button'; },
    search: function(el) { return hasList(el) ? 'combobox' : 'searchbox'; },
    submit: function() { return 'button'; },
    telephone: function(el) { return hasList(el) ? 'combobox' : 'textbox'; },
    text: function(el) { return hasList(el) ? 'combobox' : 'textbox'; },
    url: function(el) { return hasList(el) ? 'combobox' : 'textbox'; }
  };
  function inferRole(el) {
    var attr = el.getAttribute('role');
    var fn, tagName;

    if (attr) {
      return attr;
    }

    tagName = /^(math|svg)$/i.test(el.tagName) ?
      el.tagName.toUpperCase() : el.tagName;
    fn = tagFns[tagName];

    if (!fn) {
      return null;
    }

    return fn(el) || null;
  }

  return inferRole(element);
};
