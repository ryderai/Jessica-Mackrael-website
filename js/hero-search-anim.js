// ============================================================
// Jessica Mackrael — Hero Search Bar Entrance Animation
//
// Uses clip-path (NOT scaleX) so backdrop-filter renders
// cleanly. The form is clipped to a small circle centered on
// the search icon, then the clip expands to the full bar.
//
// Sequence:
//   1. Form is clipped to a ~54px pill around the search icon
//      — appears as a frosted-glass circle with the icon inside
//   2. After hero text settles, clip expands to full width
//   3. Placeholder text fades in as the bar opens
// ============================================================

(function () {
  'use strict';

  var EASE     = 'cubic-bezier(0.22, 1, 0.36, 1)';
  var DURATION = 750;  // ms — expansion duration
  var DELAY    = 600;  // ms — wait for hero text to settle first

  // Run immediately (before first paint) — no flash of the full bar
  var wrapper  = document.querySelector('.hero-search');
  var form     = document.getElementById('hero-search-form');
  var realIcon = wrapper && wrapper.querySelector('.search-ico');
  var input    = wrapper && wrapper.querySelector('input');

  if (!wrapper || !form || !realIcon || !input) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── Detach from standard reveal system ───────────────────────────────
  wrapper.classList.remove('reveal');
  wrapper.classList.add('visible');
  wrapper.style.opacity    = '1';
  wrapper.style.transform  = 'none';
  wrapper.style.transition = 'none';

  // ── Measure natural layout ────────────────────────────────────────────
  var formRect    = form.getBoundingClientRect();
  var iconRect    = realIcon.getBoundingClientRect();
  var formWidth   = formRect.width;                            // e.g. 680px

  // Center of the icon, measured from the form's left edge
  var iconCX = (iconRect.left + iconRect.width / 2) - formRect.left; // ~39px

  // Initial clip: a ~54px pill (radius 27px) centered on the icon
  // inset(top right bottom left round radius)
  var RADIUS     = 27;
  var leftInset  = Math.max(0, Math.round(iconCX - RADIUS));  // e.g. 12px
  var rightInset = Math.max(0, Math.round(formWidth - iconCX - RADIUS)); // e.g. 614px

  // ── Set initial state ─────────────────────────────────────────────────
  form.style.transition = 'none';
  form.style.clipPath   =
    'inset(0 ' + rightInset + 'px 0 ' + leftInset + 'px round 999px)';

  // Hide input text (it's outside the clip area anyway, but fade-in on reveal)
  input.style.transition = 'none';
  input.style.opacity    = '0';

  // ── Expand after delay ────────────────────────────────────────────────
  setTimeout(function () {
    form.style.transition = 'clip-path ' + DURATION + 'ms ' + EASE;
    form.style.clipPath   = 'inset(0 0 0 0 round 999px)';

    // Fade placeholder text in as bar is ~55% open
    setTimeout(function () {
      input.style.transition = 'opacity 300ms ease';
      input.style.opacity    = '1';
    }, Math.round(DURATION * 0.55));

  }, DELAY);

  // ── Cleanup: remove inline styles so CSS defaults take over ──────────
  setTimeout(function () {
    form.style.clipPath    = '';
    form.style.transition  = '';
    input.style.opacity    = '';
    input.style.transition = '';
  }, DELAY + DURATION + 400);

})();
