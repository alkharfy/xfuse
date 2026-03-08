/**
 * Xfuse — Service Cards (Card Spotlight effect handled by spotlight.js)
 * This module handles ScrollTrigger reveal for cards
 */
import { prefersReducedMotion } from '../core/utils.js';

export function initServiceCards() {
  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const cards = document.querySelectorAll('.service-card');
  if (!cards.length) return;

  gsap.from(cards, {
    scrollTrigger: {
      trigger: '.services__grid',
      start: 'top 80%',
      once: true,
    },
    opacity: 0,
    y: 40,
    duration: 0.5,
    stagger: 0.12,
    ease: 'power3.out',
  });
}
