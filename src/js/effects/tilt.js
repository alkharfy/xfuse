/**
 * Xfuse — Lightweight 3D Tilt Effect
 * Applies perspective tilt on mousemove to card elements.
 * Desktop only, respects prefers-reduced-motion.
 */
import { isDesktop, prefersReducedMotion } from '../core/utils.js';

const TILT_MAX = 8; // max degrees
const SCALE = 1.03;
const TRANSITION = 'transform 0.4s cubic-bezier(0.03, 0.98, 0.52, 0.99)';

function applyTilt(el) {
  function onMove(e) {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (TILT_MAX * (0.5 - y)).toFixed(2);
    const tiltY = (TILT_MAX * (x - 0.5)).toFixed(2);
    el.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${SCALE}, ${SCALE}, ${SCALE})`;
  }

  function onLeave() {
    el.style.transform = '';
  }

  el.style.transition = TRANSITION;
  el.style.willChange = 'transform';
  el.addEventListener('mousemove', onMove);
  el.addEventListener('mouseleave', onLeave);
}

export function initTilt() {
  if (!isDesktop() || prefersReducedMotion()) return;

  const selectors = [
    '.scene1__orbit-item',
    '.scene5__card',
    '.offers__card',
  ];

  const elements = document.querySelectorAll(selectors.join(','));
  elements.forEach(applyTilt);
}
