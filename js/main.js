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

/* ------------------------------------------------------------------
   Contact form — sends for real via /api/lead (Resend), Aug 31 2026.

   This used to call preventDefault() and print "this demo form is not
   yet connected". It sent nothing, stored nothing, and told the visitor
   the site was a demo — while the Request a Showing button on every
   property page pointed straight at it.

   Rules this handler follows:
     - Never say "thank you" unless the server confirmed the send.
     - On failure, KEEP the visitor's answers and show the phone number
       and email address, so the enquiry is not lost twice.
     - The button is disabled while sending, so one click is one lead.
   ------------------------------------------------------------------ */
const JM_PHONE = '850.687.9888';
const JM_EMAIL = 'jessica.mackrael@cbrealty.com';

const form = document.querySelector('#contact-form');
if (form) {
  const note   = document.querySelector('#form-note');
  const button = form.querySelector('button[type="submit"]');
  const startedAt = Date.now();

  const say = (msg, tone) => {
    if (!note) return;
    note.textContent = msg;
    note.style.color = tone === 'error' ? '#c0392b'
                     : tone === 'ok'    ? '#2e7d32'
                     : '#b3985f';
    note.style.display = 'block';
  };

  const val = (id) => {
    const el = document.querySelector('#' + id);
    return el ? String(el.value || '').trim() : '';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const first = val('fn'), last = val('ln'), email = val('em');

    // Say exactly what is missing, rather than a generic complaint.
    const missing = [];
    if (!first) missing.push('your first name');
    if (!last)  missing.push('your last name');
    if (!email) missing.push('your email');
    if (missing.length) {
      say('Please add ' + missing.join(', ') + '.', 'error');
      const firstEmpty = !first ? 'fn' : !last ? 'ln' : 'em';
      const el = document.querySelector('#' + firstEmpty);
      if (el) el.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      say('That email address does not look right — please check it.', 'error');
      const el = document.querySelector('#em');
      if (el) el.focus();
      return;
    }

    const payload = {
      'First name': first,
      'Last name': last,
      'Email': email,
      'Phone': val('ph'),
      'Interested in': val('in'),
      'Message': val('msg'),
      website: val('website'),          // honeypot — bots fill it, people cannot see it
      _form: 'Contact page',
      _page: location.pathname,
      _started: startedAt
    };

    if (button) { button.disabled = true; button.dataset.label = button.textContent; button.textContent = 'Sending…'; }
    say('Sending…');

    try {
      const r = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await r.json().catch(() => ({}));

      if (r.ok && data.ok) {
        say('Thank you — your message is on its way to Jessica. She usually replies the same day.', 'ok');
        form.reset();
      } else {
        // Answers are deliberately left in the form so nothing is retyped.
        say((data.message || 'We could not send that just now.') +
            ' Please call or text Jessica at ' + JM_PHONE + ', or email ' + JM_EMAIL + '.', 'error');
      }
    } catch (err) {
      say('We could not send that just now — you may be offline. Please call or text Jessica at ' +
          JM_PHONE + ', or email ' + JM_EMAIL + '.', 'error');
    } finally {
      if (button) { button.disabled = false; button.textContent = button.dataset.label || 'Send Message'; }
    }
  });
}
