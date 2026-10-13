#!/usr/bin/env python3
"""
Area-guide pages for jessicamackrael.com — built 12 Oct 2026 by AI Syndicate.

Makes four pages + their markdown copies + their link-preview images:
  crestview.html · hurlburt-field.html · eglin-afb.html · niceville-vs-crestview.html

HOW TO UPDATE
  1. Change the numbers in DRIVE / REDFIN / FACTS below (each one says where it came from).
  2. Change UPDATED to the day you re-checked them.
  3. Run from the site folder:   python3 _tools/build-guides.py
  4. Never hand-edit the four .html / .md files — this script overwrites them.

RULES THE CONTENT FOLLOWS
  - Every number names its source and the date it was read.
  - Nothing is written that the sources don't say (no invented neighborhoods, no "top 1%").
  - Drive times are what Google Maps showed on the date below, not a promise.

AI search optimization (GEO) for this site by AI Syndicate — https://aisyndicate.com
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://jessicamackrael.com"
UPDATED = "2026-10-12"
UPDATED_TEXT = "October 12, 2026"
CREDIT = "AI search optimization (GEO) for this site by AI Syndicate — https://aisyndicate.com"

# ----------------------------------------------------------------------------
# DATA — measured or quoted. Re-check before changing UPDATED.
# ----------------------------------------------------------------------------
# Google Maps, "leave now", from each town's center (Google's own town point),
# Monday 12 Oct 2026, about 9:20–9:45 a.m. Central. (minutes, miles)
DRIVE_NOTE = ("Drive times are what Google Maps showed on Monday, October 12, 2026, between about "
              "9:20 and 9:45 a.m. Central, leaving from the center of each town. Your drive will vary "
              "with traffic, the time of day and the gate you use.")
E, W, D, H = "east", "sr85", "duke", "hurlburt"
DEST = {
    E: "Eglin AFB East Gate (Valparaiso)",
    W: "Eglin AFB, SR 85 side (Air Force Armament Museum visitor center)",
    D: "Duke Field",
    H: "Hurlburt Field main gate",
}
DRIVE = {
    "Crestview":         {E: (29, 21.3), W: (26, 21.5), D: (19, 10.9), H: (43, 32.0)},
    "Niceville":         {E: (9, 4.0),   W: (12, 7.8),  D: (17, 12.1), H: (29, 18.3)},
    "Valparaiso":        {E: (4, 1.8)},
    "Shalimar":          {W: (4, 2.1)},
    "Fort Walton Beach": {E: (21, 13.2), W: (11, 5.7),  H: (13, 6.2)},
    "Wright":            {W: (8, 5.6),   H: (13, 7.1)},
    "Mary Esther":       {W: (18, 10.3), H: (6, 2.6)},
    "Navarre":           {W: (41, 25.7), H: (24, 13.6)},
}
CRESTVIEW_TO_NICEVILLE = (26, 19.3)

# Redfin "housing market" pages, read in Chrome on 12 Oct 2026.
REDFIN = {
    "Crestview":         dict(median=277318, ppsf=166, dom=84, dom_ly=71, period="3 months to Sept. 2026",
                              url="https://www.redfin.com/city/4016/FL/Crestview/housing-market"),
    "Niceville":         dict(median=532800, ppsf=287, dom=68, dom_ly=70, period="3 months to Aug. 2026",
                              url="https://www.redfin.com/city/12482/FL/Niceville/housing-market"),
    "Fort Walton Beach": dict(median=329843, ppsf=211, dom=54, dom_ly=85, period="3 months to Sept. 2026",
                              url="https://www.redfin.com/city/6298/FL/Fort-Walton-Beach/housing-market"),
    "Mary Esther":       dict(median=340000, ppsf=207, dom=64, dom_ly=73, period="3 months to Aug. 2026",
                              url="https://www.redfin.com/city/11047/FL/Mary-Esther/housing-market"),
    # Navarre: Redfin moved to the Sept. 2026 window during the day on 12 Oct (was $439,000 / 64 days, to Aug.)
    "Navarre":           dict(median=423248, ppsf=215, dom=63, dom_ly=66, period="3 months to Sept. 2026",
                              url="https://www.redfin.com/city/33787/FL/Navarre/housing-market"),
}

SRC = {
    "maps":     ("Google Maps driving directions, checked October 12, 2026 (about 9:20–9:45 a.m. Central)", "https://www.google.com/maps"),
    "redfin":   ("Redfin — Crestview housing market, read October 12, 2026", "https://www.redfin.com/city/4016/FL/Crestview/housing-market"),
    "rf_niceville": ("Redfin — Niceville housing market, read October 12, 2026", "https://www.redfin.com/city/12482/FL/Niceville/housing-market"),
    "rf_fwb":   ("Redfin — Fort Walton Beach housing market, read October 12, 2026", "https://www.redfin.com/city/6298/FL/Fort-Walton-Beach/housing-market"),
    "rf_me":    ("Redfin — Mary Esther housing market, read October 12, 2026", "https://www.redfin.com/city/11047/FL/Mary-Esther/housing-market"),
    "rf_navarre": ("Redfin — Navarre housing market, read October 12, 2026", "https://www.redfin.com/city/33787/FL/Navarre/housing-market"),
    "hurlwiki": ("Wikipedia — Hurlburt Field", "https://en.wikipedia.org/wiki/Hurlburt_Field"),
    "census":   ("U.S. Census Bureau QuickFacts — 2020 Census population, Crestview and Niceville", "https://www.census.gov/quickfacts/fact/table/crestviewcityflorida,nicevillecityflorida/POP010220"),
    "eglin":    ("Air Force Test Center — 96th Test Wing fact sheet", "https://www.aftc.af.mil/About-Us/Fact-Sheets/Article/2382281/96th-test-wing/"),
    "hurlburt": ("Hurlburt Field — installation fact sheet", "https://www.hurlburt.af.mil/About-Us/Fact-Sheets/Fact-Sheets/Article/204585/hurlburt-field/"),
    "duke":     ("Wikipedia — Duke Field", "https://en.wikipedia.org/wiki/Duke_Field"),
    "crestwiki":("Wikipedia — Crestview, Florida", "https://en.wikipedia.org/wiki/Crestview,_Florida"),
    "navwiki":  ("Wikipedia — Navarre, Florida", "https://en.wikipedia.org/wiki/Navarre,_Florida"),
    "wrightwiki":("Wikipedia — Wright, Florida", "https://en.wikipedia.org/wiki/Wright,_Florida"),
    "nicewiki": ("Wikipedia — Niceville, Florida", "https://en.wikipedia.org/wiki/Niceville,_Florida"),
    "grades":   ("WEAR-TV, July 1, 2026 — Escambia, Santa Rosa and Okaloosa school districts all receive 'A' for 2025-26", "https://weartv.com/news/local/escambia-santa-rosa-and-okaloosa-school-districts-all-receive-a-for-2025-26"),
    "okschools":("Okaloosa County School District", "https://www.okaloosaschools.com/"),
    "srschools":("Santa Rosa County District Schools", "https://www.santarosaschools.org/"),
    "bah":      ("Defense Travel Management Office — BAH rate lookup", "https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/"),
    "va":       ("U.S. Department of Veterans Affairs — VA-backed home loans", "https://www.va.gov/housing-assistance/home-loans/"),
    "fema":     ("FEMA Flood Map Service Center", "https://msc.fema.gov/portal/home"),
    "okpa":     ("Okaloosa County Property Appraiser", "https://www.okaloosapa.com/"),
    "srpa":     ("Santa Rosa County Property Appraiser", "https://www.srcpa.gov/"),
}

# ----------------------------------------------------------------------------
# small helpers
# ----------------------------------------------------------------------------
def money(n):  return "${:,.0f}".format(n)
def k(n):      return "${:,.0f}K".format(round(n / 1000))
def drv(town, dest):
    v = DRIVE.get(town, {}).get(dest)
    return f"{v[0]} min · {v[1]:.1f} mi" if v else "—"
def mins(town, dest): return DRIVE[town][dest][0]
def miles(town, dest): return DRIVE[town][dest][1]
def a(key, text=None):
    t, u = SRC[key]
    return f'<a href="{u}" target="_blank" rel="noopener">{html.escape(text or t)}</a>'
def esc(s): return html.escape(s, quote=True)

def strip_tags(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s)).strip()

def to_md_inline(s):
    s = re.sub(r'<a href="([^"]+)"[^>]*>(.*?)</a>', lambda m: f"[{strip_tags(m.group(2))}]({abs_url(m.group(1))})", s)
    s = re.sub(r"</?strong>", "**", s)
    s = re.sub(r"</?em>", "_", s)
    s = re.sub(r"<br\s*/?>", " ", s)
    s = re.sub(r"<[^>]+>", "", s)
    return html.unescape(re.sub(r"[ \t]+", " ", s)).strip()

def abs_url(h):
    if h.startswith(("http", "tel:", "mailto:", "#")): return h
    return f"{SITE}/{h.lstrip('/')}"

# ----------------------------------------------------------------------------
# PAGES — content as blocks, rendered to both HTML and markdown
# ----------------------------------------------------------------------------
R = REDFIN
CV, NV, FWB, ME, NAV = R["Crestview"], R["Niceville"], R["Fort Walton Beach"], R["Mary Esther"], R["Navarre"]

def rf(town, text=None):
    return f'<a href="{R[town]["url"]}" target="_blank" rel="noopener">{html.escape(text or town)}</a>'

def price_table(towns, caption):
    rows = [[t, money(R[t]["median"]), f"${R[t]['ppsf']}", f"{R[t]['dom']} days", R[t]["period"]] for t in towns]
    return ("table", dict(caption=caption,
                          head=["Town", "Median sale price", "Price per sq ft", "Median days on market", "Period"],
                          rows=rows,
                          note=f"Source: Redfin housing market pages, read {UPDATED_TEXT}: " + ", ".join(rf(t) for t in towns) + ". A median is the middle sale — half sold for more, half for less. These are recent sales, not today's asking prices."))

BUY_REMOTE = ("Yes. Jessica does live video tours from the house, and helps coordinate the inspection, "
              "appraisal and closing while you're at your current duty station, and works to time the closing around your report date (the day you must report to your new base).")

def checklist(county="Okaloosa"):
    pa = "okpa" if county == "Okaloosa" else "srpa"
    return ("ul", [
        f"<strong>Check the flood zone</strong> for the exact address on {a('fema', 'FEMA’s Flood Map Service Center')}. Flood insurance can change a monthly budget more than a small price difference.",
        f"<strong>Look up the tax history</strong> on the {a(pa)} site. In Florida, the seller’s tax bill is often not what you’ll pay: assessment limits on a homestead reset when a home sells.",
        f"<strong>Know your housing allowance.</strong> Look up your rate on the {a('bah', 'Defense Department’s BAH lookup')}, or try Jessica’s <a href=\"military-relocation.html#bah-calculator\">BAH calculator</a>.",
        f"<strong>Using a VA loan?</strong> Start with the {a('va', 'VA’s home loan page')} and get your Certificate of Eligibility (the VA paper that shows you qualify) early.",
        "<strong>Drive the commute at the time you’ll really leave for work</strong> before you commit — traffic at 7 a.m. is not the same as at noon.",
    ])

PAGES = []

# ---------------------------------------------------------------- CRESTVIEW
PAGES.append(dict(
    slug="crestview",
    title="Living in Crestview, FL: Drive Times & Prices | Jessica Mackrael",
    h1="Living in Crestview, Florida",
    crumb="Crestview guide",
    desc="Crestview, FL for buyers: drive times to Eglin, Duke Field and Hurlburt, recent home prices, schools, and who Crestview fits best. By Jessica Mackrael.",
    og_kicker="Area guide",
    og_title="Living in Crestview, Florida",
    og_sub="Drive times · home prices · schools",
    subject="Crestview FL real estate, living in Crestview, Crestview homes for sale, Duke Field housing, Eglin AFB commute",
    place=("Crestview", "City"),
    eyebrow="Area Guide · Crestview",
    lead="Okaloosa County’s largest city, where I-10 meets State Road 85 — and where a budget usually buys more house than it does near the water.",
    sections=[
        dict(eyebrow="The Short Answer", h2="Is Crestview a good place to buy?", layout="two", blocks=[
            ("p", f"For a lot of buyers, yes — if the drive works for you. Crestview homes sold for a median of about <strong>{k(CV['median'])}</strong> over the {CV['period'].replace('3 months', 'three months').replace('Sept.', 'September')}, at a median of <strong>${CV['ppsf']} per square foot</strong>. That is well below Fort Walton Beach (${FWB['ppsf']}), Navarre (${NAV['ppsf']}) and Niceville (${NV['ppsf']}), according to {a('redfin', 'Redfin')}."),
            ("p", f"The trade-off is distance. From central Crestview, Duke Field is about <strong>{mins('Crestview', D)} minutes</strong> away and Eglin’s East Gate about <strong>{mins('Crestview', E)}</strong>. Hurlburt Field is about <strong>{mins('Crestview', H)}</strong>. All of those drives run south on State Road 85."),
        ]),
        dict(eyebrow="At a Glance", h2="Crestview by the numbers", blocks=[
            ("tiles", [
                ("27,134", "People in 2020", "U.S. Census"),
                (k(CV["median"]), "Median sale price", f"Redfin, {CV['period']}"),
                (f"{CV['dom']} days", "Median days on market", "Redfin"),
                (f"{mins('Crestview', D)} min", "Drive to Duke Field", "Google Maps, Oct. 12, 2026"),
            ]),
            ("note", f"Sources: {a('census', '2020 Census')}, {a('redfin', 'Redfin')}, {a('maps', 'Google Maps')}. Crestview is the county seat and largest city of Okaloosa County ({a('crestwiki', 'Wikipedia')})."),
        ]),
        dict(eyebrow="Commutes", h2="Drive times from Crestview", blocks=[
            ("table", dict(caption="Drive times from central Crestview",
                           head=["Destination", "Drive", "Distance"],
                           rows=[[DEST[D], f"{mins('Crestview', D)} min", f"{miles('Crestview', D):.1f} mi"],
                                 [DEST[E], f"{mins('Crestview', E)} min", f"{miles('Crestview', E):.1f} mi"],
                                 [DEST[W], f"{mins('Crestview', W)} min", f"{miles('Crestview', W):.1f} mi"],
                                 [DEST[H], f"{mins('Crestview', H)} min", f"{miles('Crestview', H):.1f} mi"],
                                 ["Niceville", f"{CRESTVIEW_TO_NICEVILLE[0]} min", f"{CRESTVIEW_TO_NICEVILLE[1]:.1f} mi"]],
                           note=DRIVE_NOTE)),
            ("p", f"Duke Field, home of the 919th Special Operations Wing, sits about three miles south of downtown Crestview ({a('duke', 'Wikipedia')}). The Army’s 7th Special Forces Group is based on the north end of the Eglin reservation, about six miles south of the city ({a('crestwiki', 'Wikipedia')}). For households assigned to either, Crestview is the natural first look. (The Duke Field drive in the table is longer than three miles because Google Maps routes to its point for Duke Field, inside the installation.)"),
        ]),
        dict(eyebrow="Home Prices", h2="Crestview prices next to nearby towns", blocks=[
            price_table(["Crestview", "Fort Walton Beach", "Mary Esther", "Navarre", "Niceville"],
                        "Recent home sales in Crestview and nearby towns"),
            ("p", f"Crestview homes have also been taking longer to sell — a median of {CV['dom']} days, up from {CV['dom_ly']} a year earlier, per Redfin. For a buyer, more time on the market often means more room to negotiate on price, repairs or closing costs."),
        ]),
        dict(eyebrow="Is It a Fit?", h2="Who Crestview suits — and who should look elsewhere", layout="two-lists", blocks=[
            ("ul-title", "A good fit if you…", [
                "are assigned to Duke Field or the 7th Special Forces Group",
                "work on the north end of the Eglin range",
                "want more square footage or a bigger lot for your budget",
                "want quick access to I-10 for trips east or west",
            ]),
            ("ul-title", "Think twice if you…", [
                f"are assigned to Hurlburt Field — about {mins('Crestview', H)} minutes each way",
                "want to live near the bay or the beach",
                f"work on the south side of Eglin and want the shortest drive — Niceville and Valparaiso are under 10 minutes from the East Gate",
            ]),
        ]),
        dict(eyebrow="Schools", h2="Schools in Crestview", blocks=[
            ("p", f"Crestview’s public schools are part of the {a('okschools')}, which earned an <strong>A</strong> from the Florida Department of Education for the 2025–26 school year, as {a('grades', 'reported by WEAR-TV on July 1, 2026')}. Crestview High School is in the city."),
            ("p", "Which school a home is zoned for depends on its exact address, so confirm the zoning with the district before you make an offer. Military families can also ask their base’s School Liaison for help with transfers and enrollment."),
        ]),
        dict(eyebrow="Before You Buy", h2="Five things to check before you buy in Crestview", blocks=[checklist("Okaloosa")]),
        dict(eyebrow="On the Market", h2="Homes for sale in Crestview right now", listings=["Crestview"]),
        dict(eyebrow="Questions & Answers", h2="Crestview questions buyers ask", faq=[
            ("Is Crestview a good place to live if I’m stationed at Eglin?",
             f"It depends on where on Eglin you work. From central Crestview, Duke Field is about {mins('Crestview', D)} minutes and Eglin’s East Gate about {mins('Crestview', E)} minutes (Google Maps, checked {UPDATED_TEXT}). What the drive buys you is price: Crestview’s median sale was about {k(CV['median'])} ({CV['period']}), against about {k(NV['median'])} in Niceville ({NV['period']}), per Redfin."),
            ("How far is Crestview from Hurlburt Field?",
             f"About {miles('Crestview', H):.0f} miles — roughly {mins('Crestview', H)} minutes from central Crestview to Hurlburt’s main gate on Google Maps, checked {UPDATED_TEXT}. Fort Walton Beach and Mary Esther are much closer to Hurlburt."),
            ("Are homes cheaper in Crestview than in Niceville?",
             f"Yes, by recent sales. Redfin shows a Crestview median of {money(CV['median'])} ({CV['period']}) and a Niceville median of {money(NV['median'])} ({NV['period']}). Per square foot it was ${CV['ppsf']} in Crestview and ${NV['ppsf']} in Niceville."),
            ("What county is Crestview in?",
             "Okaloosa County. Crestview is the county seat and the county’s largest city, with 27,134 people in the 2020 Census."),
            ("How long do homes take to sell in Crestview?",
             f"A median of {CV['dom']} days for the {CV['period'].replace('3 months', 'three months').replace('Sept.', 'September')}, up from {CV['dom_ly']} days a year earlier, according to Redfin."),
            ("Can I buy a home in Crestview before I arrive on orders?", BUY_REMOTE),
        ]),
    ],
    sources=["maps", "redfin", "rf_fwb", "rf_me", "rf_navarre", "rf_niceville", "census", "crestwiki", "duke", "grades", "okschools", "fema", "okpa", "bah", "va"],
    related=["eglin-afb", "niceville-vs-crestview", "hurlburt-field"],
))

# ---------------------------------------------------------------- HURLBURT
PAGES.append(dict(
    slug="hurlburt-field",
    title="Homes Near Hurlburt Field: Towns & Drive Times | Jessica Mackrael",
    h1="Buying a Home Near Hurlburt Field",
    crumb="Hurlburt Field guide",
    desc="Where to buy near Hurlburt Field: drive times from Mary Esther, Fort Walton Beach, Wright, Navarre and Crestview, plus recent home prices and schools.",
    og_kicker="PCS guide",
    og_title="Buying a Home Near Hurlburt Field",
    og_sub="Towns · drive times · home prices",
    subject="Hurlburt Field housing, homes near Hurlburt Field, PCS to Hurlburt, Mary Esther homes, Fort Walton Beach homes, Navarre homes",
    place=("Hurlburt Field", "Place"),
    eyebrow="PCS Guide · Hurlburt Field",
    lead="Home of Air Force Special Operations Command. Here is how the towns around the main gate compare on drive time, price and schools.",
    sections=[
        dict(eyebrow="The Short Answer", h2="Where should I live if I’m stationed at Hurlburt?", layout="two", blocks=[
            ("p", f"If the shortest drive matters most, start with <strong>Mary Esther</strong> — about {mins('Mary Esther', H)} minutes to the main gate. <strong>Fort Walton Beach</strong> and <strong>Wright</strong> are about {mins('Fort Walton Beach', H)} minutes. <strong>Navarre</strong> is about {mins('Navarre', H)}, and <strong>Crestview</strong> about {mins('Crestview', H)} (Google Maps, checked {UPDATED_TEXT})."),
            ("p", f"Prices vary by town. Recent median sales ran about {k(ME['median'])} in Mary Esther, {k(FWB['median'])} in Fort Walton Beach and {k(NAV['median'])} in Navarre, per Redfin ({rf('Mary Esther')}, {rf('Fort Walton Beach')}, {rf('Navarre')}). Navarre is also in a different county — Santa Rosa — with its own school district and property appraiser."),
        ]),
        dict(eyebrow="The Installation", h2="About Hurlburt Field", blocks=[
            ("p", f"Hurlburt Field is home to Headquarters Air Force Special Operations Command (AFSOC) and the 1st Special Operations Wing. It began as Eglin Auxiliary Field No. 9 and has been home to the Air Commandos since 1961 ({a('hurlburt', 'Hurlburt Field fact sheet')}). It sits on the larger Eglin reservation but has been run separately since the 1950s ({a('hurlwiki', 'Wikipedia')})."),
            ("p", "The main gate is on US 98, west of Mary Esther and east of Navarre. That makes US 98 the road most Hurlburt commutes share."),
        ]),
        dict(eyebrow="Commutes", h2="Drive times to Hurlburt’s main gate", blocks=[
            ("table", dict(caption="Drive times from each town to Hurlburt Field and to Eglin’s SR 85 side",
                           head=["From", "Hurlburt main gate", "Eglin, SR 85 side"],
                           rows=[[t, drv(t, H), drv(t, W)] for t in ["Mary Esther", "Fort Walton Beach", "Wright", "Navarre", "Niceville", "Crestview"]],
                           note=DRIVE_NOTE + " The Eglin column is the Air Force Armament Museum visitor center on State Road 85 — useful for households where one person works at each base.")),
        ]),
        dict(eyebrow="Town by Town", h2="The towns around Hurlburt", blocks=[
            ("h3", "Mary Esther"),
            ("p", f"A small city right next to the base, and the shortest drive to the main gate — about {mins('Mary Esther', H)} minutes. Homes sold for a median of {money(ME['median'])} ({ME['period']}), with a median of {ME['dom']} days on the market (Redfin)."),
            ("h3", "Fort Walton Beach"),
            ("p", f"About {mins('Fort Walton Beach', H)} minutes to Hurlburt’s main gate and {mins('Fort Walton Beach', W)} minutes to Eglin’s SR 85 side — a middle point for households with one person at each base. Median sale {money(FWB['median'])} ({FWB['period']}); homes sold in a median of {FWB['dom']} days, down from {FWB['dom_ly']} a year earlier (Redfin)."),
            ("h3", "Wright"),
            ("p", f"A census-designated place (an area the Census counts as a community, without its own city government) in Okaloosa County ({a('wrightwiki', 'Wikipedia')}). About {mins('Wright', H)} minutes to Hurlburt and {mins('Wright', W)} minutes to Eglin’s SR 85 side."),
            ("h3", "Navarre"),
            ("p", f"An unincorporated community in Santa Rosa County, about 15 miles west of Fort Walton Beach ({a('navwiki', 'Wikipedia')}). About {mins('Navarre', H)} minutes to the main gate along US 98. Median sale {money(NAV['median'])} ({NAV['period']}), {NAV['dom']} median days on market (Redfin). Santa Rosa’s school district earned an A for 2025–26, and Navarre High School earned an A ({a('grades', 'WEAR-TV')})."),
            ("h3", "Crestview"),
            ("p", f"About {mins('Crestview', H)} minutes away, so mainly worth it when budget, a bigger lot, or a spouse working at Duke Field or Eglin tips the scales. Crestview’s median sale was {money(CV['median'])} ({CV['period']}). See the <a href=\"crestview.html\">Crestview guide</a>."),
        ]),
        dict(eyebrow="Home Prices", h2="Recent sales near Hurlburt", blocks=[
            price_table(["Mary Esther", "Fort Walton Beach", "Navarre", "Crestview"], "Recent home sales in towns near Hurlburt Field"),
        ]),
        dict(eyebrow="Schools", h2="Two counties, two school districts", blocks=[
            ("p", f"Mary Esther, Fort Walton Beach, Wright and Crestview are in Okaloosa County and are served by the {a('okschools')}. Navarre is in Santa Rosa County and is served by {a('srschools')}. Both districts earned an <strong>A</strong> for the 2025–26 school year ({a('grades', 'WEAR-TV, July 1, 2026')})."),
            ("p", "School zoning goes by exact address, so confirm it with the district before you make an offer. Hurlburt’s School Liaison can help with transfers and enrollment."),
        ]),
        dict(eyebrow="Before You Buy", h2="Five things to check before you buy near Hurlburt", blocks=[
            checklist("Okaloosa"),
            ("note", f"Buying in Navarre? Use the {a('srpa')} instead of Okaloosa’s."),
        ]),
        dict(eyebrow="On the Market", h2="Homes for sale near Hurlburt right now", listings=["Mary Esther", "Fort Walton Beach", "Navarre"]),
        dict(eyebrow="Questions & Answers", h2="Hurlburt Field housing questions", faq=[
            ("What is the closest town to Hurlburt Field?",
             f"Mary Esther. From central Mary Esther, Hurlburt’s main gate was about {mins('Mary Esther', H)} minutes and {miles('Mary Esther', H):.1f} miles away on Google Maps, checked {UPDATED_TEXT}. Fort Walton Beach and Wright were about {mins('Fort Walton Beach', H)} minutes."),
            ("Is Navarre a good place to live for Hurlburt Field?",
             f"It can be. It was about {mins('Navarre', H)} minutes to the main gate on US 98. Navarre is in Santa Rosa County, and its recent median sale was higher than Fort Walton Beach’s: {money(NAV['median'])} vs. {money(FWB['median'])} (Redfin)."),
            ("Is Hurlburt Field part of Eglin AFB?",
             "It sits on the larger Eglin reservation but has been run separately since the 1950s (Wikipedia). It began as Eglin Auxiliary Field No. 9 and today is home to Headquarters Air Force Special Operations Command and the 1st Special Operations Wing (Hurlburt Field fact sheet)."),
            ("What county is Hurlburt Field in?",
             "Okaloosa County. Mary Esther, Fort Walton Beach and Wright are in Okaloosa too; Navarre is in Santa Rosa County."),
            ("How do I find my BAH for Hurlburt Field?",
             "Use the Defense Department’s BAH rate lookup with your duty station ZIP code and rank, or try the BAH calculator on Jessica’s Military Relocation page."),
            ("Can I buy near Hurlburt before I arrive on orders?", BUY_REMOTE),
        ]),
    ],
    sources=["maps", "rf_me", "rf_fwb", "rf_navarre", "redfin", "hurlburt", "hurlwiki", "wrightwiki", "navwiki", "grades", "okschools", "srschools", "fema", "okpa", "srpa", "bah", "va"],
    related=["eglin-afb", "crestview", "niceville-vs-crestview"],
))

# ---------------------------------------------------------------- EGLIN
PAGES.append(dict(
    slug="eglin-afb",
    title="Homes Near Eglin AFB: Gates, Towns & Drives | Jessica Mackrael",
    h1="Buying a Home Near Eglin AFB",
    crumb="Eglin AFB guide",
    desc="Where to live near Eglin AFB: drive times to the East Gate, the SR 85 side and Duke Field from Niceville, Valparaiso, Fort Walton Beach and Crestview.",
    og_kicker="PCS guide",
    og_title="Buying a Home Near Eglin AFB",
    og_sub="Gates · towns · drive times",
    subject="Eglin AFB housing, homes near Eglin AFB, PCS to Eglin, Niceville homes, Valparaiso homes, Crestview homes, Duke Field",
    place=("Eglin Air Force Base", "Place"),
    eyebrow="PCS Guide · Eglin AFB",
    lead="Eglin’s land range alone covers 724 square miles. The right town depends on which side of the base you work on.",
    sections=[
        dict(eyebrow="The Short Answer", h2="Which town is closest to Eglin?", layout="two", blocks=[
            ("p", f"It depends on the gate. From <strong>Valparaiso</strong> and <strong>Niceville</strong>, Eglin’s East Gate is about {mins('Valparaiso', E)} and {mins('Niceville', E)} minutes away. From <strong>Shalimar</strong> and <strong>Fort Walton Beach</strong>, the State Road 85 side of the base is about {mins('Shalimar', W)} and {mins('Fort Walton Beach', W)} minutes."),
            ("p", f"<strong>Crestview</strong> is about {mins('Crestview', W)}–{mins('Crestview', E)} minutes from the East Gate and the SR 85 side, and about {mins('Crestview', D)} minutes from Duke Field. (Google Maps, checked {UPDATED_TEXT}.)"),
        ]),
        dict(eyebrow="The Installation", h2="About Eglin, Duke Field and the 7th Group", blocks=[
            ("p", f"The 96th Test Wing runs the base — its commander is the installation commander. Its land range covers 724 square miles, and the base supports about 20,000 military and civilian personnel and 43,000 dependents, according to the {a('eglin', '96th Test Wing fact sheet')}."),
            ("p", f"Duke Field, home of the 919th Special Operations Wing, is about three miles south of downtown Crestview and about 12 miles north of Eglin’s East Gate ({a('duke', 'Wikipedia')}). The Army’s 7th Special Forces Group is based on the north end of the Eglin reservation, about six miles south of Crestview ({a('crestwiki', 'Wikipedia')})."),
        ]),
        dict(eyebrow="Commutes", h2="Drive times to Eglin", blocks=[
            ("table", dict(caption="Drive times from each town to three Eglin destinations",
                           head=["From", "East Gate (Valparaiso)", "SR 85 side (Armament Museum)", "Duke Field"],
                           rows=[[t, drv(t, E), drv(t, W), drv(t, D)] for t in ["Valparaiso", "Niceville", "Shalimar", "Fort Walton Beach", "Wright", "Mary Esther", "Crestview", "Navarre"]],
                           note=DRIVE_NOTE + " A dash means we didn’t check that drive. The SR 85 column is the Air Force Armament Museum visitor center.")),
        ]),
        dict(eyebrow="Town by Town", h2="The towns around Eglin", blocks=[
            ("h3", "Niceville and Valparaiso — the East Gate side"),
            ("p", f"Niceville sits on Boggy Bayou, which opens into Choctawhatchee Bay ({a('nicewiki', 'Wikipedia')}); Valparaiso is next door. Both put the East Gate under 10 minutes away. Niceville had the highest recent median of the towns in the sales table below: {money(NV['median'])} ({NV['period']}, Redfin)."),
            ("h3", "Shalimar and Fort Walton Beach — the SR 85 side"),
            ("p", f"Shalimar is about {mins('Shalimar', W)} minutes from the Armament Museum visitor center on State Road 85, and Fort Walton Beach about {mins('Fort Walton Beach', W)}. Fort Walton Beach is also about {mins('Fort Walton Beach', H)} minutes from Hurlburt Field. Its median sale was {money(FWB['median'])} ({FWB['period']}, Redfin)."),
            ("h3", "Crestview — north, near Duke Field"),
            ("p", f"Crestview is about {mins('Crestview', D)} minutes from Duke Field and {mins('Crestview', W)}–{mins('Crestview', E)} minutes from the East Gate and the SR 85 side. Its median sale was {money(CV['median'])} ({CV['period']}) — the lowest of the towns in the sales table below. See the <a href=\"crestview.html\">Crestview guide</a> and <a href=\"niceville-vs-crestview.html\">Niceville vs. Crestview</a>."),
            ("h3", "Mary Esther and Navarre — if one of you works at Hurlburt"),
            ("p", "These towns trade a longer Eglin drive for a short one to Hurlburt Field. See the <a href=\"hurlburt-field.html\">Hurlburt Field guide</a>."),
        ]),
        dict(eyebrow="Home Prices", h2="Recent sales around Eglin", blocks=[
            price_table(["Niceville", "Fort Walton Beach", "Mary Esther", "Navarre", "Crestview"], "Recent home sales in towns around Eglin AFB"),
        ]),
        dict(eyebrow="Schools", h2="Schools near Eglin", blocks=[
            ("p", f"Niceville, Valparaiso, Shalimar, Fort Walton Beach and Crestview are all in the {a('okschools')}, which earned an <strong>A</strong> for the 2025–26 school year ({a('grades', 'WEAR-TV, July 1, 2026')}). Navarre is in Santa Rosa County’s district, which also earned an A."),
            ("p", "Confirm a home’s school zoning with the district before you make an offer. Eglin’s School Liaison can help with transfers and enrollment."),
        ]),
        dict(eyebrow="Before You Buy", h2="Five things to check before you buy near Eglin", blocks=[
            checklist("Okaloosa"),
            ("note", f"Buying in Navarre? Use the {a('srpa')} instead of Okaloosa’s."),
        ]),
        dict(eyebrow="On the Market", h2="Homes for sale near Eglin right now", listings=["Niceville", "Valparaiso", "Shalimar", "Fort Walton Beach", "Crestview"]),
        dict(eyebrow="Questions & Answers", h2="Eglin AFB housing questions", faq=[
            ("What is the closest town to Eglin AFB?",
             f"It depends on the gate. Valparaiso was about {mins('Valparaiso', E)} minutes from the East Gate, and Shalimar about {mins('Shalimar', W)} minutes from the SR 85 side of the base (Google Maps, checked {UPDATED_TEXT}). Niceville was about {mins('Niceville', E)} minutes from the East Gate."),
            ("How long is the drive from Crestview to Eglin?",
             f"About {mins('Crestview', W)} minutes to the SR 85 side and {mins('Crestview', E)} minutes to the East Gate from central Crestview, both on State Road 85. Duke Field was about {mins('Crestview', D)} minutes."),
            ("Where is Duke Field?",
             "About three miles south of downtown Crestview and about 12 miles north of Eglin’s East Gate. It is home to the 919th Special Operations Wing."),
            ("Which school district serves Eglin families?",
             "Most towns around Eglin are in the Okaloosa County School District, which earned an A for 2025–26. Navarre is in Santa Rosa County’s district, which also earned an A."),
            ("How do I find my BAH for Eglin?",
             "Use the Defense Department’s BAH rate lookup with your duty station ZIP code and rank, or try the BAH calculator on Jessica’s Military Relocation page."),
            ("Can I buy near Eglin before I arrive on orders?", BUY_REMOTE),
        ]),
    ],
    sources=["maps", "rf_niceville", "rf_fwb", "rf_me", "rf_navarre", "redfin", "eglin", "duke", "crestwiki", "nicewiki", "grades", "okschools", "srschools", "fema", "okpa", "srpa", "bah", "va"],
    related=["crestview", "niceville-vs-crestview", "hurlburt-field"],
))

# ---------------------------------------------------------------- NICEVILLE VS CRESTVIEW
budget = 400000
PAGES.append(dict(
    slug="niceville-vs-crestview",
    title="Niceville vs. Crestview, FL: Which Fits? | Jessica Mackrael",
    h1="Niceville vs. Crestview",
    crumb="Niceville vs. Crestview",
    desc="Niceville or Crestview? Side-by-side drive times to Eglin, Duke Field and Hurlburt, home prices, days on market and schools, with a clear pick for each.",
    og_kicker="Side by side",
    og_title="Niceville vs. Crestview",
    og_sub="Drive times · prices · schools",
    subject="Niceville vs Crestview, Niceville or Crestview, where to live near Eglin AFB, Niceville homes, Crestview homes",
    place=("Niceville", "City"),
    eyebrow="Side by Side",
    lead="Two Okaloosa County towns, about 19 miles apart by road, that answer the same question — where to live near Eglin — in very different ways.",
    sections=[
        dict(eyebrow="The Short Answer", h2="Which should I choose?", layout="two", blocks=[
            ("p", f"<strong>Choose Niceville</strong> if a short drive to Eglin’s East Gate and life on the bay matter most. It’s about {mins('Niceville', E)} minutes to the gate, and homes sold for a median of about {k(NV['median'])} ({NV['period']}, {rf('Niceville', 'Redfin')})."),
            ("p", f"<strong>Choose Crestview</strong> if you want more home for the money. Homes sold for a median of about {k(CV['median'])} ({CV['period']}) — but the East Gate is about {mins('Crestview', E)} minutes away (Google Maps, checked {UPDATED_TEXT}). Duke Field sits about three miles south of downtown Crestview ({a('duke', 'Wikipedia')}); Google Maps timed both towns at under 20 minutes to its point inside the base."),
        ]),
        dict(eyebrow="Side by Side", h2="Niceville and Crestview compared", blocks=[
            ("table", dict(caption="Niceville and Crestview side by side",
                           head=["Measure", "Niceville", "Crestview"],
                           rows=[
                               ["County", "Okaloosa", "Okaloosa"],
                               ["People (2020 Census)", "15,772", "27,134"],
                               ["Median sale price", f"{money(NV['median'])} ({NV['period']})", f"{money(CV['median'])} ({CV['period']})"],
                               ["Median price per sq ft", f"${NV['ppsf']}", f"${CV['ppsf']}"],
                               ["Median days on market", f"{NV['dom']} days", f"{CV['dom']} days"],
                               ["Drive to Eglin East Gate", drv("Niceville", E), drv("Crestview", E)],
                               ["Drive to Eglin, SR 85 side", drv("Niceville", W), drv("Crestview", W)],
                               ["Drive to Duke Field", drv("Niceville", D), drv("Crestview", D)],
                               ["Drive to Hurlburt main gate", drv("Niceville", H), drv("Crestview", H)],
                               ["Public schools", "Okaloosa County School District (A, 2025–26)", "Okaloosa County School District (A, 2025–26)"],
                               ["Water", "On Boggy Bayou, which opens into Choctawhatchee Bay", "Inland"],
                           ],
                           note=f"Sources: {a('census', '2020 Census')}; Redfin ({rf('Niceville')}, {rf('Crestview')}), read {UPDATED_TEXT}; {a('grades', 'WEAR-TV')}; {a('nicewiki', 'Wikipedia')}. " + DRIVE_NOTE)),
        ]),
        dict(eyebrow="What Your Budget Buys", h2="The same budget, two very different houses", layout="two", blocks=[
            ("p", f"At each town’s median price per square foot, a <strong>{money(budget)}</strong> budget works out to roughly <strong>{round(budget / CV['ppsf'], -1):,.0f} square feet in Crestview</strong> and roughly <strong>{round(budget / NV['ppsf'], -1):,.0f} in Niceville</strong>."),
            ("p", "That is rough math on Redfin’s medians, not a quote for any one home — age, condition, lot and water access all move the price. But it shows the size of the gap you’re choosing between."),
        ]),
        dict(eyebrow="Is It a Fit?", h2="Who each town suits", layout="two-lists", blocks=[
            ("ul-title", "Niceville suits you if you…", [
                f"work on the East Gate side of Eglin (about {mins('Niceville', E)} minutes)",
                "want to live near the water",
                "would rather pay more for a shorter commute",
                f"want a quicker drive to Hurlburt than Crestview gives (about {mins('Niceville', H)} vs. {mins('Crestview', H)} minutes)",
            ]),
            ("ul-title", "Crestview suits you if you…", [
                "want more square footage or a bigger lot for the money",
                "are assigned to Duke Field or the 7th Special Forces Group",
                "want I-10 close by",
                f"don’t mind about {mins('Crestview', E)} minutes to Eglin’s East Gate",
            ]),
        ]),
        dict(eyebrow="On the Market", h2="Homes for sale in Niceville and Crestview", listings=["Niceville", "Crestview"]),
        dict(eyebrow="Questions & Answers", h2="Niceville vs. Crestview questions", faq=[
            ("Is Niceville or Crestview better for Eglin AFB?",
             f"For the East Gate side of Eglin, Niceville — about {mins('Niceville', E)} minutes against {mins('Crestview', E)} from Crestview (Google Maps, checked {UPDATED_TEXT}). Duke Field sits about three miles south of downtown Crestview, and Google Maps timed both towns at under 20 minutes to its point inside the base. Crestview’s recent median sale price was much lower."),
            ("Is Crestview cheaper than Niceville?",
             f"Yes, on recent sales. Redfin shows a Crestview median of {money(CV['median'])} ({CV['period']}) and a Niceville median of {money(NV['median'])} ({NV['period']}) — ${CV['ppsf']} vs. ${NV['ppsf']} per square foot."),
            ("How far apart are Niceville and Crestview?",
             f"About {CRESTVIEW_TO_NICEVILLE[1]:.0f} miles, or roughly {CRESTVIEW_TO_NICEVILLE[0]} minutes by car on State Road 85 (Google Maps, checked {UPDATED_TEXT})."),
            ("Do Niceville and Crestview have the same school district?",
             "Yes. Both are in the Okaloosa County School District, which earned an A for 2025–26. Zoning goes by exact address, so confirm it before you make an offer."),
            ("Where do homes sell faster, Niceville or Crestview?",
             f"Niceville, recently. The median was {NV['dom']} days on market in Niceville ({NV['period']}) and {CV['dom']} in Crestview ({CV['period']}), per Redfin."),
            ("Can Jessica help me compare homes in both towns?",
             "Yes. Both towns are in the area Jessica serves, and she can tour homes in either one on live video if you’re still at another duty station."),
        ]),
    ],
    sources=["maps", "rf_niceville", "redfin", "census", "nicewiki", "crestwiki", "duke", "grades", "okschools", "fema", "okpa", "bah", "va"],
    related=["crestview", "eglin-afb", "hurlburt-field"],
))

TITLES = {p["slug"]: p["og_title"] for p in PAGES}

# ----------------------------------------------------------------------------
# HTML rendering
# ----------------------------------------------------------------------------
def render_block(b):
    kind = b[0]
    if kind == "p":    return f'<p class="g-p">{b[1]}</p>'
    if kind == "note": return f'<p class="g-note">{b[1]}</p>'
    if kind == "h3":   return f'<h3 class="g-h3">{esc(b[1])}</h3>'
    if kind == "ul":   return '<ul class="g-list">' + "".join(f"<li>{i}</li>" for i in b[1]) + "</ul>"
    if kind == "ul-title":
        return f'<div class="g-fit"><h3 class="g-h3">{esc(b[1])}</h3><ul class="g-list">' + "".join(f"<li>{esc(i)}</li>" for i in b[2]) + "</ul></div>"
    if kind == "tiles":
        return '<div class="g-tiles">' + "".join(
            f'<div class="g-tile"><span class="g-tile-num">{esc(n)}</span><span class="g-tile-label">{esc(l)}</span><span class="g-tile-src">{esc(s)}</span></div>'
            for n, l, s in b[1]) + "</div>"
    if kind == "table":
        t = b[1]
        head = "".join(f'<th scope="col">{esc(h)}</th>' for h in t["head"])
        body = ""
        for r in t["rows"]:
            cells = f'<th scope="row">{esc(r[0])}</th>' + "".join(
                f'<td data-label="{esc(t["head"][i + 1])}">{esc(c)}</td>' for i, c in enumerate(r[1:]))
            body += f"<tr>{cells}</tr>"
        return (f'<div class="g-table-wrap"><table class="g-table"><caption>{esc(t["caption"])}</caption>'
                f"<thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>"
                f'<p class="g-note">{t["note"]}</p>')
    raise ValueError(kind)

def listings_html(cities):
    from urllib.parse import quote
    links = ", ".join(f'<a href="search.html?city={quote(c)}">{esc(c)}</a>' for c in cities)
    return (f'<div class="g-listings" data-town-listings data-cities="{esc("|".join(cities))}">'
            f'<p class="g-p g-listings-fallback">Live listings load here from the Emerald Coast MLS. '
            f'Search every home for sale in {links}.</p>'
            f'<div class="card-grid g-listing-grid" aria-live="polite"></div></div>')

def faq_html(items):
    return "".join(f'<details class="faq-item" open><summary>{esc(q)}</summary><div class="answer">{esc(ans)}</div></details>' for q, ans in items)

def section_html(s, idx):
    tone = " band-tint" if idx % 2 else ""
    sid = re.sub(r"[^a-z0-9]+", "-", s["h2"].lower()).strip("-")
    head = f'<span class="eyebrow g-eyebrow">{esc(s["eyebrow"])}</span><h2 class="headline g-h2" id="{sid}">{esc(s["h2"])}</h2>'
    if "listings" in s:
        inner = f'<div class="g-head">{head}</div>' + listings_html(s["listings"])
    elif "faq" in s:
        inner = f'<div class="g-head">{head}</div><div class="g-faq">{faq_html(s["faq"])}</div>'
    elif s.get("layout") == "two":
        inner = f'<div class="two-col g-two"><div class="g-head">{head}</div><div>{"".join(render_block(b) for b in s["blocks"])}</div></div>'
    elif s.get("layout") == "two-lists":
        inner = f'<div class="g-head">{head}</div><div class="g-fit-grid">{"".join(render_block(b) for b in s["blocks"])}</div>'
    else:
        inner = f'<div class="g-head">{head}</div><div class="g-body">{"".join(render_block(b) for b in s["blocks"])}</div>'
    return f'<section class="section g-section{tone}" aria-labelledby="{sid}"><div class="wrap">{inner}</div></section>'

def sources_html(keys):
    lis = "".join(f'<li><a href="{SRC[k][1]}" target="_blank" rel="noopener">{esc(SRC[k][0])}</a></li>' for k in keys)
    return (f'<section class="section-tight g-sources" aria-labelledby="sources"><div class="wrap">'
            f'<span class="eyebrow g-eyebrow">Where These Numbers Come From</span>'
            f'<h2 class="g-h2-sm" id="sources">Sources</h2><ol class="g-src-list">{lis}</ol>'
            f'<p class="g-byline">Published by Jessica Mackrael, Realtor®, Military Relocation Professional (MRP), Coldwell Banker Realty, Niceville, Florida. '
            f'Last updated <time datetime="{UPDATED}">{UPDATED_TEXT}</time>.</p></div></section>')

def related_html(slugs):
    cards = "".join(f'<a class="map-point" href="{s}.html"><h3>{esc(TITLES[s])}</h3><span class="tag g-tag">Read the guide</span></a>' for s in slugs)
    return (f'<section class="section-tight" aria-labelledby="more-guides"><div class="wrap">'
            f'<span class="eyebrow g-eyebrow">Keep Reading</span><h2 class="g-h2-sm" id="more-guides">More area guides</h2>'
            f'<div class="map-points g-related">{cards}</div></div></section>')

CTA = ('<section class="section band-dark center" aria-labelledby="cta"><div class="wrap">'
       '<span class="eyebrow">Orders in Hand?</span><h2 class="headline" id="cta">Tell Jessica your report date, your gate and your budget.</h2><p class="g-cta-note">Your report date is the day you must report to your new base.</p>'
       '<p class="lede" style="margin:26px auto 0;">She’ll tell you where to look — and line up live video tours if you’re still at another duty station.</p>'
       '<div class="btn-row" style="justify-content:center;">'
       '<a class="btn btn-light" href="tel:+18506879888">Call or Text 850.687.9888</a>'
       '<a class="btn btn-light" href="contact.html">Send Your Timeline</a></div></div></section>')

HEADER = '''<a class="skip-link" href="#main">Skip to main content</a>
<header class="site-header">
  <a class="brand brand-lockup" href="index.html"><span class="brand-name">Jessica Mackrael</span><span class="brand-cb"><img class="cb-mark" src="assets/cb-mark-light.png" alt="" aria-hidden="true"><span class="brand-cb-text">Coldwell Banker<br>Realty</span></span></a>
  <button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="site-nav">☰</button>
  <nav class="nav" id="site-nav" aria-label="Main">
    <a href="search.html">Search</a>
    <a href="sell.html">Sell</a>
    <a href="communities.html">Communities</a>
    <a href="properties.html">My Properties</a>
    <a href="about.html">About</a>
    <a href="faq.html">FAQ</a>
    <a href="contact.html">Contact</a>
  </nav>
</header>'''

GUIDE_LINKS_LI = ('<li><a href="eglin-afb.html">Living Near Eglin AFB</a></li>'
                  '<li><a href="hurlburt-field.html">Living Near Hurlburt Field</a></li>'
                  '<li><a href="crestview.html">Crestview Guide</a></li>'
                  '<li><a href="niceville-vs-crestview.html">Niceville vs. Crestview</a></li>')

FOOTER = f'''<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <img class="jm-logo-footer" src="assets/jm-logo-light.png" alt="Jessica Mackrael">
        <div class="cb-lockup cb-lockup-light"><img class="cb-mark" src="assets/cb-mark-light.png" alt="" aria-hidden="true"><span>Coldwell Banker<br>Realty</span></div>
        <p>Realtor® · International President's Circle · MRP</p>
      </div>
      <div>
        <h2 class="g-fh">Explore</h2>
        <ul>
          <li><a href="about.html">About Jessica</a></li>
          <li><a href="communities.html">Communities</a></li>
          <li><a href="buy.html">Buying</a></li>
          <li><a href="sell.html">Selling</a></li>
        </ul>
      </div>
      <div>
        <h2 class="g-fh">Resources</h2>
        <ul>
          <li><a href="military-relocation.html">Military Relocation</a></li>
          {GUIDE_LINKS_LI}
          <li><a href="quiz.html">Find My Home Quiz</a></li>
          <li><a href="market-updates.html">Market Updates</a></li>
          <li><a href="mortgage.html">Mortgage Calculator</a></li>
          <li><a href="faq.html">Questions &amp; Answers</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div>
        <h2 class="g-fh">Contact</h2>
        <ul>
          <li><a href="tel:+18506879888">850.687.9888 mobile</a></li>
          <li><a href="tel:+18508974563">850.897.4563 office</a></li>
          <li>4504 E Highway 20 Ste A<br>Niceville, FL 32578</li>
        </ul>
      </div>
      <div>
        <h2 class="g-fh">Follow</h2>
        <ul>
          <li><a href="https://www.facebook.com/jmackrael.realestate/" target="_blank" rel="noopener">Facebook</a></li>
          <li><a href="https://www.instagram.com/realestate_with_jess/" target="_blank" rel="noopener">Instagram</a></li>
          <li><a href="https://www.linkedin.com/in/jessicamackrael/" target="_blank" rel="noopener">LinkedIn</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-recognition">
      Ranked #1 of 10 agents in <a href="https://nicevilleagentreport.com/" target="_blank" rel="noopener">The Niceville Agent Report</a> &mdash; published by AI Syndicate, September 2026.
    </div>
    <div class="footer-legal">
      Jessica Mackrael, Realtor® — affiliated with Coldwell Banker Realty, Niceville, Florida. Each office is independently owned and operated. Equal Housing Opportunity. Information deemed reliable but not guaranteed.
    </div>
    <div class="footer-powered">
      <span class="footer-powered-label">powered by</span>
      <a href="https://aisyndicate.com" target="_blank" rel="noopener" aria-label="GEO optimization by AI Syndicate">
        <img src="assets/ais-logo.svg" alt="AI Syndicate" width="150" height="28" loading="lazy">
      </a>
    </div>
  </div>
</footer>'''

ICON_TAGS = '''<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#2e343b">'''

def schema(p):
    url = f"{SITE}/{p['slug']}.html"
    faq = next((s["faq"] for s in p["sections"] if "faq" in s), [])
    person = {
        "@type": "Person", "name": "Jessica Mackrael", "jobTitle": "Realtor", "url": f"{SITE}/",
        "telephone": "+1-850-687-9888",
        "worksFor": {"@type": "RealEstateAgent", "name": "Coldwell Banker Realty — Niceville",
                     "address": {"@type": "PostalAddress", "streetAddress": "4504 E Highway 20 Ste A",
                                 "addressLocality": "Niceville", "addressRegion": "FL", "postalCode": "32578", "addressCountry": "US"}},
        "hasCredential": {"@type": "EducationalOccupationalCredential", "name": "Military Relocation Professional (MRP)",
                          "recognizedBy": {"@type": "Organization", "name": "National Association of Realtors"}},
    }
    graph = [
        {"@type": "Article", "@id": url + "#article", "headline": p["h1"], "description": p["desc"],
         "url": url, "mainEntityOfPage": url, "inLanguage": "en-US",
         "datePublished": UPDATED, "dateModified": UPDATED,
         "image": f"{SITE}/assets/og/{p['slug']}.jpg",
         "author": person, "publisher": {"@type": "Person", "name": "Jessica Mackrael", "url": f"{SITE}/"},
         "about": {"@type": "Place", "name": "Eglin Air Force Base, Florida"} if p["slug"] == "eglin-afb" else
                  {"@type": p["place"][1], "name": p["place"][0] + ", Florida",
                   "containedInPlace": {"@type": "AdministrativeArea", "name": "Okaloosa County, Florida"}} if p["slug"] != "hurlburt-field"
                  else {"@type": "Place", "name": "Hurlburt Field, Florida",
                        "containedInPlace": {"@type": "AdministrativeArea", "name": "Okaloosa County, Florida"}},
         "citation": [SRC[k][1] for k in p["sources"]]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": "Military Relocation" if p["slug"] in ("eglin-afb", "hurlburt-field") else "Communities",
             "item": f"{SITE}/military-relocation.html" if p["slug"] in ("eglin-afb", "hurlburt-field") else f"{SITE}/communities.html"},
            {"@type": "ListItem", "position": 3, "name": p["crumb"], "item": url}]},
        {"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": ans}} for q, ans in faq]},
    ]
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=1)

WEBSITE_SCHEMA = '''{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://jessicamackrael.com/",
  "name": "Jessica Mackrael Real Estate",
  "creator": {
    "@type": "Organization",
    "name": "AI Syndicate",
    "url": "https://aisyndicate.com",
    "description": "AI Syndicate builds high-converting, AI-optimized websites and delivers GEO and SEO services that help businesses get found on ChatGPT, Google AI Overviews, and other AI search engines.",
    "sameAs": ["https://aisyndicate.com"]
  }
}'''

def page_html(p):
    url = f"{SITE}/{p['slug']}.html"
    og = f"{SITE}/assets/og/{p['slug']}.jpg"
    t, d = esc(p["title"]), esc(p["desc"])
    crumb_parent = ("military-relocation.html", "Military Relocation") if p["slug"] in ("eglin-afb", "hurlburt-field") else ("communities.html", "Communities")
    sections = "".join(section_html(s, i) for i, s in enumerate(p["sections"]))
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<!-- {CREDIT} -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>{t}</title>
<meta name="description" content="{d}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<!-- AI Syndicate GEO Trust Signal Package -->
<meta name="publisher" content="Jessica Mackrael | Coldwell Banker Realty">
<meta name="geo.region" content="US-FL">
<meta name="geo.placename" content="Niceville, Florida">
<meta name="geo.position" content="30.5169;-86.4958">
<meta name="ICBM" content="30.5169, -86.4958">
<meta name="DC.creator" content="Jessica Mackrael">
<meta name="DC.publisher" content="Jessica Mackrael, Realtor — Coldwell Banker Realty">
<meta name="DC.subject" content="{esc(p['subject'])}">
<meta name="DC.language" content="en-US">
<link rel="canonical" href="{url}">
<link rel="alternate" type="text/markdown" href="{SITE}/{p['slug']}.md" title="This page in markdown">
<meta name="tdm-reservation" content="0">
<link rel="alternate" type="text/plain" href="{SITE}/llms.txt" title="LLMs summary">
<link rel="alternate" type="text/plain" href="{SITE}/llms-full.txt" title="LLMs full site content">
<meta name="designer" content="AI Syndicate">
<meta name="web-creator" content="AI Syndicate — GEO &amp; SEO Agency">
<link rel="author" href="https://aisyndicate.com">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Jessica Mackrael Real Estate">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="{esc(p['og_title'])} | Jessica Mackrael">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{esc(p['og_title'])} — {esc(p['og_sub'])}. Jessica Mackrael, Coldwell Banker Realty.">
<meta property="article:modified_time" content="{UPDATED}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(p['og_title'])} | Jessica Mackrael">
<meta name="twitter:description" content="{d}">
<meta name="twitter:image" content="{og}">
<meta name="twitter:image:alt" content="{esc(p['og_title'])} — {esc(p['og_sub'])}.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css">
<link rel="stylesheet" href="css/guides.css">
{ICON_TAGS}
<script type="application/ld+json">
{WEBSITE_SCHEMA}
</script>
<script type="application/ld+json">
{schema(p)}
</script>
</head>
<body class="guide-page">

{HEADER}

<main id="main" tabindex="-1">
<section class="hero hero-page g-hero">
  <div class="wrap hero-inner">
    <nav class="g-crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li><li><a href="{crumb_parent[0]}">{crumb_parent[1]}</a></li><li aria-current="page">{esc(p['crumb'])}</li></ol></nav>
    <span class="eyebrow">{esc(p['eyebrow'])}</span>
    <h1 class="display">{esc(p['h1'])}</h1>
    <p>{esc(p['lead'])}</p>
    <p class="g-updated">Updated <time datetime="{UPDATED}">{UPDATED_TEXT}</time> · By Jessica Mackrael, Realtor® and Military Relocation Professional (MRP)</p>
  </div>
</section>
{sections}
{CTA}
{related_html(p['related'])}
{sources_html(p['sources'])}
</main>

{FOOTER}

<script src="js/main.js"></script>
<script src="js/quiz-modal.js"></script>
<script src="js/guides.js"></script>
</body>
</html>
'''

# ----------------------------------------------------------------------------
# Markdown rendering
# ----------------------------------------------------------------------------
def md_block(b):
    kind = b[0]
    if kind in ("p", "note"): return to_md_inline(b[1]) + "\n"
    if kind == "h3": return f"### {b[1]}\n"
    if kind == "ul": return "\n".join(f"- {to_md_inline(i)}" for i in b[1]) + "\n"
    if kind == "ul-title": return f"### {b[1]}\n\n" + "\n".join(f"- {i}" for i in b[2]) + "\n"
    if kind == "tiles": return "\n".join(f"- **{n}** — {l} ({s})" for n, l, s in b[1]) + "\n"
    if kind == "table":
        t = b[1]
        hd = [h or " " for h in t["head"]]
        out = f"**{t['caption']}**\n\n| " + " | ".join(hd) + " |\n|" + "---|" * len(hd) + "\n"
        out += "\n".join("| " + " | ".join(r) + " |" for r in t["rows"]) + "\n\n" + to_md_inline(t["note"]) + "\n"
        return out
    raise ValueError(kind)

def page_md(p):
    url = f"{SITE}/{p['slug']}.html"
    out = [f"---\ntitle: \"{p['h1']}\"\nurl: {url}\nupdated: {UPDATED}\nauthor: Jessica Mackrael, Realtor®, MRP — Coldwell Banker Realty\ndescription: \"{p['desc']}\"\ncredit: \"{CREDIT}\"\n---\n",
           f"# {p['h1']}\n", f"{p['lead']}\n", f"_Updated {UPDATED_TEXT} · By Jessica Mackrael, Realtor® and Military Relocation Professional (MRP)_\n"]
    for s in p["sections"]:
        out.append(f"## {s['h2']}\n")
        if "listings" in s:
            out.append("Live listings load on the web page from the Emerald Coast MLS. Search every home for sale in: " + ", ".join(f"[{c}]({SITE}/search.html?city={c.replace(' ', '%20')})" for c in s["listings"]) + "\n")
        elif "faq" in s:
            for q, ans in s["faq"]:
                out.append(f"### {q}\n\n{ans}\n")
        else:
            for b in s["blocks"]:
                out.append(md_block(b))
    out.append("## Talk to Jessica\n\nCall or text 850.687.9888, or send your timeline at https://jessicamackrael.com/contact.html\n")
    out.append("## More area guides\n\n" + "\n".join(f"- [{TITLES[r]}]({SITE}/{r}.html)" for r in p["related"]) + "\n")
    out.append("## Sources\n\n" + "\n".join(f"{i}. [{SRC[k][0]}]({SRC[k][1]})" for i, k in enumerate(p["sources"], 1)) + "\n")
    out.append(f"---\nJessica Mackrael, Realtor® — Coldwell Banker Realty, Niceville, Florida. 850-687-9888 (mobile), 850-897-4563 (office).\n\n## Site credits\nGEO Optimization by AI Syndicate — https://aisyndicate.com\n")
    return "\n".join(out)

# ----------------------------------------------------------------------------
# Link-preview images (1200x630) and the favicon set
# ----------------------------------------------------------------------------
FONT_DIR = os.environ.get("FONT_DIR", os.path.expanduser("~/fonts"))

def og_images():
    from PIL import Image, ImageDraw, ImageFont
    serif = os.path.join(FONT_DIR, "PlayfairDisplay[wght].ttf")
    sans = os.path.join(FONT_DIR, "Jost[wght].ttf")
    def font(path, size, weight):
        f = ImageFont.truetype(path, size)
        try: f.set_variation_by_axes([weight])
        except Exception: pass
        return f
    mark = Image.open(os.path.join(ROOT, "assets", "jm-mark-light.png")).convert("RGBA")
    os.makedirs(os.path.join(ROOT, "assets", "og"), exist_ok=True)
    for p in PAGES:
        im = Image.new("RGB", (1200, 630), (46, 52, 59))
        dr = ImageDraw.Draw(im)
        dr.rectangle([0, 0, 1200, 630], fill=(46, 52, 59))
        dr.rectangle([0, 618, 1200, 630], fill=(179, 152, 95))
        def ctext(y, text, f, fill):
            w = dr.textlength(text, font=f)
            dr.text(((1200 - w) / 2, y), text, font=f, fill=fill)
        m = mark.copy(); m.thumbnail((120, 130))
        im.paste(m, ((1200 - m.width) // 2, 64), m)
        ctext(226, p["og_kicker"].upper(), font(sans, 26, 400), (203, 185, 140))
        title = p["og_title"]
        size = 76
        f = font(serif, size, 500)
        words, lines, cur = title.split(), [], ""
        for w in words:
            test = (cur + " " + w).strip()
            if dr.textlength(test, font=f) <= 980: cur = test
            else: lines.append(cur); cur = w
        lines.append(cur)
        y = 276 if len(lines) == 1 else 262
        for ln in lines[:2]:
            ctext(y, ln, f, (247, 243, 234)); y += int(size * 1.16)
        ctext(y + 16, p["og_sub"], font(sans, 30, 300), (247, 243, 234))
        ctext(548, "Jessica Mackrael, Realtor®  ·  Coldwell Banker Realty  ·  jessicamackrael.com", font(sans, 24, 300), (203, 185, 140))
        im.save(os.path.join(ROOT, "assets", "og", f"{p['slug']}.jpg"), "JPEG", quality=86, optimize=True, progressive=True)

def favicons():
    from PIL import Image
    src = Image.open(os.path.join(ROOT, "assets", "favicon.png")).convert("RGBA")  # 256x256, mark on charcoal
    bg = (46, 52, 59, 255)
    def sized(n):
        return src.resize((n, n), Image.LANCZOS)
    sized(16).save(os.path.join(ROOT, "favicon-16.png"))
    sized(32).save(os.path.join(ROOT, "favicon-32.png"))
    src.save(os.path.join(ROOT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
    a180 = Image.new("RGBA", (180, 180), bg); a180.alpha_composite(sized(180)); a180.convert("RGB").save(os.path.join(ROOT, "apple-touch-icon.png"))
    sized(192).save(os.path.join(ROOT, "icon-192.png"))
    sized(512).save(os.path.join(ROOT, "icon-512.png"))
    mk = Image.new("RGBA", (512, 512), bg); inner = sized(410); mk.alpha_composite(inner, (51, 51)); mk.convert("RGB").save(os.path.join(ROOT, "maskable-512.png"))
    # No favicon.svg: the logo mark only exists as a raster PNG, so an SVG would just wrap a bitmap.
    open(os.path.join(ROOT, "site.webmanifest"), "w").write(json.dumps({
        "name": "Jessica Mackrael Real Estate", "short_name": "Jessica Mackrael",
        "start_url": "/", "display": "standalone", "theme_color": "#2e343b", "background_color": "#f7f3ea",
        "icons": [
            {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}, indent=2))

# ----------------------------------------------------------------------------
def main():
    only = sys.argv[1:]
    for p in PAGES:
        if only and p["slug"] not in only: continue
        open(os.path.join(ROOT, f"{p['slug']}.html"), "w").write(page_html(p))
        open(os.path.join(ROOT, f"{p['slug']}.md"), "w").write(page_md(p))
        print("wrote", p["slug"])
    og_images(); print("wrote og images")
    favicons(); print("wrote favicon set")

if __name__ == "__main__":
    main()
