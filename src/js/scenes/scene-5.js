/**
 * Xfuse — Scene 5: "The Crew" (Team)
 * Crew reveal with flip cards, typewriter quotes, constellation connections
 */
import { prefersReducedMotion } from '../core/utils.js';

export function initScene5() {
  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const scene = document.getElementById('scene-5');
  if (!scene) return;

  const members = scene.querySelectorAll('.scene5__member');
  const connections = scene.querySelector('.scene5__connections');
  const textEn = scene.querySelector('.scene5__headline[data-lang="en"]');
  const textAr = scene.querySelector('.scene5__headline[data-lang="ar"]');
  const descEn = scene.querySelector('.scene5__desc[data-lang="en"]');
  const descAr = scene.querySelector('.scene5__desc[data-lang="ar"]');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: '+=200%',
      pin: true,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
      id: 'scene-5',
      onEnter: () => { document.body.setAttribute('data-scene', '5'); scene.classList.add('scene--active'); },
      onLeave: () => scene.classList.remove('scene--active'),
      onEnterBack: () => { document.body.setAttribute('data-scene', '5'); scene.classList.add('scene--active'); },
      onLeaveBack: () => scene.classList.remove('scene--active'),
    },
  });

  // Headline blur reveal — separate trigger so it appears before the pin starts
  [textEn, textAr].forEach(el => {
    if (el) {
      gsap.fromTo(el,
        { opacity: 0, filter: 'blur(15px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' }
        }
      );
    }
  });

  // Description — separate trigger
  [descEn, descAr].forEach(el => {
    if (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' }
        }
      );
    }
  });

  // Team members flip/reveal with stagger
  members.forEach((member, i) => {
    const card = member.querySelector('.scene5__card');
    const quote = member.querySelector('.scene5__quote');
    const startTime = 0.18 + i * 0.15;

    // Reveal member wrapper (has opacity: 0 in CSS)
    tl.fromTo(member,
      { opacity: 0 },
      { opacity: 1, duration: 0.1, ease: 'power3.out' },
      startTime
    );

    // Card flips in from rotateY
    if (card) {
      tl.fromTo(card,
        { rotateY: 90 },
        { rotateY: 0, duration: 0.1, ease: 'power3.out' },
        startTime
      );
    }

    // Quote typewriter-style reveal (clip path left to right)
    if (quote) {
      tl.fromTo(quote,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.1, ease: 'none' },
        startTime + 0.08
      );
    }
  });

  // Constellation connections between members
  if (connections) {
    const lines = connections.querySelectorAll('line, path');
    lines.forEach((line, i) => {
      if (line.getTotalLength) {
        const len = line.getTotalLength();
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(line, { strokeDashoffset: 0, duration: 0.1, ease: 'none' }, 0.55 + i * 0.05);
      }
    });
    tl.fromTo(connections, { opacity: 0 }, { opacity: 0.4, duration: 0.1 }, 0.5);
  }

  // Exit: all fade
  tl.to(scene.querySelectorAll('.scene5__content'), { opacity: 0, y: -30, duration: 0.1, ease: 'power2.in' }, 0.9);
}
