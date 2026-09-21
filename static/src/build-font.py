#!/usr/bin/env python3
"""
Produit les polices auto-hébergées de assets/, à partir de celles servies par
Google Fonts.

Script ponctuel : il n'est pas branché sur `npm run build`. À relancer
seulement si la plage de caractères doit évoluer, si une langue s'ajoute, ou
pour reprendre une version plus récente.

    python3 -m venv /tmp/fontenv
    /tmp/fontenv/bin/pip install "fonttools[woff]" brotli
    /tmp/fontenv/bin/python src/build-font.py

Trois fichiers sont produits :

    inter-latin.woff2        français, anglais — chargé sur toutes les pages
    inter-vietnamese.woff2   vietnamien — chargé via unicode-range, donc
                             uniquement quand la page contient ces caractères
    noto-sans-thai.woff2     thaï — Inter ne contient aucun glyphe thaï

Sur chacun, deux réductions : l'axe `wght` est ramené de 100-900 à 400-700,
les seules graisses employées, et les glyphes sont limités à la plage utile.

L'axe `opsz` d'Inter est conservé. Le figer gagnerait 15 Ko mais
`font-optical-sizing: auto` cesserait d'agir : le texte s'élargit alors de
6,4 %, ce qui décale toute la mise en page. Mesuré, pas supposé.

Inter et Noto Sans Thai sont sous SIL Open Font License 1.1 ; voir
assets/inter-LICENSE.txt et assets/noto-sans-thai-LICENSE.txt.
"""
import re
import sys
import urllib.request
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parent / 'assets'
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'

# Plage volontairement plus large que les caractères présents aujourd'hui :
# une retouche de copy ne doit pas faire tomber un caractère sur la police de
# repli. Note : U+2192 et U+2713, employés dans les maquettes, sont absents de
# la source Google et déjà rendus par une police de repli.
LATIN = (
    list(range(0x0020, 0x0100))
    + [0x0131, 0x0152, 0x0153]
    + [0x02BB, 0x02BC, 0x02C6, 0x02DA, 0x02DC]
    + list(range(0x2000, 0x2070))
    + [0x20AC, 0x2122, 0x2212]
)

# Le vietnamien empile les diacritiques : les formes combinantes sont ici
# nécessaires, contrairement au latin.
VIETNAMESE = (
    [0x0102, 0x0103, 0x0110, 0x0111, 0x0128, 0x0129, 0x0168, 0x0169]
    + [0x01A0, 0x01A1, 0x01AF, 0x01B0]
    + list(range(0x0300, 0x0330))
    + list(range(0x1EA0, 0x1EFA))
    + [0x20AB]
)

THAI = list(range(0x0E00, 0x0E80)) + [0x0020, 0x00A0] + list(range(0x2000, 0x2070))

FONTS = [
    {
        'out': 'inter-latin.woff2',
        'css': ('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@'
                '14..32,400..700&display=swap'),
        'subset': 'latin',
        'unicodes': LATIN,
    },
    {
        'out': 'inter-vietnamese.woff2',
        'css': ('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@'
                '14..32,400..700&display=swap'),
        'subset': 'vietnamese',
        'unicodes': VIETNAMESE,
    },
    {
        'out': 'noto-sans-thai.woff2',
        'css': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400..700&display=swap',
        'subset': 'thai',
        'unicodes': THAI,
    },
]


def source_url(css_url: str, subset: str) -> str:
    req = urllib.request.Request(css_url, headers={'User-Agent': UA})
    css = urllib.request.urlopen(req).read().decode()
    blocks = re.findall(rf'/\*\s*{subset}\s*\*/\s*@font-face\s*{{(.*?)}}', css, re.S)
    if not blocks:
        sys.exit(f'sous-ensemble « {subset} » introuvable dans {css_url}')
    return re.search(r'url\((https[^)]+)\)', blocks[0]).group(1)


def build(spec: dict) -> None:
    url = source_url(spec['css'], spec['subset'])
    raw = urllib.request.urlopen(url).read()
    tmp = ASSETS / '.source.woff2'
    tmp.write_bytes(raw)

    font = TTFont(tmp)
    # L'ordre compte : instancier avant de sous-ensembler laisse la table gvar
    # dans un état que le subsetter ne sait pas relire (KeyError '.notdef').
    options = Options()
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.notdef_outline = True
    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=spec['unicodes'])
    subsetter.subset(font)
    instancer.instantiateVariableFont(
        font, {'wght': (400, 700)}, inplace=True, updateFontNames=False
    )

    out = ASSETS / spec['out']
    font.flavor = 'woff2'
    font.save(out)
    tmp.unlink()

    after = out.stat().st_size
    glyphs = len(TTFont(out).getGlyphOrder())
    print(f"  {spec['out']:26} {len(raw) / 1024:6.1f} Ko -> {after / 1024:5.1f} Ko"
          f"  ({glyphs} glyphes)")


if __name__ == '__main__':
    print('polices produites :')
    for spec in FONTS:
        build(spec)
