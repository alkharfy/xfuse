/**
 * Xfuse — App Initialization
 * Lenis smooth scroll + GSAP/ScrollTrigger integration
 */
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { prefersReducedMotion } from './utils.js';

let lenis = null;

export function getLenis() {
  return lenis;
}

export function initApp() {
  // Register GSAP plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Global ScrollTrigger defaults
    ScrollTrigger.defaults({
      fastScrollEnd: true,
      preventOverlaps: true,
    });
  }

  // Mark body as JS-enabled
  document.body.classList.add('js-enabled');

  // Add class for reduced motion
  if (prefersReducedMotion()) {
    document.body.classList.add('reduced-motion');
    return;
  }

  // Initialize Lenis smooth scroll
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 2,
    infinite: false,
  });

  // Connect Lenis to GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // Page load animation — nav slides down
  if (typeof gsap !== 'undefined') {
    gsap.fromTo('.nav',
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.1 }
    );
  }
}
