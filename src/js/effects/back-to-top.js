/**
 * Xfuse — Back to Top Button with Progress Ring
 */
export function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  const circle = btn.querySelector('.back-to-top__ring circle');
  const circumference = circle ? 2 * Math.PI * 22 : 0; // r=22

  window.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollTop > 500) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }

      // Update progress ring
      if (circle && docHeight > 0) {
        const progress = scrollTop / docHeight;
        circle.style.strokeDashoffset = circumference * (1 - progress);
      }
    });
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
