/**
 * Registre des langues du site.
 *
 * Le français est la source : il vit dans index.html et n'a pas de fichier de
 * traduction. Chaque autre langue apporte `strings` (la contrepartie de chaque
 * clé `data-i18n`), `head` (les métadonnées que le HTML ne peut pas porter) et
 * `jsonld` (les libellés des données structurées).
 *
 * `path` est l'URL servie, `dir` le sens d'écriture, `font` la famille à
 * appliquer quand le latin ne suffit pas.
 */
import * as en from './en.mjs';
import * as vi from './vi.mjs';
import * as th from './th.mjs';

/** La langue source. Pas de fichier : c'est index.html. */
export const SOURCE = {
  code: 'fr',
  path: '/',
  hreflang: 'fr',
  ogLocale: 'fr_FR',
  label: 'FR',
  name: 'Français',
  switchLabel: 'Passer en français',
};

export const TARGETS = [
  {
    code: 'en',
    path: '/en/',
    hreflang: 'en',
    ogLocale: 'en_US',
    label: 'EN',
    name: 'English',
    switchLabel: 'Switch to English',
    module: en,
  },
  {
    code: 'vi',
    path: '/vi/',
    hreflang: 'vi',
    ogLocale: 'vi_VN',
    label: 'VI',
    name: 'Tiếng Việt',
    switchLabel: 'Chuyển sang tiếng Việt',
    // Inter couvre le vietnamien via son sous-ensemble dédié : le
    // unicode-range fait que le fichier n'est téléchargé que si la page en a
    // besoin. Rien à déclarer ici.
    module: vi,
  },
  {
    code: 'th',
    path: '/th/',
    hreflang: 'th',
    ogLocale: 'th_TH',
    label: 'TH',
    name: 'ไทย',
    switchLabel: 'เปลี่ยนเป็นภาษาไทย',
    // Inter ne contient aucun glyphe thaï : cette page a sa propre famille,
    // chargée uniquement ici.
    font: 'Noto Sans Thai',
    module: th,
  },
];

export const ALL = [SOURCE, ...TARGETS];

/** Ensemble hreflang commun à toutes les pages, réciproque par construction. */
export const ALTERNATES = [
  ...ALL.map((l) => ({ hreflang: l.hreflang, href: `https://saksae.com${l.path}` })),
  { hreflang: 'x-default', href: `https://saksae.com${SOURCE.path}` },
];
