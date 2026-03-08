/**
 * Xfuse — Testimonials (Swiper)
 * Loads data from /data/testimonials.json
 */

function generateStarsHTML(count) {
  const starSVG = '<svg class="star" viewBox="0 0 24 24" width="18" height="18"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#star-grad)"/></svg>';
  return starSVG.repeat(count);
}

function buildSlideHTML(item) {
  return `<div class="swiper-slide">
    <div class="testimonial-card">
      <div class="testimonial-card__stars">${generateStarsHTML(item.rating || 5)}</div>
      <blockquote class="testimonial-card__quote" data-lang="en">"${item.quoteEn}"</blockquote>
      <blockquote class="testimonial-card__quote" data-lang="ar">"${item.quoteAr}"</blockquote>
      <div class="testimonial-card__author">
        <span class="testimonial-card__avatar">${item.initials}</span>
        <div class="testimonial-card__info">
          <span class="testimonial-card__name">${item.nameEn}</span>
          <span class="testimonial-card__position" data-lang="en">${item.positionEn}</span>
          <span class="testimonial-card__position" data-lang="ar">${item.positionAr}</span>
        </div>
      </div>
    </div>
  </div>`;
}

export async function initTestimonials() {
  if (typeof Swiper === 'undefined') return;

  const container = document.querySelector('.testimonial-swiper');
  if (!container) return;

  // Load dynamic data
  try {
    const res = await fetch('/data/testimonials.json');
    if (res.ok) {
      const json = await res.json();
      const items = (json.items || []).sort((a, b) => a.order - b.order);
      if (items.length) {
        const wrapper = container.querySelector('.swiper-wrapper');
        if (wrapper) {
          wrapper.innerHTML = items.map(buildSlideHTML).join('');
        }
      }
    }
  } catch {
    // fallback: keep existing HTML
  }

  new Swiper(container, {
    slidesPerView: 1,
    spaceBetween: 30,
    autoplay: {
      delay: 5000,
      disableOnInteraction: true,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      768: { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 30 },
    },
  });
}
