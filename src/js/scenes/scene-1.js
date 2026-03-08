/**
 * Xfuse — Scene 1: "Discovery"
 * Logo center + 4 service orbits appearing with scroll
 * Stats counter + constellation lines between services
 */
import { prefersReducedMotion } from '../core/utils.js';

export function initScene1() {
  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const scene = document.getElementById('scene-1');
  if (!scene) return;

  const orbitItems = scene.querySelectorAll('.scene1__orbit-item');
  const lines = scene.querySelector('.scene1__lines');
  const textEn = scene.querySelector('.scene1__headline[data-lang="en"]');
  const textAr = scene.querySelector('.scene1__headline[data-lang="ar"]');
  const descEn = scene.querySelector('.scene1__desc[data-lang="en"]');
  const descAr = scene.querySelector('.scene1__desc[data-lang="ar"]');
  const stats = scene.querySelectorAll('.scene1__stat-number');
  const logo = scene.querySelector('.scene1__logo');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: '+=250%',
      pin: true,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
      id: 'scene-1',
      onEnter: () => { document.body.setAttribute('data-scene', '1'); scene.classList.add('scene--active'); },
      onLeave: () => scene.classList.remove('scene--active'),
      onEnterBack: () => { document.body.setAttribute('data-scene', '1'); scene.classList.add('scene--active'); },
      onLeaveBack: () => scene.classList.remove('scene--active'),
    },
  });

  // Logo scales in
  if (logo) {
    tl.fromTo(logo, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.1, ease: 'back.out(1.7)' }, 0);
  }

  // Orbit items appear one by one with stagger
  orbitItems.forEach((item, i) => {
    const startTime = 0.08 + i * 0.1;
    tl.fromTo(item,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.12, ease: 'back.out(1.4)' },
      startTime
    );
    // Expand card text on hover-like reveal
    const desc = item.querySelector('.scene1__orbit-desc');
    if (desc) {
      tl.fromTo(desc,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' },
        startTime + 0.08
      );
    }
  });

  // Constellation lines draw
  if (lines) {
    tl.fromTo(lines, { opacity: 0 }, { opacity: 0.3, duration: 0.15 }, 0.3);
  }

  // Headline blur reveal
  [textEn, textAr].forEach(el => {
    if (el) {
      tl.fromTo(el,
        { opacity: 0, filter: 'blur(15px)', y: 20 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.15, ease: 'power2.out' },
        0.45
      );
    }
  });

  // Description
  [descEn, descAr].forEach(el => {
    if (el) {
      tl.fromTo(el,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' },
        0.55
      );
    }
  });

  // Stats fade in + count up
  const statItems = scene.querySelectorAll('.scene1__stat');
  statItems.forEach((item, i) => {
    tl.fromTo(item,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' },
      0.58 + i * 0.02
    );
  });
  stats.forEach(stat => {
    const target = parseInt(stat.dataset.target, 10) || 0;
    tl.fromTo(stat,
      { innerText: '0' },
      {
        innerText: target,
        duration: 0.2,
        snap: { innerText: 1 },
        ease: 'power1.inOut',
      },
      0.6
    );
  });

  // Orbit rotation (continuous feel with scrub)
  const orbitRing = scene.querySelector('.scene1__orbit-ring');
  if (orbitRing) {
    tl.to(orbitRing, { rotation: 60, duration: 0.4, ease: 'none' }, 0.1);
  }

  // Exit: everything converges to center
  tl.to(orbitItems, { scale: 0, opacity: 0, duration: 0.1, stagger: 0.02, ease: 'power2.in' }, 0.85);
  if (logo) tl.to(logo, { scale: 0.5, opacity: 0, duration: 0.1 }, 0.9);
  [textEn, textAr, descEn, descAr].forEach(el => {
    if (el) tl.to(el, { opacity: 0, y: -20, duration: 0.08 }, 0.9);
  });
  if (lines) tl.to(lines, { opacity: 0, duration: 0.08 }, 0.9);
}
