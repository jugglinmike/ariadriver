'use strict';

module.exports = function(strategy, value) {
  // This function is defined in-line because the surrounding code is expected
  // to be serialized to a string and evaluated in a browser context.
  'use strict';

  function isPerceptible(element) {
    if (getComputedStyle(element).display === 'hidden') {
      return false;
    }

    // http://w3c.github.io/html/editing.html#the-hidden-attribute
    if (element.getAttribute('hidden') !== null) {
      return false;
    }

    if (element.getAttribute('aria-hidden') === 'true') {
      return false;
    }

    if (!element.parentNode) {
      return false;
    }

    if (element.parentNode === document) {
      return true;
    }

    return isPerceptible(element.parentNode);
  }
  function findByCssSelector(selector) {
    return {
      elements: document.querySelectorAll(selector),
      warnings: []
    };
  }
  function findByLabelText(text) {
    var labels = document.getElementsByTagName('label');
    var length = labels.length;
    var matching = [];
    var warnings = [];
    var candidates, candidate, forAttribute;

    for (idx = 0; idx < length; idx += 1) {
      if (labels[idx].innerText.replace(/^\s+|\s+$/g, '') !== text) {
        continue;
      }

      forAttribute = labels[idx].getAttribute('for');

      if (forAttribute) {
        candidate = document.getElementById(forAttribute);

        // TODO: warn if candidate is not labelable
        // TODO: throw if candidate is `null`
      }

      // TODO: Find all labelable elements
      candidates = labels[idx].getElementsByTagName('input');

      if (candidates.length > 0) {
        if (candidate && candidates[0] !== candidate) {
          warnings.push({
            code: 'SA11Y-POOR-SEMANTICS',
            data: '',
            recommendation: '',
            reference: 'https://dev.w3.org/html5/spec-preview/the-label-element.html#dom-label-control'
          });
        }

        if (candidates.length > 1) {
          warnings.push({
            code: 'SA11Y-POOR-SEMANTICS',
            data: '`<label>` element bearing multiple form control elements',
            recommendation: 'Declare either one or zero form control elements within the `<label>` element',
            reference: 'https://dev.w3.org/html5/spec-preview/the-label-element.html#dom-label-control'
          });
        }

        // The element referenced by the `for` attribute takes precedence.
        //
        // > If the for attribute is not specified, but the label element has a
        // > labelable element descendant, then the first such descendant in
        // > tree order is the label element's labeled control.
        if (!candidate) {
          candidate = candidates[0];
        }
      }

      if (matching.indexOf(candidate) === -1) {
        matching.push(candidate);
      }
    }

    // TODO: Fall back to `aria-label`
    // https://www.w3.org/WAI/tutorials/forms/labels/

    return {
      elements: matching,
      warnings: warnings
    };
  }
  var perceptibleElements = [];
  var idx, result;

  if (strategy === 'cssSelector') {
    result = findByCssSelector(value);
  } else if (strategy === 'labelText') {
    result = findByLabelText(value);
  }

  for (idx = 0; idx < result.elements.length; idx += 1) {
    if (isPerceptible(result.elements[idx])) {
      perceptibleElements.push(result.elements[idx]);
    }
  }

  return {
    elements: perceptibleElements,
    warnings: result.warnings
  };
};
