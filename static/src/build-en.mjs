/**
 * Produit la version anglaise de la page à partir de la française.
 *
 * Le français est la source : index.html porte le texte, marqué par
 * `data-i18n` (contenu texte), `data-i18n-html` (contenu balisé) et
 * `data-i18n-label` (attribut aria-label). Ce module y substitue les
 * traductions de src/i18n-en.mjs et ajuste les métadonnées propres à la langue.
 *
 * La substitution est ciblée plutôt que faite via un parseur HTML : les
 * parseurs re-sérialisent le document et introduisent des écarts (balises
 * auto-fermantes réécrites, attributs normalisés). Ici seul le texte traduit
 * change, donc les deux pages ont exactement la même structure — ce qui rend
 * aussi les écarts faciles à repérer.
 *
 * Chaque substitution est comptée et vérifiée : une clé qui ne s'applique pas
 * fait échouer le build plutôt que de laisser passer du français dans la page
 * anglaise.
 */

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function buildEnglish(html, strings, head) {
  let out = html;
  const applied = new Map();
  const problems = [];

  const count = (key, n) => applied.set(key, (applied.get(key) || 0) + n);

  // --- aria-label des maquettes décoratives -------------------------------
  for (const [key, value] of Object.entries(strings)) {
    const re = new RegExp(`aria-label="[^"]*"(\\s+data-i18n-label="${escapeRe(key)}")`, 'g');
    let n = 0;
    out = out.replace(re, (_, tail) => {
      n++;
      return `aria-label="${value.replace(/"/g, '&quot;')}"${tail}`;
    });
    if (n) count(key, n);
  }

  // --- contenu balisé : on borne sur la balise porteuse -------------------
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

  // --- toute clé présente dans le HTML doit avoir été appliquée -----------
  const keysInHtml = new Set(
    [...html.matchAll(/data-i18n(?:-html|-label)?="([^"]+)"/g)].map((m) => m[1])
  );
  for (const key of keysInHtml) {
    if (!(key in strings)) problems.push(`clé sans traduction : ${key}`);
    else if (!applied.get(key)) problems.push(`clé non appliquée : ${key}`);
  }

  // --- métadonnées propres à la langue ------------------------------------
  const swap = (from, to, label) => {
    if (!out.includes(from)) {
      problems.push(`motif introuvable (${label}) : ${from.slice(0, 60)}`);
      return;
    }
    out = out.split(from).join(to);
  };

  swap('<html lang="fr">', '<html lang="en">', 'attribut lang');
  swap(
    '<title>SAKSAE — La plateforme d\'Exécution Business IA</title>',
    `<title>${head.title}</title>`,
    'title'
  );
  swap(
    "content=\"SAKSAE centralise vos outils, analyse vos données d'opérations et de revenus, et les transforme en actions. La plateforme d'Exécution Business IA pour Indépendants, TPE et PME.\"",
    `content="${head.description}"`,
    'meta description'
  );
  swap(
    '<meta property="og:title" content="SAKSAE — La plateforme d\'Exécution Business IA" />',
    `<meta property="og:title" content="${head.ogTitle}" />`,
    'og:title'
  );
  swap(
    'content="Centralisez vos outils, détectez vos priorités, passez à l\'action. Pour Indépendants, TPE et PME."',
    `content="${head.ogDescription}"`,
    'og:description'
  );
  swap(
    '<link rel="canonical" href="https://saksae.com/" />',
    '<link rel="canonical" href="https://saksae.com/en/" />',
    'canonical'
  );
  swap(
    '<meta property="og:url" content="https://saksae.com/" />',
    '<meta property="og:url" content="https://saksae.com/en/" />',
    'og:url'
  );
  swap(
    '<meta property="og:locale" content="fr_FR" />',
    '<meta property="og:locale" content="en_US" />\n    <meta property="og:locale:alternate" content="fr_FR" />',
    'og:locale'
  );
  swap(
    'content="SAKSAE — #1 plateforme business IA pour Indépendants, TPE/PME"',
    `content="${head.ogImageAlt}"`,
    'og:image:alt'
  );

  // Le sélecteur pointe vers l'autre langue : ici, retour au français. On
  // réécrit l'intérieur du lien sans toucher à sa mise en forme.
  let links = 0;
  out = out.replace(/<a\b[^>]*data-lang-link[\s\S]*?<\/a>/g, (block) => {
    links++;
    return block
      .replace('href="/en/"', 'href="/"')
      .replace('hreflang="en"', 'hreflang="fr"')
      .replace('aria-label="Switch to English"', 'aria-label="Passer en français"')
      .replace(/(>\s*)en(\s*<\/a>)/, '$1fr$2');
  });
  if (links !== 2) problems.push(`sélecteur de langue : ${links} lien(s) réécrit(s), 2 attendus`);

  // --- données structurées ------------------------------------------------
  out = out.replace(/"inLanguage": "fr-FR"/g, '"inLanguage": "en"');
  // Seule la SoftwareApplication pointe vers /en/ : Organization et WebSite
  // décrivent le site entier, leur URL reste la racine.
  swap(
    '"url": "https://saksae.com/",\n            "inLanguage"',
    '"url": "https://saksae.com/en/",\n            "inLanguage"',
    'JSON-LD url'
  );
  swap(
    '"description": "SAKSAE centralise vos outils, analyse vos données d\'opérations et de revenus, et les transforme en actions. La plateforme d\'Exécution Business IA pour Indépendants, TPE et PME.",',
    `"description": "${head.description}",`,
    'JSON-LD description'
  );
  for (const [i, plan] of ['p1', 'p2', 'p3', 'p4'].entries()) {
    const frName = { p1: 'Indépendant', p2: 'Équipe', p3: 'Croissance', p4: 'Entreprise' }[plan];
    const frTarget = { p1: '1 utilisateur', p2: '2 à 9 utilisateurs', p3: '10 à 20 utilisateurs', p4: '20+ utilisateurs' }[plan];
    swap(`"name": "${frName}",`, `"name": "${strings[`pricing.${plan}.name`]}",`, `JSON-LD nom ${plan}`);
    swap(`"category": "${frTarget}",`, `"category": "${strings[`pricing.${plan}.target`]}",`, `JSON-LD cible ${plan}`);
  }
  out = out.replace(/"name": "Facturation annuelle"/g, '"name": "Annual billing"');
  out = out.replace(/"name": "Facturation mensuelle"/g, '"name": "Monthly billing"');
  out = out.replace(/"name": "Facturation mensuelle, à partir de"/g, '"name": "Monthly billing, from"');

  return { html: out, applied, problems };
}
