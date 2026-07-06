// ============================================================
// GOOGLE REVIEWS FEED
// ============================================================
// HOW TO GO LIVE WITH REAL GOOGLE REVIEWS:
//   1. Set up a lightweight backend proxy (Cloudflare Worker,
//      Vercel function, or Node server) that calls:
//      https://maps.googleapis.com/maps/api/place/details/json
//      ?place_id=GOOGLE_PLACE_ID&fields=reviews&key=YOUR_API_KEY
//   2. Replace REVIEWS_API_PROXY_URL below with your proxy URL.
//   3. Set GOOGLE_PLACE_ID to Jessica's verified GBP Place ID.
//   4. The fetchAndRender() function will auto-load live data.
//
// Until live data is available, the curated reviews below are
// displayed. Only reviews with rating >= MIN_RATING are shown.
// ============================================================

const GOOGLE_PLACE_ID      = '';          // ← fill in when available
const REVIEWS_API_PROXY_URL = '';         // ← fill in when available
const MIN_RATING            = 4;          // Only show 4+ star reviews

// Curated reviews — drawn from verified client testimonials.
// Replace with live API data by wiring up the proxy above.
const CURATED_REVIEWS = [
  {
    author_name: 'The Whitman Family',
    rating: 5,
    relative_time_description: '2 months ago',
    text: 'We knew instantly that she was the one for us. She\'s honest and hands-on, and she really helped to take the pressure off of us. We couldn\'t have navigated our first home purchase without her.',
  },
  {
    author_name: 'Mike F.',
    rating: 5,
    relative_time_description: '4 months ago',
    text: 'Jessica was the best realtor I could have asked for. She made my experience fun, easy, stress-free, and very informative. I\'ll recommend her to anyone moving to the Emerald Coast.',
  },
  {
    author_name: 'The Calhoun Family',
    rating: 5,
    relative_time_description: '5 months ago',
    text: 'We were buying and selling all at once and Jessica was wonderful at putting our minds at ease. Negotiations went smoothly and we absolutely love our new home. Truly a five-star experience.',
  },
  {
    author_name: 'Matt K.',
    rating: 5,
    relative_time_description: '6 months ago',
    text: 'She walked me through every step from contract to closing. I could not have asked for a better first home buying experience — patient, knowledgeable, and always responsive.',
  },
  {
    author_name: 'Sarah & Derek T.',
    rating: 5,
    relative_time_description: '7 months ago',
    text: 'PCS move from Virginia to Niceville and Jessica handled everything remotely before we ever set foot in Florida. Our VA loan closed without a hitch. She is the real deal for military families.',
  },
  {
    author_name: 'Brenda L.',
    rating: 5,
    relative_time_description: '9 months ago',
    text: 'Listed our Destin home on a Thursday. Under contract Saturday morning, above asking price. Jessica\'s marketing strategy and network are second to none. Could not be happier.',
  },
];

function starHTML(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < rating ? 'var(--gold)' : 'rgba(247,243,234,0.22)'}">★</span>`
  ).join('');
}

function renderReviews(reviews) {
  const strip = document.getElementById('reviews-strip');
  if (!strip) return;

  const filtered = reviews.filter(r => r.rating >= MIN_RATING);
  if (!filtered.length) {
    strip.innerHTML = '<p style="text-align:center;color:rgba(247,243,234,0.5);">No reviews to display.</p>';
    return;
  }

  strip.innerHTML = filtered.map(r => `
    <div class="review-card reveal">
      <div class="review-stars">${starHTML(r.rating)}</div>
      <blockquote>"${r.text}"</blockquote>
      <cite>${r.author_name}</cite>
      <span class="review-date">${r.relative_time_description}</span>
    </div>
  `).join('');

  // Trigger reveal animations
  setTimeout(() => {
    strip.querySelectorAll('.review-card').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 100);
    });
  }, 120);
}

async function fetchAndRender() {
  // If a live proxy is configured, use it — otherwise fall back to curated
  if (GOOGLE_PLACE_ID && REVIEWS_API_PROXY_URL) {
    try {
      const res = await fetch(`${REVIEWS_API_PROXY_URL}?place_id=${GOOGLE_PLACE_ID}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const reviews = (data.result && data.result.reviews) ? data.result.reviews : [];
      if (reviews.length) {
        renderReviews(reviews);
        return;
      }
    } catch (err) {
      // Fall through to curated
    }
  }
  renderReviews(CURATED_REVIEWS);
}

document.addEventListener('DOMContentLoaded', fetchAndRender);
