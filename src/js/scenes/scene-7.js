/**
 * Xfuse — Scene 7: "Your Turn" (Contact)
 * Reverse big bang → form reveal, staggered fields, pulsing CTA
 */
import { prefersReducedMotion } from '../core/utils.js';

export function initScene7() {
  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const scene = document.getElementById('scene-7');
  if (!scene) return;

  const particles = scene.querySelectorAll('.scene7__particle');
  const formWrap = scene.querySelector('.scene7__form-wrap');
  const fields = scene.querySelectorAll('.scene7__field');
  const submitBtn = scene.querySelector('.scene7__submit');
  const whatsappBtn = scene.querySelector('.scene7__whatsapp');
  const textEn = scene.querySelector('.scene7__headline[data-lang="en"]');
  const textAr = scene.querySelector('.scene7__headline[data-lang="ar"]');
  const descEn = scene.querySelector('.scene7__desc[data-lang="en"]');
  const descAr = scene.querySelector('.scene7__desc[data-lang="ar"]');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: '+=150%',
      pin: true,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
      id: 'scene-7',
      onEnter: () => { document.body.setAttribute('data-scene', '7'); scene.classList.add('scene--active'); },
      onLeave: () => scene.classList.remove('scene--active'),
      onEnterBack: () => { document.body.setAttribute('data-scene', '7'); scene.classList.add('scene--active'); },
      onLeaveBack: () => scene.classList.remove('scene--active'),
    },
  });

  // Reverse big bang — particles converge to center
  particles.forEach((p, i) => {
    const angle = (i / particles.length) * Math.PI * 2;
    const radius = 600 + Math.random() * 400;
    tl.fromTo(p,
      { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, opacity: 0.8, scale: 0.5 + Math.random() * 0.5 },
      { x: 0, y: 0, opacity: 0, scale: 0, duration: 0.2, ease: 'power3.in' },
      0
    );
  });

  // Headline blur reveal
  [textEn, textAr].forEach(el => {
    if (el) {
      tl.fromTo(el,
        { opacity: 0, filter: 'blur(20px)', scale: 1.1 },
        { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.15, ease: 'power2.out' },
        0.2
      );
    }
  });

  // Description
  [descEn, descAr].forEach(el => {
    if (el) {
      tl.fromTo(el,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' },
        0.3
      );
    }
  });

  // Form wrapper fades in
  if (formWrap) {
    tl.fromTo(formWrap,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.15, ease: 'power2.out' },
      0.35
    );
  }

  // Fields stagger in
  fields.forEach((field, i) => {
    tl.fromTo(field,
      { opacity: 0, y: 15, x: i % 2 === 0 ? -10 : 10 },
      { opacity: 1, y: 0, x: 0, duration: 0.08, ease: 'power2.out' },
      0.42 + i * 0.05
    );
  });

  // Submit button with pulsing glow
  if (submitBtn) {
    tl.fromTo(submitBtn,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.1, ease: 'back.out(1.4)' },
      0.65
    );
  }

  // WhatsApp button
  if (whatsappBtn) {
    tl.fromTo(whatsappBtn,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' },
      0.72
    );
  }

  // Slide form-wrap up to reveal submit button & WhatsApp section
  if (formWrap) {
    const sectionH = scene.offsetHeight;
    const allContent = scene.scrollHeight;
    const overflow = allContent - sectionH;
    if (overflow > 0) {
      const children = Array.from(scene.children).filter(c => !c.classList.contains('scene7__particles'));
      children.forEach(child => {
        tl.to(child, { y: -overflow, duration: 0.15, ease: 'power1.inOut' }, 0.82);
      });
    }
  }

  // Pulsing glow animation on submit (continuous, outside scroll timeline)
  if (submitBtn) {
    gsap.to(submitBtn, {
      boxShadow: '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3)',
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: 'sine.inOut',
      paused: false,
    });
  }
}
