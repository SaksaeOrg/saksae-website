/**
 * Produit assets/og-image-<code>.png, l'aperçu affiché par LinkedIn, Slack et X,
 * en une version par langue.
 *
 * Script ponctuel : il n'est pas branché sur `npm run deploy`. À relancer quand
 * le titre d'une page change, ou qu'une langue s'ajoute.
 *
 *     npm install --no-save playwright
 *     npx playwright install chromium     # ou : export CHROMIUM_PATH=/chemin/vers/chrome
 *     node src/build-og.mjs
 *
 * Le texte est repris des fichiers de locale plutôt que ressaisi : un aperçu
 * qui promet autre chose que la page nuit au taux de clic, et deux sources de
 * vérité finiraient par diverger.
 *
 * Le rendu passe par un navigateur, pas par une bibliothèque d'images : c'est
 * ce qui permet de réutiliser telles quelles la mise en page, les polices
 * auto-hébergées et la trame de la page d'accueil.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE, TARGETS } from './locales/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(HERE, 'og-image.html');
const ASSETS = join(HERE, '..', 'assets');

const LATIN_STACK = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const THAI_STACK = "'Inter', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, sans-serif";

/** Le français est la source : ses chaînes vivent dans index.html, pas dans une locale. */
const FR_OG = {
  tag: 'Exécution Business IA',
  headline:
    '#1 plateforme business IA<br /><span class="muted">pour Indépendants, TPE/PME</span>',
  footer: "Centralisez vos outils, détectez vos priorités, passez à l'action.",
};

function variants() {
  const out = [{ code: SOURCE.code, ...FR_OG, stack: LATIN_STACK }];
  for (const locale of TARGETS) {
    const { strings, head } = locale.module;
    out.push({
      code: locale.code,
      tag: head.ogTag,
      headline: strings['hero.headline'],
      footer: head.ogDescription,
      stack: locale.font === 'Noto Sans Thai' ? THAI_STACK : LATIN_STACK,
    });
  }
  return out;
}

/**
 * Réduit à 256 couleurs : de l'aplat et du texte, donc le poids est divisé par
 * deux sans perte visible. Sans Pillow, le PNG pleine couleur reste valable —
 * juste plus lourd.
 */
function quantise(file) {
  try {
    execFileSync('python3', ['-c', `
from PIL import Image
im = Image.open(${JSON.stringify(file)}).convert('RGB')
im.quantize(colors=256, method=Image.MEDIANCUT, dither=Image.NONE).save(${JSON.stringify(file)}, 'PNG', optimize=True)
`.trim()], { stdio: 'pipe' });
    return readFileSync(file).length;
  } catch {
    return null;
  }
}

async function main() {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error('playwright est absent. Installer :  npm install --no-save playwright');
    process.exit(1);
  }

  const template = readFileSync(TEMPLATE, 'utf8');
  // CHROMIUM_PATH permet d'utiliser un navigateur déjà présent plutôt que
  // d'en faire télécharger un par `npx playwright install`.
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
  );
  console.log('aperçus sociaux :');

  for (const v of variants()) {
    const html = template
      .replace('{{LANG}}', v.code)
      .replace('{{FONT_STACK}}', v.stack)
      .replace('{{TAG}}', v.tag)
      .replace('{{HEADLINE}}', v.headline)
      .replace('{{FOOTER}}', v.footer);

    // Écrit à côté du gabarit pour que les chemins relatifs des polices tiennent.
    const tmp = join(HERE, `.og-${v.code}.html`);
    writeFileSync(tmp, html);

    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    await page.goto(`file://${tmp}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Les langues ne tiennent pas dans la même place : le vietnamien déborde
    // sur trois lignes là où le français en tient deux. On réduit le corps
    // jusqu'à ce que le titre rentre, plutôt que de régler chaque langue à la
    // main — la prochaine langue ajoutée sera traitée de la même façon.
    const fitted = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const MAX = 210;
      let size = parseFloat(getComputedStyle(h1).fontSize);
      while (h1.getBoundingClientRect().height > MAX && size > 46) {
        size -= 2;
        h1.style.fontSize = size + 'px';
      }
      return size;
    });
    await page.waitForTimeout(400);
    const out = join(ASSETS, `og-image-${v.code}.png`);
    await page.screenshot({ path: out });
    await page.close();
    unlinkSync(tmp);

    const before = readFileSync(out).length;
    const after = quantise(out) ?? before;
    const saved = before === after ? '' : `, ${(before / 1024).toFixed(0)} Ko avant palette`;
    console.log(`  og-image-${v.code}.png  ${(after / 1024).toFixed(1)} Ko  (titre ${fitted}px${saved})`);
  }

  await browser.close();
}

main();
