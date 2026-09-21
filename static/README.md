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
├── src/og-image.html   template for the social previews (not published)
├── src/build-og.mjs    renders one preview per language (one-off)
├── src/locales/        one file per language, build-time only
├── src/build-locale.mjs  generates a translated page
├── src/build-font.py   regenerates the subsetted font files (one-off)
├── js/main.js          all behaviour
├── assets/             logo, icon sprite, social image, self-hosted fonts
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

**Languages.** Every version is **generated at build time and served as its
own page**, because a single URL can only ever be indexed in one language.

```
/          index.html    French — the source you edit
/en/                     English    ┐
/vi/                     Vietnamese ├ generated, never edited by hand
/th/                     Thai       ┘
```

French is the source of truth and lives in `index.html`. Elements that change
carry `data-i18n` (text content), `data-i18n-html` (content with markup) or
`data-i18n-label` (the `aria-label` of a decorative mockup). Each target
language is one file under `src/locales/`, exporting `strings` (218 keys),
`head` (metadata the HTML cannot carry) and `jsonld` (structured-data labels).
`src/locales/index.mjs` is the registry: URL, `hreflang`, `og:locale`, and the
font to add when Latin is not enough.

At deploy time, `src/build-locale.mjs` substitutes the translations and
rewrites what belongs to the language: `lang`, `<title>`, description,
canonical, `og:*`, the JSON-LD, and the language switcher — where the current
language becomes inert and the others are links. Nothing is translated in the
browser: no dictionary ships. Only the handful of strings JavaScript composes
(step counters, prices, calculator totals) live in `main.js`, keyed off
`<html lang>`.

The substitution is targeted rather than done through an HTML parser. Parsers
re-serialise the document and drift (self-closing tags rewritten, attributes
normalised); here only translated text changes, so every page shares the exact
same structure. Every key must resolve or the build fails — `npm run check`
runs all generations in memory before anything is published.

**To add a language**: write `src/locales/<code>.mjs` with the same 218 keys,
add an entry to the registry, and add its URL to `sitemap.xml` and the
`hreflang` block of `index.html`. The checks will tell you what is missing.

⚠️ **The Vietnamese and Thai copy has not been reviewed by a native speaker.**
It was produced by a language model. The meaning should be sound, the idiom may
not be. Have it read before treating those pages as published marketing.

All local paths are absolute (`/css/…`, `/js/…`, `/assets/…`) so the
sub-directories resolve them from the site root.

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

**Fonts.** Three self-hosted files, none of which leaves for Google:

| File | Size | Loaded |
| --- | --- | --- |
| `inter-latin.woff2` | 42 KB | every page |
| `inter-vietnamese.woff2` | 10 KB | only where those characters appear |
| `noto-sans-thai.woff2` | 14 KB | only on `/th/` |

The last two carry a `unicode-range`, so the browser fetches them on demand —
verified: `/` and `/en/` download the Latin subset alone. Inter has **no Thai
glyphs at all**, hence the second family; it stays first in the stack so Latin,
digits and `€` keep rendering in Inter on `/th/`.

Each is subsetted with the `wght` axis narrowed to 400–700 and `opsz` kept, so
`font-optical-sizing` still works. Freezing `opsz` would save 15 KB but widens
text by 6.4 %, which reflows the page — measured, not assumed. Regenerate with
`src/build-font.py`; licences sit next to the files in `assets/`.

Thai stacks diacritics above and below the baseline, so `html[lang='th']`
relaxes the tight display line-heights and drops the negative letter-spacing,
which is tuned for Latin.

Note that `font-feature-settings: 'cv02'…` in `src/input.css` is inert: neither
Google's build nor our subset ships `cv01`–`cv13`. It is kept as a record of
intent — switching to the upstream Inter release would activate it and change
the rendering.

**Social preview.** One image per language — `assets/og-image-<code>.png`,
1200×630 — which is what LinkedIn, Slack and X display. Their source is
`src/og-image.html`, a template filled from the locale files, so the preview
always carries the same headline as the page it links to: one that promises
something else costs click-through.

```sh
npm install --no-save playwright
npx playwright install chromium      # or: export CHROMIUM_PATH=/path/to/chrome
node src/build-og.mjs
```

The renderer is a browser rather than an image library, so the layout, the
self-hosted fonts and the dotted ground are reused as they are. **The headline
shrinks until it fits**: Vietnamese needs three lines where French takes two,
and the next language will be handled the same way without a hand-tuned size.
Each file is then quantised to 256 colours, which halves it with no visible
loss — flat colour plus text.

`npm run check` verifies every language has its image at the right dimensions.
An `og:image` pointing at a 404 only shows up on the first share.

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
