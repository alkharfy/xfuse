/**
 * Xfuse — Offers & FAQ ScrollTrigger Animations
 * Offers: cards stagger in with scroll-triggered entrance (no pin, natural scroll)
 * FAQ: pinned scroll to reveal overflowing content within the viewport.
 */
import { prefersReducedMotion } from '../core/utils.js';

function pinScrollableSection(id) {
  const section = document.getElementById(id);
  if (!section) return;

  const content = section.firstElementChild;
  if (!content) return;

  section.style.contentVisibility = 'visible';

  const vh = window.innerHeight;
  const overflow = section.scrollHeight - vh;
  if (overflow <= 0) return;

  section.style.alignItems = 'flex-start';
  section.style.height = vh + 'px';
  section.style.overflow = 'hidden';
  section.style.zIndex = '2';

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${overflow}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      id: id,
    },
  });

  tl.to(content, {
    y: -overflow,
    ease: 'none',
    duration: 1,
  });
}

export function initOffers() {
  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.getElementById('scene-offers');
  if (!section) return;

  section.style.contentVisibility = 'visible';

  // Animate cards staggering in on scroll — no pinning needed for pricing
  const cards = section.querySelectorAll('.offers__card');
  const custom = section.querySelector('.offers__custom');
  const headline = section.querySelectorAll('.offers__headline');
  const desc = section.querySelectorAll('.offers__desc');

  // Headline & desc fade in
  [...headline, ...desc].forEach(el => {
    if (!el || getComputedStyle(el).display === 'none') return;
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
      }
    );
  });

  // Cards stagger in
  cards.forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: i * 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' }
      }
    );
  });

  // Custom project box
  if (custom) {
    gsap.fromTo(custom,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: custom, start: 'top 85%', toggleActions: 'play none none reverse' }
      }
    );
  }
}

export function initFaq() {
  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  pinScrollableSection('scene-faq');
}
