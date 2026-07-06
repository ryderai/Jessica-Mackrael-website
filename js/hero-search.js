// ============================================================
// Jessica Mackrael — Hero "search everything" bar (homepage)
// Live-suggests homes for sale (js/listings-data.js) AND site
// pages/communities as you type. Enter (or "See all results")
// hands the query to search.html?q=… where the full listing
// engine — demo or live API — takes over.
// ============================================================

(function () {
  const input = document.getElementById("hero-search-input");
  const panel = document.getElementById("hero-search-results");
  const form = document.getElementById("hero-search-form");
  if (!input || !panel || !form) return;

  // --- searchable site pages (title + hidden keywords) ---
  const PAGES = [
    { title: "Search All Homes", sub: "Interactive map search", url: "search.html", kw: "search homes listings buy mls map for sale" },
    { title: "My Properties", sub: "Jessica's own listings", url: "properties.html", kw: "portfolio my properties jessica listings featured curated" },
    { title: "Sell Your Home", sub: "Free home value report", url: "sell.html", kw: "sell selling home value worth list my house cma" },
    { title: "The Buying Experience", sub: "Buyer's guide", url: "buy.html", kw: "buy buying first time buyer purchase" },
    { title: "Military Relocation", sub: "PCS to Eglin AFB & Hurlburt Field", url: "military-relocation.html", kw: "military pcs relocation eglin hurlburt duke field mrp va loan base" },
    { title: "About Jessica", sub: "Top 1% Coldwell Banker worldwide", url: "about.html", kw: "about jessica mackrael realtor agent bio coldwell banker" },
    { title: "Questions & Answers", sub: "FAQ", url: "faq.html", kw: "faq questions answers closing costs commission" },
    { title: "Contact", sub: "850.687.9888", url: "contact.html", kw: "contact call email phone message office" },
    { title: "Niceville", sub: "Community guide", url: "communities.html#niceville", kw: "niceville bluewater bay boggy bayou community 32578" },
    { title: "Destin", sub: "Community guide", url: "communities.html#destin", kw: "destin harbor emerald coast community 32541" },
    { title: "Miramar Beach", sub: "Community guide", url: "communities.html#miramar", kw: "miramar beach scenic gulf drive community 32550" },
    { title: "Santa Rosa Beach & 30A", sub: "Community guide", url: "communities.html#santa-rosa", kw: "santa rosa beach 30a seaside watercolor grayton community 32459" },
    { title: "Fort Walton Beach", sub: "Community guide", url: "communities.html#fwb", kw: "fort walton beach fwb community 32548" },
    { title: "Freeport · Navarre · Crestview", sub: "Community guide", url: "communities.html#more", kw: "freeport navarre crestview hammock bay community" },
  ];

  const listings = typeof SAMPLE_LISTINGS !== "undefined" ? SAMPLE_LISTINGS : [];
  const fmt = (n) => "$" + Number(n).toLocaleString("en-US");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function listingHaystack(l) {
    return [l.address, l.city, l.zip, l.tag, l.blurb, l.office].join(" ").toLowerCase();
  }

  function render(q) {
    const term = q.trim().toLowerCase();
    if (term.length < 2) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }

    const homeHits = listings.filter((l) => listingHaystack(l).includes(term)).slice(0, 5);
    const pageHits = PAGES.filter((p) => (p.title + " " + p.kw).toLowerCase().includes(term)).slice(0, 4);

    let html = "";
    if (homeHits.length) {
      html += `<div class="hsr-group">Homes for Sale</div>`;
      homeHits.forEach((l) => {
        html += `<a class="hsr-item" href="search.html?q=${encodeURIComponent(l.address)}">
          <span class="hsr-main">${esc(l.address)}<em>${esc(l.city)}, FL ${esc(l.zip)}</em></span>
          <span class="hsr-price">${fmt(l.price)}</span></a>`;
      });
    }
    if (pageHits.length) {
      html += `<div class="hsr-group">On This Site</div>`;
      pageHits.forEach((p) => {
        html += `<a class="hsr-item" href="${p.url}">
          <span class="hsr-main">${esc(p.title)}<em>${esc(p.sub)}</em></span>
          <span class="hsr-go">&rarr;</span></a>`;
      });
    }
    html += `<a class="hsr-item hsr-all" href="search.html?q=${encodeURIComponent(q.trim())}">
      <span class="hsr-main">See all results for &ldquo;${esc(q.trim())}&rdquo;</span>
      <span class="hsr-go">&rarr;</span></a>`;

    panel.innerHTML = html;
    panel.hidden = false;
  }

  input.addEventListener("input", () => render(input.value));
  input.addEventListener("focus", () => render(input.value));

  // Some hosts rewrite search.html → /search and drop the ?q=…
  // query in the redirect. Stash the query in sessionStorage as a
  // backup; search.js reads it if the URL arrives without one.
  form.addEventListener("submit", () => {
    try { sessionStorage.setItem("heroQ", input.value.trim()); } catch (_) {}
  });
  panel.addEventListener("click", (e) => {
    const a = e.target.closest("a.hsr-item");
    if (!a) return;
    const m = (a.getAttribute("href") || "").match(/[?&]q=([^&]*)/);
    if (m) { try { sessionStorage.setItem("heroQ", decodeURIComponent(m[1])); } catch (_) {} }
  });

  // Close on click-away or Escape; Enter falls through to the
  // form's native GET → search.html?q=…
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".hero-search")) panel.hidden = true;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { panel.hidden = true; input.blur(); }
  });

  // If the background video can't load (offline / source removed),
  // fade it out so the poster photograph carries the hero instead.
  const vid = document.querySelector(".hero-vid");
  if (vid) {
    const sources = vid.querySelectorAll("source");
    const last = sources[sources.length - 1];
    if (last) last.addEventListener("error", () => vid.classList.add("vid-failed"));
    vid.addEventListener("error", () => vid.classList.add("vid-failed"));

    // Play the beach footage at 80% speed for a calmer, more
    // luxurious drift. Re-applied on loadeddata/play in case the
    // browser resets the rate when the source finishes loading.
    const calm = () => { vid.playbackRate = 0.8; };
    calm();
    vid.addEventListener("loadeddata", calm);
    vid.addEventListener("play", calm);
  }
})();
