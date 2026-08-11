/* ============================================================
   Jessica Mackrael — IDX feed proxy  (Vercel serverless function)
   ------------------------------------------------------------
   Feed: Emerald Coast MLS (ECMLS) via Spark Platform (FBS),
   RESO Web API v3.

   WHY A SERVER FUNCTION:
   The Spark access token is a secret. In front-end JS it would be
   public to anyone who views source, exposing AI Syndicate's ECMLS
   feed access. IDX terms also forbid re-serving the raw feed. So the
   token lives here, server-side; the browser only sees clean JSON.

   OUTPUT SHAPE: matches exactly what js/search.js, properties.js and
   listing.js already render — id, price, address, city, zip, beds,
   baths, sqft, lat, lng, status, office, tag, photo, photos, ph,
   blurb — so almost nothing on the site has to change.

   ENVIRONMENT VARIABLE (Vercel → Settings → Environment Variables,
   never committed):
     SPARK_ACCESS_TOKEN   the Access Token from the Spark
                          "Subscription Approved" email.

   ENDPOINTS:
     GET /api/listings          → all active IDX listings (market-wide)
     GET /api/listings?debug=1  → counts + sample offices, no listing rows
   ============================================================ */

// Vercel: allow up to 60s so the cold market pull never times out.
export const config = { maxDuration: 60 };

const SERVICE_ROOT = "https://replication.sparkapi.com/Version/3/Reso/OData";

const PAGE_SIZE     = 200;
const MAX_RECORDS   = 250;    // market slice: newest-modified first (kept small so
                              //   the page loads fast and doesn't render 1000 map pins)
const HER_NAME      = "Mackrael";   // always pull her own listings too, so My Properties
                                    //   is never empty even if she's outside the newest 250
const CACHE_SECONDS = 60 * 60 * 6;   // 6h fresh; stale served instantly while revalidating

/* For-sale statuses only (this is a buyer-facing search site). */
const STATUS_MAP = {
  "Active":                "Active",
  "ActiveUnderContract":   "Under Contract",
  "Active Under Contract": "Under Contract",
  "Pending":               "Pending",
  "ComingSoon":            "Coming Soon",
  "Coming Soon":           "Coming Soon"
};

async function odata(path, { retry = true } = {}) {
  const token = process.env.SPARK_ACCESS_TOKEN;
  if (!token) throw new Error("CONFIG: SPARK_ACCESS_TOKEN is not set");

  const res = await fetch(`${SERVICE_ROOT}/${path}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
      "User-Agent": "AISyndicate/1.0"
    }
  });

  if ((res.status === 401 || res.status === 429) && retry) {
    await new Promise(r => setTimeout(r, 1200));
    return odata(path, { retry: false });
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ODATA ${res.status} on ${path.split("?")[0]}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

async function odataAll(path) {
  const out = [];
  let page = await odata(path);
  out.push(...(page.value || []));
  while (page["@odata.nextLink"] && out.length < MAX_RECORDS) {
    const next = page["@odata.nextLink"].replace(SERVICE_ROOT + "/", "");
    page = await odata(next);
    out.push(...(page.value || []));
  }
  return out.slice(0, MAX_RECORDS);
}

function baths(raw) {
  if (raw.BathroomsTotalInteger != null) return raw.BathroomsTotalInteger;
  const full = raw.BathroomsFull || 0;
  const half = raw.BathroomsHalf || 0;
  if (!full && !half) return null;
  return half ? full + 0.5 * half : full;
}

function photoUrls(raw) {
  const media = Array.isArray(raw.Media) ? raw.Media : [];
  return media
    .filter(m => m && m.MediaURL && (!m.MediaCategory || /photo|image/i.test(m.MediaCategory)))
    .sort((a, b) => (a.Order ?? a.MediaKey ?? 0) - (b.Order ?? b.MediaKey ?? 0))
    .map(m => m.MediaURL);
}

/* Office string doubles as the "is this Jessica's?" signal:
   properties.js keeps any listing whose office contains "Mackrael".
   So put the agent name in it. */
function officeLabel(raw) {
  const office = raw.ListOfficeName || "";
  const agent  = raw.ListAgentFullName || "";
  return [office, agent].filter(Boolean).join(" · ");
}

function tag(raw) {
  if (raw.PriceChangeTimestamp) return "Price Drop";
  if (raw.NewConstructionYN === true) return "New Build";
  return "";
}

function normalize(raw, i) {
  const status = STATUS_MAP[raw.StandardStatus];
  if (!status) return null;                       // drop non-for-sale
  const photos = photoUrls(raw);
  const remarks = raw.PublicRemarks || "";
  return {
    id:      String(raw.ListingId || raw.ListingKey),
    price:   raw.ListPrice ?? null,
    address: raw.UnparsedAddress ||
             [raw.StreetNumber, raw.StreetDirPrefix, raw.StreetName, raw.StreetSuffix].filter(Boolean).join(" "),
    city:    raw.City || "",
    zip:     raw.PostalCode || "",
    beds:    raw.BedroomsTotal ?? null,
    baths:   baths(raw),
    sqft:    raw.LivingArea ?? raw.BuildingAreaTotal ?? null,
    lat:     raw.Latitude ?? null,
    lng:     raw.Longitude ?? null,
    status,
    office:  officeLabel(raw),
    tag:     tag(raw),
    photo:   photos[0] || "",
    photos,
    ph:      "ph-" + ((i % 6) + 1),
    blurb:   remarks ? (remarks.length > 110 ? remarks.slice(0, 110) + "…" : remarks) : ""
  };
}

export default async function handler(req, res) {
  const started = Date.now();
  try {
    const statuses = Object.keys(STATUS_MAP)
      .filter(s => !s.includes(" "))
      .map(s => `StandardStatus eq '${s}'`)
      .join(" or ");

    const marketQuery =
      `Property?$filter=${encodeURIComponent(`(${statuses})`)}` +
      `&$orderby=ModificationTimestamp desc` +
      `&$expand=Media` +
      `&$top=${PAGE_SIZE}`;

    let raw;
    try {
      raw = await odataAll(marketQuery);
    } catch (err) {
      // Spark may not certify $expand — retry without it (cards fall back to gradient).
      if (/expand/i.test(err.message) || /400|501/.test(err.message)) {
        raw = await odataAll(marketQuery.replace("&$expand=Media", ""));
      } else {
        throw err;
      }
    }

    // Always include Jessica's own listings, even if they're older than the
    // newest 250 — otherwise the My Properties page could come up empty.
    try {
      const herFilter = `(${statuses}) and contains(ListAgentFullName,'${HER_NAME}')`;
      const herQuery =
        `Property?$filter=${encodeURIComponent(herFilter)}&$expand=Media&$top=${PAGE_SIZE}`;
      const herRaw = await odataAll(herQuery);
      const seen = new Set(raw.map(r => String(r.ListingId || r.ListingKey)));
      for (const r of herRaw) {
        const id = String(r.ListingId || r.ListingKey);
        if (!seen.has(id)) { raw.push(r); seen.add(id); }
      }
    } catch (err) {
      // contains() unsupported or query failed — no problem, her listings just
      // rely on being within the market slice. Don't fail the whole response.
      console.warn("[idx] agent-specific pull skipped:", err.message);
    }

    const listings = raw.map(normalize).filter(Boolean);

    if (req.query.debug) {
      return res.status(200).json({
        ok: true,
        rawCount: raw.length,
        displayedCount: listings.length,
        withPhotos: listings.filter(l => l.photo).length,
        withGeo: listings.filter(l => l.lat != null && l.lng != null).length,
        jessicaCount: listings.filter(l => /mackrael/i.test(l.office)).length,
        sampleOffices: [...new Set(listings.map(l => l.office).filter(Boolean))].slice(0, 12),
        ms: Date.now() - started
      });
    }

    res.setHeader("Cache-Control",
      `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`);
    return res.status(200).json({
      listings,
      count: listings.length,
      source: "Emerald Coast MLS",
      generatedAt: new Date().toISOString()
    });

  } catch (err) {
    console.error("[idx]", err.message);
    const kind = err.message.startsWith("CONFIG") ? 500 : 502;
    return res.status(kind).json({
      listings: [],
      error: err.message.split(":")[0] || "UPSTREAM",
      message: "Listing data is temporarily unavailable."
    });
  }
}
