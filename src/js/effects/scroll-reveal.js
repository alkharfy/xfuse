/**
 * Xfuse — Scroll Reveal (GSAP ScrollTrigger)
 * Generic reveal animation for sections + parallax depth effects
 */
import { prefersReducedMotion } from '../core/utils.js';

export function initScrollReveal() {
  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Section headers
  const headers = document.querySelectorAll('.section-header');
  headers.forEach(header => {
    gsap.fromTo(header,
      { opacity: 0, y: 30 },
      {
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          once: true,
        },
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      }
    );
  });

  // Social proof
  const socialProof = document.querySelector('.social-proof');
  if (socialProof) {
    gsap.fromTo(socialProof,
      { opacity: 0, y: 20 },
      {
        scrollTrigger: {
          trigger: socialProof,
          start: 'top 85%',
          once: true,
        },
        opacity: 1,
        y: 0,
        duration: 0.5,
      }
    );
  }

  // Why Xfuse cards
  const whyCards = document.querySelectorAll('.why-card');
  if (whyCards.length) {
    gsap.fromTo(whyCards,
      { opacity: 0, y: 40 },
      {
        scrollTrigger: {
          trigger: '.why__grid',
          start: 'top 80%',
          once: true,
        },
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
      }
    );
  }

  // CTA section
  const ctaCard = document.querySelector('.final-cta__card');
  if (ctaCard) {
    gsap.fromTo(ctaCard,
      { opacity: 0, y: 40, scale: 0.97 },
      {
        scrollTrigger: {
          trigger: ctaCard,
          start: 'top 80%',
          once: true,
        },
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out',
      }
    );
  }

  // Contact section
  const contactCard = document.querySelector('.contact-card');
  if (contactCard) {
    gsap.fromTo(contactCard,
      { opacity: 0, y: 40 },
      {
        scrollTrigger: {
          trigger: contactCard,
          start: 'top 80%',
          once: true,
        },
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      }
    );
  }

  // ── Parallax Depth Effects ──
  initParallax();
}

function initParallax() {
  // Grid background parallax — moves slower than scroll for depth feel
  const gridBg = document.querySelector('.grid-background');
  if (gridBg) {
    gsap.to(gridBg, {
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
      y: '-20%',
      ease: 'none',
    });
  }
}
