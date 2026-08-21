# CONTEXT FOR AI — Jessica Mackrael

**Read this before touching anything in this folder.** It is the current state of the project.
Last updated: **2026-08-21**.

> ⚠️ **`README-START-HERE.md` and `HANDOFF-FOR-CJ-ANDREW.md` in this folder are July 2026
> documents and are now WRONG in important ways.** They are kept as history. See
> "Documents in this folder that are out of date" at the bottom before believing anything in them.

---

## 1. Who this is

**Jessica Mackrael**, Realtor®, Coldwell Banker Realty, Niceville, Florida. Emerald Coast and the
wider Florida Panhandle. Her niche is military relocation — families PCSing to Eglin Air Force
Base, Hurlburt Field and Duke Field.

- Site: **https://jessicamackrael.com** — no `www`. The `www` host has never had a TLS
  certificate. Never write `www.jessicamackrael.com` anywhere.
- Repo: `github.com/ryderai/Jessica-Mackrael-website`, branch `main`
- Host: Vercel, project `jessica-mackrael-website`, org AI Syndicate Pro
- Mobile (call or text): 850-687-9888 · Office: 850-897-4563

## 2. How work reaches the live site

1. Build in this folder.
2. Commit locally. **`git push` can never run through the Mac device bridge — Ryder pushes from
   Cursor.** Vercel redeploys on push.
3. After ANY git command on this mount, git leaves `.git/HEAD.lock`, `.git/index.lock` and
   `.git/objects/maintenance.lock` behind and cannot delete them. Move them out with `mv` as your
   very last action, because every further git command recreates `index.lock`.
4. Verify live before calling anything done. Fetch the real URLs with a cache-buster and assert on
   the markup. Never trust deploy timing.

## 3. Commit history that matters

| Commit | Date | What |
|---|---|---|
| `b49c3a2` | Aug 11 | Live IDX feed wired via Spark serverless proxy |
| `aee55fd` | Aug 11 | Homepage featured listings; IDX hardened |
| `c90636b` | **Aug 12** | **Week 1** — crawler readability. 24 `www` refs killed, canonicals added to 12 pages, AI snippet permission on all 14, sitemap rebuilt |
| `6b536e7` | **Aug 21** | **Week 2** — the three AI files rebuilt to the graded structure |
| `3793b10` | Aug 21 | Fact-check pass + two live copy defects fixed |
| `b4874d7` | Aug 21 | agents.md links converted to Markdown syntax |
| `0ca7244` | Aug 21 | agents.md action-oriented section added |

## 4. Where the scores stand (measured on the AI Syndicate platform)

| | Aug 12 | Aug 21 |
|---|---|---|
| `llms.txt` | 39/100 · 5 of 13 checks | **100/100 · 13 of 13** |
| `agents.md` | 54/100 · 4 of 7 | **78/100 · 6 of 7** ⚠️ |
| llms.txt & agents (combined) | 55/100 | **95/100** |
| **AI Access** | 83/100 | **86/100** |
| Structured data (AI) | 29/100 | 29/100 ← **platform's own "FIX THIS FIRST"** |
| Identity (NAP) | 75 | 75 |
| Page content quality | 80 | 80 |
| AI crawler access · Sitemap · robots.txt · AI intent · Crawlability | 100 | 100 |
| Brand Search Control | 16/100 | not re-run |
| Security hygiene | **0 / grade D** (7 issues, no leaks) | not re-run |
| AI fact accuracy | 82% · 23 wrong (21 real, 2 false positives) | not re-run |

⚠️ **The agents.md figure is one push behind.** Its last failing check was fixed in `0ca7244` and
that fix IS live, but the platform audit hung twice afterwards (>12 min, never recorded). Do not
quote 7 of 7 until a scan actually completes.

**Two scoring traps, both real, both bit us:**
- **The Aug 12 sample-size trap.** When only 1 of 12 pages was readable, per-page categories were
  scoring the homepage alone — the best page on the site. "Page content quality 95 → 80" and
  "title tags 100 → 75" are NOT regressions; the sample went from 1 page to 12.
- **Read the `MEASURED` timestamp before trusting any number as post-change.** Results cache.

## 5. The paced plan (one visible step per week — do not ship it all at once)

1. ✅ **Week 1, Aug 12** — crawler readability.
2. ✅ **Week 2, Aug 21** — the AI files (`llms.txt`, `llms-full.txt`, `agents.md`).
3. ⬜ **Week 3, next** — **security headers.** `vercel.json` has NO `headers` block, only a cron
   entry. Five of the seven Aug 12 security findings are that one block.
   **Ship Content-Security-Policy as `Report-Only` first** — enforcing `script-src 'self'` will
   break the Spark IDX map and search, which is the most valuable thing on the site.
4. ⬜ **Week 4** — structured data / identity. Unify the business name, add `@id`, add
   `hasCredential` for MRP, publish an email, Wikidata. Partly blocked, see §8.
5. ⬜ **Then** — BreadcrumbList (absent on all 12), homepage FAQPage, Open Graph on 11 of 12 pages,
   8 over-long titles, 10 over-long meta descriptions.

## 6. The scanner rubric — exact, pulled from the platform's own DOM

Not guessed. Use this for any client, not just Jessica.

**`llms.txt`, 13 checks:** Identity heading (`# name`) · Summary blockquote (`> one-liner`) ·
Prose paragraph after the summary · `## About` · `## Services` · Q&A block · Citation policy ·
Internal links ≥5 · Word count 300–3000 · **AI-engine mentions ≥3** · Service area / location ·
Canonical Q&A pairs ≥3 · Last-updated stamp.

**`agents.md`, 7 checks:** Identity heading · **Action-oriented section (what an agent can DO)** ·
Citation / reuse policy · Internal links ≥3 · References sibling files, ≥2 of robots/llms/sitemap ·
Word count 80–1500 · Last-updated stamp.

**Three traps that cost two extra pushes:**
1. **Links must be Markdown syntax `[label](url)`.** A bare `https://…` counts as ZERO. agents.md
   had 24 bare URLs and scored "Links · 0". Converting them took it 62 → 78.
2. **"AI-engine mentions ≥3" means naming them** — ChatGPT, Claude, Gemini, Perplexity, Copilot.
   A `## For AI Assistants` heading alone scores 0. One sentence naming six engines took llms.txt
   95 → 100.
3. **agents.md's "What to do" is not "who to recommend."** It wants actions an agent can take on
   the site. A "Recommended use" section fails it.

## 7. The IDX feed — read before touching listings

Full detail is in project memory, `jessica-mackrael-idx-ecmls.md`.

- **Emerald Coast MLS (ECMLS) via Spark Platform (FBS), RESO Web API v3.** Live since Aug 11.
- Token lives in the Vercel env var `SPARK_ACCESS_TOKEN` and in Bitwarden. **Never put it in this
  repo — this folder syncs to GitHub.**
- `search.html` serves **real live listings** — 498 measured on Aug 21.
- `properties.html` filters to her own listings and currently renders **zero**. Her own-listing
  count in the feed went 1 → 0 on Aug 12 and has stayed there. The page now explains that honestly.
- ⚠️ **The feed has gotten much slower.** `/api/listings?debug=1` did not answer within **95
  seconds** cold on Aug 21, against ~12 seconds on Aug 12. This is the likely reason the platform
  audit hung twice. Watch it.

**Rule learned here, applies to every IDX build:** the day a listing feed goes live, grep the whole
site for `demo`, `placeholder`, `preview`, `coming soon`, `once .* approved`. On Aug 21 the search
page was rendering 498 real homes underneath the line *"Demo listings shown for design preview —
live MLS data connects here once IDX access is approved."* That copy had been live for ten days,
telling every visitor and every AI crawler the real listings were fake. `properties.html` said the
same. Both are fixed.

## 8. Open questions — blocked, do not guess

1. **Which office address is current.** The site says `4504 E Highway 20 Ste A, Niceville`.
   Coldwell Banker's own agent page says `350 W John Sims Pkwy Ste 402, Niceville`, and the 4504
   building has shown as for sale. Needs Jessica.
2. **"Top 1%" or "top 4%".** Her site says top 1% of Coldwell Banker agents worldwide. Gemini reads
   the International President's Circle award as top 4%. No year, no issuing body, no citation
   anywhere. The AI files now **attribute** the claim to her rather than state it. Needs Jessica.
3. **No Florida real estate licence number is published anywhere on the site.** This is the single
   strongest trust signal still missing, because it is the one fact an AI engine can verify against
   a public state database. Needs Jessica.
4. **Why her own-listing count is zero.** Closed, or filed under a co-listing agent. Needs Jessica
   or the MLS.

## 9. Known-wrong things still live on the site

Not fixed yet — deliberately out of scope for Week 2, but real.

- **"Certified Military Relocation Professional"** appears on `index.html` and `about.html`. There
  is no such credential. NAR's designation is **Military Relocation Professional (MRP)**. The three
  AI files already use the correct name.
- **The homepage "Google Reviews" section is not Google reviews.** It asserts a 5.0 rating "based
  on verified Google reviews", but `js/reviews.js` has an empty `GOOGLE_PLACE_ID` and an empty
  proxy URL — all six reviews are hardcoded `CURATED_REVIEWS`. **Never quote that 5.0 anywhere.**
  Either wire a real Place ID or relabel the section.
- **Homepage "stories behind the sales" photos are hotlinked** from the MLS CDN
  (`photos.prod.cirrussystem.net`). They will break when those listings sell or purge. Swap for
  owned copies when Jessica sends photos of homes she has actually sold. The `assets/jess-*.png`
  files are Instagram design-inspiration saves — one has the IG icon in it — do NOT use those.
- **The Vercel `www` redirect was never added.** Deliberate, decided Aug 12: the code fix is what
  crawlers respond to, and a redirect only helps humans who type `www`. Still available if wanted.

## 10. How to talk about her claims in any report

Three buckets, never blended:

- **Measured by us** — a number produced with a tool, on a stated date. All the scores in §4.
- **Quoted** — text taken from her site or a third party, marked as such.
- **Her marketing claim** — "top 1% of Coldwell Banker agents worldwide", "top-producing", "nearly
  a decade", the 5.0 rating. Unverified. Label them.

Reports describe the work. They never assign tasks to CJ, Andrew or anyone — write "this is blocked
until X exists", not "CJ needs to do X".

## 11. Where the records live

- **Project memory** — `jessica-mackrael-week2-ai-files.md`, `jessica-mackrael-geo-baseline-aug12.md`,
  `jessica-mackrael-idx-ecmls.md`
- **Reports** — `AI-Syndicate/Jessica-Mackrael-Aug12/` and `AI-Syndicate/Jessica-Mackrael-Aug21/`
- **Work log** — `AI-Syndicate/WORK-LOG/2026-08-21--jessica-mackrael--week2-ai-files.md`
- **Notion** — client record "Jessica Mackrael"; Operations tasks "Run baseline GEO report",
  "Major fixes #1", "Week 2 changes — the AI files"
- **Platform** — aisyndicate.com dashboard. The workspace is normally left on `shinerlawgroup.com`;
  switch YOUR SITE to `jessicamackrael.com` to audit her, and **switch it back when done**.

## 12. Documents in this folder that are out of date

Kept as history. Do not act on them.

**`README-START-HERE.md`** (July 2026) — wrong on five points now:
- Says the contact form "shows a polite message instead of sending". It sends.
- Says to swap placeholder photos and fill in real listings. The IDX feed is live.
- Lists the page set without Search, My Properties, Market Updates, Mortgage or Listing.
- Says to update URLs "if the site moves to a new domain". It already moved; the domain is
  `jessicamackrael.com` and all `www` references were removed on Aug 12.
- Mentions `llms.txt` as a single file. There are three AI files, all rebuilt Aug 21.

**`HANDOFF-FOR-CJ-ANDREW.md`** (July 2, 2026) — wrong on three points now:
- Says the Search page "currently shows 12 demo homes". It shows live ECMLS listings.
- Recommends signing up for SimplyRETS or Repliers. Neither was used — the feed is Spark/FBS,
  approved and paid for on Aug 11 (ECAR invoice #5167239, $193.75).
- Says domain access is still needed. The site is live on `jessicamackrael.com`.
