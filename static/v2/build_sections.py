# Étape 3 : génère les sections 3 à 13 de v2/index.html (exécuté une fois, puis
# le HTML est édité à la main). Conservé pour garder trace de la structure.
import re
from pathlib import Path

ROOT = Path(__file__).parent
U = 'https://images.unsplash.com/'
Q = '?w=900&h=900&fit=crop&auto=format&q=72'


def svg(d, size=20):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 20 20" fill="none" stroke="currentColor" '
            f'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{d}</svg>')


ARROW_L = '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4L6 9l5 5"/></svg>'
ARROW_R = '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4l5 5-5 5"/></svg>'


def head(label, title, text='', center=False):
    c = ' text-center mx-auto' if center else ''
    p = f'<p class="t-body mt-4 max-w-[60ch]{c}">{text}</p>' if text else ''
    return f'<div class="reveal max-w-[720px]{c}"><span class="t-label">{label}</span><h2 class="t-h2 mt-3">{title}</h2>{p}</div>'


# ---------- 3. Pourquoi SAKSAE ----------
why = [
    ('badge-done', 'Temps', svg('<rect x="3" y="5" width="10" height="9" rx="2"/><path d="M13 8.5l4-2v7l-4-2"/>'),
     'Vos réunions deviennent des actions', 'Compte rendu, tâches et e-mail de suivi prêts quelques minutes après. Rien à retaper.'),
    ('badge-todo', 'Rien n’échappe', svg('<circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 1.5"/>'),
     'Chaque matin, vos 3 priorités', 'Factures à relancer, validations en attente, engagements oubliés : tout remonte au même endroit.'),
    ('badge-info', 'Toute l’entreprise', svg('<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/>'),
     'Pas seulement la facture', 'Clients, équipe, recrutement, formation, contrats et paie préparée, dans un seul outil.'),
    ('badge-late', 'Prix', svg('<path d="M14.5 5.5a5 5 0 1 0 0 9M4 9h7M4 11h7"/>'),
     'Un prix par équipe, pas par personne', 'De 2 à 9 personnes, le même prix. Sans engagement au mois.'),
]
why_html = ''.join(
    f'<div class="reveal card p-6 flex flex-col gap-4"><span class="mega-icon" style="width:44px;height:44px;border-radius:12px">{ic}</span>'
    f'<span class="badge {b} self-start">{tag}</span><b class="t-h3">{t}</b><p class="text-[0.9375rem] text-text-2 leading-relaxed">{d}</p></div>'
    for b, tag, ic, t, d in why)
s_pourquoi = f'''<section id="pourquoi" class="py-20 md:py-28">
  <div class="max-w-[1200px] mx-auto px-4 md:px-6">
    {head('Pourquoi SAKSAE', 'Moins de choses à retenir, plus de choses faites')}
    <div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{why_html}</div>
  </div>
</section>'''

# ---------- 4. La boucle ----------
steps = [('1', 'Écoute', 'Réunions, mémos vocaux et e-mails.', ''),
         ('2', 'Relie', 'Factures, devis, équipe, projets : 14 sources au même endroit.', ''),
         ('3', 'Propose', 'Vos 3 priorités du jour, les relances et l’e-mail de suivi rédigés.', ''),
         ('4', 'Vous validez', 'Un clic. Rien ne part sans vous.', ' you'),
         ('5', 'Exécute', 'L’e-mail part, les tâches sont créées, le client est relancé.', ''),
         ('6', 'Se souvient', 'Décisions et engagements restent visibles jusqu’à ce qu’ils soient tenus.', '')]
nodes = [(380, 55), (614, 128), (614, 272), (380, 345), (146, 272), (146, 128)]
short = ['réunions, mémos, e-mails', 'factures, équipe, projets', '3 priorités, relances', 'un clic, rien sans vous', 'e-mail, tâche, relance', 'décisions, engagements']
g = ''.join(
    f'<g class="loop-node{c}" style="--i:{i}"><rect x="{x - 85}" y="{y - 26}" width="170" height="52" rx="12"/>'
    f'<text class="t1" x="{x}" y="{y - 3}" text-anchor="middle">{n} · {t}</text>'
    f'<text class="t2" x="{x}" y="{y + 15}" text-anchor="middle">{short[i]}</text></g>'
    for i, ((n, t, _, c), (x, y)) in enumerate(zip(steps, nodes)))
loop_svg = f'''<div class="loop hidden md:block mt-12"><svg class="loop-svg" viewBox="0 0 760 400" role="img" aria-label="La boucle SAKSAE : écoute, relie, propose, vous validez, exécute, se souvient">
<ellipse class="loop-ring" cx="380" cy="200" rx="234" ry="145"/><ellipse class="loop-ring-on" cx="380" cy="200" rx="234" ry="145" pathLength="1200"/>
<text class="loop-center" x="380" y="196" text-anchor="middle">La boucle</text><text class="loop-center2" x="380" y="218" text-anchor="middle">chaque jour, à chaque événement</text>{g}</svg></div>'''
loop_list = '<ol class="loop-list md:hidden mt-10 list-none p-0 m-0">' + ''.join(
    f'<li class="reveal{" you" if c else ""}"><span class="loop-num">{n}</span><span><b>{t}</b><span>{d}</span></span></li>'
    for n, t, d, c in steps) + '</ol>'
kpis = [('2 min', 'entre la fin d’une réunion et l’e-mail de suivi prêt'),
        ('3', 'priorités chaque matin, toutes fonctions confondues'),
        ('0', 'message envoyé sans votre validation')]
kpi_html = ''.join(f'<div class="reveal card p-6"><div class="kpi-num">{k}</div><p class="text-sm text-text-2 mt-2">{t}</p></div>' for k, t in kpis)
s_boucle = f'''<section id="boucle" class="py-20 md:py-28 bg-soft">
  <div class="max-w-[1200px] mx-auto px-4 md:px-6">
    {head('La boucle SAKSAE', 'SAKSAE propose. Vous validez. C’est fait.', 'Les logiciels de gestion enregistrent ce qui s’est passé. SAKSAE relie vos modules, vous dit ce qu’il faut faire maintenant et prépare le travail.', True)}
    {loop_svg}{loop_list}
    <div class="mt-12 grid sm:grid-cols-3 gap-4">{kpi_html}</div>
    <p class="mt-4 text-xs text-muted text-center">Le délai de 2 minutes est un objectif, mesuré chez nos premiers clients avant publication définitive.</p>
  </div>
</section>'''

# ---------- 5. Votre journée ----------
s_journee = f'''<section id="journee" class="py-20 md:py-28">
  <div class="max-w-[1200px] mx-auto px-4 md:px-6 module-block">
    <div class="reveal">
      <span class="t-label">Votre journée</span>
      <h2 class="t-h2 mt-3">Demain matin, tout est prêt</h2>
      <p class="t-body mt-4">En ouvrant SAKSAE, vous voyez ce qui s’est passé hier, ce qu’il faut traiter aujourd’hui et ce que personne ne regarde.</p>
      <ul class="check-list list-none p-0 m-0">
        <li>Le brief du matin : réunions tenues, paiements reçus, signatures obtenues</li>
        <li>Vos 3 priorités, chacune avec son action en un clic</li>
        <li>Ce que les autres attendent de vous, et ce que vous attendez d’eux</li>
      </ul>
      <a href="https://app.saksae.com/signup" class="btn btn-primary mt-8">Essai gratuit</a>
    </div>
    <div class="reveal module-visual" style="aspect-ratio:4/5">
      <img src="{U}photo-1545239351-ef35f43d514b?w=900&h=1125&fit=crop&auto=format&q=72" alt="Un ordinateur ouvert et un café sur un bureau, le matin" loading="lazy" />
      <div class="ui-card" style="left:20px;right:20px;top:auto;bottom:20px;width:auto">
        <div class="ui-head"><span>Aujourd’hui</span><span class="ui-muted">jeudi 4 décembre</span></div>
        <p class="ui-muted" style="margin:0 0 8px">Hier : 2 réunions tenues · 1 paiement reçu · 1 contrat signé</p>
        <div class="ui-row"><span class="flex items-center gap-2"><i class="ui-dot" style="background:var(--amber)"></i>Relancer la facture de 2 400 €</span><span class="badge badge-todo">Élevé</span></div>
        <div class="ui-row"><span class="flex items-center gap-2"><i class="ui-dot" style="background:var(--indigo)"></i>Valider 2 demandes de congés</span><span class="badge badge-info">On m’attend</span></div>
        <div class="ui-row"><span class="flex items-center gap-2"><i class="ui-dot" style="background:var(--emerald)"></i>Envoyer le suivi de la réunion</span><button class="btn btn-primary btn-sm" style="min-height:28px;padding:0 10px;font-size:12px">Valider</button></div>
      </div>
    </div>
  </div>
</section>'''

# ---------- 6. Modules (onglets) ----------
def ui(title, right, rows):
    r = ''.join(rows)
    return f'<div class="ui-card"><div class="ui-head"><span>{title}</span>{right}</div>{r}</div>'


def row(dot, left, mid, badge):
    d = f'<i class="ui-dot" style="background:{dot}"></i>' if dot else ''
    m = f'<span class="ui-amount">{mid}</span>' if mid else ''
    return f'<div class="ui-row"><span class="flex items-center gap-2">{d}{left}</span>{m}{badge}</div>'


def module(img, alt, title, text, bullets, ai, chip, card, rev=''):
    lis = ''.join(f'<li>{b}</li>' for b in bullets)
    return (f'<div class="module-block{rev}"><div><span class="badge badge-included">Inclus</span><h3 class="t-h2 mt-4">{title}</h3>'
            f'<p class="t-body mt-3">{text}</p><ul class="check-list list-none p-0 m-0">{lis}</ul>'
            f'<p class="ai-line"><span aria-hidden="true">✦</span><span><b>Et en plus :</b> {ai}</span></p></div>'
            f'<div class="module-visual"><img src="{U}{img}{Q}" alt="{alt}" loading="lazy" />{card}{chip}</div></div>')


B = lambda cls, t: f'<span class="badge {cls}">{t}</span>'
M = lambda t: f'<span class="ui-muted">{t}</span>'
mods = [
    ('reu', 'Réunions', module('photo-1625297673112-06b459140555', 'Mains sur un ordinateur portable à la fin d’une réunion',
        'Vos réunions deviennent des actions',
        'Enregistrez vos réunions avec l’accord de chacun. Le compte rendu, les décisions et les tâches sont prêts quelques minutes après.',
        ['Visio intégrée et enregistrement avec consentement', 'Compte rendu, décisions et tâches créés', 'E-mail de suivi prêt, à valider en un clic'],
        'les engagements pris en réunion remontent dans vos priorités tant qu’ils ne sont pas tenus.',
        '<span class="chip"><span class="badge badge-done">Envoyé</span>E-mail de suivi</span>',
        ui('Compte rendu · Studio Nord', B('badge-done', 'Prêt'), [row('', '3 décisions', '', M('voir')), row('', '3 tâches créées', '', M('assignées')),
           '<div class="ui-row"><span>E-mail de suivi</span><button class="btn btn-primary btn-sm" style="min-height:28px;padding:0 10px;font-size:12px">Envoyer</button></div>']))),
    ('cli', 'Clients et devis', module('photo-1454165804606-c3d57bc86b40', 'Rendez-vous client autour d’un ordinateur, prise de notes',
        'Du premier contact au devis signé',
        'Vos clients, vos prospects et vos devis au même endroit. Vous voyez où en est chaque affaire.',
        ['Fiches clients et prospects, historique des échanges', 'Devis signés en ligne', 'Page de rendez-vous à partager'],
        'les devis restés sans réponse remontent dans vos priorités, avec la relance déjà rédigée.',
        '<span class="chip"><span class="badge badge-done">Signé</span>Devis 4 800 €</span>',
        ui('Affaires en cours', M('décembre'), [row('var(--emerald)', 'Studio Nord', '4 800 €', B('badge-done', 'Signé')),
           row('var(--amber)', 'Maison Lumière', '2 100 €', B('badge-todo', 'À relancer')), row('var(--indigo)', 'Atelier Brun', '', B('badge-info', 'Nouveau'))]), ' is-reverse')),
    ('fac', 'Factures', module('photo-1556741533-411cf82e4e2d', 'Paiement au comptoir d’une boutique',
        'Soyez payé plus vite',
        'Devis, factures et relances au même endroit. Vous savez à tout moment qui vous doit quoi.',
        ['Factures conformes, verrouillées à l’émission', 'Relances automatiques, que vous validez', 'Suivi de ce qui est payé, en attente ou en retard'],
        'chaque matin, les factures à relancer passent en tête de vos priorités.',
        '<span class="chip"><span class="badge badge-done">Payée</span>Facture 2 400 €</span>',
        ui('Factures', M('novembre'), [row('var(--emerald)', 'F-2026-104', '1 240 €', B('badge-done', 'Payée')),
           row('var(--amber)', 'F-2026-118', '2 400 €', B('badge-todo', 'À relancer')), row('#EF4444', 'F-2026-097', '860 €', B('badge-late', 'En retard'))]))),
    ('equ', 'Équipe et RH', module('photo-1521633286323-05b17f47cb74', 'Un responsable consulte sa tablette',
        'Votre équipe, sans paperasse',
        'Congés, recrutement, contrats et préparation de la paie, avec les bons droits pour chacun.',
        ['Congés validés en deux étapes, plannings à jour', 'Recrutement : annonces, candidatures, entretiens', 'Paie du mois préparée et transmise à votre comptable'],
        'les demandes qui attendent votre validation remontent chaque matin dans vos priorités.',
        '<span class="chip"><span class="badge badge-done">Validés</span>Congés de décembre</span>',
        ui('Équipe', M('cette semaine'), [row('var(--indigo)', 'Congés · 2 demandes', '', B('badge-info', 'À valider')),
           row('var(--emerald)', 'Paie de novembre', '', B('badge-done', 'Préparée')), row('var(--amber)', 'Recrutement · 3 candidatures', '', B('badge-todo', 'À lire'))]), ' is-reverse')),
]
NOT_FIRST = ' tabindex="-1"'
tabs = ''.join(
    f'<button class="tab" role="tab" id="tab-{k}" aria-controls="panel-{k}" aria-selected="{"true" if i == 0 else "false"}"{"" if i == 0 else NOT_FIRST}>{n}</button>'
    for i, (k, n, _) in enumerate(mods))
panels = ''.join(
    f'<div class="tab-panel{" is-active" if i == 0 else ""}" role="tabpanel" id="panel-{k}" aria-labelledby="tab-{k}">{b}</div>'
    for i, (k, n, b) in enumerate(mods))
s_modules = f'''<section id="modules" class="py-20 md:py-28 border-t border-line">
  <div class="max-w-[1200px] mx-auto px-4 md:px-6">
    {head('Fonctionnalités', 'Tout ce qu’il faut, au même endroit')}
    <div class="reveal mt-10" data-tabs><div class="tabs" role="tablist" aria-label="Fonctionnalités">{tabs}<span class="tab-indicator" aria-hidden="true"></span></div>
    <div class="tab-panels">{panels}</div></div>
  </div>
</section>'''

# ---------- 7. Et aussi (bento) ----------
bento = [('span-3', 'Projets et missions', 'Temps passé et rentabilité par mission.', ui('Mission Studio Nord', B('badge-info', 'En cours'), [row('', 'Temps passé', '32 h', ''), '<div class="ui-row"><span>Rentabilité</span><span class="ui-amount" style="color:var(--emerald-text)">+38 %</span></div>'])),
         ('span-3', 'Formation', 'Convocations, émargements, dossiers OPCO.', ui('Session du 4 décembre', B('badge-done', '12/12'), [row('', 'Attestations', '', B('badge-done', 'Envoyées'))])),
         ('span-2', 'Notes de frais', 'Ticket lu, barème kilométrique, validation.', ui('Déjeuner client', M('hier'), [row('', 'Montant', '42 €', B('badge-todo', 'À valider'))])),
         ('span-2', 'Contrats et signature', 'Signés en ligne, avec preuve.', ui('Contrat de mission', '', [row('', 'Signature', '', B('badge-done', 'Signé'))])),
         ('span-2', 'Agenda', 'Rendez-vous et page de réservation.', ui('Demain', '', [row('', '10:00 · Studio Nord', '', M('visio'))]))]
bento_html = ''.join(
    f'<div class="reveal bento-card {s}"><div><b class="t-h3">{t}</b><p class="text-sm text-text-2 mt-1">{d}</p></div>{c}</div>'
    for s, t, d, c in bento)
s_aussi = f'''<section id="et-aussi" class="pb-20 md:pb-28">
  <div class="max-w-[1200px] mx-auto px-4 md:px-6">
    {head('Et aussi', 'Le reste de votre gestion, déjà inclus')}
    <div class="bento mt-10">{bento_html}</div>
  </div>
</section>'''

# ---------- 8. Par métier ----------
metiers = [('photo-1625297673112-06b459140555', 'Agences', 'Rendez-vous clients suivis, rien ne se perd'),
           ('photo-1521633286323-05b17f47cb74', 'Sociétés de services', 'Missions, équipes et plannings au même endroit'),
           ('photo-1454165804606-c3d57bc86b40', 'Cabinets conseil', 'Une proposition prête après chaque rendez-vous'),
           ('photo-1503428593586-e225b39bddfe', 'Organismes de formation', 'Convocations, émargements, OPCO'),
           ('photo-1556741533-411cf82e4e2d', 'Commerçants et franchises', 'Les priorités de chaque boutique, chaque matin'),
           ('photo-1707902665498-a202981fb5ac', 'Experts-comptables', 'Les pièces de vos clients, complètes')]
cards = ''.join(
    f'<a href="#" class="metier-card"><img src="{U}{i}?w=600&h=750&fit=crop&auto=format&q=72" alt="" loading="lazy" /><span class="metier-body"><b>{t}</b><span>{s}</span></span></a>'
    for i, t, s in metiers)
s_metiers = f'''<section id="metiers" class="py-20 md:py-28 bg-soft overflow-hidden">
  <div class="max-w-[1200px] mx-auto px-4 md:px-6">
    <div class="flex flex-wrap items-end justify-between gap-6">{head('Pour qui ?', 'Pensé pour votre métier')}</div>
    <div class="reveal carousel mt-10" data-carousel><div class="carousel-track">{cards}</div>
      <div class="carousel-controls"><button class="btn-round" data-prev aria-label="Précédent">{ARROW_L}</button><button class="btn-round" data-next aria-label="Suivant">{ARROW_R}</button></div></div>
  </div>
</section>'''

# ---------- 9. Votre comptable ----------
s_comptable = f'''<section id="comptable" class="py-20 md:py-28">
  <div class="max-w-[1200px] mx-auto px-4 md:px-6 module-block is-reverse">
    <div class="reveal">
      <span class="t-label">Votre comptable</span>
      <h2 class="t-h2 mt-3">Votre comptable reçoit tout, sans changer ses outils</h2>
      <p class="t-body mt-4">SAKSAE n’est pas un logiciel comptable : il prépare des pièces propres que votre cabinet importe dans le sien.</p>
      <ul class="check-list list-none p-0 m-0">
        <li>Accès gratuit pour votre comptable, en lecture seule</li>
        <li>Ventes, achats et justificatifs, mois par mois</li>
        <li>Paie du mois validée, si vous l’activez</li>
        <li>Il ne voit ni vos clients, ni vos réunions, ni vos données RH</li>
      </ul>
      <p class="ai-line"><span aria-hidden="true">✦</span><span><b>Bientôt :</b> les écritures prêtes à importer et une vue sur tous les dossiers du cabinet.</span></p>
    </div>
    <div class="reveal module-visual">
      <img src="{U}photo-1562564055-71e051d33c19{Q}" alt="Deux personnes relisent des documents sur une table" loading="lazy" />
      {ui('Espace comptable', M('novembre'), [row('var(--emerald)', 'Ventes · 24 factures', '', B('badge-done', 'Transmis')), row('var(--emerald)', 'Achats · 11 justificatifs', '', B('badge-done', 'Complet')), row('var(--indigo)', 'Paie du mois', '', B('badge-info', 'Validée'))])}
      <span class="chip"><span class="badge badge-done">Transmis</span>Ventes du mois</span>
    </div>
  </div>
</section>'''

# ---------- 10. Tarifs ----------
plans = [('independant', 'Indépendant', '1 utilisateur', 99, 79, 'Pour gérer seul vos clients, vos missions et vos factures.',
          ['Clients et prospects', 'Missions et rentabilité', 'Devis, factures et relances', 'RH essentiel', 'Vos 3 priorités chaque matin', 'Tableaux de bord essentiels'], False),
         ('equipe', 'Équipe', '2 à 9 utilisateurs', 349, 279, 'Pour organiser le travail d’une petite équipe.',
          ['Tout le plan Indépendant', 'Réunions enregistrées et comptes rendus', 'Missions, temps passé et rentabilité', 'Suivi des affaires et des revenus', 'Méthodes de travail partagées', 'Support prioritaire'], True),
         ('croissance', 'Croissance', '10 à 20 utilisateurs', 749, 599, 'Pour piloter une PME de services : revenus, équipe et trésorerie.',
          ['Tout le plan Équipe', 'Rentabilité par client et par mission', 'Circuits de validation', 'Contrats et signature', 'Objectifs commerciaux', 'Droits d’accès avancés'], False),
         ('entreprise', 'Entreprise', 'Plus de 20 utilisateurs', None, None, 'Pour plusieurs sociétés ou de grandes équipes.',
          ['Tout le plan Croissance', 'Plusieurs sociétés', 'Intégrations sur mesure', 'Reporting dirigeant', 'Engagement de service', 'Accompagnement dédié'], False)]


def plan(k, n, who, mo, an, d, feats, hi):
    lis = ''.join(f'<li>{f}</li>' for f in feats)
    dark = ' price-card-dark' if hi else ''
    pop = '<span class="price-popular">Le plus choisi</span>' if hi else ''
    if mo:
        price = f'<div class="mt-5 flex items-baseline gap-1"><span class="price-num" data-price>{an} €</span><span class="price-per">/ mois</span></div><p class="price-note" data-saving>au lieu de {mo} € · facturé à l’année</p>'
        cta = f'<a href="https://app.saksae.com/signup?plan={k}&amp;cycle=annual" data-signup-plan="{k}" class="btn {"btn-on-dark" if hi else "btn-primary"} w-full mt-6">Essai gratuit</a>'
        data = f' data-monthly="{mo}" data-annual="{an}"'
    else:
        price = '<div class="mt-5"><span class="price-num">Sur devis</span></div><p class="price-note">&nbsp;</p>'
        cta = '<a href="https://app.saksae.com/book/org_098ac3a559f8/d%C3%A9mo-saksae" target="_blank" rel="noopener" class="btn btn-secondary w-full mt-6">Parler à l’équipe</a>'
        data = ''
    return (f'<div class="reveal price-card{dark}" data-plan="{k}"{data}>{pop}<b class="text-lg">{n}</b><span class="price-who">{who}</span>{price}'
            f'<p class="price-desc">{d}</p>{cta}<ul class="check-list list-none p-0 m-0 price-feats">{lis}</ul></div>')


plans_html = ''.join(plan(*p) for p in plans)
s_tarifs = f'''<section id="tarifs" class="py-20 md:py-28 bg-soft">
  <div class="max-w-[1200px] mx-auto px-4 md:px-6">
    <div class="flex flex-wrap items-end justify-between gap-6">
      {head('Tarifs', 'Un prix par équipe, pas par personne', 'Tous les modules sont inclus. Sans frais cachés.')}
      <div class="reveal billing" role="group" aria-label="Facturation">
        <button type="button" data-billing="monthly" aria-pressed="false">Mensuel</button>
        <button type="button" data-billing="annual" aria-pressed="true">Annuel <span class="badge badge-done">-20 %</span></button>
      </div>
    </div>
    <div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{plans_html}</div>
  </div>
</section>'''

# ---------- 11. Confidentialité ----------
conf = [(svg('<rect x="4" y="9" width="12" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9"/>'), 'Chacun voit ce qu’il doit voir', 'Des droits réglés par module et par action, pour chaque rôle.'),
        (svg('<path d="M3 10s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><path d="M4 16L16 4"/>'), 'Les données sensibles masquées', 'Salaires et données RH restent réservés aux personnes autorisées.'),
        (svg('<circle cx="10" cy="8" r="3"/><path d="M4.5 16.5c.8-2.5 3-4 5.5-4s4.7 1.5 5.5 4"/><path d="M14 4.5l1.5 1.5L18 3.5"/>'), 'Enregistrement avec accord', 'Une réunion n’est enregistrée que si chaque participant l’accepte.')]
conf_html = ''.join(f'<div class="reveal"><span class="mega-icon" style="width:44px;height:44px;border-radius:12px">{i}</span><b class="block t-h3 mt-4">{t}</b><p class="text-[0.9375rem] text-text-2 mt-2">{d}</p></div>' for i, t, d in conf)
s_conf = f'''<section id="confidentialite" class="py-20 md:py-28">
  <div class="max-w-[1200px] mx-auto px-4 md:px-6">
    {head('Confidentialité', 'Vos données restent à leur place')}
    <div class="mt-10 grid md:grid-cols-3 gap-10">{conf_html}</div>
  </div>
</section>'''

# ---------- 13. FAQ ----------
faq = [('Qui voit quoi dans SAKSAE ?', 'Chacun a un rôle, avec des droits réglés module par module et action par action. Un commercial voit ses affaires, un responsable RH les dossiers du personnel, et vous gardez la vue d’ensemble.'),
       ('Combien d’utilisateurs puis-je inviter ?', 'Selon votre formule : 1 en Indépendant, jusqu’à 9 en Équipe, jusqu’à 20 en Croissance, au-delà sur devis. Le prix est fixe pour la tranche : un collègue de plus dans la tranche ne coûte rien. Vous ajoutez ou retirez un accès à tout moment.'),
       ('Mes données sont-elles protégées ?', 'Chaque utilisateur a son propre accès et ne voit que ce que son rôle autorise. Les salaires et les données RH sont masqués aux autres. Une réunion n’est enregistrée qu’avec l’accord de chaque participant.'),
       ('L’IA agit-elle sans moi ?', 'Non. SAKSAE propose, vous validez. Aucun e-mail, aucune relance et aucune tâche ne part sans votre clic. Et l’IA respecte les mêmes droits : elle ne s’appuie que sur ce que votre rôle vous permet de voir.'),
       ('Que voit mon comptable ?', 'Les ventes, les achats et, si vous l’activez, la paie du mois. Jamais vos clients, vos réunions ni vos données RH. Son accès est gratuit.'),
       ('Y a-t-il un engagement ?', 'Le paiement au mois est sans engagement. Le paiement à l’année coûte 20 % de moins.'),
       ('Comment démarrer ?', 'Créez votre compte, importez vos clients depuis un fichier Excel ou CSV et connectez votre messagerie. Un parcours guidé vous accompagne.')]
faq_html = ''.join(f'<details class="faq-item"{" open" if i == 0 else ""}><summary>{q}</summary><p>{a}</p></details>' for i, (q, a) in enumerate(faq))
s_faq = f'''<section id="faq" class="py-20 md:py-28 border-t border-line">
  <div class="max-w-[1200px] mx-auto px-4 md:px-6 grid lg:grid-cols-[1fr_1.6fr] gap-10">
    {head('Questions fréquentes', 'Vos questions, nos réponses')}
    <div class="reveal">{faq_html}</div>
  </div>
</section>'''

sections = '\n'.join([s_pourquoi, s_boucle, s_journee, s_modules, s_aussi, s_metiers, s_comptable, s_tarifs, s_conf, s_faq])
p = ROOT / 'index.html'
t = p.read_text()
start = t.index('      <!-- ================= 3 à 13')
end = t.index('      <!-- ================= 14. CTA final')
t = t[:start] + '      <!-- ================= 3 à 13 : contenu de la page ================= -->\n' + sections + '\n\n' + t[end:]
p.write_text(t)
print('ok', len(t))
