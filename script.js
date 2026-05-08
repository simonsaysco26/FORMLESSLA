'use strict';

// ===========================
// PAGE TRANSITIONS
// ===========================
(function () {
  const overlay = document.createElement('div');
  overlay.id = 'page-transition';
  document.body.appendChild(overlay);

  // Page entering — fade the overlay out
  requestAnimationFrame(() => requestAnimationFrame(() => {
    overlay.classList.add('is-out');
  }));

  // Page leaving — fade to black, then navigate
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      link.target === '_blank'
    ) return;
    e.preventDefault();
    overlay.classList.remove('is-out');
    setTimeout(() => { window.location.href = href; }, 320);
  });
})();

// ===========================
// NAV — border on scroll
// ===========================
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.style.borderBottomColor = window.scrollY > 40
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(255,255,255,0.06)';
  }, { passive: true });
}

// ===========================
// SMOOTH SCROLL — same-page anchor links
// ===========================
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href').slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY - 64,
    behavior: 'smooth',
  });
});

// ===========================
// EMAIL FORMS — inline confirmation
// ===========================
function handleSignup(form, inputSel) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const val = form.querySelector(inputSel)?.value.trim();
    if (!val) return;
    const msg = document.createElement('p');
    msg.textContent = "you're on the list.";
    msg.style.cssText = [
      'font-family:var(--font-headline,"Barlow Condensed",sans-serif)',
      'font-size:18px', 'font-weight:700', 'letter-spacing:0.12em',
      'text-transform:uppercase', 'color:rgba(255,255,255,0.6)', 'margin-top:0',
    ].join(';');
    form.replaceWith(msg);
  });
}
const signupForm = document.getElementById('signup-form');
const footerForm = document.getElementById('footer-form');
if (signupForm) handleSignup(signupForm, '.signup__input');
if (footerForm)  handleSignup(footerForm,  '.footer__input');

// ===========================
// SCROLL REVEALS
// ===========================
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(({ target, isIntersecting }) => {
    if (!isIntersecting) return;
    target.classList.add('is-visible');
    // Legacy .fade-in CSS expects 'visible' class
    if (target.classList.contains('fade-in')) target.classList.add('visible');
    revealObs.unobserve(target);
  });
}, { threshold: 0.12 });

// Legacy fade-in elements (work items, signup, footer)
document.querySelectorAll('.work__item, .about__inner, .signup__inner, .footer__inner')
  .forEach(el => { el.classList.add('fade-in'); revealObs.observe(el); });

// Directional reveals for text elements across all pages
const revealMap = [
  ['.section-label',        'left'],
  ['.about-vision__label',  'left'],
  ['.page-hero__title',     'up'],
  ['.page-hero__sub',       'up',  'reveal--delay-1'],
  ['.about-story__eyebrow', 'left'],
  ['.about-story__heading', 'up',  'reveal--delay-1'],
  ['.about-vision__text',   'up',  'reveal--delay-1'],
  ['.signup__heading',      'up'],
  ['.signup__sub',          'up',  'reveal--delay-1'],
  ['.clients-intro',        'up'],
];
revealMap.forEach(([sel, dir, delay]) => {
  document.querySelectorAll(sel).forEach(el => {
    if (el.closest('.hero__inner')) return; // hero has its own CSS animation
    el.classList.add('reveal', `reveal--${dir}`);
    if (delay) el.classList.add(delay);
    revealObs.observe(el);
  });
});

// Stagger story body paragraphs
document.querySelectorAll('.about-story__body p').forEach((el, i) => {
  const d = ['', 'reveal--delay-1', 'reveal--delay-2', 'reveal--delay-3'][Math.min(i, 3)];
  el.classList.add('reveal', 'reveal--up');
  if (d) el.classList.add(d);
  revealObs.observe(el);
});

// ===========================
// PARALLAX — hero inner (homepage only)
// ===========================
const heroSection = document.querySelector('.hero');
const heroInner   = document.querySelector('.hero__inner');

if (heroSection && heroInner) {
  heroInner.style.willChange = 'transform';
  let rafPending = false;

  function updateParallax() {
    if (heroSection.getBoundingClientRect().bottom > 0) {
      heroInner.style.transform = `translateY(${window.scrollY * 0.32}px)`;
    }
    rafPending = false;
  }

  window.addEventListener('scroll', () => {
    if (!rafPending) { rafPending = true; requestAnimationFrame(updateParallax); }
  }, { passive: true });
}


// ===========================
// MARQUEE — pixel-precise loop
// ===========================
requestAnimationFrame(() => {
  document.querySelectorAll('.marquee-inner').forEach(inner => {
    // Content is duplicated in HTML. Animate by exactly half the total width
    // so the loop reset is sub-pixel perfect instead of using -50% percentage.
    const halfW = Math.round(inner.scrollWidth / 2);
    inner.style.setProperty('--marquee-dist', `-${halfW}px`);
  });
});

// ===========================
// ALTERNATING ROWS — scroll reveal
// ===========================
document.querySelectorAll('.client-row, .home-event-row').forEach(el => {
  revealObs.observe(el);
});

// Catch-all: observe any .reveal elements already in the HTML
// (e.g. who-are-we, recent-events cards hardcoded with reveal classes)
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ===========================
// MAGNETIC BUTTONS
// ===========================
document.querySelectorAll('.signup__btn, .footer__btn').forEach(btn => {
  btn.classList.add('magnetic');

  btn.addEventListener('mousemove', e => {
    const r  = btn.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) * 0.28;
    const dy = (e.clientY - (r.top  + r.height / 2)) * 0.28;
    btn.style.transition = 'none';
    btn.style.transform  = `translate(${dx}px, ${dy}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transition = 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1)';
    btn.style.transform  = '';
    btn.classList.add('returning');
    btn.addEventListener('transitionend', () => {
      btn.classList.remove('returning');
      btn.style.transition = '';
    }, { once: true });
  });
});
