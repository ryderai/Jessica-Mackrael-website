// Area-guide pages — menu accessibility + live town listings. Built 12 Oct 2026.
(function () {
  // ---- Menu: keep aria-expanded in step with main.js, close on Escape / link tap
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var sync = function () { toggle.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false"); };
    new MutationObserver(sync).observe(nav, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { nav.classList.remove("open"); toggle.focus(); }
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) nav.classList.remove("open"); });
  }

  // ---- Live listings for the towns named in data-cities
  var boxes = document.querySelectorAll("[data-town-listings]");
  if (!boxes.length || !window.fetch) return;

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var fmt = function (n) { return "$" + Number(n).toLocaleString("en-US"); };

  function pick(list, n) {
    // Jessica's own listings first, then a spread across the price range.
    var mine = list.filter(function (l) { return /mackrael/i.test(l.office || ""); });
    var rest = list.filter(function (l) { return !/mackrael/i.test(l.office || ""); })
                   .sort(function (a, b) { return a.price - b.price; });
    var out = mine.slice(0, n);
    var need = n - out.length;
    if (need > 0 && rest.length) {
      if (rest.length <= need) out = out.concat(rest);
      else for (var i = 0; i < need; i++) out.push(rest[Math.round(i * (rest.length - 1) / (need - 1 || 1))]);
    }
    return out;
  }

  function card(l) {
    var photo = l.photo && /^https:\/\//.test(l.photo)
      ? ' style="background:url(\'' + encodeURI(l.photo).replace(/'/g, "%27") + '\') center/cover;"' : "";
    var meta = [l.beds != null ? l.beds + " beds" : "", l.baths != null ? l.baths + " baths" : "",
                l.sqft != null ? Number(l.sqft).toLocaleString("en-US") + " sq ft" : ""].filter(Boolean)
               .map(function (m) { return "<span>" + esc(m) + "</span>"; }).join("");
    return '<article class="card">' +
      '<div class="card-photo ' + esc(l.ph || "ph-1") + '"' + photo + ' aria-hidden="true"></div>' +
      '<div class="price">' + fmt(l.price) + "</div>" +
      "<h3>" + esc(l.address) + " · " + esc(l.city) + "</h3>" +
      '<div class="meta">' + meta + "</div>" +
      (l.office ? '<p class="listing-office">Listed by ' + esc(l.office) + "</p>" : "") +
      '<a class="card-link" href="search.html#listing-' + encodeURIComponent(l.id) + '">View details<span class="sr-only"> for ' + esc(l.address) + "</span></a>" +
      "</article>";
  }

  fetch("/api/listings", { headers: { Accept: "application/json" } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("feed " + r.status)); })
    .then(function (data) {
      var all = (data && data.listings) || [];
      boxes.forEach(function (box) {
        var cities = (box.getAttribute("data-cities") || "").split("|");
        // Homes for sale only: active, priced like a home (not a rental or a lot), with bedrooms.
        var list = all.filter(function (l) {
          return cities.indexOf(l.city) > -1 && l.status === "Active" && l.price >= 100000 && l.beds >= 1;
        });
        if (!list.length) return; // keep the fallback text and search link
        var chosen = pick(list, 6);
        box.querySelector(".g-listing-grid").innerHTML = chosen.map(card).join("");
        var fb = box.querySelector(".g-listings-fallback");
        if (fb) fb.innerHTML = "A sample of " + chosen.length + " of the " + list.length + " homes for sale in " +
          esc(cities.join(", ")) + " in Jessica’s live MLS feed, spread across the price range. See every home for sale in " +
          cities.map(function (c) { return '<a href="search.html?city=' + encodeURIComponent(c) + '">' + esc(c) + "</a>"; }).join(", ") + ".";
        var p = document.createElement("p");
        p.className = "g-note";
        p.textContent = "Listing data courtesy of Emerald Coast MLS. Information is deemed reliable but not guaranteed.";
        box.appendChild(p);
      });
    })
    .catch(function (e) { if (window.console) console.warn("[guides] listings feed unavailable:", e.message); });
})();
