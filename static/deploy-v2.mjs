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
    // Image produite par v2/build_og.py, une par langue
    `    <meta property="og:image" content="${SITE}assets/og-v2-${lang.code}.png" />`,
    '    <meta property="og:image:width" content="1200" />',
    '    <meta property="og:image:height" content="630" />',
    `    <meta property="og:image:alt" content="${title}" />`,
    '    <meta name="twitter:card" content="summary_large_image" />',
    `    <meta name="twitter:image" content="${SITE}assets/og-v2-${lang.code}.png" />`,
    `    <script type="application/ld+json">${JSON.stringify(jsonld(lang, page, desc))}</script>`,
  ].filter(Boolean).join('\n');
}

// Données structurées : organisation et site partout ; le logiciel et ses
// formules (prix publics de la grille) sur l'accueil et la page Tarifs.
const PLANS = [['Indépendant', 79, 99], ['Équipe', 279, 349], ['Croissance', 599, 749]];
function jsonld(lang, page, desc) {
  const graph = [
    { '@type': 'Organization', '@id': `${SITE}#organization`, name: 'SAKSAE', url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}assets/logo-saksae.png`, width: 555, height: 450 } },
    { '@type': 'WebSite', '@id': `${SITE}#website`, url: SITE, name: 'SAKSAE', inLanguage: lang.code, publisher: { '@id': `${SITE}#organization` } },
  ];
  if (page === 'index.html' || page === 'tarifs.html') {
    graph.push({
      '@type': 'SoftwareApplication', '@id': `${SITE}#software`, name: 'SAKSAE', applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web', url: url(lang, page), inLanguage: lang.code, publisher: { '@id': `${SITE}#organization` },
      description: desc || undefined,
      offers: {
        '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: '79', highPrice: '749', offerCount: PLANS.length,
        offers: PLANS.map(([name, annual, monthly]) => ({
          '@type': 'Offer', name, priceCurrency: 'EUR', price: String(annual), url: url(lang, 'tarifs.html'),
          priceSpecification: [
            { '@type': 'UnitPriceSpecification', price: String(annual), priceCurrency: 'EUR', unitText: 'MON', billingDuration: 12 },
            { '@type': 'UnitPriceSpecification', price: String(monthly), priceCurrency: 'EUR', unitText: 'MON', billingDuration: 1 },
          ],
        })),
      },
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
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
