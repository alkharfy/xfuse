/**
 * Xfuse — Portfolio Section
 * Loads data from /data/portfolio.json
 */
import { prefersReducedMotion } from '../core/utils.js';

function buildCardHTML(project) {
  const featuredClass = project.featured ? ' portfolio-card--featured' : '';
  const imgWidth = project.featured ? 800 : 400;
  const imgHeight = project.featured ? 400 : 250;
  const descHTML = project.descriptionEn
    ? `<p class="portfolio-card__desc" data-lang="en">${project.descriptionEn}</p>
              <p class="portfolio-card__desc" data-lang="ar">${project.descriptionAr}</p>`
    : '';

  return `<article class="portfolio-card${featuredClass}">
            <div class="portfolio-card__image-wrap">
              <img src="${project.image}" alt="${project.titleEn}" class="portfolio-card__image" width="${imgWidth}" height="${imgHeight}" loading="lazy">
            </div>
            <div class="portfolio-card__overlay">
              <span class="portfolio-card__tag" data-lang="en">${project.tagEn}</span>
              <span class="portfolio-card__tag" data-lang="ar">${project.tagAr}</span>
              <h3 class="portfolio-card__title" data-lang="en">${project.titleEn}</h3>
              <h3 class="portfolio-card__title" data-lang="ar">${project.titleAr}</h3>
              ${descHTML}
            </div>
            <div class="portfolio-card__arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </div>
          </article>`;
}

export async function initPortfolio() {
  const grid = document.querySelector('.portfolio-grid');

  // Load dynamic data
  if (grid) {
    try {
      const res = await fetch('/data/portfolio.json');
      if (res.ok) {
        const json = await res.json();
        const projects = (json.projects || []).sort((a, b) => a.order - b.order);
        if (projects.length) {
          grid.innerHTML = projects.map(buildCardHTML).join('');
        }
      }
    } catch {
      // fallback: keep existing HTML
    }
  }

  if (prefersReducedMotion()) return;

  const cards = document.querySelectorAll('.portfolio-card');
  if (!cards.length) return;

  // GSAP scroll reveal
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.from(cards, {
      scrollTrigger: {
        trigger: '.portfolio-grid',
        start: 'top 80%',
        once: true,
      },
      opacity: 0,
      y: 50,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
    });
  }

  // Parallax hover — desktop only
  if (!matchMedia('(hover: hover)').matches) return;

  cards.forEach((card) => {
    const img = card.querySelector('.portfolio-card__image');
    if (!img) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      img.style.transform = `scale(1.08) translate(${-x * 10}px, ${-y * 10}px)`;
    });

    card.addEventListener('mouseleave', () => {
      img.style.transform = '';
    });
  });
}
