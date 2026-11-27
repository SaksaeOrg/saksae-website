/**
 * Refonte 2027 : publie la v2 dans ../docs, que GitHub Pages sert.
 *
 * Les sources restent dans v2/ (français) et v2/en|vi|th/ (générées par
 * `python3 -I v2/i18n.py build`). Ce script ne fait que recopier et ajuster :
 * chemins relatifs, balise noindex retirée, adresse canonique, liens hreflang
 * et plan du site.
 *
 * docs/ est une sortie de build : il est effacé et réécrit à chaque passage.
 */
import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const docs = join(here, '..', 'docs');
const v2 = join(here, 'v2');
const SITE = 'https://saksae.com/';

export const PAGES = ['index.html', 'agences.html', 'societes-de-services.html', 'cabinets-conseil.html', 'organismes-de-formation.html',
  'commercants-franchises.html', 'startups.html', 'comptables.html', 'tarifs.html'];
export const LANGS = [
  { code: 'fr', dir: '', og: 'fr_FR' },
  { code: 'en', dir: 'en/', og: 'en_US' },
  { code: 'vi', dir: 'vi/', og: 'vi_VN' },
  { code: 'th', dir: 'th/', og: 'th_TH' },
];

const url = (lang, page) => SITE + lang.dir + (page === 'index.html' ? '' : page);

function head(lang, page, html) {
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || 'SAKSAE';
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const alternates = LANGS.map((l) => `    <link rel="alternate" hreflang="${l.code}" href="${url(l, page)}" />`).join('\n');
  return [
    `    <link rel="canonical" href="${url(lang, page)}" />`,
    alternates,
    `    <link rel="alternate" hreflang="x-default" href="${url(LANGS[0], page)}" />`,
    '    <meta property="og:type" content="website" />',
    '    <meta property="og:site_name" content="SAKSAE" />',
    `    <meta property="og:title" content="${title}" />`,
    desc ? `    <meta property="og:description" content="${desc}" />` : '',
    `    <meta property="og:url" content="${url(lang, page)}" />`,
    `    <meta property="og:locale" content="${lang.og}" />`,
  ].filter(Boolean).join('\n');
}

function publish(lang, page, html) {
  const deep = lang.dir !== '';
  let out = html.replace(/\s*<meta name="robots" content="noindex" \/>/, '');
  // v2/x.html → /x.html : « ../ » remonte d'un cran de moins ; v2/en/x.html → /en/x.html : idem
  out = deep
    ? out.replace(/((?:href|src|srcset)="|, )\.\.\/\.\.\//g, '$1../').replace('src="../main.js"', 'src="../js/main.js"')
    : out.replace(/((?:href|src|srcset)="|, )\.\.\//g, '$1./').replace('src="./main.js"', 'src="./js/main.js"');
  return out.replace('</head>', `${head(lang, page, html)}\n  </head>`);
}

async function main() {
  if (!existsSync(join(here, 'css', 'v2.css'))) {
    console.error('css/v2.css est absent : lancez `npm run build:v2` d’abord.');
    process.exit(1);
  }
  for (const l of LANGS.slice(1)) {
    if (!existsSync(join(v2, l.code, 'index.html'))) {
      console.error(`v2/${l.code}/ est absent : lancez \`python3 -I v2/i18n.py build\` d’abord.`);
      process.exit(1);
    }
  }
  if (existsSync(docs)) await rm(docs, { recursive: true });
  await mkdir(join(docs, 'css'), { recursive: true });
  await mkdir(join(docs, 'js'), { recursive: true });
  for (const entry of ['robots.txt', 'CNAME', 'assets']) await cp(join(here, entry), join(docs, entry), { recursive: true });
  await cp(join(here, 'css', 'v2.css'), join(docs, 'css', 'v2.css'));
  await cp(join(v2, 'main.js'), join(docs, 'js', 'main.js'));

  let n = 0;
  for (const lang of LANGS) {
    await mkdir(join(docs, lang.dir), { recursive: true });
    for (const page of PAGES) {
      const src = await readFile(join(v2, lang.dir, page), 'utf8');
      await writeFile(join(docs, lang.dir, page), publish(lang, page, src));
      n += 1;
    }
  }

  const entries = PAGES.flatMap((page) => LANGS.map((lang) => [
    '  <url>',
    `    <loc>${url(lang, page)}</loc>`,
    ...LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${url(l, page)}" />`),
    '  </url>',
  ].join('\n')));
  await writeFile(join(docs, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`);
  console.log(`docs/ : ${n} pages (${PAGES.length} × ${LANGS.length} langues), sitemap.xml, css/v2.css, js/main.js, assets/`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
