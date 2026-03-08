/**
 * Xfuse — Process Timeline (scroll-triggered line fill + dot activation)
 */
import { prefersReducedMotion } from '../core/utils.js';

export function initProcess() {
  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const fill = document.querySelector('.process__line-fill');
  const steps = document.querySelectorAll('.process__step');
  const dots = document.querySelectorAll('.process__dot');

  if (!fill || !steps.length) return;

  // Animate line fill
  gsap.to(fill, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '.process',
      start: 'top 60%',
      end: 'bottom 60%',
      scrub: 1,
      onUpdate: (self) => {
        // Activate dots based on scroll progress
        const progress = self.progress;
        const total = dots.length;
        dots.forEach((dot, i) => {
          if (progress >= (i / total)) {
            dot.classList.add('active');
          }
        });
      },
    },
  });

  // Reveal steps
  gsap.from(steps, {
    scrollTrigger: {
      trigger: '.process',
      start: 'top 75%',
      once: true,
    },
    opacity: 0,
    y: 30,
    duration: 0.5,
    stagger: 0.15,
    ease: 'power3.out',
  });
}
