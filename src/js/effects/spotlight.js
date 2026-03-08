/**
 * Xfuse — Card Spotlight Effect (Stripe-style)
 * Radial gradient follows mouse over cards
 */
import { isDesktop } from '../core/utils.js';

export function initSpotlight() {
  if (!isDesktop()) return;

  const cards = document.querySelectorAll('.service-card, .why-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}
