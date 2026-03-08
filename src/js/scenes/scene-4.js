/**
 * Xfuse — Scene 4: "Launch & Portfolio"
 * Rocket flies on the side with fire exhaust,
 * projects appear centered one at a time
 */
import { prefersReducedMotion } from '../core/utils.js';

export function initScene4() {
  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const scene = document.getElementById('scene-4');
  if (!scene) return;

  const rocket = scene.querySelector('.scene4__rocket');
  const starLayers = scene.querySelectorAll('.scene4__stars');
  const projects = scene.querySelectorAll('.scene4__project');
  const textEn = scene.querySelector('.scene4__headline[data-lang="en"]');
  const textAr = scene.querySelector('.scene4__headline[data-lang="ar"]');
  const descEn = scene.querySelector('.scene4__desc[data-lang="en"]');
  const descAr = scene.querySelector('.scene4__desc[data-lang="ar"]');

  // Set initial state for all projects
  gsap.set(projects, { opacity: 0, scale: 0.3, force3D: true });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: '+=350%',
      pin: true,
      pinSpacing: true,
      scrub: 0.8,
      anticipatePin: 1,
      id: 'scene-4',
      onEnter: () => { document.body.setAttribute('data-scene', '4'); scene.classList.add('scene--active'); },
      onLeave: () => scene.classList.remove('scene--active'),
      onEnterBack: () => { document.body.setAttribute('data-scene', '4'); scene.classList.add('scene--active'); },
      onLeaveBack: () => scene.classList.remove('scene--active'),
    },
  });

  // Scene background transitions to deep space
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  tl.fromTo(scene,
    { backgroundColor: isDark ? '#0C0C1D' : '#F8FAFC' },
    { backgroundColor: isDark ? '#050510' : '#0a0a1a', duration: 0.05, force3D: true },
    0
  );

  // Rocket launches from bottom-right upward
  if (rocket) {
    tl.fromTo(rocket,
      { y: '60vh', opacity: 0 },
      { y: '10vh', opacity: 1, duration: 0.12, ease: 'power2.out', force3D: true },
      0
    );
  }

  // Star layers parallax at different speeds
  starLayers.forEach((layer, i) => {
    const speed = (i + 1) * 40;
    tl.to(layer, { y: -speed, duration: 0.8, ease: 'none', force3D: true }, 0);
  });

  // Headline blur reveal
  [textEn, textAr].forEach(el => {
    if (el) {
      tl.fromTo(el,
        { opacity: 0, filter: 'blur(15px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 0.08, ease: 'power2.out' },
        0.08
      );
    }
  });

  // Description
  [descEn, descAr].forEach(el => {
    if (el) {
      tl.fromTo(el,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.05, ease: 'power2.out' },
        0.14
      );
    }
  });

  // Move headline/desc away before projects
  tl.to([textEn, textAr, descEn, descAr].filter(Boolean), {
    opacity: 0, duration: 0.04
  }, 0.22);

  // Projects appear centered one at a time
  const projectStart = 0.26;
  const projectDur = 0.14; // each project gets 14% of timeline

  projects.forEach((proj, i) => {
    const start = projectStart + i * projectDur;
    const info = proj.querySelector('.scene4__project-info');
    const glow = proj.querySelector('.scene4__project-glow');

    // Fade in + scale up
    tl.to(proj, {
      scale: 1, opacity: 1, duration: 0.05,
      ease: 'back.out(1.2)', force3D: true
    }, start);

    // Glow
    if (glow) {
      tl.to(glow, { opacity: 0.5, duration: 0.04 }, start + 0.03);
    }

    // Info slides in
    if (info) {
      tl.fromTo(info,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.04, ease: 'power2.out' },
        start + 0.04
      );
    }

    // Rocket moves upward alongside projects
    if (rocket) {
      tl.to(rocket, {
        y: `${10 - (i + 1) * 18}vh`,
        duration: projectDur * 0.5,
        ease: 'none', force3D: true
      }, start);
    }

    // Fade out when next project comes (not for last)
    if (i < projects.length - 1) {
      tl.to(proj, {
        opacity: 0, scale: 0.7,
        duration: 0.04, force3D: true
      }, start + projectDur - 0.04);

      if (glow) {
        tl.to(glow, { opacity: 0, duration: 0.03 }, start + projectDur - 0.04);
      }
    }
  });

  // Rocket exits at the end
  if (rocket) {
    tl.to(rocket, {
      y: '-50vh', opacity: 0,
      duration: 0.06, ease: 'power2.in', force3D: true
    }, 0.94);
  }

  // Last project fades
  if (projects.length) {
    tl.to(projects[projects.length - 1], {
      opacity: 0, scale: 0.8,
      duration: 0.04, force3D: true
    }, 0.94);
  }
}
