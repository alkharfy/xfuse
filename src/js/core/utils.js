/**
 * Xfuse — Core Utilities
 */

/** Throttle — limits function execution frequency */
export function throttle(fn, delay) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/** Debounce — executes after event stops */
export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/** Check if device has hover + fine pointer (desktop) */
export function isDesktop() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Check if user prefers reduced motion */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** querySelector shorthand */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/** querySelectorAll shorthand */
export function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

/** Smooth scroll to element with nav offset */
export function scrollToTarget(target) {
  if (!target) return;
  const nav = document.querySelector('.nav');
  const offset = nav ? nav.offsetHeight + 20 : 0;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}
