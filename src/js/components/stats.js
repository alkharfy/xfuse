/**
 * Xfuse — Stats Counter Animation with Typing Effect
 */
import { prefersReducedMotion } from '../core/utils.js';

export function initStats() {
  const statNumbers = document.querySelectorAll('.stats__number');
  if (!statNumbers.length) return;

  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    statNumbers.forEach(el => {
      el.textContent = el.dataset.target || el.textContent;
    });
    // Show typing line immediately if reduced motion
    const typingLine = document.querySelector('.stats__typing');
    if (typingLine) typingLine.style.display = 'none';
    return;
  }

  // Typing effect
  const typingLine = document.querySelector('.stats__typing');
  const statsGrid = document.querySelector('.stats__grid');
  let typingDone = false;

  ScrollTrigger.create({
    trigger: '.stats__card',
    start: 'top 85%',
    once: true,
    onEnter: () => {
      if (typingLine && !typingDone) {
        typingDone = true;
        const text = '$ xfuse --stats';
        let i = 0;
        typingLine.textContent = '';
        typingLine.style.display = 'block';
        const interval = setInterval(() => {
          if (i < text.length) {
            typingLine.textContent += text[i];
            i++;
          } else {
            clearInterval(interval);
            // After typing, reveal the grid
            setTimeout(() => {
              if (statsGrid) gsap.to(statsGrid, { opacity: 1, y: 0, duration: 0.5 });
              startCounters();
            }, 300);
          }
        }, 60);
      } else {
        startCounters();
      }
    },
  });

  function startCounters() {
    statNumbers.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;

      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';

      gsap.to(el, {
        textContent: target,
        duration: 1.5,
        ease: 'power2.out',
        snap: { textContent: 1 },
        onUpdate() {
          el.textContent = prefix + Math.round(parseFloat(el.textContent)) + suffix;
        },
      });
    });

    // Animate progress bars with glow
    document.querySelectorAll('.stats__bar-fill').forEach(bar => {
      gsap.to(bar, {
        scaleX: 1,
        duration: 1.2,
        ease: 'power2.out',
      });
    });
  }
}
