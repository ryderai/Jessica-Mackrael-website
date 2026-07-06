# Jessica Mackrael Website — Handoff Notes

Prepared by Ryder · Updated July 2, 2026

## What's built and working

- Full 10-page site: Home, Search, My Properties, About, Communities, Buy, Sell, Military Relocation, FAQ, Contact
- **New hero (July 2)**: full-screen slow-motion white-sand beach video (free Pexels footage, photo fallback if video can't load), a "search everything" bar front and center that live-suggests listings AND site pages as you type, and Jessica's name oversized at the base — modeled directly on the Dahler & Co. site she loved
- **Coldwell Banker branding site-wide (July 2)**: the official CB Realty logo mark + "Coldwell Banker Realty" lockup to the right of her name in the header on all 10 pages, in every footer, and in the new About section. The official navy version sits on light backgrounds; a reversed cream version (same mark, brand-standard knockout treatment) sits on the dark header/footer
- **About Jessica section on the homepage (July 2)**: sits right above Featured Properties — portrait spot (placeholder until we have her headshot), her credentials checklist, CB lockup, "Meet Jessica" button
- **Jessica's personal brand logo woven in (July 2)**: her script "jm" house logo now appears in the About Jessica section on the homepage, above the contact form on the Contact page, and in the footer of all 10 pages (a cream version made for the dark footer). The "jm" house mark is also the site's browser-tab icon (favicon) — a small touch that makes it feel like her brand everywhere
- Header menu mirrors her current site (Search · Sell · Communities · My Properties · About · Contact) plus FAQ; Buy and Military Relocation stay reachable in the footer and keep working for AI/search visibility
- Luxury look modeled on the 30A inspiration site (cream / charcoal / gold, serif headlines, spacious layout)
- All copy is fact-checked against Jessica's real credentials (Top 1% CB worldwide, International President's Circle, MRP, ~10 yrs, real phone + office address)
- Interactive Search page: live map with price pins, property cards, filters (area, price, beds, baths, sort). Map is free — no API key or monthly map bill.
- Built for AI leads (GEO): structured data on every key page (RealEstateAgent + FAQPage schema), llms.txt, AI-crawler-friendly robots.txt, sitemap, and FAQ copy written to match questions people type into ChatGPT/Gemini (including the Eglin AFB / military PCS niche)
- Header hides on scroll down, reappears on scroll up; heroes sit clear of the header
- **Subtle premium animations site-wide (July 2)**: sections and property cards fade-and-rise in with a gentle cascade as you scroll, the hero intro sequences in (headline → search bar → giant name), cards lift with a slow photo zoom on hover, buttons lift softly, and nav links get an animated gold underline. All motion automatically switches off for visitors who have "reduce motion" set on their device. Hero video plays at 80% speed for a calmer feel.
- Real photography throughout (licensed-free Unsplash stock in a white-beach-house / dark-luxury theme) — swap for Jessica's own listing photos and headshot before launch
- "What is your home worth?" form on the Sell page, modeled on her current site — no backend or monthly service needed; it opens the visitor's email app with a pre-written request to Jessica (one line of config once we have her email address)
- My Properties page pulls from the same listings feed as Search, filtered to her group — when the IDX API is connected, her real listings appear there automatically

## What we need to go live

1. **Domain access** — login for emeraldcoasthomeguide.com (or wherever the domain is registered) so we can point it at the new site on Vercel. (CJ flagged this in Notion.)
2. **MLS / IDX approval for real listings** — the Search page currently shows 12 demo homes. To show Jessica's real MLS listings:
   - Jessica (or her Coldwell Banker broker) approves an IDX feed from the Emerald Coast Association of Realtors — routine paperwork agents do for their websites
   - Sign up for an IDX API vendor: **SimplyRETS** (~$49/mo, simplyrets.com) or Repliers — they handle the MLS connection and give us a username + password
   - Hand those credentials to Ryder — the site is pre-wired, it's a one-line switch and real listings with real photos flow into the existing map and cards
3. **Real photos** — professional headshot of Jessica + property/area photography to replace the placeholder gradients
4. **Jessica's email address** — for the contact page and form notifications
5. **Form service** — contact form is built but needs a backend (Formspree, Basin, or similar — 5-minute hookup) so submissions land in Jessica's inbox
6. **Final URL swap** — once the domain is confirmed, update the URLs in sitemap.xml, robots.txt, and the structured data (find-and-replace, 2 minutes)
7. ~~Official Coldwell Banker logo files~~ — DONE July 2: official CB Realty logo is now in place site-wide (navy on light backgrounds, reversed cream on dark)

## Who does what

| Item | Owner |
|------|-------|
| Domain login | CJ / Jessica |
| IDX approval + SimplyRETS account | Jessica's broker + CJ (billing) |
| Photos + email | Jessica |
| Wiring it all in + deploy | Ryder |

Nothing on this list blocks a design review — the demo site is fully clickable now.
