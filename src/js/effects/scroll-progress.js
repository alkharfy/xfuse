/**
 * Xfuse — Scroll Progress Bar + Scene Progress Dots
 */
export function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  const sceneDots = document.querySelectorAll('.scene-progress__dot');
  const sceneProgress = document.querySelector('.scene-progress');

  if (!bar && !sceneDots.length) return;

  // Ordered section IDs matching dot order
  const sectionIds = [
    'scene-0', 'scene-1', 'scene-2', 'scene-3', 'scene-4',
    'scene-offers', 'scene-5', 'scene-6', 'scene-faq', 'scene-7'
  ];

  // Resolve section elements once
  const sectionEls = sectionIds.map(id => document.getElementById(id));

  // Find active dot index based on scroll position
  // Uses getBoundingClientRect to handle GSAP pin-spacer wrapped sections
  function getActiveDotIndex() {
    const threshold = window.innerHeight * 0.3;
    let active = 0;
    for (let i = 0; i < sectionEls.length; i++) {
      if (sectionEls[i] && sectionEls[i].getBoundingClientRect().top <= threshold) {
        active = i;
      }
    }
    return active;
  }

  // Show scene progress dots after Scene 0
  function updateSceneProgress() {
    const activeDot = getActiveDotIndex();

    if (sceneProgress) {
      if (activeDot > 0) {
        sceneProgress.classList.add('scene-progress--visible');
      } else {
        sceneProgress.classList.remove('scene-progress--visible');
      }
    }

    sceneDots.forEach((dot, i) => {
      dot.classList.toggle('scene-progress__dot--active', i <= activeDot);
      dot.classList.toggle('scene-progress__dot--current', i === activeDot);
    });
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
      // Global progress bar
      if (bar) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        const percent = (scrollTop / docHeight) * 100;
        bar.style.width = `${percent}%`;
      }

      // Scene dots
      if (sceneDots.length) {
        updateSceneProgress();
      }
    });
  }, { passive: true });

  // Initial update
  updateSceneProgress();

  // Scene dots click-to-navigate
  sceneDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const target = sectionEls[i];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Footer reveal via IntersectionObserver
  const footer = document.querySelector('.footer');
  if (footer) {
    const footerObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        footer.classList.toggle('footer--visible', entry.isIntersecting);
      });
    }, { threshold: 0.1 });
    footerObs.observe(footer);
  }
}
