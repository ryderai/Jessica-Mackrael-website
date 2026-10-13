#!/usr/bin/env python3
"""
Site-wide <head> upgrade for jessicamackrael.com (12 Oct 2026). Safe to run more than once.
  1. Full favicon set links (files are made by _tools/build-guides.py) instead of the single assets/favicon.png
  2. Viewport lets people zoom (removes maximum-scale=1.0, user-scalable=no — a WCAG 1.4.4 failure)
  3. Link-preview tags (Open Graph + Twitter) on pages that had none, using one site card: assets/og/site.jpg
     The homepage keeps its own title/description; only its image changes from the transparent logo to the card.
The four area-guide pages are skipped (they have their own per-page cards).
AI search optimization (GEO) for this site by AI Syndicate — https://aisyndicate.com
"""
import sys; sys.dont_write_bytecode = True
import glob, html, os, re, importlib.util
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
spec = importlib.util.spec_from_file_location("bg", os.path.join(ROOT, "_tools", "build-guides.py"))
bg = importlib.util.module_from_spec(spec); spec.loader.exec_module(bg)
SKIP = {p["slug"] + ".html" for p in bg.PAGES}
CARD = "https://jessicamackrael.com/assets/og/site.jpg"
ALT = "Jessica Mackrael, Realtor® — Coldwell Banker Realty, Niceville, Florida."

def make_card():
    from PIL import Image, ImageDraw, ImageFont
    fd = bg.FONT_DIR
    def font(name, size, wt):
        f = ImageFont.truetype(os.path.join(fd, name), size)
        try: f.set_variation_by_axes([wt])
        except Exception: pass
        return f
    im = Image.new("RGB", (1200, 630), (46, 52, 59)); dr = ImageDraw.Draw(im)
    dr.rectangle([0, 618, 1200, 630], fill=(179, 152, 95))
    logo = Image.open("assets/jm-logo-light.png").convert("RGBA"); logo.thumbnail((620, 270))
    im.paste(logo, ((1200 - logo.width) // 2, 120), logo)
    def c(y, t, f, fill):
        dr.text(((1200 - dr.textlength(t, font=f)) / 2, y), t, font=f, fill=fill)
    c(430, "Realtor®  ·  Coldwell Banker Realty  ·  Niceville, Florida", font("Jost[wght].ttf", 30, 300), (247, 243, 234))
    c(482, "Emerald Coast homes  ·  Military relocation (MRP)", font("Jost[wght].ttf", 26, 300), (203, 185, 140))
    os.makedirs("assets/og", exist_ok=True)
    im.save("assets/og/site.jpg", "JPEG", quality=86, optimize=True, progressive=True)

make_card()
changed = []
OLD_ICONS = re.compile(r'<link rel="icon" type="image/png" href="assets/favicon.png">\s*(<link rel="apple-touch-icon" href="assets/favicon.png">)?')
for path in sorted(glob.glob("*.html")):
    if path in SKIP: continue
    s = open(path).read(); old = s
    if "/site.webmanifest" not in s:
        s = OLD_ICONS.sub(lambda m: bg.ICON_TAGS, s, count=1)
    s = s.replace(", maximum-scale=1.0, user-scalable=no", "")
    if 'property="og:title"' not in s:
        tm = re.search(r"<title[^>]*>(.*?)</title>", s, re.S)
        title = html.unescape(tm.group(1).strip()) if tm and tm.group(1).strip() else "Home Details | Jessica Mackrael, Coldwell Banker Realty"
        dm = re.search(r'<meta name="description" content="([^"]*)"', s)
        desc = html.unescape(dm.group(1)) if dm else "Jessica Mackrael, Realtor® with Coldwell Banker Realty in Niceville, Florida — Emerald Coast homes and military relocation."
        url = re.search(r'<link rel="canonical" href="([^"]+)"', s).group(1)
        e = lambda x: html.escape(x, quote=True)
        tags = (f'\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="Jessica Mackrael Real Estate">\n'
                f'<meta property="og:locale" content="en_US">\n<meta property="og:title" content="{e(title)}">\n'
                f'<meta property="og:description" content="{e(desc)}">\n<meta property="og:url" content="{e(url)}">\n'
                f'<meta property="og:image" content="{CARD}">\n<meta property="og:image:type" content="image/jpeg">\n'
                f'<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
                f'<meta property="og:image:alt" content="{e(ALT)}">\n<meta name="twitter:card" content="summary_large_image">\n'
                f'<meta name="twitter:title" content="{e(title)}">\n<meta name="twitter:description" content="{e(desc)}">\n'
                f'<meta name="twitter:image" content="{CARD}">\n<meta name="twitter:image:alt" content="{e(ALT)}">')
        anchor = dm.group(0) if dm else (tm.group(0) if tm else re.search(r'<link rel="canonical"[^>]*>', s).group(0))
        s = s.replace(anchor, anchor + tags, 1)
    else:
        # homepage: swap the transparent logo for the branded card and add the missing image tags
        s = s.replace('content="https://jessicamackrael.com/assets/jm-logo-light.png">\n<meta name="twitter:card"',
                      f'content="{CARD}">\n<meta property="og:image:type" content="image/jpeg">\n<meta property="og:image:width" content="1200">\n'
                      f'<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="{ALT}">\n<meta property="og:locale" content="en_US">\n<meta name="twitter:card"')
        s = s.replace('<meta name="twitter:image" content="https://jessicamackrael.com/assets/jm-logo-light.png">',
                      f'<meta name="twitter:image" content="{CARD}">\n<meta name="twitter:image:alt" content="{ALT}">')
    if s != old:
        open(path, "w").write(s); changed.append(path)
print("changed:", *changed)
