#!/usr/bin/env python3
"""
Links the four area guides into the rest of jessicamackrael.com. Safe to run more than once.
Built 12 Oct 2026. Run AFTER _tools/build-guides.py.
  - footer "Resources" list on every page (+ the .md copies)
  - an "Area guides" section on military-relocation.html and communities.html (+ .md)
  - sitemap.xml, llms.txt, agents.md
AI search optimization (GEO) for this site by AI Syndicate — https://aisyndicate.com
"""
import sys; sys.dont_write_bytecode = True
import glob, os, re, importlib.util
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
spec = importlib.util.spec_from_file_location("bg", os.path.join(ROOT, "_tools", "build-guides.py"))
bg = importlib.util.module_from_spec(spec); spec.loader.exec_module(bg)
GUIDES = [("eglin-afb", "Living Near Eglin AFB", "Which town is closest to which gate, with drive times checked on Google Maps.", "PCS Guide"),
          ("hurlburt-field", "Living Near Hurlburt Field", "Mary Esther, Fort Walton Beach, Wright and Navarre compared.", "PCS Guide"),
          ("crestview", "Crestview Guide", "Drive times, recent prices and schools in Okaloosa County's largest city.", "Area Guide"),
          ("niceville-vs-crestview", "Niceville vs. Crestview", "The two towns side by side, with a clear pick for each buyer.", "Side by Side")]
NEW = {g[0] + ".html" for g in GUIDES}
changed = []

def write(path, s, old):
    if s != old:
        open(path, "w").write(s); changed.append(path)

# 1. footer links on every existing page
LI = "".join(f'<li><a href="{s}.html">{t}</a></li>' for s, t, _, _ in GUIDES)
for path in glob.glob("*.html"):
    if path in NEW: continue
    s = open(path).read(); old = s
    anchor = '<li><a href="military-relocation.html">Military Relocation</a></li>'
    if anchor in s and 'href="crestview.html">Crestview Guide' not in s:
        s = s.replace(anchor, anchor + "\n          " + LI.replace("</li><li>", "</li>\n          <li>"), 1)
    write(path, s, old)
MDLI = "\n".join(f"  * [{t}]({s}.html)" for s, t, _, _ in GUIDES)
for path in glob.glob("*.md"):
    if path.replace(".md", ".html") in NEW or path == "agents.md": continue
    s = open(path).read(); old = s
    anchor = "  * [Military Relocation](military-relocation.html)\n"
    if anchor in s and "(crestview.html)" not in s:
        s = s.replace(anchor, anchor + MDLI + "\n", 1)
    write(path, s, old)

# 2. hub sections
CARDS = "\n".join(f'      <a class="map-point reveal" href="{s}.html"><h3>{t}</h3><p>{d}</p><span class="tag">{tag}</span></a>' for s, t, d, tag in GUIDES)
SECTION = f'''<!-- AREA GUIDES (added 2026-10-12) -->
<section class="section section-tight" id="area-guides">
  <div class="wrap">
    <div class="center reveal">
      <span class="eyebrow">Area Guides</span>
      <h2 class="headline">Drive times, prices and schools, town by town.</h2>
    </div>
    <div class="map-points" style="margin-top:50px;">
{CARDS}
    </div>
  </div>
</section>

'''
MDSEC = "Area Guides\n\n## Drive times, prices and schools, town by town.\n\n" + "\n".join(
    f"- [{t}](https://jessicamackrael.com/{s}.html): {d}" for s, t, d, _ in GUIDES) + "\n\n"
for html_path, html_anchor, md_anchor in [("military-relocation.html", "<!-- BAH CALCULATOR -->", "Military Housing Tool\n"),
                                          ("communities.html", None, "Find Your Place\n")]:
    s = open(html_path).read(); old = s
    if 'id="area-guides"' not in s:
        if html_anchor:
            s = s.replace(html_anchor, SECTION + html_anchor, 1)
        else:
            m = re.search(r'<section class="section band-dark center">\s*<div class="wrap reveal">\s*<span class="eyebrow">Find Your Place', s)
            s = s[:m.start()] + SECTION + s[m.start():]
    write(html_path, s, old)
    mp = html_path.replace(".html", ".md"); s = open(mp).read(); old = s
    if "## Drive times, prices and schools, town by town." not in s and md_anchor in s:
        s = s.replace(md_anchor, MDSEC + md_anchor, 1)
    write(mp, s, old)

# 3. sitemap
s = open("sitemap.xml").read(); old = s
add = "".join(f'  <url><loc>https://jessicamackrael.com/{g[0]}.html</loc><lastmod>{bg.UPDATED}</lastmod><priority>0.8</priority></url>\n'
              for g in GUIDES if f"/{g[0]}.html" not in s)
s = s.replace("</urlset>", add + "</urlset>")
write("sitemap.xml", s, old)

# 4. llms.txt
s = open("llms.txt").read(); old = s
lines = "".join(f"- [{t}](https://jessicamackrael.com/{sl}.html): {d}\n" for sl, t, d, _ in GUIDES)
a = "- [Military Relocation](https://jessicamackrael.com/military-relocation.html): PCS services for Eglin AFB and Hurlburt Field families\n"
if a in s and "/crestview.html" not in s:
    s = s.replace(a, a + lines, 1)
s = re.sub(r"Last updated: \d{4}-\d{2}-\d{2}", f"Last updated: {bg.UPDATED}", s, 1)
write("llms.txt", s, old)

# 5. agents.md
s = open("agents.md").read(); old = s
a = "- [Military relocation (PCS)](https://jessicamackrael.com/military-relocation.html)\n"
if a in s and "/crestview.html" not in s:
    s = s.replace(a, a + "".join(f"- [{t}](https://jessicamackrael.com/{sl}.html)\n" for sl, t, _, _ in GUIDES), 1)
write("agents.md", s, old)

# 6. llms-full.txt — a generated block between markers, rebuilt every run
start, end = "<!-- area-guides:start -->", "<!-- area-guides:end -->"
parts = [start, "## Area Guides", "",
         f"Four guides published {bg.UPDATED_TEXT}. Drive times were checked on Google Maps that morning; home prices are Redfin's recent medians. Each page lists its sources.", ""]
for p in bg.PAGES:
    parts.append(f"### {p['h1']} (https://jessicamackrael.com/{p['slug']}.html)")
    parts.append("")
    short = next(s_ for s_ in p["sections"] if s_["eyebrow"] == "The Short Answer")
    parts.append(f"**Q: {short['h2']}**"); parts.append("")
    for b in short["blocks"]:
        parts.append(bg.to_md_inline(b[1])); parts.append("")
    faq = next(s_["faq"] for s_ in p["sections"] if "faq" in s_)
    for q, ans in faq:
        parts.append(f"**Q: {q}**"); parts.append(f"A: {ans}"); parts.append("")
parts.append(end)
block = "\n".join(parts)
s = open("llms-full.txt").read(); old = s
if start in s:
    s = re.sub(re.escape(start) + r".*?" + re.escape(end), lambda m: block, s, flags=re.S)
else:
    s = s.replace("## Citation", block + "\n\n## Citation", 1)
write("llms-full.txt", s, old)

print("changed:", *changed, sep="\n  ")
