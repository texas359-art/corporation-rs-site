const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu a');

const updateHeader = () => {
  header?.classList.toggle('scrolled', window.scrollY > 40);
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileMenu.classList.toggle('open', !open);
    mobileMenu.setAttribute('aria-hidden', String(open));
    document.body.style.overflow = open ? '' : 'hidden';
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });
}

const revealItems = [...document.querySelectorAll('.reveal')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
const closeButton = lightbox?.querySelector('.lightbox-close');
const prevButton = lightbox?.querySelector('.lightbox-prev');
const nextButton = lightbox?.querySelector('.lightbox-next');
const counter = lightbox?.querySelector('.lightbox-count');
const zoomables = [...document.querySelectorAll('.zoomable')];
let currentIndex = 0;

function showImage(index) {
  if (!lightbox || !lightboxImage || !zoomables.length) return;
  currentIndex = (index + zoomables.length) % zoomables.length;
  const source = zoomables[currentIndex].dataset.full || zoomables[currentIndex].querySelector('img')?.src;
  const thumb = zoomables[currentIndex].querySelector('img');
  lightboxImage.src = source;
  lightboxImage.alt = thumb?.alt || 'Изображение проекта';
  if (counter) counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(zoomables.length).padStart(2, '0')}`;
}

function openLightbox(index) {
  if (!lightbox) return;
  showImage(index);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  closeButton?.focus();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage?.removeAttribute('src');
  document.body.style.overflow = '';
}

zoomables.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
});

closeButton?.addEventListener('click', closeLightbox);
prevButton?.addEventListener('click', () => showImage(currentIndex - 1));
nextButton?.addEventListener('click', () => showImage(currentIndex + 1));
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (event) => {
  if (!lightbox?.classList.contains('open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
  if (event.key === 'ArrowRight') showImage(currentIndex + 1);
});

let touchStartX = 0;
lightbox?.addEventListener('touchstart', (event) => {
  touchStartX = event.changedTouches[0].screenX;
}, { passive: true });
lightbox?.addEventListener('touchend', (event) => {
  const delta = event.changedTouches[0].screenX - touchStartX;
  if (Math.abs(delta) < 50) return;
  showImage(currentIndex + (delta < 0 ? 1 : -1));
}, { passive: true });
