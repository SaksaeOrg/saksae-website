# SAKSAE — static site

A framework-free rewrite of the marketing page: plain HTML, CSS and JavaScript.
Tailwind is the only build step; there is no bundler, no runtime dependency and
no npm package shipped to the browser.

```
static/
├── index.html          the whole page, French, with the icon sprite inlined
├── robots.txt          published at the site root
├── sitemap.xml         published at the site root
├── css/styles.css      built by Tailwind — committed, do not edit by hand
├── src/input.css       Tailwind entry + design tokens + the animation system
├── src/og-image.html   source of assets/og-image.png (not published)
├── src/i18n-en.mjs     English strings, build-time only
├── src/build-en.mjs    generates the English page
├── src/build-font.py   regenerates the subsetted Inter file (one-off)
├── js/main.js          all behaviour
├── assets/             logo, icon sprite, social image, self-hosted Inter
├── check.mjs           consistency checks, run before every deploy
├── deploy.mjs          publishes into ../docs
├── tailwind.config.js
└── CNAME
```

## Working on it

```sh
npm install        # installs tailwindcss only
npm run dev        # rebuild css/styles.css on change
npm run serve      # http://localhost:8080
npm run build      # minified css/styles.css
npm run check      # consistency checks
npm run deploy     # build, then publish into ../docs
```

`css/styles.css` is committed — the site is served from these files, so the
build output is part of the repo.

## How it works

**Languages.** Both versions are **generated at build time and served as
separate pages**, because a single URL can only ever be indexed in one
language.

```
/          index.html            French — the source you edit
/en/       docs/en/index.html    English — generated, never edited by hand
```

French is the source of truth and lives in `index.html`. Elements that change
carry `data-i18n` (text content), `data-i18n-html` (content with markup) or
`data-i18n-label` (the `aria-label` of a decorative mockup). `src/i18n-en.mjs`
holds the English counterpart of every key, plus the `<head>` metadata that
cannot carry an attribute.

At deploy time, `src/build-en.mjs` substitutes the translations and rewrites
what belongs to the language: `lang`, `<title>`, description, canonical,
`og:*`, the JSON-LD, and the language selector — which is a **link to the other
URL**, not a JavaScript toggle. Nothing is translated in the browser: neither
dictionary ships. Only the handful of strings JavaScript composes (step
counters, prices, calculator totals) live in `main.js`, keyed off `<html lang>`.

The substitution is targeted rather than done through an HTML parser. Parsers
re-serialise the document and drift (self-closing tags rewritten, attributes
normalised); here only translated text changes, so both pages share the exact
same structure. Every key must resolve or the build fails — `npm run check`
runs the generation in memory before anything is published.

To change French copy, edit `index.html`. To change English, edit
`src/i18n-en.mjs`. Both pages carry the same `hreflang` set (`fr`, `en`,
`x-default`), and the sitemap lists both URLs with their alternates.

All local paths are absolute (`/css/…`, `/js/…`, `/assets/…`) so `/en/` resolves
them from the site root.

**Icons.** `assets/icons.svg` is a sprite of the 41 [lucide](https://lucide.dev)
icons the page uses (ISC licensed), inlined into `index.html` at assembly time.
Reference one with `<svg class="icon w-4 h-4"><use href="#i-arrow-right" /></svg>`;
add `icon-thin` for the 1.5 stroke weight.

**Animation.** Everything that framer-motion used to do is CSS, driven by a few
class toggles in `main.js`:

| Pattern | Replaced by |
| --- | --- |
| `whileInView` | `.reveal` + one `IntersectionObserver` (`.is-visible`) |
| `initial`/`animate` on mount | `.intro` keyframes |
| `<AnimatePresence mode="wait">` | `.panel` + `showPanel()` (leave, swap, enter) |
| `layoutId` sliding underline | `.tab-underline` positioned from `offsetLeft`/`offsetWidth` |
| `height: auto` accordion | `.collapse` + measured `scrollHeight` |
| `staggerChildren` | `.stagger` + `nth-child` animation delays |

Spring transitions are approximated with `cubic-bezier`, so tab underlines move
without overshoot. Everything else matches the original timings.

Anything that starts invisible is scoped under `.js-on` (added by `main.js` on
boot), so the page still reads correctly with JavaScript disabled.
`prefers-reduced-motion` disables the lot.

**Font.** Inter is self-hosted: `assets/inter-latin-var.woff2`, 42 KB, latin
subset with the `wght` axis narrowed to 400–700 and `opsz` kept so
`font-optical-sizing` still works. Freezing `opsz` would take it to 28 KB but
widens text by 6.4 %, which reflows the page — measured, not assumed. No
request leaves for Google, which also settles the GDPR question. Regenerate
with `src/build-font.py`; licence in `assets/inter-LICENSE.txt` (SIL OFL 1.1).

Note that `font-feature-settings: 'cv02'…` in `src/input.css` is inert: neither
Google's build nor our subset ships `cv01`–`cv13`. It is kept as a record of
intent — switching to the upstream Inter release would activate it and change
the rendering.

**Social preview.** `assets/og-image.png` (1200×630) is what LinkedIn, Slack
and X display. Its source is `src/og-image.html`, which reuses the page's own
headline — a preview promising something the page doesn't deliver costs
click-through. To regenerate after editing, screenshot that file at 1200×630
with `deviceScaleFactor: 1`, then quantise to 256 colours (it is flat colour
plus text, so this halves the file with no visible loss).

## Checks

```sh
npm run check
```

`check.mjs` runs before every deploy, and a failure blocks publication. It has
no dependencies. It catches the kind of drift that does not visibly break the
page:

- **Structured-data prices** match the pricing section. The JSON-LD in the
  `<head>` necessarily duplicates them, so the check compares every figure
  against `data-monthly` / `data-annual` on the cards — and, for the Enterprise
  plan which has no such attributes, against the `DYN` table in `js/main.js`. Plan names, `offerCount`, `lowPrice` and `highPrice` are
  checked too, and every `@id` reference must resolve inside the graph.
- **Translation coverage** both ways: every `data-i18n`, `data-i18n-html` and
  `data-i18n-label` key has an English counterpart, and no English string is
  orphaned.
- **Icon sprite**: every `<use>` resolves to a `<symbol>`, and no symbol is
  left unused.
- **The English page generates cleanly**: the build runs in memory, and any key
  that fails to apply stops the deploy rather than shipping French text on
  `/en/`. `hreflang` completeness and the sitemap's alternates are checked too.

Change a price in one place only and the deploy stops with the mismatch
spelled out. That is the point: a page advertising 279 € while its structured
data says 289 € is worse than no structured data at all.

## Deploying

GitHub Pages only accepts `/` or `/docs` as a source directory, so `static/` is
where you edit and `docs/` is what gets served.

```sh
npm run deploy     # rebuilds css, then rewrites ../docs
git add ../docs && git commit
```

`deploy.mjs` wipes `docs/` and copies `index.html`, `robots.txt`, `sitemap.xml`,
`CNAME`, `css/`, `js/` and `assets/` into it, then generates `docs/en/index.html`
from the French source. Source files (`src/`, `package.json`, `deploy.mjs`, this
README) stay behind and are never published. Treat `docs/` as build output:
committed, but never hand-edited.
