/**
 * Contrôles de cohérence du site, exécutés avant chaque déploiement.
 *
 *   npm run check     # seul
 *   npm run deploy    # build -> check -> publication ; un échec bloque tout
 *
 * Aucune dépendance : lecture de fichiers et comparaison de chaînes.
 * Ces contrôles attrapent la dérive silencieuse — un prix modifié dans la
 * section tarifs mais pas dans les données structurées, une clé de traduction
 * ajoutée sans son pendant anglais, une icône référencée mais absente du
 * sprite. Rien de tout cela ne casse visiblement la page.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildEnglish } from './src/build-en.mjs';
import { strings, head } from './src/i18n-en.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, 'index.html'), 'utf8');

let failures = 0;
const ok = (label, condition, detail = '') => {
  if (!condition) failures++;
  console.log(`${condition ? 'ok  ' : 'ECHEC'} ${label}${detail ? ` — ${detail}` : ''}`);
};

/* ------------------------------------------------------------------ *
 * 1. Données structurées : cohérence avec les tarifs affichés
 * ------------------------------------------------------------------ */

const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
ok('le bloc JSON-LD est présent', !!ldMatch);

if (ldMatch) {
  let ld;
  try {
    ld = JSON.parse(ldMatch[1]);
    ok('le JSON-LD est du JSON valide', true);
  } catch (e) {
    ok('le JSON-LD est du JSON valide', false, e.message);
  }

  if (ld) {
    const graph = ld['@graph'] || [];
    const software = graph.find((n) => n['@type'] === 'SoftwareApplication');
    ok('le graphe déclare une SoftwareApplication', !!software);

    // Toutes les références @id doivent se résoudre dans le graphe.
    const ids = new Set(graph.map((n) => n['@id']).filter(Boolean));
    const refs = [];
    JSON.stringify(ld, (k, v) => {
      if (v && typeof v === 'object' && v['@id'] && Object.keys(v).length === 1) refs.push(v['@id']);
      return v;
    });
    const dangling = refs.filter((r) => !ids.has(r));
    ok('toutes les références @id se résolvent', dangling.length === 0, dangling.join(', '));

    const offers = software?.offers?.offers || [];
    ok('les 4 formules sont déclarées', offers.length === 4, `${offers.length} trouvée(s)`);
    ok(
      'offerCount correspond au nombre de formules',
      software?.offers?.offerCount === offers.length,
      `offerCount=${software?.offers?.offerCount}`
    );

    // Source de vérité 1 : les attributs data-* des cartes tarifaires.
    const cards = [...html.matchAll(/data-plan="(\w+)"([^>]*)>/g)].map(([, key, attrs]) => ({
      key,
      monthly: (attrs.match(/data-monthly="(\d+)"/) || [])[1],
      annual: (attrs.match(/data-annual="(\d+)"/) || [])[1],
      custom: attrs.includes('data-custom'),
    }));
    ok('les 4 cartes tarifaires sont présentes', cards.length === 4, `${cards.length} trouvée(s)`);

    const priceOf = (offer, billing) => {
      const specs = [].concat(offer.priceSpecification || []);
      const s = specs.find((x) => (x.name || '').toLowerCase().includes(billing));
      return s ? s.price ?? s.minPrice : undefined;
    };

    cards.forEach((card, i) => {
      const offer = offers[i];
      if (!offer) return;
      if (card.custom) {
        // Source de vérité 2 : le plan Entreprise n'a pas d'attributs data-*,
        // ses libellés viennent de SAKSAE_DYN dans js/i18n-data.js.
        const dyn = readFileSync(join(here, 'js', 'main.js'), 'utf8');
        const frMonthly = (dyn.match(/entMonthly:\s*'([^']+)'/) || [])[1] || '';
        const digits = frMonthly.replace(/[^\d]/g, '');
        ok(
          `${card.key} : le prix plancher suit main.js`,
          priceOf(offer, 'partir de') === digits,
          `JSON-LD=${priceOf(offer, 'partir de')} vs main.js DYN="${frMonthly}"`
        );
      } else {
        ok(
          `${card.key} : prix mensuel identique à la page`,
          priceOf(offer, 'mensuelle') === card.monthly,
          `JSON-LD=${priceOf(offer, 'mensuelle')} vs data-monthly=${card.monthly}`
        );
        ok(
          `${card.key} : prix annuel identique à la page`,
          priceOf(offer, 'annuelle') === card.annual,
          `JSON-LD=${priceOf(offer, 'annuelle')} vs data-annual=${card.annual}`
        );
        ok(
          `${card.key} : price reprend le tarif annuel affiché par défaut`,
          offer.price === card.annual,
          `price=${offer.price} vs data-annual=${card.annual}`
        );
      }
    });

    // lowPrice / highPrice doivent encadrer ce qui est réellement déclaré.
    const all = offers
      .flatMap((o) => [].concat(o.priceSpecification || []))
      .map((s) => Number(s.price ?? s.minPrice))
      .filter((n) => !Number.isNaN(n));
    ok('lowPrice est le tarif le plus bas déclaré', Number(software?.offers?.lowPrice) === Math.min(...all), `lowPrice=${software?.offers?.lowPrice}, min=${Math.min(...all)}`);
    ok('highPrice est le tarif le plus haut déclaré', Number(software?.offers?.highPrice) === Math.max(...all), `highPrice=${software?.offers?.highPrice}, max=${Math.max(...all)}`);

    // Les intitulés des formules doivent correspondre à ceux de la page.
    const names = [...html.matchAll(/data-i18n="pricing\.p\d\.name">([^<]+)</g)].map((m) => m[1].trim());
    const ldNames = offers.map((o) => o.name);
    ok('les intitulés des formules correspondent', JSON.stringify(names) === JSON.stringify(ldNames), `page=${names.join('/')} vs JSON-LD=${ldNames.join('/')}`);
  }
}

/* ------------------------------------------------------------------ *
 * 2. Police : auto-hébergée, et le fichier déclaré existe
 * ------------------------------------------------------------------ */

const css = readFileSync(join(here, 'css', 'styles.css'), 'utf8');
const externalFonts = [html, css].some((f) => /fonts\.(googleapis|gstatic)\.com/.test(f));
ok("aucune requête de police vers Google", !externalFonts);

const srcMatch = css.match(/@font-face\{[^}]*src:url\(([^)]+)\)/);
ok('le @font-face déclare une source', !!srcMatch);
if (srcMatch) {
  const rel = srcMatch[1].replace(/^['"]|['"]$/g, '').replace(/^\.\.\//, '');
  let exists = true;
  try {
    readFileSync(join(here, rel));
  } catch {
    exists = false;
  }
  ok('le fichier de police déclaré existe', exists, rel);
}

/* ------------------------------------------------------------------ *
 * 3. Version anglaise : la génération doit aboutir sans trou
 * ------------------------------------------------------------------ */

const { applied, problems } = buildEnglish(html, strings, head);
ok('la page anglaise se génère sans problème', problems.length === 0, problems.slice(0, 3).join(' | '));
ok('toutes les clés du HTML sont appliquées', applied.size > 0, `${applied.size} clés`);

// hreflang : chaque page doit déclarer l'ensemble complet, y compris elle-même.
const hre = [...html.matchAll(/hreflang="([\w-]+)" href="([^"]+)"/g)].map((m) => m[1]);
ok('la page déclare fr, en et x-default', ['fr', 'en', 'x-default'].every((h) => hre.includes(h)), hre.join(', '));

const sitemap = readFileSync(join(here, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
ok('le sitemap liste les deux langues', locs.length === 2 && locs.includes('https://saksae.com/en/'), locs.join(', '));
const altCount = (sitemap.match(/xhtml:link/g) || []).length;
ok('le sitemap déclare 3 alternatives par URL', altCount === locs.length * 3, `${altCount} déclarations`);

/* ------------------------------------------------------------------ *
 * 4. Traductions : couverture dans les deux sens
 * ------------------------------------------------------------------ */

const EN = strings;
const keys = [...new Set([...html.matchAll(/data-i18n(?:-html|-label)?="([^"]+)"/g)].map((m) => m[1]))];
const missing = keys.filter((k) => !(k in EN));
const unused = Object.keys(EN).filter((k) => !keys.includes(k));
ok('chaque clé du HTML a une traduction anglaise', missing.length === 0, missing.join(', '));
ok('aucune traduction anglaise orpheline', unused.length === 0, unused.join(', '));

/* ------------------------------------------------------------------ *
 * 5. Sprite d'icônes : chaque <use> pointe vers un <symbol> existant
 * ------------------------------------------------------------------ */

const defined = new Set([...html.matchAll(/<symbol id="(i-[a-z0-9-]+)"/g)].map((m) => m[1]));
const used = [...new Set([...html.matchAll(/<use href="#(i-[a-z0-9-]+)"/g)].map((m) => m[1]))];
ok('chaque icône référencée existe dans le sprite', used.every((u) => defined.has(u)), used.filter((u) => !defined.has(u)).join(', '));
ok('aucun symbole inutilisé dans le sprite', [...defined].every((d) => used.includes(d)), [...defined].filter((d) => !used.includes(d)).join(', '));

/* ------------------------------------------------------------------ */

console.log(failures ? `\n${failures} contrôle(s) en échec.` : '\nTous les contrôles passent.');
process.exit(failures ? 1 : 0);
