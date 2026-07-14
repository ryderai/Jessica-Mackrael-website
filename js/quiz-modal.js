// ============================================================
// FIND MY HOME QUIZ — popup version (js/quiz-modal.js)
// ============================================================
// Replaces the old standalone quiz.html flow. Every "Take the
// Quiz" / "Find My Home Quiz" link on every page now opens this
// popup instead of navigating away.
//
// Flow: Area -> Budget -> Bedrooms -> Email -> redirect to
// search.html with those answers pre-applied as filters.
//
// LIVE MODE: while the site is still being built, no email is
// sent to Jessica. Flip QUIZ_MODAL_CONFIG.liveMode to true once
// this is really her live site and Ryder wants leads emailed to
// her automatically (same mailto pattern used elsewhere on site).
// ============================================================

const QUIZ_MODAL_CONFIG = {
  liveMode: true, // <- site is live on jessicamackrael.com
  jessicaEmail: 'jessica.mackrael@cbrealty.com',
};

const QM_TOTAL_STEPS = 3; // Area, Budget, Bedrooms (email is a 4th gate screen)

// City values here must exactly match the `city` strings used in
// js/listings-data.js so the search page's dropdown can select them.
const QM_AREA_OPTIONS = [
  { value: 'Niceville',         label: 'Niceville',                 sub: "Bayside charm, A-rated schools, close to Eglin's gate." },
  { value: 'Destin',            label: 'Destin',                    sub: 'Emerald water and beachside energy.' },
  { value: 'Miramar Beach',     label: 'Miramar Beach',             sub: 'Resort-style Gulf-front living.' },
  { value: 'Santa Rosa Beach',  label: 'Santa Rosa Beach & 30A',    sub: 'Architect-designed beach homes on Scenic 30A.' },
  { value: 'Fort Walton Beach', label: 'Fort Walton Beach',         sub: 'Established neighborhoods near Hurlburt Field.' },
  { value: 'Navarre',           label: 'Navarre & Crestview',       sub: 'More house for the money, room to grow.' },
  { value: 'all',               label: "Not sure yet",              sub: 'Show me homes across the whole coast.' },
];

const QM_BUDGET_OPTIONS = [
  { min: 0,       max: 500000,  label: 'Under $500,000' },
  { min: 500000,  max: 750000,  label: '$500K – $750K' },
  { min: 750000,  max: 1000000, label: '$750K – $1M' },
  { min: 1000000, max: 1500000, label: '$1M – $1.5M' },
  { min: 1500000, max: 0,       label: '$1.5M+' },
];

const QM_BEDS_OPTIONS = [
  { value: '0', label: 'Any' },
  { value: '2', label: '2+ Bedrooms' },
  { value: '3', label: '3+ Bedrooms' },
  { value: '4', label: '4+ Bedrooms' },
  { value: '5', label: '5+ Bedrooms' },
];

const qmAnswers = {}; // { area, min, max, beds }
let qmStep = 1; // 1,2,3 = questions, 4 = email gate

// ---------- build + inject the modal markup once ----------
function qmBuildModal() {
  if (document.getElementById('qm-backdrop')) return;

  const optHtml = (opts, kind) => opts.map((o, i) => {
    const val = kind === 'area' ? o.value : kind === 'beds' ? o.value : i;
    const sub = o.sub ? `<span class="quiz-opt-sub">${o.sub}</span>` : '';
    return `<button type="button" class="quiz-opt" data-kind="${kind}" data-idx="${i}">
      <span class="quiz-opt-label">${o.label}</span>${sub}
    </button>`;
  }).join('');

  const wrap = document.createElement('div');
  wrap.id = 'qm-backdrop';
  wrap.className = 'ss-modal-backdrop qm-backdrop';
  wrap.innerHTML = `
    <div class="ss-modal qm-modal">
      <button type="button" class="qm-close" aria-label="Close">&times;</button>

      <div class="quiz-progress" aria-label="Quiz progress">
        <div class="quiz-progress-dot" id="qm-dot-1"></div>
        <div class="quiz-progress-dot" id="qm-dot-2"></div>
        <div class="quiz-progress-dot" id="qm-dot-3"></div>
        <div class="quiz-progress-dot" id="qm-dot-4"></div>
      </div>

      <div class="quiz-step active" id="qm-step-1">
        <p class="eyebrow qm-eyebrow">Question 1 of 3</p>
        <h2 class="quiz-q">Which area are you drawn to?</h2>
        <div class="quiz-options">${optHtml(QM_AREA_OPTIONS, 'area')}</div>
        <div class="quiz-nav"><span></span><span></span></div>
      </div>

      <div class="quiz-step" id="qm-step-2">
        <p class="eyebrow qm-eyebrow">Question 2 of 3</p>
        <h2 class="quiz-q">What's your budget?</h2>
        <div class="quiz-options">${optHtml(QM_BUDGET_OPTIONS, 'budget')}</div>
        <div class="quiz-nav">
          <button type="button" class="quiz-back" data-back="1">&larr; Back</button><span></span>
        </div>
      </div>

      <div class="quiz-step" id="qm-step-3">
        <p class="eyebrow qm-eyebrow">Question 3 of 3</p>
        <h2 class="quiz-q">How many bedrooms do you need?</h2>
        <div class="quiz-options">${optHtml(QM_BEDS_OPTIONS, 'beds')}</div>
        <div class="quiz-nav">
          <button type="button" class="quiz-back" data-back="2">&larr; Back</button><span></span>
        </div>
      </div>

      <div class="quiz-step" id="qm-step-4">
        <p class="eyebrow qm-eyebrow">Almost there</p>
        <h2 class="quiz-q">To move forward, please enter your email.</h2>
        <form id="qm-email-form" class="qm-email-step" novalidate>
          <label for="qm-name">First name (optional)</label>
          <input id="qm-name" type="text" placeholder="First name" autocomplete="given-name">
          <label for="qm-email" style="margin-top:16px;">Email</label>
          <input id="qm-email" type="email" placeholder="you@example.com" required autocomplete="email">
          <div class="btn-row" style="margin-top:28px;">
            <button type="submit" class="btn btn-solid">Show My Matching Homes &rarr;</button>
          </div>
          <p class="qm-note" id="qm-email-note" style="display:none;"></p>
        </form>
        <div class="quiz-nav" style="margin-top:0;">
          <button type="button" class="quiz-back" data-back="3">&larr; Back</button><span></span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  // Option clicks
  wrap.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.addEventListener('click', () => qmSelectOption(btn));
  });
  // Back buttons
  wrap.querySelectorAll('.quiz-back').forEach(btn => {
    btn.addEventListener('click', () => qmGoToStep(Number(btn.dataset.back)));
  });
  // Close
  wrap.querySelector('.qm-close').addEventListener('click', closeQuizModal);
  wrap.addEventListener('click', e => { if (e.target === wrap) closeQuizModal(); });
  // Email form
  wrap.querySelector('#qm-email-form').addEventListener('submit', qmSubmitEmail);
}

// ---------- step navigation ----------
function qmGoToStep(n) {
  document.querySelectorAll('.qm-modal .quiz-step').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('qm-step-' + n);
  if (target) target.classList.add('active');
  qmStep = n;
  document.querySelectorAll('.qm-modal .quiz-progress-dot').forEach((dot, i) => {
    dot.classList.toggle('done', i < n - 1);
  });
}

function qmSelectOption(btn) {
  btn.closest('.quiz-options').querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('selected'));
  btn.classList.add('selected');

  const kind = btn.dataset.kind;
  const idx = Number(btn.dataset.idx);

  if (kind === 'area') {
    qmAnswers.area = QM_AREA_OPTIONS[idx].value;
  } else if (kind === 'budget') {
    qmAnswers.min = QM_BUDGET_OPTIONS[idx].min;
    qmAnswers.max = QM_BUDGET_OPTIONS[idx].max;
  } else if (kind === 'beds') {
    qmAnswers.beds = QM_BEDS_OPTIONS[idx].value;
  }

  setTimeout(() => {
    if (qmStep < QM_TOTAL_STEPS) {
      qmGoToStep(qmStep + 1);
    } else {
      qmGoToStep(4); // email gate
      const emailInput = document.getElementById('qm-email');
      if (emailInput) setTimeout(() => emailInput.focus(), 350);
    }
  }, 280);
}

function qmSubmitEmail(e) {
  e.preventDefault();
  const name = document.getElementById('qm-name').value.trim();
  const email = document.getElementById('qm-email').value.trim();
  const note = document.getElementById('qm-email-note');

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    note.textContent = 'Please enter a valid email to see your matching homes.';
    note.style.display = 'block';
    return;
  }

  // Stash the lead + answers for this session
  try {
    sessionStorage.setItem('jm_quiz_lead', JSON.stringify({ name, email, ...qmAnswers }));
  } catch (_) {}

  // Notify Jessica — only once the site is actually live (see config at top)
  if (QUIZ_MODAL_CONFIG.liveMode) {
    const subject = encodeURIComponent('Home Finder Quiz Lead — ' + (name || email));
    const body = encodeURIComponent(
      'Hi Jessica,\n\n' +
      (name || 'A visitor') + ' just took the Find My Home quiz on your website.\n\n' +
      'Email: ' + email + '\n' +
      'Area: ' + (qmAnswers.area && qmAnswers.area !== 'all' ? qmAnswers.area : 'Not sure yet') + '\n' +
      'Budget: ' + qmBudgetLabel() + '\n' +
      'Bedrooms: ' + (qmAnswers.beds && qmAnswers.beds !== '0' ? qmAnswers.beds + '+' : 'Any') + '\n\n' +
      'They are being shown matching homes now — reach out while it\'s fresh!'
    );
    window.open('mailto:' + QUIZ_MODAL_CONFIG.jessicaEmail + '?subject=' + subject + '&body=' + body);
  } else {
    // Build-phase safeguard: log instead of emailing Jessica.
    console.log('[quiz-modal] liveMode is off — lead captured but not emailed:', { name, email, ...qmAnswers });
  }

  qmRedirectToSearch();
}

function qmBudgetLabel() {
  const match = QM_BUDGET_OPTIONS.find(o => o.min === qmAnswers.min && o.max === qmAnswers.max);
  return match ? match.label : 'Not specified';
}

// ---------- hand off to search.html ----------
function qmRedirectToSearch() {
  const params = new URLSearchParams();
  if (qmAnswers.area && qmAnswers.area !== 'all') params.set('city', qmAnswers.area);
  if (qmAnswers.min) params.set('min', qmAnswers.min);
  if (qmAnswers.max) params.set('max', qmAnswers.max);
  if (qmAnswers.beds && qmAnswers.beds !== '0') params.set('beds', qmAnswers.beds);

  // Safety net: some hosts rewrite search.html?... and drop the query
  // string (same issue the hero search already works around).
  try {
    sessionStorage.setItem('quizFilters', JSON.stringify({
      city: qmAnswers.area && qmAnswers.area !== 'all' ? qmAnswers.area : '',
      min: qmAnswers.min || '',
      max: qmAnswers.max || '',
      beds: qmAnswers.beds && qmAnswers.beds !== '0' ? qmAnswers.beds : '',
    }));
  } catch (_) {}

  window.location.href = 'search.html' + (params.toString() ? '?' + params.toString() : '');
}

// ---------- open / close / reset ----------
function openQuizModal() {
  qmBuildModal();
  qmAnswers.area = undefined;
  qmAnswers.min = undefined;
  qmAnswers.max = undefined;
  qmAnswers.beds = undefined;
  document.querySelectorAll('.qm-modal .quiz-opt').forEach(o => o.classList.remove('selected'));
  const note = document.getElementById('qm-email-note');
  if (note) note.style.display = 'none';
  const form = document.getElementById('qm-email-form');
  if (form) form.reset();
  qmGoToStep(1);

  const backdrop = document.getElementById('qm-backdrop');
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuizModal() {
  const backdrop = document.getElementById('qm-backdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

// ---------- wire up triggers on every page ----------
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href="quiz.html"]');
    if (!link) return;
    e.preventDefault();
    openQuizModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeQuizModal();
  });

  // Legacy quiz.html now redirects here with ?openQuiz=1 — auto-open.
  const params = new URLSearchParams(window.location.search);
  if (params.get('openQuiz') === '1') {
    openQuizModal();
    // Clean the URL so a refresh doesn't re-trigger it.
    params.delete('openQuiz');
    const clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', clean);
  }
});
