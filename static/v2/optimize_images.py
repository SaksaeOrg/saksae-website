# Étape 6 : chaque photo reçoit plusieurs tailles (srcset) et une indication de
# largeur affichée (sizes), pour que le téléphone ne charge pas l'image du grand
# écran. Idempotent : relancé après build_pages.py, il ne double rien.
#   python3 -I v2/optimize_images.py
import re
from pathlib import Path

ROOT = Path(__file__).parent

# Largeur affichée de chaque famille d'image, du plus spécifique au plus général
SIZES = [
    ('tile-media', '(min-width: 768px) 312px, 76vw'),
    ('metier-card', '(min-width: 768px) 300px, 78vw'),
    ('module-visual', '(min-width: 900px) 560px, 92vw'),
]
WIDTHS = [400, 640, 960, 1280]
IMG = re.compile(r'<img (?P<before>[^>]*?)src="(?P<base>https://images\.unsplash\.com/photo-[0-9a-f-]+)\?w=(?P<w>\d+)&h=(?P<h>\d+)(?P<rest>[^"]*)"(?P<after>[^>]*)>')


def family(html, pos):
    # la classe de l'image elle-même, sinon celle du conteneur le plus proche
    window = html[max(0, pos - 600):pos + 300]
    for key, sizes in SIZES:
        if key in window[window.rfind('<a ') if key == 'metier-card' else 0:]:
            return sizes
    return '92vw'


def rewrite(html):
    def repl(m):
        tag = m.group(0)
        if 'srcset=' in tag:
            return tag
        w, h = int(m.group('w')), int(m.group('h'))
        ratio = h / w
        q = re.sub(r'&?q=\d+', '', m.group('rest')) + '&q=72'
        srcset = ', '.join(f"{m.group('base')}?w={x}&h={round(x * ratio)}{q} {x}w" for x in WIDTHS if x <= max(w * 1.5, 960))
        sizes = family(html, m.start())
        after = m.group('after').rstrip(' /')
        dec = '' if 'decoding=' in after else ' decoding="async"'
        return f'<img {m.group("before")}src="{m.group("base")}?w={w}&h={h}{q}" srcset="{srcset}" sizes="{sizes}"{after}{dec} />'
    return IMG.sub(repl, html)


for f in sorted(ROOT.glob('*.html')):
    t = f.read_text()
    n = rewrite(t)
    if n != t:
        f.write_text(n)
        print('srcset :', f.name, n.count('srcset='))
