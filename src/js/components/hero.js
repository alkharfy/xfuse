/**
 * Xfuse — Hero Animations (GSAP)
 */
import { prefersReducedMotion } from '../core/utils.js';

export function initHero() {
  if (prefersReducedMotion()) return;
  if (typeof gsap === 'undefined') return;

  // Set initial states for clip-path reveal
  gsap.set('.badge', { opacity: 0, y: 20 });
  gsap.set('.hero__word', { opacity: 0, y: 60, clipPath: 'inset(100% 0 0 0)' });
  gsap.set('.hero__subheadline', { opacity: 0, y: 20 });
  gsap.set('.hero__ctas .btn--primary, .hero__ctas .btn--secondary', { opacity: 0, y: 20 });
  gsap.set('.orbit-container', { opacity: 0, scale: 0.8 });
  gsap.set('.scroll-indicator', { opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Badge
  tl.to('.badge', {
    opacity: 1,
    y: 0,
    duration: 0.6,
  });

  // Headline words — clip-path reveal stagger
  tl.to('.hero__word', {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0% 0 0 0)',
    duration: 0.6,
    stagger: 0.12,
    ease: 'power4.out',
  }, '-=0.3');

  // Subheadline
  tl.to('.hero__subheadline', {
    opacity: 1,
    y: 0,
    duration: 0.5,
  }, '-=0.2');

  // CTAs
  tl.to('.hero__ctas .btn--primary, .hero__ctas .btn--secondary', {
    opacity: 1,
    y: 0,
    duration: 0.4,
    stagger: 0.1,
  }, '-=0.2');

  // Orbit
  tl.to('.orbit-container', {
    opacity: 1,
    scale: 1,
    duration: 0.8,
    ease: 'back.out(1.2)',
  }, '-=0.4');

  // Scroll indicator
  tl.to('.scroll-indicator', {
    opacity: 1,
    duration: 0.5,
  }, '-=0.2');

}
