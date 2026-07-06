// ============================================================
// My Properties — shows every listing represented by Jessica's
// group. Pulls from the exact same data source as the Search
// page (demo listings now, live IDX/MLS feed later), filtered
// to her office — so when the API is connected, this page fills
// itself with her real listings automatically. Nothing extra
// to grab from her.
// ============================================================

function fmtPrice(n) {
  return "$" + Number(n).toLocaleString("en-US");
}

function propertyCard(l) {
  const photoStyle = l.photo ? ` style="background-image:url('${l.photo}');background-size:cover;background-position:center;"` : "";
  const tag = l.tag ? `<span class="listing-tag">${l.tag}</span>` : "";
  return `
  <a class="card reveal" href="#listing-${l.id}"
     style="opacity:1;transform:none;display:block;text-decoration:none;color:inherit;">
    <div class="card-photo ${l.ph || ""}"${photoStyle}>${tag}</div>
    <div class="price">${fmtPrice(l.price)}</div>
    <h3>${l.address} · ${l.city}</h3>
    <div class="meta"><span>${l.beds} beds</span><span>${l.baths} baths</span><span>${Number(l.sqft).toLocaleString()} sq ft</span></div>
    <span class="card-link">View Details →</span>
  </a>`;
}

async function initProperties() {
  const grid = document.getElementById("props-grid");
  if (!grid) return;
  let listings = [];
  try {
    listings = await loadListings();
  } catch (e) {
    listings = (typeof SAMPLE_LISTINGS !== "undefined") ? SAMPLE_LISTINGS : [];
  }
  const kw = (LISTINGS_CONFIG.myOfficeKeyword || "").toLowerCase();
  const mine = listings.filter((l) => ((l.office || "").toLowerCase().includes(kw)));
  const count = document.getElementById("props-count");
  if (count) count.textContent = mine.length + (mine.length === 1 ? " home" : " homes") + " currently represented";
  if (!mine.length) {
    grid.innerHTML = '<p class="lede" style="grid-column:1/-1;text-align:center;">New listings are on the way — call or text Jessica at <a href="tel:+18506879888">850.687.9888</a> for what\'s coming to market.</p>';
    return;
  }
  grid.innerHTML = mine
    .slice()
    .sort((a, b) => b.price - a.price)
    .map(propertyCard)
    .join("");
}

document.addEventListener("DOMContentLoaded", initProperties);
