/**
 * Xfuse — Scene 2: "Strategy & Design"
 * Blueprint wireframe → high-fidelity mockup transition
 * Multi-phase: Grid → Wireframe → Annotations/Cursor → Mockup → Text → Exit
 */
import { prefersReducedMotion } from '../core/utils.js';

export function initScene2() {
  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const scene = document.getElementById('scene-2');
  if (!scene) return;

  const grid = scene.querySelector('.scene2__grid');
  const wireframePaths = scene.querySelectorAll('.scene2__wireframe path, .scene2__wireframe line, .scene2__wireframe rect');
  const wireframeLabels = scene.querySelectorAll('.scene2__wireframe text.scene2__label');
  const annotations = scene.querySelector('.scene2__annotations');
  const cursor = scene.querySelector('.scene2__cursor');
  const palette = scene.querySelector('.scene2__palette');
  const swatches = scene.querySelectorAll('.scene2__swatch');
  const mockup = scene.querySelector('.scene2__mockup');
  const uiNav = scene.querySelector('.scene2__ui-nav');
  const uiHero = scene.querySelector('.scene2__ui-hero');
  const uiCards = scene.querySelector('.scene2__ui-cards');
  const uiFooter = scene.querySelector('.scene2__ui-footer');
  const textEn = scene.querySelector('.scene2__headline[data-lang="en"]');
  const textAr = scene.querySelector('.scene2__headline[data-lang="ar"]');
  const descEn = scene.querySelector('.scene2__desc[data-lang="en"]');
  const descAr = scene.querySelector('.scene2__desc[data-lang="ar"]');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: '+=250%',
      pin: true,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
      id: 'scene-2',
      onEnter: () => { document.body.setAttribute('data-scene', '2'); scene.classList.add('scene--active'); },
      onLeave: () => scene.classList.remove('scene--active'),
      onEnterBack: () => { document.body.setAttribute('data-scene', '2'); scene.classList.add('scene--active'); },
      onLeaveBack: () => scene.classList.remove('scene--active'),
    },
  });

  // ═══════════════════════════════════════════
  // Phase 0: Background + Grid guides (0 → 0.08)
  // ═══════════════════════════════════════════
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  tl.fromTo(scene,
    { backgroundColor: isDark ? '#0C0C1D' : '#F8FAFC' },
    { backgroundColor: isDark ? '#0a1628' : '#e8eef6', duration: 0.08 },
    0
  );

  if (grid) {
    tl.fromTo(grid,
      { opacity: 0 },
      { opacity: 1, duration: 0.08, ease: 'power1.in' },
      0.02
    );
  }

  // ═══════════════════════════════════════════
  // Phase 1: Wireframe drawing (0.05 → 0.30)
  // ═══════════════════════════════════════════
  wireframePaths.forEach((path, i) => {
    if (path.getTotalLength) {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(path, { strokeDashoffset: 0, duration: 0.12, ease: 'none' }, 0.05 + i * 0.008);
    }
  });

  // Labels fade in after wireframe draws
  wireframeLabels.forEach((label, i) => {
    tl.fromTo(label,
      { opacity: 0 },
      { opacity: 1, duration: 0.06 },
      0.22 + i * 0.015
    );
  });

  // ═══════════════════════════════════════════
  // Phase 2: Annotations + Cursor + Palette (0.28 → 0.42)
  // ═══════════════════════════════════════════
  if (annotations) {
    tl.fromTo(annotations,
      { opacity: 0 },
      { opacity: 1, duration: 0.06 },
      0.28
    );
  }

  if (cursor) {
    // Cursor appears and moves across the wireframe
    tl.fromTo(cursor,
      { opacity: 0, x: 0, y: 0 },
      { opacity: 1, duration: 0.04 },
      0.30
    );
    tl.to(cursor,
      { x: 80, y: 40, duration: 0.06, ease: 'power2.inOut' },
      0.34
    );
    tl.to(cursor,
      { x: 160, y: -20, duration: 0.06, ease: 'power2.inOut' },
      0.40
    );
  }

  // Palette slides up
  if (palette) {
    tl.fromTo(palette,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' },
      0.32
    );
  }

  // Swatches pop in
  swatches.forEach((swatch, i) => {
    tl.fromTo(swatch,
      { scale: 0 },
      { scale: 1, duration: 0.04, ease: 'back.out(2)' },
      0.34 + i * 0.02
    );
  });

  // ═══════════════════════════════════════════
  // Phase 3: Wireframe → Mockup transition (0.42 → 0.55)
  // ═══════════════════════════════════════════

  // Fade grid, annotations, cursor, labels
  if (grid) {
    tl.to(grid, { opacity: 0, duration: 0.06 }, 0.42);
  }
  if (annotations) {
    tl.to(annotations, { opacity: 0, duration: 0.04 }, 0.42);
  }
  if (cursor) {
    tl.to(cursor, { opacity: 0, duration: 0.04 }, 0.43);
  }
  wireframeLabels.forEach(label => {
    tl.to(label, { opacity: 0, duration: 0.04 }, 0.42);
  });

  // Wireframe fades as mockup rises
  wireframePaths.forEach(path => {
    tl.to(path, { opacity: 0, duration: 0.08 }, 0.44);
  });

  // Mockup reveal
  if (mockup) {
    tl.fromTo(mockup,
      { filter: 'grayscale(1) brightness(1.3)', opacity: 0 },
      { filter: 'grayscale(0) brightness(1)', opacity: 1, duration: 0.12, ease: 'power2.out' },
      0.44
    );
  }

  // ═══════════════════════════════════════════
  // Phase 4: UI elements stagger in (0.50 → 0.68)
  // ═══════════════════════════════════════════
  const uiSections = [uiNav, uiHero, uiCards, uiFooter].filter(Boolean);
  uiSections.forEach((el, i) => {
    tl.fromTo(el,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' },
      0.50 + i * 0.04
    );
  });

  // Perspective tilt on mockup
  if (mockup) {
    tl.fromTo(mockup,
      { rotateY: 0, rotateX: 0 },
      { rotateY: -3, rotateX: 2, duration: 0.06, ease: 'power1.out' },
      0.62
    );
    tl.to(mockup,
      { rotateY: 0, rotateX: 0, duration: 0.06, ease: 'power1.inOut' },
      0.68
    );
  }

  // ═══════════════════════════════════════════
  // Phase 5: Headline + Description (0.72 → 0.82)
  // ═══════════════════════════════════════════
  [textEn, textAr].forEach(el => {
    if (el) {
      tl.fromTo(el,
        { opacity: 0, filter: 'blur(15px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 0.1, ease: 'power2.out' },
        0.72
      );
    }
  });

  [descEn, descAr].forEach(el => {
    if (el) {
      tl.fromTo(el,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' },
        0.78
      );
    }
  });

  // Fade palette on text reveal
  if (palette) {
    tl.to(palette, { opacity: 0, duration: 0.06 }, 0.75);
  }

  // ═══════════════════════════════════════════
  // Phase 6: Exit (0.88 → 1.0)
  // ═══════════════════════════════════════════
  tl.to(scene.querySelector('.scene2__content'), {
    opacity: 0, scale: 0.95, y: -30, duration: 0.1, ease: 'power2.in'
  }, 0.9);

  // Also fade out text
  [textEn, textAr, descEn, descAr].forEach(el => {
    if (el) tl.to(el, { opacity: 0, y: -20, duration: 0.08, ease: 'power2.in' }, 0.9);
  });
}
