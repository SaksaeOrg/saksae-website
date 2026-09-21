#!/usr/bin/env python3
"""
Produit assets/inter-latin-var.woff2 à partir de la police servie par Google.

Script ponctuel : il n'est pas branché sur `npm run build`. À relancer
seulement si la plage de caractères doit évoluer, ou pour reprendre une
version plus récente d'Inter.

    python3 -m venv /tmp/fontenv
    /tmp/fontenv/bin/pip install "fonttools[woff]" brotli
    /tmp/fontenv/bin/python src/build-font.py

Deux réductions sont appliquées à la source (71,2 Ko) :

  1. l'axe `wght` est ramené de 100-900 à 400-700, les seules graisses
     employées par la page ;
  2. les glyphes sont limités à la plage latine utile.

L'axe `opsz` est conservé. Le figer descendrait le fichier à 27,8 Ko, mais
`font-optical-sizing: auto` cesserait d'agir : le texte s'élargit alors de
6,4 %, ce qui décale toute la mise en page. Mesuré, pas supposé.

Les diacritiques combinants (U+0300-U+036F) sont volontairement exclus :
ils ajoutent 7 Ko pour couvrir des formes décomposées que le contenu
n'utilise pas — tout y est précomposé.

Inter est sous SIL Open Font License 1.1 ; voir assets/inter-LICENSE.txt.
"""
import os
import sys
import urllib.request
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / 'assets' / 'inter-latin-var.woff2'

GOOGLE_CSS = (
    'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@'
    '14..32,300;14..32,400;14..32,450;14..32,500;14..32,600;14..32,700&display=swap'
)
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'

# Plage volontairement plus large que les 105 caractères présents aujourd'hui :
# une retouche de copy ne doit pas faire tomber un caractère sur la police de
# repli. Note : U+2192 et U+2713, employés dans les maquettes, sont absents de
# la source Google et déjà rendus par une police de repli.
UNICODES = (
    list(range(0x0020, 0x0100))   # latin de base + supplément latin-1
    + [0x0131, 0x0152, 0x0153]    # ı Œ œ
    + [0x02BB, 0x02BC, 0x02C6, 0x02DA, 0x02DC]
    + list(range(0x2000, 0x2070))  # espaces, tirets, guillemets, puces
    + [0x20AC, 0x2122, 0x2212]     # € ™ −
)


def fetch_source() -> bytes:
    """Récupère le sous-ensemble latin que Google sert aux navigateurs récents."""
    req = urllib.request.Request(GOOGLE_CSS, headers={'User-Agent': UA})
    css = urllib.request.urlopen(req).read().decode()

    # Le dernier bloc @font-face est le sous-ensemble latin.
    import re
    blocks = re.findall(r'/\*\s*latin\s*\*/\s*@font-face\s*\{(.*?)\}', css, re.S)
    if not blocks:
        sys.exit('bloc @font-face « latin » introuvable dans la CSS Google')
    url = re.search(r'url\((https[^)]+)\)', blocks[0]).group(1)
    print(f'source : {url.split("/")[-1]}')
    return urllib.request.urlopen(url).read()


def main() -> None:
    raw = fetch_source()
    tmp = OUT.parent / '.inter-source.woff2'
    tmp.write_bytes(raw)
    before = len(raw)

    font = TTFont(tmp)

    # L'ordre compte : instancier avant de sous-ensembler laisse la table gvar
    # dans un état que le subsetter ne sait pas relire (KeyError '.notdef').
    options = Options()
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.notdef_outline = True
    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=UNICODES)
    subsetter.subset(font)

    instancer.instantiateVariableFont(
        font, {'wght': (400, 700)}, inplace=True, updateFontNames=False
    )

    font.flavor = 'woff2'
    font.save(OUT)
    tmp.unlink()

    after = OUT.stat().st_size
    axes = {a.axisTag: (a.minValue, a.maxValue) for a in TTFont(OUT)['fvar'].axes}
    print(f'écrit  : {OUT.relative_to(HERE.parent)}')
    print(f'poids  : {before / 1024:.1f} Ko -> {after / 1024:.1f} Ko '
          f'({100 * (before - after) / before:.0f} % de moins)')
    print(f'axes   : {axes}')
    print(f'glyphes: {len(TTFont(OUT).getGlyphOrder())}')


if __name__ == '__main__':
    main()
