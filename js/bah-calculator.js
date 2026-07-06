// ============================================================
// BAH CALCULATOR
// 2026 Basic Allowance for Housing rates — Fort Walton Beach, FL
// MHA covers: Niceville, Eglin AFB, Hurlburt Field, Duke Field,
//             Fort Walton Beach, Crestview, Navarre
// Source: DoD Office of the Under Secretary of Defense
// ============================================================

// Monthly BAH rates — Fort Walton Beach, FL (2026 estimates)
const BAH_RATES = {
  'E-1':  { without: 1368,  with: 1641  },
  'E-2':  { without: 1368,  with: 1641  },
  'E-3':  { without: 1368,  with: 1641  },
  'E-4':  { without: 1440,  with: 1908  },
  'E-5':  { without: 1656,  with: 2181  },
  'E-6':  { without: 1908,  with: 2403  },
  'E-7':  { without: 2061,  with: 2580  },
  'E-8':  { without: 2289,  with: 2832  },
  'E-9':  { without: 2508,  with: 3078  },
  'W-1':  { without: 2061,  with: 2580  },
  'W-2':  { without: 2160,  with: 2691  },
  'W-3':  { without: 2289,  with: 2832  },
  'W-4':  { without: 2508,  with: 3078  },
  'W-5':  { without: 2691,  with: 3315  },
  'O-1E': { without: 2061,  with: 2580  },
  'O-1':  { without: 1908,  with: 2403  },
  'O-2E': { without: 2289,  with: 2832  },
  'O-2':  { without: 2160,  with: 2691  },
  'O-3E': { without: 2580,  with: 3141  },
  'O-3':  { without: 2403,  with: 2991  },
  'O-4':  { without: 2658,  with: 3357  },
  'O-5':  { without: 3024,  with: 3813  },
  'O-6':  { without: 3405,  with: 4218  },
  'O-7':  { without: 4218,  with: 4800  },
};

// Estimated home price range based on monthly BAH
// VA loan assumed: no down payment, 30yr at ~6.5% rate
// P&I = BAH; total PITI uses 1.1% tax + 0.9% insurance annually
function bahToHomePrice(monthlyBah) {
  // Strip ~30% for taxes, insurance, HOA → leaves for P&I
  const pi = monthlyBah * 0.72;
  const rate = 0.065 / 12;
  const n = 360; // 30 year
  // Home price from P&I: P = M * [(1-(1+r)^-n)/r]
  const price = pi * ((1 - Math.pow(1 + rate, -n)) / rate);
  return Math.round(price / 10000) * 10000; // round to nearest $10K
}

function fmt$(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function runBahCalc() {
  const rank = document.getElementById('bah-rank').value;
  const dep  = document.getElementById('bah-dep').value;

  if (!rank) return;

  const rateObj = BAH_RATES[rank];
  if (!rateObj) return;

  const monthly = dep === 'with' ? rateObj.with : rateObj.without;
  const maxPrice = bahToHomePrice(monthly);
  const minPrice = Math.round(maxPrice * 0.75 / 10000) * 10000;

  // Fill result tiles
  document.getElementById('bah-monthly').textContent  = fmt$(monthly) + '/mo';
  document.getElementById('bah-min').textContent       = fmt$(minPrice);
  document.getElementById('bah-max').textContent       = fmt$(maxPrice);

  // Range label
  document.getElementById('bah-range-label').textContent =
    'With VA financing and no down payment, your ' + fmt$(monthly) +
    ' BAH covers a home in the ' + fmt$(minPrice) + ' – ' + fmt$(maxPrice) + ' range.';

  const result = document.getElementById('bah-result');
  result.classList.add('visible');
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.addEventListener('DOMContentLoaded', () => {
  const rankSel = document.getElementById('bah-rank');
  const depSel  = document.getElementById('bah-dep');
  if (rankSel) rankSel.addEventListener('change', runBahCalc);
  if (depSel)  depSel.addEventListener('change', runBahCalc);
});
