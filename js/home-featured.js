// ============================================================
// Homepage — "Featured Properties" strip, live from the IDX feed.
// Self-contained: fetches /api/listings directly (the homepage does
// not load search.js). Jessica's own listings lead; the rest are the
// highest-priced active homes as a luxe "featured" set. If the feed
// is unavailable, the hardcoded placeholder cards are left untouched.
// ============================================================
(function () {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;

  const HOW_MANY = 6;
  const fmt = (n) => (n == null ? "$—" : "$" + Number(n).toLocaleString("en-US"));

  function card(l) {
    const bg = l.photo
      ? `style="background:url('${l.photo}') center/cover;"`
      : "";
    const photoInner = l.photo ? "" : "<span>Listing Photo<br>Coming Soon</span>";
    const beds = l.beds != null ? `${l.beds} beds` : "— beds";
    const baths = l.baths != null ? `${l.baths} baths` : "— baths";
    const sqft = l.sqft != null ? `${Number(l.sqft).toLocaleString()} sq ft` : "— sq ft";
    const office = l.office
      ? `<p class="listing-office" style="font-size:12px;opacity:.6;margin-top:6px;">Listed by ${l.office}</p>`
      : "";
    return `
      <article class="card" style="opacity:1;transform:none;">
        <div class="card-photo ${l.ph || "ph-1"}" ${bg}>${photoInner}</div>
        <div class="price">${fmt(l.price)}</div>
        <h3>${l.address}${l.city ? " · " + l.city : ""}</h3>
        <div class="meta"><span>${beds}</span><span>${baths}</span><span>${sqft}</span></div>
        ${office}
        <a class="card-link" href="search.html#listing-${encodeURIComponent(l.id)}">View Details</a>
      </article>`;
  }

  function pick(listings) {
    const mine = listings.filter((l) => /mackrael/i.test(l.office || ""));
    const rest = listings
      .filter((l) => !/mackrael/i.test(l.office || ""))
      .sort((a, b) => (b.price || 0) - (a.price || 0));
    const seen = new Set();
    const out = [];
    for (const l of [...mine, ...rest]) {
      if (seen.has(l.id)) continue;
      seen.add(l.id);
      out.push(l);
      if (out.length >= HOW_MANY) break;
    }
    return out;
  }

  fetch("/api/listings", { headers: { Accept: "application/json" } })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error("feed " + r.status))))
    .then((data) => {
      const listings = (data && data.listings) || [];
      if (!listings.length) return; // keep placeholders
      const chosen = pick(listings);
      if (!chosen.length) return;
      grid.innerHTML = chosen.map(card).join("");

      // IDX data-source disclaimer (required wherever listings display).
      if (!document.getElementById("home-idx-disclaimer")) {
        const p = document.createElement("p");
        p.id = "home-idx-disclaimer";
        p.style.cssText =
          "font-size:11.5px;line-height:1.5;opacity:.55;text-align:center;margin-top:28px;";
        p.textContent =
          "Listing data courtesy of Emerald Coast MLS. Information is deemed reliable but not guaranteed.";
        grid.after(p);
      }
    })
    .catch((e) => {
      // Leave the placeholder cards in place; just log.
      console.warn("[home-featured] live feed unavailable:", e.message);
    });
})();
