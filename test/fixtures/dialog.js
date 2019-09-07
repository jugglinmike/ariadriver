'use strict';
let activeDialog = null;
let prevFocused = null;

function close(el, force) {
  if (el.id === 'good-slow' && !force) {
    setTimeout(() => close(el, true), 500);
    return;
  }

  el.setAttribute('aria-hidden', 'true');
  activeDialog = null;

  if (prevFocused) {
    prevFocused.focus();
    prevFocused = null;
  }
}
function open(el, force) {
  if (el.id === 'good-slow' && !force) {
    setTimeout(() => open(el, true), 500);
    return;
  }

  prevFocused = document.activeElement;
  activeDialog = el;
  el.setAttribute('aria-hidden', 'false');
  activeDialog.focus();
}
function create(el) {
  const openBtn = document.createElement('button');
  openBtn.innerHTML = `Open "${el.id}" modal`;
  openBtn.setAttribute('for', el.getAttribute('id'));

  if (el.id !== 'no-haspopup') {
    openBtn.setAttribute('aria-haspopup', 'dialog');
  }

  el.querySelector('.dialog__close')
    .addEventListener('click', () => close(el));

  openBtn.addEventListener('click', () => open(el));

  return openBtn;
}
function handleFocus(event) {
  if (!activeDialog || activeDialog.contains(event.target)) {
    return;
  }

  if (activeDialog.id === 'no-focus-capture') {
    return;
  }

  activeDialog.focus();
  event.stopPropagation();
}
function handleKeydown(event) {
  const { keyCode } = event;

  if (!activeDialog || keyCode !== 27) {
    return;
  }

  if (activeDialog.id === 'no-escape-binding') {
    return;
  }

  close(activeDialog);
}

document.addEventListener('focus', handleFocus, true);
document.addEventListener('keydown', handleKeydown, true);
Array.from(document.querySelectorAll('[role="dialog"]:not([data-skip])'))
  .map(create)
  .forEach((openBtn) => document.body.appendChild(openBtn));
