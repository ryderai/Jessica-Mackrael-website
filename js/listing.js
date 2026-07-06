// ============================================================
// listing.js — Listing detail overlay (hash-based routing)
//
// Works entirely within search.html — no separate page needed.
// When the URL hash is "#listing-L001", a full-screen overlay
// slides over the search results showing the full property detail.
// Back button / clicking outside restores the search view.
//
// Hash format:  #listing-{id}   e.g.  #listing-L001
// ============================================================

// ── Helpers ──────────────────────────────────────────────────
function fmtUSD(n) {
  return "$" + Number(n).toLocaleString("en-US");
}

function rotatePh(ph, offset) {
  const n = parseInt((ph || "ph-1").replace("ph-", "")) || 1;
  return "ph-" + (((n - 1 + offset) % 6) + 1);
}

// ── Mortgage / cost calculator ────────────────────────────────
function calcMortgage(price) {
  const down   = Math.round(price * 0.20);
  const loan   = price - down;
  const r      = 7.25 / 100 / 12;
  const n      = 360;
  const factor = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const pi     = Math.round(loan * factor);
  const tax    = Math.round((price * 0.0083) / 12);
  const ins    = Math.round(price > 1_200_000 ? 420 : price > 600_000 ? 280 : 195);
  return { down, loan, pi, tax, ins, total: pi + tax + ins };
}

// ── Gallery helpers ───────────────────────────────────────────

// Returns an array of { ph, url } objects — one per photo to show
function getPhotos(l) {
  // Live API listing with multiple photos
  if (l.photos && l.photos.length > 1) {
    return l.photos.map((url, i) => ({ ph: rotatePh(l.ph, i), url }));
  }
  // Single API photo — pad with ph- placeholders so the gallery scrolls
  if (l.photo) {
    return [{ ph: l.ph, url: l.photo }, ...Array.from({ length: 4 }, (_, i) => ({ ph: rotatePh(l.ph, i + 1), url: null }))];
  }
  // Demo mode — generate 5 gradient placeholders
  return Array.from({ length: 5 }, (_, i) => ({ ph: rotatePh(l.ph, i), url: null }));
}

function buildGalleryHTML(l) {
  const photos = getPhotos(l);
  const total  = photos.length;
  const tag    = l.tag ? `<span class="listing-tag">${l.tag}</span>` : "";

  const slides = photos.map((p, i) => {
    const bg = p.url ? `background-image:url('${p.url}');background-size:cover;background-position:center;` : "";
    // On desktop: hide items beyond index 2 but show a "+N more" badge on item 2
    const moreLabel = (i === 2 && total > 3)
      ? `<span class="ldp-more-badge">+${total - 3} more photos</span>` : "";
    const mainLabels = i === 0
      ? `${tag}<span class="ldp-status-pill">${l.status}</span>` : "";
    return `<div class="ldp-gi${i === 0 ? " ldp-gi-main" : ""}${i >= 3 ? " ldp-gi-hidden" : ""} ${p.ph}" style="${bg}">${mainLabels}${moreLabel}</div>`;
  }).join("");

  return `<div class="ldp-gallery"><div class="ldp-gallery-inner" data-total="${total}">${slides}</div></div>`;
}

// ── Build overlay HTML ────────────────────────────────────────
function buildOverlayHTML(l) {
  const m            = calcMortgage(l.price);
  const pricePerSqft = fmtUSD(Math.round(l.price / l.sqft));
  const isJessica    = (l.office || "").toLowerCase().includes("mackrael");

  return `
  <!-- Close bar -->
  <div class="ldp-topbar">
    <button class="ldp-close-btn" onclick="closeListing()">← Back to Results</button>
    <span class="ldp-topbar-addr">${l.address} · ${l.city}, FL</span>
  </div>

  <!-- Photo gallery (dynamic) -->
  ${buildGalleryHTML(l)}

  <!-- Content -->
  <div class="wrap ldp-main">
    <div class="ldp-layout">

      <!-- ═══ LEFT COLUMN ═══ -->
      <div class="ldp-left">

        <div class="ldp-price">${fmtUSD(l.price)}</div>
        <h1 class="ldp-address">${l.address}</h1>
        <p class="ldp-cityzip">${l.city}, FL ${l.zip}</p>

        <div class="ldp-specs">
          <div class="ldp-spec"><span class="ldp-spec-num">${l.beds}</span><span class="ldp-spec-lbl">Beds</span></div>
          <div class="ldp-spec"><span class="ldp-spec-num">${l.baths}</span><span class="ldp-spec-lbl">Baths</span></div>
          <div class="ldp-spec"><span class="ldp-spec-num">${Number(l.sqft).toLocaleString()}</span><span class="ldp-spec-lbl">Sq&nbsp;Ft</span></div>
          <div class="ldp-spec"><span class="ldp-spec-num">${pricePerSqft}</span><span class="ldp-spec-lbl">Per&nbsp;Sq&nbsp;Ft</span></div>
        </div>

        <hr class="hairline ldp-rule">

        <div class="ldp-section">
          <span class="eyebrow">About This Home</span>
          <p class="lede">${l.blurb || "A remarkable property in one of Florida's most desirable coastal markets. Contact Jessica for full details and to arrange a private showing."}</p>
          ${isJessica
            ? `<p class="ldp-body-copy">This home is listed exclusively by Jessica Mackrael with Coldwell Banker Realty. As your agent, Jessica brings deep local knowledge and a top-1% track record — ensuring your purchase is as seamless as it is smart.</p>`
            : `<p class="ldp-body-copy">Jessica Mackrael can represent you as a buyer's agent on this property at no additional cost. Reach out for full details, disclosures, and to arrange a private tour.</p>`
          }
        </div>

        <hr class="hairline ldp-rule">

        <div class="ldp-section">
          <span class="eyebrow">Property Details</span>
          <div class="ldp-details">
            <div class="ldp-drow"><span class="ldp-dlbl">Status</span><span class="ldp-dval">${l.status}</span></div>
            <div class="ldp-drow"><span class="ldp-dlbl">Type</span><span class="ldp-dval">Single Family</span></div>
            <div class="ldp-drow"><span class="ldp-dlbl">Bedrooms</span><span class="ldp-dval">${l.beds}</span></div>
            <div class="ldp-drow"><span class="ldp-dlbl">Bathrooms</span><span class="ldp-dval">${l.baths}</span></div>
            <div class="ldp-drow"><span class="ldp-dlbl">Square Feet</span><span class="ldp-dval">${Number(l.sqft).toLocaleString()} sq ft</span></div>
            <div class="ldp-drow"><span class="ldp-dlbl">Price / Sq Ft</span><span class="ldp-dval">${pricePerSqft}</span></div>
            <div class="ldp-drow"><span class="ldp-dlbl">MLS #</span><span class="ldp-dval">${l.id}</span></div>
            <div class="ldp-drow"><span class="ldp-dlbl">Listed By</span><span class="ldp-dval">${l.office || "Coldwell Banker Realty"}</span></div>
            <div class="ldp-drow"><span class="ldp-dlbl">Market</span><span class="ldp-dval">Emerald Coast, FL</span></div>
            <div class="ldp-drow"><span class="ldp-dlbl">ZIP Code</span><span class="ldp-dval">${l.zip}</span></div>
          </div>
        </div>

        <hr class="hairline ldp-rule">

        <div class="ldp-section">
          <span class="eyebrow">Estimated Monthly Costs</span>
          <p class="ldp-disclaimer-sm">Based on 20% down (${fmtUSD(m.down)}), 30-year fixed at 7.25%. Taxes and insurance are estimates — consult your lender for a personalised quote.</p>
          <div class="ldp-cost-table">
            <div class="ldp-cost-row"><span>Principal &amp; Interest</span><span class="ldp-cost-amt">${fmtUSD(m.pi)}<span class="ldp-mo">/mo</span></span></div>
            <div class="ldp-cost-row"><span>Property Taxes (est.)</span><span class="ldp-cost-amt">${fmtUSD(m.tax)}<span class="ldp-mo">/mo</span></span></div>
            <div class="ldp-cost-row"><span>Home Insurance (est.)</span><span class="ldp-cost-amt">${fmtUSD(m.ins)}<span class="ldp-mo">/mo</span></span></div>
            <div class="ldp-cost-row ldp-cost-total"><span>Estimated Total</span><span class="ldp-cost-amt">${fmtUSD(m.total)}<span class="ldp-mo">/mo</span></span></div>
          </div>
          <p class="ldp-disclaimer-sm" style="margin-top:14px;">Loan amount: ${fmtUSD(m.loan)} · Down payment: ${fmtUSD(m.down)} (20%)</p>
        </div>

        <hr class="hairline ldp-rule">

        <div class="ldp-section">
          <span class="eyebrow">Location</span>
          <p class="ldp-body-copy" style="margin-bottom:18px;">${l.address}, ${l.city}, FL ${l.zip}</p>
          <div id="ldp-map" class="ldp-map"></div>
        </div>

      </div>

      <!-- ═══ RIGHT SIDEBAR ═══ -->
      <aside class="ldp-sidebar">
        <div class="ldp-sidebar-card">
          <div class="ldp-sb-price">${fmtUSD(l.price)}</div>
          <div class="ldp-sb-est">Est. ${fmtUSD(m.total)}/mo · 20% down · 7.25%</div>
          <div class="ldp-sb-agent">
            <img class="ldp-sb-headshot" src="assets/jess-headshot.png" alt="Jessica Mackrael" onerror="this.style.display='none'">
            <div>
              <div class="ldp-sb-name">Jessica Mackrael</div>
              <div class="ldp-sb-title">Realtor® · Coldwell Banker Realty</div>
            </div>
          </div>
          <a class="btn btn-solid" href="tel:+18506879888" style="width:100%;text-align:center;display:block;margin-top:22px;">Call 850.687.9888</a>
          <a class="btn" href="contact.html" style="width:100%;text-align:center;display:block;margin-top:12px;">Request a Showing</a>
          <a class="btn" href="mailto:jessica.mackrael@cbrealty.com?subject=Inquiry%3A%20${encodeURIComponent(l.address)}" style="width:100%;text-align:center;display:block;margin-top:12px;">Send an Email</a>
          <hr class="hairline" style="margin:26px 0;">
          <div class="ldp-sb-specs">
            <div class="ldp-sb-spec-row"><span>${l.beds} Beds</span><span>${l.baths} Baths</span><span>${Number(l.sqft).toLocaleString()} Sq Ft</span></div>
          </div>
          <div class="ldp-sb-disclaimer">Information deemed reliable but not guaranteed. Contact Jessica for current availability and showing instructions.</div>
        </div>
      </aside>

    </div>
  </div>`;
}

// ── Show / hide overlay ───────────────────────────────────────
let ldpMapInstance = null;

function showListing(id) {
  const listings = typeof SAMPLE_LISTINGS !== "undefined" ? SAMPLE_LISTINGS : [];
  const l = listings.find((x) => x.id === id);
  const overlay = document.getElementById("listing-overlay");
  if (!overlay) return;

  if (!l) {
    overlay.innerHTML = `<div class="ldp-topbar"><button class="ldp-close-btn" onclick="closeListing()">← Back to Results</button></div><div class="wrap section center"><span class="eyebrow">Not Found</span><h2 class="headline" style="margin-top:16px;">We couldn't find that listing.</h2></div>`;
    overlay.style.display = "block";
    document.body.style.overflow = "hidden";
    overlay.scrollTop = 0;
    return;
  }

  overlay.innerHTML = buildOverlayHTML(l);
  overlay.style.display = "block";
  document.body.style.overflow = "hidden";
  overlay.scrollTop = 0;

  // Init Leaflet map inside overlay
  if (l.lat && l.lng) {
    setTimeout(() => {
      try {
        if (ldpMapInstance) { ldpMapInstance.remove(); ldpMapInstance = null; }
        ldpMapInstance = L.map("ldp-map", {
          scrollWheelZoom: false,
          touchZoom: false,
          zoomControl: true,
          center: [l.lat, l.lng],
          zoom: 15,
        });
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: "© OpenStreetMap © CARTO",
          maxZoom: 19,
        }).addTo(ldpMapInstance);
        L.divIcon && L.marker([l.lat, l.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div class="price-pin">${fmtUSD(l.price)}</div>`,
            iconSize: null,
          }),
        }).addTo(ldpMapInstance);
      } catch (e) { /* Leaflet unavailable */ }
    }, 150);
  }
}

window.closeListing = function () {
  // Remove the hash — this triggers hashchange which hides the overlay
  history.pushState("", document.title, window.location.pathname + window.location.search);
  hideOverlay();
};

function hideOverlay() {
  const overlay = document.getElementById("listing-overlay");
  if (overlay) { overlay.style.display = "none"; overlay.innerHTML = ""; }
  document.body.style.overflow = "";
  if (ldpMapInstance) { ldpMapInstance.remove(); ldpMapInstance = null; }
}

// ── Hash routing ──────────────────────────────────────────────
function handleHash() {
  const hash = window.location.hash; // e.g. "#listing-L001"
  if (hash.startsWith("#listing-")) {
    const id = hash.replace("#listing-", "");
    showListing(id);
  } else {
    hideOverlay();
  }
}

window.addEventListener("hashchange", handleHash);
document.addEventListener("DOMContentLoaded", handleHash);
