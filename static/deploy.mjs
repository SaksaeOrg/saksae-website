/**
 * Publishes the static site into ../docs, which is what GitHub Pages serves.
 *
 * Pages only accepts `/` or `/docs` as a source directory, so `static/` stays
 * the place you edit and `docs/` is generated — the same split the React app
 * used with BUILD_PATH=../docs.
 *
 * docs/ is build output: it is wiped and rewritten on every run. Run
 * `npm run build` first (or just use `npm run deploy`, which does both).
 */
import { cp, mkdir, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const docs = join(here, '..', 'docs');

// Published at the site root. Source files (src/, *.config.js, package.json,
// deploy.mjs, README) deliberately stay behind.
const PUBLISH = ['index.html', 'robots.txt', 'sitemap.xml', 'CNAME', 'css', 'js', 'assets'];

if (!existsSync(join(here, 'css', 'styles.css'))) {
  console.error('css/styles.css is missing — run `npm run build` first.');
  process.exit(1);
}

if (existsSync(docs)) {
  await rm(docs, { recursive: true });
}
await mkdir(docs, { recursive: true });

for (const entry of PUBLISH) {
  await cp(join(here, entry), join(docs, entry), { recursive: true });
}

const listed = (await readdir(docs)).sort();
console.log(`published to docs/: ${listed.join(', ')}`);
