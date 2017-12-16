'use strict';

module.exports = function(selector) {
  // This function is defined in-line because the surrounding code is expected
  // to be serialized to a string and evaluated in a browser context.
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
  var elements = document.querySelectorAll(selector);
  var perceptibleElements = [];
  var length = elements.length;
  var imperceptibleCount = 0;
  var idx;

  for (idx = 0; idx < length; idx += 1) {
    if (isPerceptible(elements[idx])) {
      perceptibleElements.push(elements[idx]);
    } else {
      imperceptibleCount += 1;
    }
  }

  return perceptibleElements;
};
