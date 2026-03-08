/**
 * Xfuse — Portfolio Parallax Depth Effect
 * Shifts project image opposite to mouse on hover for depth illusion.
 * Desktop only, respects prefers-reduced-motion.
 */
import { isDesktop, prefersReducedMotion } from '../core/utils.js';

const SHIFT = 8; // max px shift

export function initPortfolioParallax() {
  if (!isDesktop() || prefersReducedMotion()) return;

  const projects = document.querySelectorAll('.scene4__project');
  if (!projects.length) return;

  projects.forEach(proj => {
    const img = proj.querySelector('.scene4__project-img');
    if (!img) return;

    img.style.transition = 'transform 0.3s ease-out';
    img.style.willChange = 'transform';

    proj.addEventListener('mousemove', e => {
      const rect = proj.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      img.style.transform = `translate(${-x * SHIFT}px, ${-y * SHIFT}px) scale(1.04)`;
    });

    proj.addEventListener('mouseleave', () => {
      img.style.transform = '';
    });
  });
}
