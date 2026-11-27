# -*- coding: utf-8 -*-
# Image d'aperçu (Open Graph) de la v2, 1200 × 630, une par langue, rendue par le
# Chromium déjà installé par Playwright (rien n'est téléchargé) :
#   python3 -I v2/build_og.py
# Variable CHROMIUM_PATH pour pointer vers un autre Chrome.
import glob
import os
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).parent
ASSETS = ROOT.parent / 'assets'

TEXT = {
    'fr': ('Chaque matin, SAKSAE vous dit par quoi commencer.', 'Clients, devis, factures, équipe et réunions au même endroit.', 'Ce matin, 8 h',
           ['Relancer la facture de 2 400 €', 'Valider 2 demandes de congés', 'Envoyer le suivi de la réunion'], 'Valider', '✓ Tâche créée'),
    'en': ('Every morning, SAKSAE tells you where to start.', 'Clients, quotes, invoices, team and meetings in one place.', 'This morning, 8 am',
           ['Send a reminder for the €2,400 invoice', 'Approve 2 time-off requests', 'Send the meeting follow-up'], 'Approve', '✓ Task created'),
    'vi': ('Mỗi sáng, SAKSAE cho bạn biết nên bắt đầu từ đâu.', 'Khách hàng, báo giá, hóa đơn, đội ngũ và cuộc họp ở cùng một nơi.', 'Sáng nay, 8 giờ',
           ['Nhắc hóa đơn 2 400 €', 'Duyệt 2 đơn nghỉ phép', 'Gửi email theo dõi cuộc họp'], 'Duyệt', '✓ Đã tạo việc'),
    'th': ('ทุกเช้า SAKSAE บอกคุณว่าควรเริ่มจากอะไร', 'ลูกค้า ใบเสนอราคา ใบแจ้งหนี้ ทีม และการประชุม ในที่เดียว', 'เช้านี้ 8:00 น.',
           ['แจ้งเตือนใบแจ้งหนี้ 2 400 €', 'อนุมัติคำขอลา 2 รายการ', 'ส่งอีเมลติดตามผลการประชุม'], 'อนุมัติ', '✓ สร้างงานแล้ว'),
}
DOTS = ['#fbbf24', '#6366f1', '#10b981']


def page(code):
    h1, sub, head, prios, ok, done = TEXT[code]
    a = ASSETS.resolve().as_uri()
    rows = ''
    for i, (p, d) in enumerate(zip(prios, DOTS)):
        if i == 0:
            rows += f'<li class="done"><span><i style="background:{d}"></i>{p}</span><b class="ok">✓</b><em>{done}</em></li>'
        else:
            rows += f'<li><span><i style="background:{d}"></i>{p}</span><b class="btn">{ok}</b></li>'
    thai = ", 'Noto Sans Thai'" if code == 'th' else ''
    return f'''<!doctype html><html lang="{code}"><head><meta charset="utf-8"><style>
@font-face{{font-family:Inter;src:url('{a}/inter-latin.woff2') format('woff2');font-weight:400 700}}
@font-face{{font-family:Inter;src:url('{a}/inter-vietnamese.woff2') format('woff2');font-weight:400 700;unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}}
@font-face{{font-family:'Noto Sans Thai';src:url('{a}/noto-sans-thai.woff2') format('woff2');font-weight:400 700}}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:1200px;height:630px;overflow:hidden}}
body{{font-family:Inter{thai},-apple-system,sans-serif;background:#fff;color:#171717;display:grid;grid-template-columns:1fr 470px;gap:56px;padding:72px 72px 64px;-webkit-font-smoothing:antialiased}}
.left{{display:flex;flex-direction:column}}
.logo{{height:104px;width:auto;align-self:flex-start;margin:-20px 0 0 -16px}}
h1{{margin-top:auto;font-size:{56 if code != 'th' else 50}px;line-height:{1.06 if code != 'th' else 1.3};letter-spacing:{'-0.035em' if code != 'th' else '0'};font-weight:700}}
p{{margin-top:20px;font-size:24px;line-height:1.4;color:#525252}}
.card{{align-self:center;border:2px solid #171717;border-radius:22px;padding:26px;background:#fff;box-shadow:0 24px 60px rgba(0,0,0,.08)}}
.head{{font-size:20px;font-weight:700;margin-bottom:16px}}
ul{{list-style:none;display:grid;gap:12px}}
li{{display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px;background:#f5f5f5;border-radius:14px;padding:16px 16px;font-size:19px;font-weight:500}}
li span{{display:flex;align-items:center;gap:12px}}
i{{width:11px;height:11px;border-radius:99px;flex:none}}
.btn{{background:#171717;color:#fff;border-radius:9px;padding:8px 14px;font-size:15px}}
.done{{background:#d1fae5}}
.done span{{text-decoration:line-through;color:#525252}}
.ok{{background:#047857;color:#fff;border-radius:9px;padding:8px 14px;font-size:15px}}
em{{grid-column:1/-1;font-style:normal;font-weight:700;font-size:16px;color:#047857}}
</style></head><body>
<div class="left"><img class="logo" src="{a}/logo-saksae.svg" alt=""><h1>{h1}</h1><p>{sub}</p></div>
<div class="card"><div class="head">{head}</div><ul>{rows}</ul></div>
</body></html>'''


def chromium():
    if os.environ.get('CHROMIUM_PATH'):
        return os.environ['CHROMIUM_PATH']
    found = sorted(glob.glob(os.path.expanduser('~/Library/Caches/ms-playwright/chromium-*/chrome-mac*/*.app/Contents/MacOS/*')))
    if not found:
        raise SystemExit('Chromium introuvable : définissez CHROMIUM_PATH.')
    return found[-1]


if __name__ == '__main__':
    exe = chromium()
    with tempfile.TemporaryDirectory() as tmp:
        for code in TEXT:
            html = Path(tmp) / f'og-{code}.html'
            html.write_text(page(code), encoding='utf-8')
            out = ASSETS / f'og-v2-{code}.png'
            subprocess.run([exe, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                            '--window-size=1200,630', '--virtual-time-budget=3000', f'--screenshot={out}', html.as_uri()],
                           check=True, capture_output=True)
            print(out.name, out.stat().st_size // 1024, 'Ko')
