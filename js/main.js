// Jessica Mackrael — site interactions

// Mobile nav
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

// Smart header: hide on scroll down, reappear on scroll up
const header = document.querySelector('.site-header');
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (header) {
    if (y > lastY && y > 140) {
      header.classList.add('header-hidden');
      if (nav) nav.classList.remove('open');
    } else if (y < lastY) {
      header.classList.remove('header-hidden');
    }
  }
  lastY = y;
}, { passive: true });

// Scroll reveal
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Testimonial rotator
const quotes = document.querySelectorAll('[data-quote]');
const dots = document.querySelectorAll('[data-quote-dot]');
let qIndex = 0;
let qTimer = null;

function showQuote(i) {
  qIndex = i;
  quotes.forEach((q, n) => (q.style.display = n === i ? 'block' : 'none'));
  dots.forEach((d, n) => d.classList.toggle('active', n === i));
}

if (quotes.length) {
  showQuote(0);
  dots.forEach((d, n) =>
    d.addEventListener('click', () => {
      showQuote(n);
      clearInterval(qTimer);
      qTimer = setInterval(nextQuote, 8000);
    })
  );
  function nextQuote() {
    showQuote((qIndex + 1) % quotes.length);
  }
  qTimer = setInterval(nextQuote, 8000);
}

// Contact form (placeholder handler — connect to a form service before launch)
const form = document.querySelector('#contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = document.querySelector('#form-note');
    if (note) {
      note.textContent =
        'Thank you — this demo form is not yet connected. Please call or text Jessica at 850.687.9888.';
      note.style.display = 'block';
    }
  });
}
