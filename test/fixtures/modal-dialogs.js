'use strict';
let activeDialog = null;
let prevFocused = null;

function close(el, event) {
  el.setAttribute('aria-hidden', 'true');
  activeDialog = null;

  if (prevFocused) {
    prevFocused.focus();
    prevFocused = null;
  }
}
function open(el) {
  prevFocused = document.activeElement;
  activeDialog = el;
  el.setAttribute('aria-hidden', 'false');
  activeDialog.focus();
}
function create(el) {
  const openBtn = document.createElement('button');
  openBtn.innerHTML = `Open "${el.id}" modal`;
  openBtn.setAttribute('for', el.getAttribute('id'));

  el.querySelector('.dialog__close')
    .addEventListener('click', () => close(el));

  openBtn.addEventListener('click', (event) => open(el, event));

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
function handleKeypress(event) {
  const { keyCode } = event;

  if (!activeDialog || keyCode !== 27) {
    return;
  }

  if (activeDialog.id === 'no-escape-binding') {
    return;
  }

  if (activeDialog.id === 'good-slow-close') {
    setTimeout(() => close(activeDialog), 500);
    return;
  }

  close(activeDialog);
}

document.addEventListener('focus', handleFocus, true);
document.addEventListener('keypress', handleKeypress, true);
Array.from(document.querySelectorAll('[role="dialog"]:not([data-skip])'))
  .map(create)
  .forEach((openBtn) => document.body.appendChild(openBtn));
