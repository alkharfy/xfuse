/**
 * Xfuse — Scene 3: "Development"
 * Split-screen code editor + mockup
 * Scroll-synced typing effect + tech marquee
 */
import { prefersReducedMotion } from '../core/utils.js';

export function initScene3() {
  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const scene = document.getElementById('scene-3');
  if (!scene) return;

  const codeLines = scene.querySelectorAll('.scene3__code-line');
  const mockup = scene.querySelector('.scene3__mockup');
  const mockupElements = scene.querySelectorAll('.scene3__mockup-element');
  const terminal = scene.querySelector('.scene3__terminal');
  const marquee = scene.querySelector('.scene3__marquee');
  const textEn = scene.querySelector('.scene3__headline[data-lang="en"]');
  const textAr = scene.querySelector('.scene3__headline[data-lang="ar"]');
  const descEn = scene.querySelector('.scene3__desc[data-lang="en"]');
  const descAr = scene.querySelector('.scene3__desc[data-lang="ar"]');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: '+=300%',
      pin: true,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
      id: 'scene-3',
      onEnter: () => { document.body.setAttribute('data-scene', '3'); scene.classList.add('scene--active'); },
      onLeave: () => scene.classList.remove('scene--active'),
      onEnterBack: () => { document.body.setAttribute('data-scene', '3'); scene.classList.add('scene--active'); },
      onLeaveBack: () => scene.classList.remove('scene--active'),
    },
  });

  // Split-screen layout: code editor slides in from left, mockup from right
  const editor = scene.querySelector('.scene3__editor');
  if (editor) {
    tl.fromTo(editor, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.1, ease: 'power3.out' }, 0);
  }
  if (mockup) {
    tl.fromTo(mockup, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.1, ease: 'power3.out' }, 0);
  }

  // Code lines type in one by one synced with scroll
  codeLines.forEach((line, i) => {
    // Make the code line visible first
    tl.fromTo(line, { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.1 + i * 0.06);

    const chars = line.querySelector('.scene3__code-chars');
    if (chars) {
      // Clip-path reveal for typing effect
      tl.fromTo(chars,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.06, ease: 'none' },
        0.1 + i * 0.06
      );
    }

    // Corresponding mockup element appears when its code line is "typed"
    if (mockupElements[i]) {
      tl.fromTo(mockupElements[i],
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.04, ease: 'power2.out' },
        0.13 + i * 0.06
      );
    }
  });

  // Terminal output
  if (terminal) {
    tl.fromTo(terminal,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' },
      0.6
    );

    const termLines = terminal.querySelectorAll('.scene3__term-line');
    termLines.forEach((tl2, i) => {
      tl.fromTo(tl2,
        { opacity: 0 },
        { opacity: 1, duration: 0.04 },
        0.63 + i * 0.04
      );
    });
  }

  // Tech marquee slides in
  if (marquee) {
    tl.fromTo(marquee,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' },
      0.5
    );
  }

  // Exit: editor/mockup fade out first to make room for headline
  tl.to([editor, mockup, terminal, marquee].filter(Boolean), { opacity: 0, duration: 0.08, ease: 'power2.in' }, 0.64);

  // Headline blur reveal (after content fades out)
  [textEn, textAr].forEach(el => {
    if (el) {
      tl.fromTo(el,
        { opacity: 0, filter: 'blur(15px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 0.12, ease: 'power2.out' },
        0.72
      );
    }
  });

  // Description
  [descEn, descAr].forEach(el => {
    if (el) {
      tl.fromTo(el,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' },
        0.8
      );
    }
  });

  // Exit: headline and description fade out
  tl.to(scene.querySelectorAll('.scene3__headline, .scene3__desc'), { opacity: 0, scale: 0.9, duration: 0.1, ease: 'power2.in' }, 0.92);
}
