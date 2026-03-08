/**
 * Xfuse — Navigation
 */
import { throttle, scrollToTarget } from '../core/utils.js';

export function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const overlay = document.querySelector('.nav__overlay');
  const navLinks = document.querySelectorAll('.nav__overlay-link');

  if (!nav) return;

  // --- Hide/Show on scroll ---
  let lastScrollY = 0;

  const handleScroll = throttle(() => {
    const currentY = window.scrollY;

    if (currentY > 100) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    if (currentY > lastScrollY && currentY > 200) {
      nav.classList.add('nav--hidden');
    } else {
      nav.classList.remove('nav--hidden');
    }

    lastScrollY = currentY;
  }, 100);

  window.addEventListener('scroll', handleScroll, { passive: true });

  // --- Hamburger toggle ---
  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Smooth scroll for nav links ---
  document.querySelectorAll('.nav__link[href^="#"], .nav__overlay-link[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      scrollToTarget(target);
    });
  });
}
