# saksae-website

The stack is native HTML + Tailwind + a little vanilla JS — no framework. Edit
the site in `static/`; `docs/` is generated build output that GitHub Pages
serves, so never edit it by hand (`cd static && npm run deploy` regenerates it).

`SPEC.md` describes the product, the page and the design system — including
which content is still placeholder. `static/README.md` covers the build and
i18n mechanics. The site ships in four languages, generated at deploy time
from the French source in `static/index.html`.
