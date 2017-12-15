'use strict';

function handleClick({target}) {
  const {openRole} = target.dataset;
  const toOpen = document.querySelector(`[role="${openRole}"]`);

  if (!toOpen) {
    return;
  }

  const open = () => toOpen.setAttribute('aria-hidden', 'false');
  target.getAttribute('aria-label') === 'Slow' ? setTimeout(open, 500) : open();
}

Array.from(document.querySelectorAll('[data-open-role]'))
  .forEach((el) => {
    el.addEventListener('click', handleClick);
  });
