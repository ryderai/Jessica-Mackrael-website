// ============================================================
// FIND MY HOME QUIZ — logic engine
// ============================================================

const answers = {};

// Community scoring weights
// Keys: niceville, destin, miramar, santa-rosa, fwb, navarre-crestview
const COMMUNITIES = {
  niceville: {
    name: 'Niceville',
    tagline: 'Bayside charm, A-rated schools, and ten minutes to Eglin\'s gate.',
    tag: 'Hometown Expertise',
    href: 'communities.html#niceville',
  },
  destin: {
    name: 'Destin',
    tagline: 'The world\'s luckiest fishing village — emerald water and beachside energy.',
    tag: 'Waterfront Living',
    href: 'communities.html#destin',
  },
  miramar: {
    name: 'Miramar Beach',
    tagline: 'Resort-style luxury along Scenic Gulf Drive with Gulf-front estates.',
    tag: 'Luxury & Investment',
    href: 'communities.html#miramar',
  },
  'santa-rosa': {
    name: 'Santa Rosa Beach & 30A',
    tagline: 'Architect-designed beach homes and the storied communities of Scenic 30A.',
    tag: 'Coastal Icon',
    href: 'communities.html#santa-rosa',
  },
  fwb: {
    name: 'Fort Walton Beach',
    tagline: 'Established neighborhoods minutes from Hurlburt Field and the water.',
    tag: 'Value & Location',
    href: 'communities.html#fwb',
  },
  navarre: {
    name: 'Navarre & Crestview',
    tagline: 'More house for the money — room to grow across the wider Panhandle.',
    tag: 'Space & Value',
    href: 'communities.html#more',
  },
};

function score(ans) {
  const s = {
    niceville: 0, destin: 0, miramar: 0,
    'santa-rosa': 0, fwb: 0, navarre: 0
  };

  // Q1: Budget
  if (ans.budget === 'under400') {
    s.fwb += 4; s.navarre += 5; s.niceville += 2;
  } else if (ans.budget === '400to700') {
    s.niceville += 5; s.destin += 3; s.miramar += 2; s.fwb += 3;
  } else if (ans.budget === '700to1200') {
    s.destin += 5; s.miramar += 5; s.niceville += 2;
  } else if (ans.budget === 'over1200') {
    s['santa-rosa'] += 5; s.miramar += 5; s.destin += 3;
  }

  // Q2: Lifestyle
  if (ans.lifestyle === 'beach') {
    s.destin += 4; s.miramar += 4; s['santa-rosa'] += 5;
  } else if (ans.lifestyle === 'family') {
    s.niceville += 5; s.fwb += 3; s.navarre += 3;
  } else if (ans.lifestyle === 'military') {
    s.niceville += 5; s.fwb += 5; s.navarre += 4;
  } else if (ans.lifestyle === 'investment') {
    s['santa-rosa'] += 5; s.destin += 4; s.miramar += 4;
  }

  // Q3: Type
  if (ans.type === 'primary') {
    s.niceville += 3; s.fwb += 2; s.navarre += 2;
  } else if (ans.type === 'vacation') {
    s['santa-rosa'] += 4; s.destin += 4; s.miramar += 4;
  } else if (ans.type === 'pcs') {
    s.niceville += 5; s.fwb += 5; s.navarre += 4;
  }

  // Q4: Bedrooms
  if (ans.beds === '2') {
    s.destin += 2; s.miramar += 2;
  } else if (ans.beds === '3') {
    s.niceville += 2; s.fwb += 2;
  } else if (ans.beds === '4') {
    s.niceville += 2; s.navarre += 3; s.fwb += 2;
  } else if (ans.beds === '5plus') {
    s.navarre += 3; s['santa-rosa'] += 2;
  }

  // Q5: Timeline doesn't shift community scores but adjusts messaging
  // (handled in results render)

  return s;
}

function getTopCommunities(scores, n = 3) {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key);
}

function renderResults() {
  const scores = score(answers);
  const top = getTopCommunities(scores, 3);

  const container = document.getElementById('quiz-result-cards');
  container.innerHTML = '';

  top.forEach((key, i) => {
    const c = COMMUNITIES[key];
    const card = document.createElement('div');
    card.className = 'quiz-result-card reveal';
    card.innerHTML = `
      <div class="rank">${i + 1}</div>
      <h3>${c.name}</h3>
      <p>${c.tagline}</p>
      <span class="tag">${c.tag}</span>
      <div style="margin-top:20px;">
        <a class="card-link" href="${c.href}">Explore ${c.name} →</a>
      </div>
    `;
    container.appendChild(card);
  });

  // Timeline message
  const msg = {
    now:     'Ready to move — Jessica can start showing you homes this week.',
    '1to3':  'Looking in 1–3 months — a great time to narrow communities and start showings.',
    '3to6':  'Planning for 3–6 months — perfect timing to align on budget and neighborhoods.',
    exploring: 'Just exploring — no rush. Bookmark your results and reach back when you\'re ready.',
  };
  const tl = document.getElementById('quiz-timeline-msg');
  if (tl && answers.timeline) tl.textContent = msg[answers.timeline] || '';

  // Trigger reveals
  setTimeout(() => {
    document.querySelectorAll('.quiz-result-card').forEach(el => el.classList.add('visible'));
  }, 100);
}

// ── Step navigation ──────────────────────────────────────────
let currentStep = 1;
const totalSteps = 5;

function goToStep(n) {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('quiz-step-' + n);
  if (target) {
    target.classList.add('active');
    currentStep = n;
  }

  // Update progress bar
  document.querySelectorAll('.quiz-progress-dot').forEach((dot, i) => {
    dot.classList.toggle('done', i < n - 1);
  });

  // Show/hide back button
  const backBtn = document.getElementById('quiz-back-btn');
  if (backBtn) backBtn.style.visibility = n > 1 ? 'visible' : 'hidden';
}

function selectOption(step, value, el) {
  // Deselect siblings
  el.closest('.quiz-options').querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');

  // Save answer
  const keys = ['', 'budget', 'lifestyle', 'type', 'beds', 'timeline'];
  answers[keys[step]] = value;

  // Auto-advance after short delay
  setTimeout(() => {
    if (step < totalSteps) {
      goToStep(step + 1);
    } else {
      // Show results
      document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
      const resultSection = document.getElementById('quiz-result');
      if (resultSection) {
        resultSection.classList.add('active');
        renderResults();
        resultSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, 320);
}

function goBack() {
  if (currentStep > 1) goToStep(currentStep - 1);
}

// ── Lead form ────────────────────────────────────────────────
function submitQuizLead(e) {
  e.preventDefault();
  const name  = document.getElementById('ql-name').value.trim();
  const email = document.getElementById('ql-email').value.trim();
  const phone = document.getElementById('ql-phone').value.trim();

  const topKeys = getTopCommunities(score(answers), 3);
  const topNames = topKeys.map(k => COMMUNITIES[k].name).join(', ');

  const subject = encodeURIComponent('Home Search Inquiry — ' + name);
  const body = encodeURIComponent(
    'Hi Jessica,\n\nI just took the Find My Home quiz on your website and my top communities were: ' + topNames + '.\n\n' +
    'Name: ' + name + '\n' +
    'Phone: ' + (phone || 'Not provided') + '\n' +
    'Budget: ' + (document.getElementById('ql-budget').value || answers.budget) + '\n' +
    'Timeline: ' + (answers.timeline || 'Not specified') + '\n\n' +
    'Looking forward to connecting!'
  );

  window.location.href = 'mailto:jessica.mackrael@cbrealty.com?subject=' + subject + '&body=' + body;

  // Show confirmation
  const note = document.getElementById('quiz-lead-note');
  if (note) {
    note.textContent = 'Opening your email app — we\'ll be in touch soon!';
    note.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  goToStep(1);

  const backBtn = document.getElementById('quiz-back-btn');
  if (backBtn) backBtn.addEventListener('click', goBack);

  const leadForm = document.getElementById('quiz-lead-form');
  if (leadForm) leadForm.addEventListener('submit', submitQuizLead);
});
