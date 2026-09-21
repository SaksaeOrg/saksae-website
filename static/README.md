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
├── js/i18n-data.js     English strings (French lives in index.html)
├── js/main.js          all behaviour
├── assets/             logo, icon sprite, social preview image
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
npm run deploy     # build, then publish into ../docs
```

`css/styles.css` is committed — the site is served from these files, so the
build output is part of the repo.

## How it works

**Languages.** French is the source of truth and lives in `index.html`.
Elements that change carry `data-i18n` (text) or `data-i18n-html` (markup with
`<br>`); `js/i18n-data.js` holds only the English side. On load, `main.js`
snapshots the French DOM, so switching back to `fr` restores it exactly. The
choice persists in `localStorage` under `saksae-lang`.

To change French copy, edit `index.html`. To change English, edit
`js/i18n-data.js`. Every key must exist in both — see *Checks* below.

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

**Social preview.** `assets/og-image.png` (1200×630) is what LinkedIn, Slack
and X display. Its source is `src/og-image.html`, which reuses the page's own
headline — a preview promising something the page doesn't deliver costs
click-through. To regenerate after editing, screenshot that file at 1200×630
with `deviceScaleFactor: 1`, then quantise to 256 colours (it is flat colour
plus text, so this halves the file with no visible loss).

## Checks

```sh
# every data-i18n key has an English counterpart, and vice versa
node -e "
const fs=require('fs'),h=fs.readFileSync('index.html','utf8');
global.window={};eval(fs.readFileSync('js/i18n-data.js','utf8'));
const k=[...new Set([...h.matchAll(/data-i18n(?:-html)?=\"([^\"]+)\"/g)].map(m=>m[1]))];
console.log('missing EN:',k.filter(x=>!(x in window.SAKSAE_EN)));
console.log('unused EN:',Object.keys(window.SAKSAE_EN).filter(x=>!k.includes(x)));"

# every <use> resolves to a symbol in the sprite
node -e "
const h=require('fs').readFileSync('index.html','utf8');
const d=new Set([...h.matchAll(/<symbol id=\"(i-[a-z0-9-]+)\"/g)].map(m=>m[1]));
console.log('missing icons:',[...new Set([...h.matchAll(/<use href=\"#(i-[a-z0-9-]+)\"/g)].map(m=>m[1]))].filter(x=>!d.has(x)));"
```

## Deploying

GitHub Pages only accepts `/` or `/docs` as a source directory, so `static/` is
where you edit and `docs/` is what gets served.

```sh
npm run deploy     # rebuilds css, then rewrites ../docs
git add ../docs && git commit
```

`deploy.mjs` wipes `docs/` and copies `index.html`, `CNAME`, `css/`, `js/` and
`assets/` into it. Source files (`src/`, `package.json`, `deploy.mjs`, this
README) stay behind and are never published. Treat `docs/` as build output:
committed, but never hand-edited.
