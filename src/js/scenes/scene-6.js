/**
 * Xfuse — Scene 6: "Trust & Testimonials"
 * Mission control theme — scanlines, incoming transmissions, counters
 */
import { prefersReducedMotion } from '../core/utils.js';
import { initTestimonials } from '../components/testimonials.js';

export async function initScene6() {
  // Load dynamic testimonial data first (rebuilds .scene6__testimonials DOM)
  await initTestimonials();

  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const scene = document.getElementById('scene-6');
  if (!scene) return;

  const scanlines = scene.querySelector('.scene6__scanlines');
  const status = scene.querySelector('.scene6__status');
  const testimonials = scene.querySelectorAll('.scene6__testimonial');
  const counters = scene.querySelectorAll('.scene6__counter');
  const textEn = scene.querySelector('.scene6__headline[data-lang="en"]');
  const textAr = scene.querySelector('.scene6__headline[data-lang="ar"]');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: '+=200%',
      pin: true,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
      id: 'scene-6',
      onEnter: () => { document.body.setAttribute('data-scene', '6'); scene.classList.add('scene--active'); },
      onLeave: () => scene.classList.remove('scene--active'),
      onEnterBack: () => { document.body.setAttribute('data-scene', '6'); scene.classList.add('scene--active'); },
      onLeaveBack: () => scene.classList.remove('scene--active'),
    },
  });

  // Background to dark mission control
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  tl.fromTo(scene,
    { backgroundColor: isDark ? '#0C0C1D' : '#F8FAFC' },
    { backgroundColor: isDark ? '#080c14' : '#0d1320', duration: 0.05 },
    0
  );

  // Scanlines appear
  if (scanlines) {
    tl.fromTo(scanlines, { opacity: 0 }, { opacity: 0.15, duration: 0.1 }, 0);
  }

  // Status indicator
  if (status) {
    tl.fromTo(status,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.08, ease: 'power2.out' },
      0.05
    );
  }

  // Headline
  [textEn, textAr].forEach(el => {
    if (el) {
      tl.fromTo(el,
        { opacity: 0, filter: 'blur(15px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 0.12, ease: 'power2.out' },
        0.08
      );
    }
  });

  // Testimonials appear as incoming transmissions
  const testimonialCount = testimonials.length;
  const testimonialWindow = 0.55; // total timeline range for all testimonials (0.15 → 0.70)
  const testimonialStagger = testimonialCount > 1 ? testimonialWindow / (testimonialCount - 1) : 0;

  testimonials.forEach((test, i) => {
    const signal = test.querySelector('.scene6__signal');
    const card = test.querySelector('.scene6__card');
    const stars = test.querySelectorAll('.scene6__star');
    const startTime = 0.15 + i * testimonialStagger;

    // Signal line appears first
    if (signal) {
      tl.fromTo(signal,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.04, ease: 'power2.out' },
        startTime
      );
    }

    // Reveal testimonial wrapper (has opacity: 0 in CSS)
    tl.fromTo(test,
      { opacity: 0 },
      { opacity: 1, duration: 0.04 },
      startTime
    );

    // Card expands from the signal line
    if (card) {
      tl.fromTo(card,
        { scaleX: 0.3, scaleY: 0, opacity: 0, transformOrigin: 'left center' },
        { scaleX: 1, scaleY: 1, opacity: 1, duration: 0.08, ease: 'back.out(1.2)' },
        startTime + 0.04
      );
    }

    // Stars light up one by one
    stars.forEach((star, j) => {
      tl.fromTo(star,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.02, ease: 'back.out(2)' },
        startTime + 0.1 + j * 0.02
      );
    });
  });

  // Counter animations
  counters.forEach((counter, i) => {
    const numEl = counter.querySelector('.scene6__counter-num');
    const targetVal = parseInt(numEl?.dataset.target || '0', 10);

    tl.fromTo(counter,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' },
      0.75 + i * 0.05
    );

    if (numEl) {
      tl.fromTo(numEl,
        { innerText: 0 },
        {
          innerText: targetVal,
          duration: 0.1,
          ease: 'power1.out',
          snap: { innerText: 1 },
          modifiers: { innerText: (v) => Math.ceil(v) }
        },
        0.77 + i * 0.05
      );
    }
  });

  // Exit: fade to dark
  tl.to(scene.querySelectorAll('.scene6__content'), { opacity: 0, duration: 0.08 }, 0.92);
}
