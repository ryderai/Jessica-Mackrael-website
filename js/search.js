// ============================================================
// Jessica Mackrael — Property Search
// Demo mode uses SAMPLE_LISTINGS (js/listings-data.js).
// To go live: set LISTINGS_CONFIG.mode = "api" and fill in the
// IDX provider credentials (e.g. SimplyRETS / Repliers).
// ============================================================

const LISTINGS_CONFIG = {
  mode: "demo", // "demo" | "api"
  api: {
    // Example for SimplyRETS-style REST API:
    baseUrl: "https://api.simplyrets.com/properties",
    username: "",   // <- provided by IDX vendor
    password: "",   // <- provided by IDX vendor
  },
  // Used by the My Properties page: any listing whose office/agent
  // name contains this word counts as "Jessica's group".
  myOfficeKeyword: "Mackrael",
};

// --- fetch listings (demo or live) ---
async function loadListings() {
  if (LISTINGS_CONFIG.mode === "demo") return SAMPLE_LISTINGS;
  const { baseUrl, username, password } = LISTINGS_CONFIG.api;
  const res = await fetch(`${baseUrl}?limit=50&status=Active`, {
    headers: { Authorization: "Basic " + btoa(username + ":" + password) },
  });
  const data = await res.json();
  // Adapter: map RESO/SimplyRETS fields into our card format
  return data.map((p, i) => ({
    id: p.mlsId || "API" + i,
    price: p.listPrice,
    address: p.address && p.address.full,
    city: p.address && p.address.city,
    zip: p.address && p.address.postalCode,
    beds: p.property && p.property.bedrooms,
    baths: p.property && p.property.bathsFull,
    sqft: p.property && p.property.area,
    lat: p.geo && p.geo.lat,
    lng: p.geo && p.geo.lng,
    status: p.mls && p.mls.status,
    office: [(p.office && p.office.name) || "", (p.agent && p.agent.firstName) || "", (p.agent && p.agent.lastName) || ""].join(" ").trim(),
    tag: "",
    photo: p.photos && p.photos[0],
    ph: "ph-" + ((i % 6) + 1),
    blurb: p.remarks ? p.remarks.slice(0, 110) + "…" : "",
  }));
}

// --- state ---
let allListings = [];
let map, markerLayer;
const markers = {};

const fmt = (n) => "$" + Number(n).toLocaleString("en-US");

// --- filters ---
function getFilters() {
  const qEl = document.querySelector("#f-q");
  return {
    q: qEl ? qEl.value.trim().toLowerCase() : "",
    city: document.querySelector("#f-city").value,
    minPrice: Number(document.querySelector("#f-min").value) || 0,
    maxPrice: Number(document.querySelector("#f-max").value) || Infinity,
    beds: Number(document.querySelector("#f-beds").value) || 0,
    baths: Number(document.querySelector("#f-baths").value) || 0,
    sort: document.querySelector("#f-sort").value,
  };
}

function applyFilters() {
  const f = getFilters();
  let out = allListings.filter(
    (l) =>
      (f.city === "all" || l.city === f.city) &&
      l.price >= f.minPrice &&
      l.price <= f.maxPrice &&
      l.beds >= f.beds &&
      l.baths >= f.baths &&
      (!f.q ||
        [l.address, l.city, l.zip, l.tag, l.blurb, l.office]
          .join(" ")
          .toLowerCase()
          .includes(f.q))
  );
  if (f.sort === "price-asc") out.sort((a, b) => a.price - b.price);
  if (f.sort === "price-desc") out.sort((a, b) => b.price - a.price);
  render(out);
}

// --- render cards + markers ---
function render(list) {
  const grid = document.querySelector("#results");
  const count = document.querySelector("#result-count");
  count.textContent = list.length + (list.length === 1 ? " home" : " homes");
  grid.innerHTML = "";
  markerLayer.clearLayers();

  list.forEach((l) => {
    // card
    // Entire card is a native <a> — no JS navigation, no event issues
    const card = document.createElement("a");
    card.href = "#listing-" + l.id;
    card.className = "listing-card";
    card.id = "card-" + l.id;
    card.style.display = "block";
    card.style.textDecoration = "none";
    card.style.color = "inherit";
    card.innerHTML = `
      <div class="card-photo ${l.ph}" ${l.photo ? `style="background:url('${l.photo}') center/cover"` : ""}>
        ${l.tag ? `<em class="listing-tag">${l.tag}</em>` : ""}
        <span class="listing-status">${l.status}</span>
      </div>
      <div class="listing-body">
        <div class="price">${fmt(l.price)}</div>
        <h3>${l.address}</h3>
        <p class="listing-city">${l.city}, FL ${l.zip}</p>
        <div class="meta"><span>${l.beds} beds</span><span>${l.baths} baths</span><span>${Number(l.sqft).toLocaleString()} sq ft</span></div>
        <p>${l.blurb || ""}</p>
        <span class="card-link">View Details →</span>
      </div>`;
    card.addEventListener("mouseenter", () => highlightMarker(l.id, true));
    card.addEventListener("mouseleave", () => highlightMarker(l.id, false));
    grid.appendChild(card);

    // marker (price pill)
    const icon = L.divIcon({
      className: "",
      html: `<div class="price-pin" id="pin-${l.id}">${"$" + Math.round(l.price / 1000) + "k"}</div>`,
      iconSize: null,
    });
    const m = L.marker([l.lat, l.lng], { icon }).addTo(markerLayer);
    m.on("click", () => {
      document.querySelector("#card-" + l.id).scrollIntoView({ behavior: "smooth", block: "center" });
      flashCard(l.id);
    });
    markers[l.id] = m;
  });

  if (list.length) {
    map.fitBounds(markerLayer.getBounds().pad(0.18));
  }
}

function highlightMarker(id, on) {
  const pin = document.querySelector("#pin-" + id);
  if (pin) pin.classList.toggle("pin-active", on);
}

function flashCard(id) {
  const card = document.querySelector("#card-" + id);
  card.classList.add("card-flash");
  setTimeout(() => card.classList.remove("card-flash"), 1600);
}

// --- init ---
async function initSearch() {
  if (!document.getElementById("map")) return; // not on the search page
  // Scroll/pinch zoom off: the page scrolls normally even when the
  // cursor is over the map. Zoom with the +/- buttons, pan by dragging.
  map = L.map("map", { scrollWheelZoom: false, touchZoom: false, zoomControl: false });
  L.control.zoom({ position: "topright" }).addTo(map);
  // Light, premium map tiles (free, no API key)
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
  }).addTo(map);
  markerLayer = L.featureGroup().addTo(map);
  map.setView([30.45, -86.45], 10);

  allListings = await loadListings();

  // Arriving from the homepage hero search? Pre-fill the keyword box.
  const params = new URLSearchParams(window.location.search);
  let qParam = (params.get("q") || "").trim();
  // Fallback: hosts that rewrite search.html → /search can drop the
  // query string; the hero search stashes it in sessionStorage.
  if (!qParam) {
    try { qParam = (sessionStorage.getItem("heroQ") || "").trim(); } catch (_) {}
  }
  try { sessionStorage.removeItem("heroQ"); } catch (_) {}
  const qInput = document.querySelector("#f-q");
  if (qInput && qParam) qInput.value = qParam;

  // populate city dropdown
  const cities = [...new Set(allListings.map((l) => l.city))].sort();
  const citySel = document.querySelector("#f-city");
  cities.forEach((c) => {
    const o = document.createElement("option");
    o.value = c; o.textContent = c;
    citySel.appendChild(o);
  });

  // Arriving from the Find My Home quiz? Pre-fill the filter bar
  // with their answers so the matching homes show immediately.
  let quizCity = params.get("city") || "";
  let quizMin  = params.get("min")  || "";
  let quizMax  = params.get("max")  || "";
  let quizBeds = params.get("beds") || "";
  if (!quizCity && !quizMin && !quizMax && !quizBeds) {
    try {
      const stashed = JSON.parse(sessionStorage.getItem("quizFilters") || "null");
      if (stashed) {
        quizCity = stashed.city || "";
        quizMin  = stashed.min  || "";
        quizMax  = stashed.max  || "";
        quizBeds = stashed.beds || "";
      }
    } catch (_) {}
  }
  try { sessionStorage.removeItem("quizFilters"); } catch (_) {}

  if (quizCity && [...citySel.options].some((o) => o.value === quizCity)) {
    citySel.value = quizCity;
  }
  if (quizMin) document.querySelector("#f-min").value = quizMin;
  if (quizMax) document.querySelector("#f-max").value = quizMax;
  if (quizBeds) document.querySelector("#f-beds").value = quizBeds;

  document.querySelectorAll(".search-filters select").forEach((s) =>
    s.addEventListener("change", applyFilters)
  );
  if (qInput) qInput.addEventListener("input", applyFilters);

  applyFilters();
}

document.addEventListener("DOMContentLoaded", initSearch);
