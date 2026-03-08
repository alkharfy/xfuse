/**
 * Xfuse — Router (Smooth Scroll + URL Hash)
 * Handles non-nav anchor clicks and initial hash.
 */
import { scrollToTarget } from './utils.js';

export function initRouter() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    if (link.matches('.nav__link, .nav__overlay-link')) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    scrollToTarget(target);
    history.pushState(null, '', targetId);
  });

  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      requestAnimationFrame(() => scrollToTarget(target));
    }
  }
}
