# Horizon Jets — exact static replica of horizonjets.com

A byte-faithful static mirror of Nick's live WordPress/Elementor site, as served
on **Sun Nov 15, 2026**. Built because Nick rejected the redesigned v2 and asked
for an EXACT replica of his current site, as-is, for now.

**Nothing was redesigned, rewritten, or "improved."** Copy, layout, images,
wording — including the flagged claims and typos ("Aquistions", "Entrepaneur",
"Fashon Designer", fake testimonials, Ferrari/NBAA logos) — are exactly as on
the live site. Cleaning those claims up is a separate later step Nick will
decide; this build is replication only.

## Hosting target

GitHub Pages at `https://nhigh723.github.io/horizon-jets-replica/` (a subpath).
All internal links are relative, so the site works under that subpath. There
are no root-absolute internal references and no `<base>` tag.

## How it was mirrored

- Tool: GNU Wget 1.21.4, normal Chrome User-Agent, polite 0.3s wait between
  requests. It is Nick's own site, so mirroring was authorized.
- URL list: all 69 URLs from the live sitemaps (`page-sitemap.xml` 16,
  `aircraft-sitemap.xml` 50, `post-sitemap.xml` 1, `metform-form-sitemap.xml` 2),
  fetched with `-p` (page requisites) `-k` (convert links to relative) `-E -N`.
  All 546 initial downloads returned HTTP 200, zero failures.
- Archive pagination was followed to the end: `/aircraft/page/2/` through
  `/aircraft/page/5/` (page 6 is a 404 on the live site), adding 4 pages.
- Excluded: wp-admin, wp-login.php, wp-json, feeds, xmlrpc.php, wp-cron.php.
- Post-processing (scripts in `/tmp/hj-replica/`, not shipped):
  1. `postprocess.py` — stripped `?ver=...` query strings from 301 asset
     filenames (GitHub Pages would 404 on them) and rewrote the references;
     189 query-variant duplicates were byte-identical and deduped to one file
     each (notably `jet-card-builder`'s script, downloaded ~65x with timestamp
     `?ver=` params, all identical).
  2. `hotlink.py` — raster images hotlinked (see below).
  3. `relink.py` — 9 small assets wget missed (referenced only inside JS/JSON
     configs) were downloaded and relinked to relative paths: WP Grid Builder
     vendor JS/CSS (5), grid arrow SVGs (2), wp-emoji scripts (2).

## What is local vs hotlinked

- **Local (203 files, 13,088,477 bytes / 12.48 MiB):** all 73 HTML pages, all
  CSS (79) and JS (38), all SVG (9, including the Font Awesome icon fonts),
  `robots.txt` (verbatim from live), `.nojekyll`, and a trimmed
  `airports-data.json` (see below).
- **Hotlinked to `https://horizonjets.com` (same owner):** all 303 raster
  images (jpg/jpeg/png/webp, 38.5 MB total) — 1,513 + 590 + 1,121 references
  rewritten to absolute live URLs. They load cross-origin fine via `<img>` /
  CSS. If the WordPress site ever goes away, the images go with it. **Also
  hotlinked: all 33 font files** (woff2/woff/ttf/eot, ~2.0 MB) — the GitHub
  push tool only handles text files, so the 98 `url()` font references in 6
  CSS files were rewritten to absolute live URLs instead. Fonts load
  cross-origin fine via CSS; if the WordPress site ever goes away, the fonts
  fall back to system fonts. **Also hotlinked: `map.js`** (the comparison-page
  map script, 23 KB) — it contains Nick's Mapbox public token, and GitHub's
  secret scanner rejects any push containing it, so the file loads from the
  live site instead of the repo. The token is a `pk.*` public token, already
  published on the live site; the map works exactly the same. Its
  `fetch('../wp-content/uploads/2025/06/airports-data.json')` calls resolve
  against the preview page, so they still hit the local trimmed airport file.
- **Still absolute by design:** JSON-LD schema URLs, canonical URLs, og: URLs
  (identifiers, not navigation); feed URLs (not mirrored); `wp-json` API
  endpoints (see below); Google Fonts; Mapbox CDN + geocoding API.

## The one deliberate data trim: airports-data.json

The comparison-page map fetches `wp-content/uploads/2025/06/airports-data.json`
(29,267 airports, 9.0 MB) from the live site. That file **cannot stay
hotlinked**: the live server sends no CORS header for it, so a cross-origin
`fetch()` from the GitHub Pages preview would be blocked by the browser and
the map's airport search would be dead. (Verified with an `Origin:` header
check; the `wp-json` aircraft endpoint, by contrast, DOES send permissive
CORS and works from the preview.)

Options were: full file locally (9.0 MB pretty / 5.8 MB minified) — blows the
16 MiB push cap; or trim. Shipped: **IATA-only, minified — 7,917 airports,
1,579,127 bytes, all 10 fields kept, same object shape** (`Object.values()`
still works). Every commercial airport worldwide survives, including all of
Nick's SWFL airports (RSW, APF, FMY, PGD, SRQ) and the intl hubs in his
Popular Routes (LHR, CDG, DXB, TEB…). Dropped: ~21,350 small fields with no
IATA code (mostly US grass strips/private fields). The 4 `fetch()` calls in
`map.js` were rewritten to the relative path
`../wp-content/uploads/2025/06/airports-data.json` (map.js loads only on
`/aircraft-comparison/`, and `fetch()` resolves relative to the page).
To restore the full dataset later, drop the full file in at that path —
nothing else needs to change.

## The map

The map is **Mapbox** (not Google/Leaflet): `mapbox-gl-js v2.15.0` from the
Mapbox CDN, style `satellite-streets-v12`, using Nick's own public token
embedded in his `map.js` (kept as-is; public tokens are meant to be
client-side). Mapbox geocoding was verified live (HTTP 200 with his token).
Map files present: `wp-content/plugins/jet-comparison-tool-fixed-isolated/
assets/map.js` + `styles.css`, loaded by `/aircraft-comparison/`.
Aircraft data for the comparison grid comes from the live
`wp-json/wp/v2/aircraft?per_page=100&_embed` endpoint (CORS-verified working
from the preview origin).

## Known limits (accepted, not fixed)

- **Forms cannot submit.** The booking/contact/MetForm forms POST to
  `wp-admin/admin-ajax.php` and `wp-json/metform/...` on the live site; from a
  static copy those submissions fail (CORS / no backend). Forms are left
  visually as-is.
- **WordPress dynamic behaviour is lost:** search, comments, login, admin,
  feed generation. The `/author/nhigh723/` page was not mirrored (it appears
  only inside JSON-LD, never as a visible link).
- **Sitemap XMLs dropped** (they point at horizonjets.com). `robots.txt` kept
  verbatim; its `Sitemap:` line still points at the live site.
- **Hotlinked images depend on the live site** staying up (see above).
- **Airport data is IATA-only** (see trim note above).
- The jet-card builder script and grid-filter vendor scripts are included
  locally; their server-side AJAX calls (filtering via `wp-json/wpgb`, form
  inserts) will hit the live API where CORS allows, or fail silently.

## QA counts (verified Nov 15, 2026)

- Pages: **73 HTML** — all 69 sitemap URLs present (16 pages incl. home,
  50 aircraft incl. archive, hello-world, 2 MetForm forms), 0 missing,
  plus 4 archive pagination pages (2–5). 0 extra beyond those.
- Links: **5,197 relative href/src/srcset/CSS-url() refs checked, 0 broken.**
- Homepage: 51 CSS refs + 36 JS refs, **0 missing locally**.
- Comparison page present (85,881 bytes); `map.js` + `styles.css` present.
- Fidelity spot-checks: "Aquistions" typo present (2x, homepage), testimonial
  typos "Entrepaneur"/"Fashon" present, no `<base>` tag, no `?` left in any
  filename, no root-absolute internal references.
- Live smoke test (local HTTP server): `/`, `/about-us/`,
  `/aircraft-comparison/`, `/aircraft/gulfstream-g650/`, `/aircraft/page/3/`,
  `/booking/`, `map.js`, `airports-data.json`, an Elementor CSS file, and
  `robots.txt` all returned HTTP 200.
- Totals: **203 files, 13,088,477 bytes (12.48 MiB)** — inside the 16 MiB /
  2,000-file push limit. (Builder's original totals were 237 files /
  14.48 MiB; the 33 binary font files were hotlinked instead of pushed —
  see above — dropping 2.0 MB, and `map.js` was hotlinked after GitHub's
  secret scanner rejected the Mapbox token it contains.) All pushed files
  verified valid UTF-8.
- Preview-only shim: `aircraft-comparison/index.html` carries a small inline
  script (commented in the file) that rewrites the map's JS-generated
  "More Details" links from `/aircraft/<slug>` to `../aircraft/<slug>` as
  the route-results grid renders — the only root-absolute internal link in
  any JS file, and it would 404 under the subpath. Not part of the live site.

## Publishing (parent's step, not done here)

No repo was created and nothing was pushed. Publish flow: create public repo
`nhigh723/horizon-jets-replica`, push this directory to `main`, enable GitHub
Pages (branch `main`, folder `/ (root)`). Verify live at
`https://nhigh723.github.io/horizon-jets-replica/`.

## Accuracy pass (Nov 15)

After Nick approved the replica's look, an accuracy pass applied text-only
fixes (same layout, same structure — no new pages, sections, or CSS changes)
so the site reads as the small charter brokerage it is: fake testimonials out
(replaced with honest "what to expect" content in the same card layout),
Ferrari/NBAA logos removed, "Aquistions"/"Citaton"/"Aquisition" typos fixed,
instant-booking and 24/7 claims removed, fleet and Jet Card program claims
reframed as broker guidance, ARGUS/Wyvern partnership claims removed, the
fictional team/founding story replaced with the small-broker story, and the
exact Part 295 disclosure added to the footer of all 69 pages that have one
(plus booking, FAQ, and About). 71 of 73 HTML files changed
(`header/` and `hello-world/` untouched). Full edit list with old → new text:
`CHANGES-accuracy.md`. Deliberately left for Nick's call: contact details,
the site-title wording, JSON-LD `openingHours`, and the Privacy/Terms pages
(still describe a Jet Card program and aircraft sales).

## Accuracy pass, round 2 (Nov 15)

Nick then ordered the whole site made fully real — no placeholders, no fake
stuff, ready to market — and gave his real number, 603-670-6361. Round 2
(applied in place, same design): the real phone number everywhere (contact
page, footer of all 71 footer-bearing pages as a tap-to-call link, JSON-LD);
Boston → Southwest Florida (region only, no invented street address); the
site title shortened to "Horizon Jets | Private Jet Charter Broker" on all
73 pages (titles, meta/OG tags, JSON-LD, and the Elementor frontend config,
including its URL-encoded titles); `openingHours` removed from JSON-LD;
Privacy and Terms rewritten as real brokerage documents (no Jet Card program
or aircraft sales, no payment collection, Florida governing law — Nick to
confirm); the empty `/empty-leg/` page filled with request-based explainer
content from the approved rewrite (no live inventory claimed); nav
"Testimonials" → "What to Expect" (page slug unchanged); homepage meta
descriptions rewritten to request-a-quote wording; the MetForm page's
placeholder image swapped for the site's share image; a full placeholder
sweep (zero `lorem`, `[Insert …]`, `555-` numbers, `Boston`, `Aquistions`,
or `Testimonials` labels left). 73 of 73 HTML files changed. Full edit list:
`CHANGES-accuracy.md`, "Round 2" section.
