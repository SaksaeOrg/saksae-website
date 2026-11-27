/**
 * Refonte 2027 : contrôles de la sortie publiée (../docs), à lancer après
 * deploy-v2.mjs. Échoue au premier défaut bloquant.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES, LANGS } from './deploy-v2.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const docs = join(here, '..', 'docs');
let failed = 0;
const ok = (label, cond, detail = '') => {
  console.log(`${cond ? 'ok  ' : 'ÉCHEC'} ${label}${!cond && detail ? ` — ${detail}` : ''}`);
  if (!cond) failed += 1;
};

for (const lang of LANGS) {
  for (const page of PAGES) {
    const file = join(docs, lang.dir, page);
    const where = `/${lang.dir}${page}`;
    if (!existsSync(file)) { ok(`${where} existe`, false); continue; }
    const html = await readFile(file, 'utf8');
    const problems = [];
    if (!html.includes(`<html lang="${lang.code}"`)) problems.push('attribut lang');
    if (html.includes('noindex')) problems.push('noindex encore présent');
    if (!html.includes('rel="canonical"')) problems.push('canonique absente');
    if ((html.match(/hreflang="/g) || []).length < LANGS.length + 1) problems.push('hreflang incomplets');
    if (html.includes('images.unsplash.com')) problems.push('photo encore servie par Unsplash');
    if ((html.match(/<h1[\s>]/g) || []).length !== 1) problems.push('un seul h1 attendu');
    // chaque lien et ressource relatifs doivent exister dans docs/
    const refs = [...html.matchAll(/(?:href|src)="(\.{1,2}\/[^"#?]*)/g)].map((m) => m[1]);
    const srcsets = [...html.matchAll(/srcset="([^"]*)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(' ')[0]));
    for (const ref of [...refs, ...srcsets].filter((r) => r.startsWith('.'))) {
      const target = normalize(join(docs, lang.dir, ref.endsWith('/') ? `${ref}index.html` : ref));
      if (!existsSync(target)) problems.push(`lien cassé ${ref}`);
    }
    ok(`${where}`, problems.length === 0, [...new Set(problems)].slice(0, 4).join(', '));
  }
}
const sitemap = await readFile(join(docs, 'sitemap.xml'), 'utf8');
ok('sitemap : une entrée par page et par langue', (sitemap.match(/<loc>/g) || []).length === PAGES.length * LANGS.length);
ok('CNAME publié', existsSync(join(docs, 'CNAME')));

console.log(failed ? `\n${failed} contrôle(s) en échec.` : '\nTous les contrôles passent.');
process.exit(failed ? 1 : 0);
