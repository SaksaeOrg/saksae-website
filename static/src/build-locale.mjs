/**
 * Produit une version traduite de la page à partir de la source française.
 *
 * Le français est la source : index.html porte le texte, marqué par
 * `data-i18n` (contenu texte), `data-i18n-html` (contenu balisé) et
 * `data-i18n-label` (attribut aria-label). Ce module y substitue les
 * traductions de src/locales/<code>.mjs et ajuste ce qui relève de la langue.
 *
 * La substitution est ciblée plutôt que faite via un parseur HTML : les
 * parseurs re-sérialisent le document et introduisent des écarts (balises
 * auto-fermantes réécrites, attributs normalisés). Ici seul le texte traduit
 * change, donc toutes les pages partagent la même structure — ce qui rend les
 * écarts faciles à repérer.
 *
 * Chaque substitution est comptée et vérifiée : une clé qui ne s'applique pas
 * fait échouer le build plutôt que de laisser passer du français.
 */
import { SOURCE, ALL } from './locales/index.mjs';

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const attr = (s) => s.replace(/"/g, '&quot;');

/** Chaînes françaises que le HTML ne peut pas marquer avec data-i18n. */
const FR = {
  title: "SAKSAE — La plateforme d'Exécution Business IA",
  description:
    "SAKSAE centralise vos outils, analyse vos données d'opérations et de revenus, et les transforme en actions. La plateforme d'Exécution Business IA pour Indépendants, TPE et PME.",
  ogTitle: "SAKSAE — La plateforme d'Exécution Business IA",
  ogDescription:
    "Centralisez vos outils, détectez vos priorités, passez à l'action. Pour Indépendants, TPE et PME.",
  ogImageAlt: 'SAKSAE — #1 plateforme business IA pour Indépendants, TPE/PME',
  planNames: ['Indépendant', 'Équipe', 'Croissance', 'Entreprise'],
  planTargets: ['1 utilisateur', '2 à 9 utilisateurs', '10 à 20 utilisateurs', '20+ utilisateurs'],
  billingAnnual: 'Facturation annuelle',
  billingMonthly: 'Facturation mensuelle',
  billingFrom: 'Facturation mensuelle, à partir de',
};

export function buildLocale(html, locale) {
  const { strings, head, jsonld } = locale.module;
  let out = html;
  const applied = new Map();
  const problems = [];
  const count = (key, n) => applied.set(key, (applied.get(key) || 0) + n);

  const swap = (from, to, label) => {
    if (!out.includes(from)) {
      problems.push(`[${locale.code}] motif introuvable (${label}) : ${from.slice(0, 55)}`);
      return;
    }
    out = out.split(from).join(to);
  };

  // --- aria-label des maquettes décoratives -------------------------------
  for (const [key, value] of Object.entries(strings)) {
    const re = new RegExp(`aria-label="[^"]*"(\\s+data-i18n-label="${escapeRe(key)}")`, 'g');
    let n = 0;
    out = out.replace(re, (_, tail) => {
      n++;
      return `aria-label="${attr(value)}"${tail}`;
    });
    if (n) count(key, n);
  }

  // --- contenu balisé : borné sur la balise porteuse ----------------------
  for (const match of html.matchAll(/<([a-z0-9]+)[^>]*?data-i18n-html="([^"]+)"/gis)) {
    const [, tag, key] = match;
    if (!(key in strings)) continue;
    const re = new RegExp(
      `(<${tag}\\b[^>]*data-i18n-html="${escapeRe(key)}"[^>]*>)([\\s\\S]*?)(</${tag}>)`,
      'gi'
    );
    let n = 0;
    out = out.replace(re, (_, open, __, close) => {
      n++;
      return open + strings[key] + close;
    });
    if (n) count(key, n);
  }

  // --- contenu texte : borné sur la première balise fermante --------------
  for (const [key, value] of Object.entries(strings)) {
    const re = new RegExp(`(data-i18n="${escapeRe(key)}"[^>]*>)([^<]*)(</)`, 'g');
    let n = 0;
    out = out.replace(re, (_, open, __, close) => {
      n++;
      return open + value + close;
    });
    if (n) count(key, n);
  }

  // --- aucune clé du HTML ne doit rester en français ----------------------
  const keysInHtml = new Set(
    [...html.matchAll(/data-i18n(?:-html|-label)?="([^"]+)"/g)].map((m) => m[1])
  );
  for (const key of keysInHtml) {
    if (!(key in strings)) problems.push(`[${locale.code}] clé sans traduction : ${key}`);
    else if (!applied.get(key)) problems.push(`[${locale.code}] clé non appliquée : ${key}`);
  }

  // --- métadonnées de la page --------------------------------------------
  swap(`<html lang="${SOURCE.code}">`, `<html lang="${locale.code}">`, 'lang');
  swap(`<title>${FR.title}</title>`, `<title>${head.title}</title>`, 'title');
  swap(`content="${FR.description}"`, `content="${attr(head.description)}"`, 'meta description');
  swap(
    `<meta property="og:title" content="${FR.ogTitle}" />`,
    `<meta property="og:title" content="${attr(head.ogTitle)}" />`,
    'og:title'
  );
  swap(`content="${FR.ogDescription}"`, `content="${attr(head.ogDescription)}"`, 'og:description');
  swap(`content="${FR.ogImageAlt}"`, `content="${attr(head.ogImageAlt)}"`, 'og:image:alt');
  swap(
    `<link rel="canonical" href="https://saksae.com${SOURCE.path}" />`,
    `<link rel="canonical" href="https://saksae.com${locale.path}" />`,
    'canonical'
  );
  swap(
    `<meta property="og:url" content="https://saksae.com${SOURCE.path}" />`,
    `<meta property="og:url" content="https://saksae.com${locale.path}" />`,
    'og:url'
  );
  const alternates = ALL.filter((l) => l.code !== locale.code)
    .map((l) => `\n    <meta property="og:locale:alternate" content="${l.ogLocale}" />`)
    .join('');
  swap(
    `<meta property="og:locale" content="${SOURCE.ogLocale}" />`,
    `<meta property="og:locale" content="${locale.ogLocale}" />${alternates}`,
    'og:locale'
  );

  // --- sélecteur de langue : la page courante n'est plus un lien ----------
  let switcherCount = 0;
  out = out.replace(/<nav\b[^>]*data-lang-switcher[\s\S]*?<\/nav>/g, (block) => {
    switcherCount++;
    // Les deux styles sont lus dans le bloc lui-même : ils restent alignés
    // sur index.html sans être dupliqués ici.
    const currentClass = (block.match(/<span\b[^>]*data-lang-current="[^"]*"[^>]*class="([^"]*)"/) || [])[1];
    const linkClass = (block.match(/<a\b[^>]*class="([^"]*)"/) || [])[1];
    if (!currentClass || !linkClass) {
      problems.push(`[${locale.code}] styles du sélecteur introuvables`);
      return block;
    }
    let next = block;
    // La langue source redevient un lien, avec le style d'un lien.
    next = next.replace(
      new RegExp(`<span\\b[^>]*data-lang-current="${SOURCE.code}"[^>]*>([\\s\\S]*?)</span>`),
      (_, inner) =>
        `<a href="${SOURCE.path}" hreflang="${SOURCE.code}" class="${linkClass}" aria-label="${attr(SOURCE.switchLabel)}">${inner}</a>`
    );
    // La langue courante devient inerte, avec le style courant.
    next = next.replace(
      new RegExp(`<a\\b[^>]*href="${locale.path}"[^>]*>([\\s\\S]*?)</a>`),
      (_, inner) =>
        `<span data-lang-current="${locale.code}" aria-current="true" class="${currentClass}">${inner}</span>`
    );
    return next;
  });
  if (switcherCount !== 2) {
    problems.push(`[${locale.code}] sélecteur : ${switcherCount} bloc(s) réécrit(s), 2 attendus`);
  }

  // --- police propre à la langue -----------------------------------------
  if (locale.font) {
    swap(
      '<link rel="stylesheet" href="/css/styles.css" />',
      `<link rel="preload" as="font" type="font/woff2" href="/assets/noto-sans-thai.woff2" crossorigin />\n    <link rel="stylesheet" href="/css/styles.css" />`,
      'preload police'
    );
  }

  // --- données structurées ------------------------------------------------
  out = out.replace(/"inLanguage": "fr-FR"/g, `"inLanguage": "${locale.code}"`);
  swap(
    `"url": "https://saksae.com${SOURCE.path}",\n            "inLanguage"`,
    `"url": "https://saksae.com${locale.path}",\n            "inLanguage"`,
    'JSON-LD url'
  );
  swap(`"description": "${FR.description}",`, `"description": "${attr(head.description)}",`, 'JSON-LD description');
  FR.planNames.forEach((fr, i) => {
    swap(`"name": "${fr}",`, `"name": "${attr(strings[`pricing.p${i + 1}.name`])}",`, `JSON-LD nom p${i + 1}`);
  });
  FR.planTargets.forEach((fr, i) => {
    swap(`"category": "${fr}",`, `"category": "${attr(strings[`pricing.p${i + 1}.target`])}",`, `JSON-LD cible p${i + 1}`);
  });
  // L'ordre compte : le libellé long contient le court.
  swap(`"name": "${FR.billingFrom}"`, `"name": "${attr(jsonld.billingFrom)}"`, 'JSON-LD facturation min');
  out = out.replace(new RegExp(`"name": "${escapeRe(FR.billingAnnual)}"`, 'g'), `"name": "${attr(jsonld.billingAnnual)}"`);
  out = out.replace(new RegExp(`"name": "${escapeRe(FR.billingMonthly)}"`, 'g'), `"name": "${attr(jsonld.billingMonthly)}"`);

  return { html: out, applied, problems };
}
