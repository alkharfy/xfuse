/**
 * Xfuse — Magnetic Buttons
 * Buttons attract toward cursor on hover
 */
import { isDesktop, prefersReducedMotion } from '../core/utils.js';

export function initMagnetic() {
  if (!isDesktop() || prefersReducedMotion()) return;

  const magnetics = document.querySelectorAll('.magnetic');

  magnetics.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
}
