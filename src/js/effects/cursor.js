/**
 * Xfuse — Custom Cursor (Desktop only)
 * Scene-aware: changes appearance based on current scene
 */
import { isDesktop, prefersReducedMotion } from '../core/utils.js';

export function initCursor() {
  if (!isDesktop() || prefersReducedMotion()) return;

  const dot = document.querySelector('.cursor');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let rafId = null;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    // Dot follows instantly
    dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;

    // Ring follows with easing
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;

    rafId = requestAnimationFrame(animate);
  }

  // Pause when tab is hidden to save CPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!rafId) {
      rafId = requestAnimationFrame(animate);
    }
  });

  rafId = requestAnimationFrame(animate);

  // Scene-aware cursor styling
  const bodyObserver = new MutationObserver(() => {
    const scene = document.body.getAttribute('data-scene');
    dot.setAttribute('data-scene', scene || '');
    ring.setAttribute('data-scene', scene || '');
  });
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['data-scene'] });

  // Hover state on interactive elements (using event delegation)
  document.addEventListener('mouseenter', (e) => {
    const el = e.target;
    if (!(el instanceof Element)) return;
    if (el.matches('.scene4__project, .scene5__card, .scene6__card, .scene1__orbit-item, .scene2__mockup')) {
      dot.classList.add('is-card');
      ring.classList.add('is-card');
    } else if (el.matches('a, button, .magnetic, input, textarea, select')) {
      dot.classList.add('is-hover');
      ring.classList.add('is-hover');
    }
  }, true);

  document.addEventListener('mouseleave', (e) => {
    const el = e.target;
    if (!(el instanceof Element)) return;
    if (el.matches('.scene4__project, .scene5__card, .scene6__card, .scene1__orbit-item, .scene2__mockup')) {
      dot.classList.remove('is-card');
      ring.classList.remove('is-card');
    } else if (el.matches('a, button, .magnetic, input, textarea, select')) {
      dot.classList.remove('is-hover');
      ring.classList.remove('is-hover');
    }
  }, true);
}
