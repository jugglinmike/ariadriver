(function(window) {
  'use strict';

  window.toggle = (button) => {
    const presentState = button.getAttribute('aria-pressed');
    const newState = presentState === 'false' ? 'true' : 'false';
    button.setAttribute('aria-pressed', newState);
  };

  function onPush(target) {
    const currentCount = parseInt(target.dataset.clickCount, 10) || 0;
    target.dataset.clickCount = currentCount + 1;
  }

  document.body.addEventListener('click', ({target}) => {
    if (!target.matches('button, input[type="reset"], [role="button"]')) {
      return;
    }

    onPush(target);
  });

  document.body.addEventListener('keydown', ({target, keyCode}) => {
    if (keyCode !== 32 && keyCode !== 13) {
      return;
    }

    // Buttons fire a "click" event when they receive a keypress, so the keydown
    // event should be ignored for button.
    if (!target.matches(':not(button)[role="button"]')) {
      return;
    }

    onPush(target);
  });
}(this));
