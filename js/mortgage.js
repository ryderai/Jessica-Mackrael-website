// ============================================================
// MORTGAGE CALCULATOR — js/mortgage.js
// ============================================================

function fmt$(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function calcMortgage() {
  const price    = parseFloat(document.getElementById('m-price').value)   || 0;
  const dpPct    = parseFloat(document.getElementById('m-dp-pct').value)  || 0;
  const rate     = parseFloat(document.getElementById('m-rate').value)    || 0;
  const termYrs  = parseInt(document.getElementById('m-term').value)       || 30;

  const dp       = price * (dpPct / 100);
  const loan     = price - dp;
  const r        = rate / 100 / 12;
  const n        = termYrs * 12;

  let pi = 0;
  if (r > 0 && n > 0 && loan > 0) {
    pi = loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  // Estimates for Florida coastal market
  const annualTax  = price * 0.011;       // ~1.1% property tax
  const annualIns  = price * 0.009;       // ~0.9% homeowners insurance (coastal)
  const pmi        = dpPct < 20 ? (loan * 0.008 / 12) : 0; // 0.8% PMI if < 20% down

  const monthlyTax = annualTax / 12;
  const monthlyIns = annualIns / 12;
  const totalMo    = pi + monthlyTax + monthlyIns + pmi;
  const totalInt   = (pi * n) - loan;
  const totalCost  = price + totalInt;

  // Update display
  document.getElementById('m-result-monthly').textContent = fmt$(totalMo) + '/mo';
  document.getElementById('m-pi').textContent     = fmt$(pi);
  document.getElementById('m-tax').textContent    = fmt$(monthlyTax);
  document.getElementById('m-ins').textContent    = fmt$(monthlyIns);
  document.getElementById('m-pmi').textContent    = dpPct >= 20 ? '—' : fmt$(pmi);
  document.getElementById('m-loan').textContent   = fmt$(loan);
  document.getElementById('m-int').textContent    = fmt$(totalInt);
  document.getElementById('m-total').textContent  = fmt$(totalCost);

  // PMI row visibility
  const pmiRow = document.getElementById('m-pmi-row');
  if (pmiRow) pmiRow.style.opacity = dpPct >= 20 ? '0.4' : '1';
}

// VA Calculator (no down payment)
function calcVA() {
  const price    = parseFloat(document.getElementById('va-price').value)  || 0;
  const rate     = parseFloat(document.getElementById('va-rate').value)   || 0;
  const termYrs  = parseInt(document.getElementById('va-term').value)      || 30;
  const fundingFee = parseFloat(document.getElementById('va-ff').value)   || 2.15;

  // VA: no down payment, funding fee rolled in
  const ffAmt  = price * (fundingFee / 100);
  const loan   = price + ffAmt;
  const r      = rate / 100 / 12;
  const n      = termYrs * 12;

  let pi = 0;
  if (r > 0 && n > 0 && loan > 0) {
    pi = loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const monthlyTax = (price * 0.011) / 12;
  const monthlyIns = (price * 0.009) / 12;
  const totalMo    = pi + monthlyTax + monthlyIns;
  const totalInt   = (pi * n) - loan;
  const totalCost  = price + totalInt + ffAmt;

  document.getElementById('va-result-monthly').textContent = fmt$(totalMo) + '/mo';
  document.getElementById('va-pi').textContent    = fmt$(pi);
  document.getElementById('va-tax').textContent   = fmt$(monthlyTax);
  document.getElementById('va-ins').textContent   = fmt$(monthlyIns);
  document.getElementById('va-ff-amt').textContent = fmt$(ffAmt);
  document.getElementById('va-loan').textContent  = fmt$(loan);
  document.getElementById('va-int').textContent   = fmt$(totalInt);
  document.getElementById('va-total').textContent = fmt$(totalCost);
}

// Sync range slider with number input
function syncRange(rangeId, numId, multiplier, updateFn) {
  const range = document.getElementById(rangeId);
  const num   = document.getElementById(numId);
  if (!range || !num) return;
  range.addEventListener('input', () => {
    const v = parseFloat(range.value) * (multiplier || 1);
    num.value = multiplier ? v : v;
    updateFn();
  });
  num.addEventListener('input', () => {
    range.value = parseFloat(num.value) / (multiplier || 1);
    updateFn();
  });
}

// Tab switching
function switchTab(tab) {
  document.querySelectorAll('.mort-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.mort-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  // Conventional inputs
  ['m-price','m-dp-pct','m-rate','m-term'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calcMortgage);
  });

  // VA inputs
  ['va-price','va-rate','va-term','va-ff'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calcVA);
  });

  // Initial calculations
  calcMortgage();
  calcVA();
});
