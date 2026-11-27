# Étape 7 : traductions de la v2. Le français reste la source unique.
#
#   python3 -I v2/i18n.py extract   → v2/i18n/fr.json (tous les textes visibles et attributs)
#   python3 -I v2/i18n.py build     → v2/en/, v2/vi/, v2/th/ à partir de v2/i18n/<code>.json
#
# Un texte absent d'un dictionnaire fait échouer la génération : aucune page ne
# part à moitié traduite.
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).parent
I18N = ROOT / 'i18n'
PAGES = ['index.html', 'agences.html', 'societes-de-services.html', 'cabinets-conseil.html', 'organismes-de-formation.html',
         'commercants-franchises.html', 'startups.html', 'comptables.html', 'tarifs.html']
ATTRS = ('alt', 'aria-label', 'title', 'placeholder', 'data-t-annual', 'data-t-monthly', 'data-t-price')
LANGS = {
    'fr': {'path': '', 'hreflang': 'fr', 'label': 'Français'},
    'en': {'path': 'en/', 'hreflang': 'en', 'label': 'English'},
    'vi': {'path': 'vi/', 'hreflang': 'vi', 'label': 'Tiếng Việt'},
    'th': {'path': 'th/', 'hreflang': 'th', 'label': 'ไทย'},
}
# Rien à traduire : nombres, montants, symboles, marques, noms de langues
SKIP = re.compile(r'^[\s\d€%+\-–—·/:,.()→←✦?×]*$')
KEEP = {'SAKSAE', 'Français', 'English', 'Tiếng Việt', 'ไทย', '© 2026 SAKSAE', 'OPCO'}


class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.texts, self.skip = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.skip += 1
        a = dict(attrs)
        for k in ATTRS:
            if a.get(k):
                self.texts.append(a[k])
        if tag == 'meta' and a.get('name') == 'description' and a.get('content'):
            self.texts.append(a['content'])

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.texts.append(data)


def keep(t):
    t = t.strip()
    return bool(t) and ('{' in t or not SKIP.match(t)) and t not in KEEP


def extract():
    seen = {}
    for p in PAGES:
        c = Collector()
        c.feed((ROOT / p).read_text())
        for t in c.texts:
            t = ' '.join(t.split())
            if keep(t):
                seen.setdefault(t, '')
    I18N.mkdir(exist_ok=True)
    (I18N / 'fr.json').write_text(json.dumps(seen, ensure_ascii=False, indent=1))
    print(f'{len(seen)} textes à traduire → v2/i18n/fr.json')


def translate_page(src, code, table, missing):
    lang = LANGS[code]

    def tr(text):
        norm = ' '.join(text.split())
        if not keep(norm):
            return text
        out = table.get(norm)
        if not out:
            missing.add(norm)
            return text
        lead = text[:len(text) - len(text.lstrip())]
        trail = text[len(text.rstrip()):]
        return lead + html.escape(out, quote=False) + trail

    # textes entre balises, hors script et style
    parts = re.split(r'(<script.*?</script>|<style.*?</style>|<[^>]+>)', src, flags=re.S)
    for i, part in enumerate(parts):
        if part and not part.startswith('<'):
            parts[i] = tr(html.unescape(part)) if keep(' '.join(html.unescape(part).split())) else part
        elif part.startswith('<') and not part.startswith(('<script', '<style')):
            def attr(m):
                v = html.unescape(m.group(2))
                n = ' '.join(v.split())
                return f'{m.group(1)}="{html.escape(table.get(n, v), quote=True)}"' if keep(n) else m.group(0)
            part = re.sub(r'\b(alt|aria-label|title|placeholder|data-t-annual|data-t-monthly|data-t-price)="([^"]*)"', lambda m: (missing.add(' '.join(html.unescape(m.group(2)).split())) if keep(' '.join(html.unescape(m.group(2)).split())) and ' '.join(html.unescape(m.group(2)).split()) not in table else None) or attr(m), part)
            if part.startswith('<meta name="description"'):
                part = re.sub(r'content="([^"]*)"', lambda m: f'content="{html.escape(table.get(" ".join(html.unescape(m.group(1)).split()), html.unescape(m.group(1))), quote=True)}"', part)
            parts[i] = part
    out = ''.join(parts)
    # langue, chemins relatifs un niveau plus bas, sélecteur de langue
    out = out.replace('<html lang="fr">', f'<html lang="{code}">', 1)
    out = re.sub(r'(href|src|srcset)="\.\./', r'\1="../../', out)
    out = re.sub(r'(srcset="[^"]*")', lambda m: m.group(1).replace(', ../assets', ', ../../assets'), out)
    out = out.replace('src="./main.js"', 'src="../main.js"')
    if code == 'th':
        out = out.replace('<body>', '<body class="lang-th">', 1)
    return out


def lang_links(page_html, page, code):
    """Le sélecteur du footer pointe vers la même page dans chaque langue."""
    up = '' if code == 'fr' else '../'
    def link(c):
        meta = LANGS[c]
        href = f'./{up}{meta["path"]}{page}'.replace('/./', '/') if c != code else f'./{page}'
        cur = ' aria-current="page" class="text-ink font-semibold"' if c == code else ''
        return f'<a href="{href}" hreflang="{meta["hreflang"]}"{cur}>{meta["label"]}</a>'
    # repère data-lang-nav : le libellé aria-label, lui, est traduit
    def repl(m):
        return m.group(1) + ''.join(link(c) for c in LANGS) + '</nav>'
    return re.sub(r'(<nav [^>]*data-lang-nav[^>]*>).*?</nav>', repl, page_html, flags=re.S)


def build():
    problems = []
    for page in PAGES:
        src = (ROOT / page).read_text()
        (ROOT / page).write_text(lang_links(src, page, 'fr'))
    for code in ('en', 'vi', 'th'):
        f = I18N / f'{code}.json'
        if not f.exists():
            problems.append(f'{code}.json manquant')
            continue
        table = {k: v for k, v in json.loads(f.read_text()).items() if v}
        missing = set()
        (ROOT / code).mkdir(exist_ok=True)
        for page in PAGES:
            out = translate_page((ROOT / page).read_text(), code, table, missing)
            (ROOT / code / page).write_text(lang_links(out, page, code))
        if missing:
            problems.append(f'{code} : {len(missing)} textes sans traduction, ex. {sorted(missing)[:3]}')
        else:
            print(f'/{code}/ : {len(PAGES)} pages')
    if problems:
        print('\n'.join(problems))
        sys.exit(1)


if __name__ == '__main__':
    {'extract': extract, 'build': build}[sys.argv[1]]()
