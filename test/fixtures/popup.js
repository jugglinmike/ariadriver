'use strict';

async function handleClick({target}) {
  const {openRole} = target.dataset;
  const toOpen = document.querySelector(`[role="${openRole}"]`);

  if (!toOpen) {
    return;
  }

  if (target.getAttribute('aria-label') === 'Slow') {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  toOpen.setAttribute('aria-hidden', 'false');
}

Array.from(document.querySelectorAll('[data-open-role]'))
  .forEach((el) => {
    el.addEventListener('click', handleClick);
  });
