// ============================================================
// SAVE SEARCH + EMAIL ALERTS — js/save-search.js
// ============================================================
// No backend required in demo mode.
// When the form is submitted:
//   1. Stores the saved search in sessionStorage (for UX state).
//   2. Opens a mailto: compose to jessica.mackrael@cbrealty.com
//      with the current filter state in the body.
//   3. Shows success confirmation in the modal.
//
// TO UPGRADE: Replace the mailto handler with a POST to your
// form backend (e.g. Formspree, Netlify Forms, or a serverless
// function) for reliable email delivery.
// ============================================================

const JESSICA_EMAIL = 'jessica.mackrael@cbrealty.com';
const SS_KEY = 'jm_saved_search';

function openSaveSearch() {
  const backdrop = document.getElementById('ss-modal-backdrop');
  if (!backdrop) return;

  // Reset to form view
  document.getElementById('ss-form-wrap').style.display = 'block';
  document.getElementById('ss-success').style.display   = 'none';
  document.getElementById('ss-form-note').style.display = 'none';

  // Pre-fill name/email if previously saved
  const saved = JSON.parse(sessionStorage.getItem(SS_KEY) || '{}');
  if (saved.name)  document.getElementById('ss-name').value  = saved.name;
  if (saved.email) document.getElementById('ss-email').value = saved.email;

  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('ss-email').focus();
}

function closeSaveSearch() {
  const backdrop = document.getElementById('ss-modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

function getCurrentFilters() {
  const q    = document.getElementById('f-q')?.value   || '';
  const city = document.getElementById('f-city')?.value || 'All Areas';
  const min  = document.getElementById('f-min')?.value  || '0';
  const max  = document.getElementById('f-max')?.value  || '0';
  const beds = document.getElementById('f-beds')?.value || '0';
  const baths= document.getElementById('f-baths')?.value|| '0';

  const fmtPrice = v => v === '0' ? 'No limit' : '$' + parseInt(v).toLocaleString();

  return {
    raw: { q, city, min, max, beds, baths },
    summary: [
      q         ? `Keyword: ${q}`                   : '',
      city !== 'all' ? `Area: ${city}`              : '',
      `Price: ${fmtPrice(min)} – ${fmtPrice(max)}`,
      beds  !== '0' ? `Beds: ${beds}+`              : '',
      baths !== '0' ? `Baths: ${baths}+`            : '',
    ].filter(Boolean).join('\n      ')
  };
}

function handleSaveSearch(e) {
  e.preventDefault();

  const name  = document.getElementById('ss-name').value.trim();
  const email = document.getElementById('ss-email').value.trim();

  if (!name || !email) {
    const note = document.getElementById('ss-form-note');
    note.textContent = 'Please enter your name and email to continue.';
    note.style.display = 'block';
    return;
  }

  const filters = getCurrentFilters();

  // Store for session UX
  sessionStorage.setItem(SS_KEY, JSON.stringify({ name, email, filters: filters.raw }));

  // Build mailto
  const subject = encodeURIComponent('New Saved Search Alert Request — ' + name);
  const body = encodeURIComponent(
    'Hi Jessica,\n\n' +
    name + ' has saved a home search on your website and would like to receive email alerts when matching listings become available.\n\n' +
    'Contact Information:\n' +
    '  Name: ' + name + '\n' +
    '  Email: ' + email + '\n\n' +
    'Search Criteria:\n' +
    '  ' + (filters.summary || 'All listings') + '\n\n' +
    'Please add them to your alert list. Thank you!'
  );

  window.open('mailto:' + JESSICA_EMAIL + '?subject=' + subject + '&body=' + body);

  // Show success
  document.getElementById('ss-form-wrap').style.display = 'none';
  document.getElementById('ss-success').style.display   = 'block';

  // Update button state
  const btn = document.getElementById('save-search-btn');
  const lbl = document.getElementById('ss-btn-label');
  if (btn && lbl) {
    btn.classList.add('saved');
    lbl.textContent = 'Search Saved ✓';
    btn.setAttribute('onclick', '');
    btn.style.cursor = 'default';
  }
}

// Close on backdrop click
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ss-form');
  if (form) form.addEventListener('submit', handleSaveSearch);

  const backdrop = document.getElementById('ss-modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) closeSaveSearch();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSaveSearch();
  });

  // Restore saved state from previous session
  const saved = JSON.parse(sessionStorage.getItem(SS_KEY) || '{}');
  if (saved.email) {
    const btn = document.getElementById('save-search-btn');
    const lbl = document.getElementById('ss-btn-label');
    if (btn && lbl) {
      btn.classList.add('saved');
      lbl.textContent = 'Search Saved ✓';
    }
  }
});
