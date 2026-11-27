# Étape 6 : rapatrier les photos Unsplash dans le site (assets/photos/) pour ne
# plus dépendre de images.unsplash.com en production.
#
#   python3 -I v2/fetch_photos.py --dry-run   liste les fichiers et estime le poids, ne télécharge rien
#   python3 -I v2/fetch_photos.py             télécharge, puis réécrit les pages en <picture> AVIF + JPEG
#
# Les photos sont sous licence Unsplash (usage commercial libre, sans attribution
# obligatoire). Chaque fichier reprend l'identifiant de la photo d'origine.
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
OUT = ROOT.parent / 'assets' / 'photos'
URL = re.compile(r'https://images\.unsplash\.com/(photo-[0-9a-f-]+)\?w=(\d+)&h=(\d+)[^"\s,]*')
FORMATS = ['avif', 'jpg']


def variants():
    seen = {}
    for f in ROOT.glob('*.html'):
        for m in URL.finditer(f.read_text()):
            seen[(m.group(1), int(m.group(2)), int(m.group(3)))] = True
    return sorted(seen)


def local(photo, w, h, fmt):
    return f'{photo}-{w}x{h}.{fmt}'


def fetch(dry):
    items = variants()
    total = 0
    for photo, w, h in items:
        for fmt in FORMATS:
            url = f'https://images.unsplash.com/{photo}?w={w}&h={h}&fit=crop&q=72&fm={fmt}'
            dest = OUT / local(photo, w, h, fmt)
            if dry:
                req = urllib.request.Request(url, method='HEAD')
                with urllib.request.urlopen(req) as r:
                    total += int(r.headers.get('Content-Length', 0))
                continue
            if dest.exists():
                continue
            OUT.mkdir(parents=True, exist_ok=True)
            with urllib.request.urlopen(url) as r:
                data = r.read()
            dest.write_bytes(data)
            total += len(data)
    print(f'{len(items)} tailles × {len(FORMATS)} formats = {len(items) * len(FORMATS)} fichiers, {total / 1e6:.1f} Mo'
          + (' (estimation, rien téléchargé)' if dry else ' téléchargés'))


IMG = re.compile(r'<img (?P<attrs>[^>]*?src="https://images\.unsplash\.com/[^>]*?)/>')


def to_local(html):
    def repl(m):
        attrs = m.group('attrs')
        src = re.search(r'src="([^"]+)"', attrs).group(1)
        srcset = re.search(r'srcset="([^"]+)"', attrs).group(1)
        def conv(s, fmt):
            return URL.sub(lambda u: f'../assets/photos/{local(u.group(1), int(u.group(2)), int(u.group(3)), fmt)}', s)
        rest = re.sub(r'\s*(src|srcset)="[^"]*"', '', attrs)
        sizes = re.search(r'sizes="([^"]+)"', attrs).group(1)
        return (f'<picture><source type="image/avif" srcset="{conv(srcset, "avif")}" sizes="{sizes}" />'
                f'<img src="{conv(src, "jpg")}" srcset="{conv(srcset, "jpg")}" {rest.strip()} /></picture>')
    return IMG.sub(repl, html)


if __name__ == '__main__':
    dry = '--dry-run' in sys.argv
    fetch(dry)
    if not dry:
        for f in ROOT.glob('*.html'):
            f.write_text(to_local(f.read_text()))
        print('pages réécrites en <picture> AVIF + JPEG')
