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
    return document.querySelectorAll(selector);
  }
  function findByLabelText(text) {
    var labels = document.getElementsByTagName('label');
    var length = labels.length;
    var matching = [];
    var candidates, candidate, candidateId;

    for (idx = 0; idx < length; idx += 1) {
      if (labels[idx].innerText.replace(/^\s+|\s+$/g, '') === text) {

        candidateId = labels[idx].getAttribute('for');

        if (candidateId) {
          candidate = document.getElementById(candidateId);

          if (candidate) {
            matching.push(candidate);
          }
        } else {
          candidates = labels[idx].getElementsByTagName('input');

          // TODO: Throw if more than one element matches
          if (candidates.length === 0) {
            continue;
          } else if (candidates.length > 1) {
            throw {
              status: 'Sa11yError',
              value: {
                code: 'SA11Y-POOR-SEMANTICS',
                data: '`<label>` element bearing multiple form control elements',
                recommendation: 'Declare either one or zero form control elements within the `<label>` element',
                reference: 'https://www.w3.org/TR/html401/interact/forms.html#edef-LABEL'
              }
            };
          }

          if (matching.indexOf(candidates[0]) === -1) {
            matching.push(candidates[0]);
          }
        }
      }
    }

    return matching;
  }
  var perceptibleElements = [];
  var imperceptibleCount = 0;
  var elements, idx, length;

  try {
    if (strategy === 'cssSelector') {
      elements = findByCssSelector(value);
    } else if (strategy === 'labelText') {
      elements = findByLabelText(value);
    }
  } catch (error) {
    if (error.status === 'Sa11yError') {
      return error;
    }

    throw error;
  }

  length = elements.length;

  for (idx = 0; idx < length; idx += 1) {
    if (isPerceptible(elements[idx])) {
      perceptibleElements.push(elements[idx]);
    } else {
      imperceptibleCount += 1;
    }
  }

  return {
    status: 'success',
    value: perceptibleElements
  };
};
