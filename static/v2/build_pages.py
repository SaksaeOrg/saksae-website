# Étape 5 : pages métier, Comptables et Tarifs, générées depuis un gabarit unique.
# L'en-tête, le menu mobile et le pied de page sont repris de v2/index.html pour
# rester identiques partout. Relancer après toute modification de ces blocs :
#   python3 -I v2/build_pages.py
import re
from pathlib import Path

ROOT = Path(__file__).parent
U = 'https://images.unsplash.com/'

METIERS = {
    'Agences': 'agences.html',
    'Sociétés de services': 'societes-de-services.html',
    'Cabinets conseil': 'cabinets-conseil.html',
    'Organismes de formation': 'organismes-de-formation.html',
    'Formation': 'organismes-de-formation.html',
    'Commerçants et franchises': 'commercants-franchises.html',
    'Startups': 'startups.html',
    'Experts-comptables': 'comptables.html',
}


def relink(html, on_home):
    """Les menus et le footer pointent vers les vraies pages ; ailleurs que sur
    l'accueil, les ancres restantes pointent vers les sections de l'accueil."""
    def metier(m):
        label = m.group(2)
        page = METIERS.get(label)
        return f'href="./{page}"{m.group(1)}{label}' if page else m.group(0)
    # liens du méga-menu, du menu mobile et du footer dont le texte est un métier
    for label, page in METIERS.items():
        html = re.sub(r'href="#(?:metiers|comptable)"(\s+class="[^"]*")?>' + re.escape(label) + '<',
                      lambda m, p=page, l=label: f'href="./{p}"{m.group(1) or ""}>{l}<', html)
        # (?!</a>) : le motif ne doit jamais déborder sur le lien suivant du menu
        html = re.sub(r'<a class="mega-link" href="#(?:metiers|comptable)">((?:(?!</a>).)*?<b class="block text-\[0\.9375rem\]">)' + re.escape(label) + '</b>',
                      lambda m, p=page, l=label: f'<a class="mega-link" href="./{p}">{m.group(1)}{l}</b>', html, flags=re.S)
    html = html.replace('class="nav-trigger" href="#tarifs"', 'class="nav-trigger" href="./tarifs.html"')
    html = html.replace('class="nav-trigger" href="#comptable"', 'class="nav-trigger" href="./comptables.html"')
    html = html.replace('href="#comptable" class="col-span-4', 'href="./comptables.html" class="col-span-4')
    html = html.replace('<a class="block border-b border-line py-5 text-lg font-semibold" href="#tarifs">', '<a class="block border-b border-line py-5 text-lg font-semibold" href="./tarifs.html">')
    html = html.replace('<a class="block border-b border-line py-5 text-lg font-semibold" href="#comptable">', '<a class="block border-b border-line py-5 text-lg font-semibold" href="./comptables.html">')
    html = html.replace('<a href="#tarifs">Tarifs</a>', '<a href="./tarifs.html">Tarifs</a>')
    html = html.replace('<a href="#comptable">Comptables</a>', '<a href="./comptables.html">Comptables</a>')
    if not on_home:
        html = re.sub(r'href="#([a-z-]+)"', r'href="./#\1"', html)
    return html


# ---------- Tarification : deux couches, le travail opérationnel et la boucle IA ----------
# Répartition par formule tirée du code (benchmark IA du 16/11) : transcription des
# réunions et brief du matin à partir d'Équipe, synthèses client et prospect à
# partir de Croissance. Le classement des priorités est un calcul (indice Loop),
# la rédaction des messages passe par l'IA : les infobulles le disent tel quel.
TIPS = {
    'prio': ('Chaque nuit, SAKSAE relie vos modules et classe ce qui compte selon le montant, l’urgence et qui attend. Vous voyez les 3 premiers éléments, chacun avec son action.'),
    'relance': ('L’IA rédige la relance ou l’e-mail à partir de l’historique du client. Vous relisez et vous validez : rien ne part sans votre clic.'),
    'ticket': ('Vous photographiez le ticket, l’IA lit le montant, la date et le fournisseur, et remplit la note de frais.'),
    'devis': ('Les devis restés sans réponse remontent dans vos priorités, avec la relance déjà rédigée.'),
    'factures': ('Les factures à relancer passent en tête de vos priorités, classées par montant et par retard.'),
    'reunion': ('La réunion est transcrite avec l’accord de chacun. L’IA en tire le compte rendu, les décisions, les tâches et l’e-mail de suivi.'),
    'brief': ('Chaque matin : ce qui s’est passé hier, vos 3 priorités et ce qui reste ouvert, sur une seule page.'),
    'engagements': ('Ce qui a été promis en réunion reste dans vos priorités tant que ce n’est pas fait.'),
    'synthese': ('Avant un rendez-vous, l’IA résume l’historique du client ou du prospect : échanges, affaires, factures.'),
    'agents': ('Des agents et des automatisations construits avec vous, sur vos propres circuits.'),
}


def tip(key, label):
    return (f'<span class="ai-tip"><button type="button" class="ai-tip-btn" aria-label="Le rôle de l’IA : {label}">'
            '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8l1.4 3.6 3.6 1.4-3.6 1.4L8 11.8 6.6 8.2 3 6.8l3.6-1.4z" fill="currentColor"/></svg></button>'
            f'<span class="ai-tip-bubble" role="tooltip">{TIPS[key]}</span></span>')


def li(text, key=None):
    return f'<li>{text}{tip(key, text) if key else ""}</li>' if key else f'<li>{text}</li>'


PRICING = [
    ('independant', 'Indépendant', '1 utilisateur', 99, 79, 'Pour gérer seul vos clients, vos missions et vos factures.',
     [('Clients, prospects et devis', 'devis'), ('Factures et relances', 'factures'), ('Missions et rentabilité', None), ('Notes de frais', 'ticket'), ('RH essentiel', None), ('Tableaux de bord essentiels', None)],
     [('Vos 3 priorités chaque matin', 'prio'), ('Relances et e-mails rédigés', 'relance'), ('Lecture des justificatifs', 'ticket')], False),
    ('equipe', 'Équipe', '2 à 9 utilisateurs', 349, 279, 'Pour organiser le travail d’une petite équipe.',
     [('Tout le plan Indépendant', None), ('Réunions et visio', 'reunion'), ('Temps passé par mission', None), ('Suivi des affaires et des revenus', None), ('Méthodes de travail partagées', None), ('Support prioritaire', None)],
     [('Réunions transcrites et analysées', 'reunion'), ('Brief du matin', 'brief'), ('Engagements suivis', 'engagements')], True),
    ('croissance', 'Croissance', '10 à 20 utilisateurs', 749, 599, 'Pour piloter une PME de services : revenus, équipe et trésorerie.',
     [('Tout le plan Équipe', None), ('Rentabilité par client', None), ('Circuits de validation', None), ('Contrats et signature', None), ('Objectifs commerciaux', None), ('Droits d’accès avancés', None)],
     [('Synthèses client et prospect', 'synthese')], False),
    ('entreprise', 'Entreprise', 'Plus de 20 utilisateurs', None, None, 'Pour plusieurs sociétés ou de grandes équipes.',
     [('Tout le plan Croissance', None), ('Plusieurs sociétés', None), ('Intégrations sur mesure', None), ('Reporting dirigeant', None), ('Engagement de service', None), ('Accompagnement dédié', None)],
     [('Agents et automatisations sur mesure', 'agents')], False),
]


def price_card(k, n, who, mo, an, d, ops, loop, hi):
    dark = ' price-card-dark' if hi else ''
    pop = '<span class="price-popular">Le plus choisi</span>' if hi else ''
    if mo:
        price = (f'<div class="mt-5 flex items-baseline gap-1"><span class="price-num" data-price>{an} €</span><span class="price-per">/ mois</span></div>'
                 f'<p class="price-note" data-saving>au lieu de {mo} € · facturé à l’année</p>')
        cta = f'<a href="https://app.saksae.com/signup?plan={k}&amp;cycle=annual" data-signup-plan="{k}" class="btn {"btn-on-dark" if hi else "btn-primary"} w-full mt-6">Essai gratuit</a>'
        data = f' data-monthly="{mo}" data-annual="{an}"'
    else:
        price = '<div class="mt-5"><span class="price-num">Sur devis</span></div><p class="price-note">&nbsp;</p>'
        cta = '<a href="https://app.saksae.com/book/org_098ac3a559f8/d%C3%A9mo-saksae" target="_blank" rel="noopener" class="btn btn-secondary w-full mt-6">Parler à l’équipe</a>'
        data = ''
    plus = 'Toute la boucle, et en plus :' if k != 'independant' else 'Inclus dans la formule :'
    return (f'<div class="reveal price-card{dark}" data-plan="{k}"{data}>{pop}<b class="text-lg">{n}</b><span class="price-who">{who}</span>{price}'
            f'<p class="price-desc">{d}</p>{cta}'
            f'<p class="price-layer">Opérations</p><ul class="check-list list-none p-0 m-0 price-feats">{"".join(li(t, key) for t, key in ops)}</ul>'
            f'<div class="price-loop"><p class="price-layer price-layer-ai"><span aria-hidden="true">✦</span> La boucle IA</p><p class="price-loop-plus">{plus}</p>'
            f'<ul class="list-none p-0 m-0 price-loop-list">{"".join(li(t, key) for t, key in loop)}</ul></div></div>')


PRICING_GRID = '<div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">' + ''.join(price_card(*p) for p in PRICING) + '</div>'
PRICING_INTRO = ('<p class="reveal pricing-layers mt-8"><span class="badge badge-included">Opérations</span> clients, factures, équipe : le travail du quotidien.'
                 ' <span class="badge badge-done">✦ La boucle IA</span> relie vos modules, vous dit quoi faire et prépare le travail. Rien ne part sans votre validation.</p>')

home = (ROOT / 'index.html').read_text()
home = relink(home, True)
s = home.index('<section id="tarifs"')
e = home.index('</section>', s)
sec = home[s:e]
sec = sec.replace('Tous les modules sont inclus. Sans frais cachés.', 'Le même socle pour tous, une boucle IA qui va plus loin à chaque formule. Sans frais cachés.')
sec = re.sub(r'(?:<p class="reveal pricing-layers.*?</p>)?<div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4[^"]*">.*</div>\s*</div>\s*$',
             PRICING_INTRO + PRICING_GRID + '\n  </div>\n', sec, flags=re.S)
home = home[:s] + sec + home[e:]
# cartes du carrousel de l'accueil
for label, page in METIERS.items():
    home = re.sub(r'<a href="#" class="metier-card">(<img [^>]+>)<span class="metier-body"><b>' + re.escape(label) + '</b>',
                  lambda m, p=page, l=label: f'<a href="./{p}" class="metier-card">{m.group(1)}<span class="metier-body"><b>{l}</b>', home)
(ROOT / 'index.html').write_text(home)

HEADER = home[home.index('    <header class="site-header">'):home.index('    <main>')]
FOOTER = home[home.index('    <!-- ================= 15. Footer'):home.index('    <script')]
HEADER, FOOTER = relink(HEADER, False), relink(FOOTER, False)
FINAL = '''      <section class="bg-ink text-white">
        <div class="max-w-[1200px] mx-auto px-4 md:px-6 py-20 md:py-28 text-center">
          <h2 class="t-h2 text-white mx-auto max-w-[22ch]">Demain matin, vos 3 priorités vous attendent.</h2>
          <a href="https://app.saksae.com/signup" class="btn btn-on-dark mt-8">Essai gratuit</a>
        </div>
      </section>'''


def page(title, desc, body):
    return f'''<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>{title} — SAKSAE</title>
    <meta name="description" content="{desc}" />
    <link rel="icon" type="image/svg+xml" href="../assets/logo-saksae.svg" />
    <link rel="stylesheet" href="../css/v2.css" />
  </head>
  <body>
{HEADER}    <main>
{body}
{FINAL}
    </main>

{FOOTER}    <script src="./main.js" defer></script>
  </body>
</html>
'''


def head(label, title, text='', center=False):
    c = ' text-center mx-auto' if center else ''
    p = f'<p class="t-body mt-4 max-w-[60ch]{c}">{text}</p>' if text else ''
    return f'<div class="reveal max-w-[720px]{c}"><span class="t-label">{label}</span><h2 class="t-h2 mt-3">{title}</h2>{p}</div>'


def badge(cls, t):
    return f'<span class="badge {cls}">{t}</span>'


def ui(title, right, rows):
    r = ''.join(f'<div class="ui-row"><span>{a}</span>{b}</div>' for a, b in rows)
    return f'<div class="ui-card"><div class="ui-head"><span>{title}</span>{right}</div>{r}</div>'


def faq(items):
    return ''.join(f'<details class="faq-item"{" open" if i == 0 else ""}><summary>{q}</summary><p>{a}</p></details>' for i, (q, a) in enumerate(items))


PLANS = {
    'Indépendant': ('1 utilisateur', '79 €', '99 €'),
    'Équipe': ('2 à 9 utilisateurs', '279 €', '349 €'),
    'Croissance': ('10 à 20 utilisateurs', '599 €', '749 €'),
}


def metier_page(d):
    problems = ''.join(f'<div class="reveal card p-6"><span class="badge badge-late">Aujourd’hui</span><p class="mt-4 text-[1.0625rem] font-semibold leading-snug">{p}</p></div>' for p in d['problems'])
    steps = ''.join(
        f'<li class="reveal{" you" if i == d["you"] else ""}"><span class="loop-num">{i + 1}</span><span><b>{t}</b><span>{x}</span></span></li>'
        for i, (t, x) in enumerate(d['loop']))
    mods = ''.join(f'<div class="reveal bento-card"><div><b class="t-h3">{t}</b><p class="text-sm text-text-2 mt-1">{x}</p></div>{c}</div>' for t, x, c in d['modules'])
    who, price, was = PLANS[d['plan']]
    return f'''      <section class="pt-10 md:pt-16 pb-16 md:pb-24">
        <div class="max-w-[1200px] mx-auto px-4 md:px-6 module-block">
          <div>
            <span class="t-label">{d['label']}</span>
            <h1 class="t-display mt-4" style="font-size:clamp(2.25rem,4.4vw,3.5rem)">{d['title']}</h1>
            <p class="t-body mt-5 max-w-[52ch]">{d['sub']}</p>
            <div class="mt-8 flex flex-wrap gap-3"><a href="https://app.saksae.com/signup" class="btn btn-primary">Essai gratuit</a><a href="./tarifs.html" class="btn btn-secondary">Voir les tarifs</a></div>
          </div>
          <div class="module-visual">
            <img src="{U}{d['img']}?w=900&h=900&fit=crop&auto=format&q=72" alt="{d['alt']}" />
            {d['card']}
            <span class="chip">{badge('badge-done', d['chip'][0])}{d['chip'][1]}</span>
          </div>
        </div>
      </section>

      <section class="py-16 md:py-24 bg-soft">
        <div class="max-w-[1200px] mx-auto px-4 md:px-6">
          {head('Votre quotidien', d['problems_title'])}
          <div class="mt-10 grid md:grid-cols-3 gap-4">{problems}</div>
        </div>
      </section>

      <section class="py-16 md:py-24">
        <div class="max-w-[1200px] mx-auto px-4 md:px-6 grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
          {head('Avec SAKSAE', d['loop_title'], 'SAKSAE propose, vous validez, c’est fait.')}
          <ol class="loop-list list-none p-0 m-0">{steps}</ol>
        </div>
      </section>

      <section class="py-16 md:py-24 border-t border-line">
        <div class="max-w-[1200px] mx-auto px-4 md:px-6">
          {head('Ce que vous utilisez', 'Les modules qui comptent pour vous')}
          <div class="mt-10 grid md:grid-cols-3 gap-4">{mods}</div>
          <p class="mt-6 text-sm text-muted">Tous les autres modules sont aussi inclus. <a class="underline" href="./#modules">Voir toutes les fonctionnalités</a></p>
        </div>
      </section>

      <section class="py-16 md:py-24 bg-soft">
        <div class="max-w-[1200px] mx-auto px-4 md:px-6 grid lg:grid-cols-[1fr_1.6fr] gap-10">
          <div class="reveal">
            <span class="t-label">Tarif conseillé</span>
            <div class="price-card price-card-dark mt-4">
              <b class="text-lg">{d['plan']}</b><span class="price-who">{who}</span>
              <div class="mt-5 flex items-baseline gap-1"><span class="price-num">{price}</span><span class="price-per">/ mois</span></div>
              <p class="price-note">au lieu de {was} · facturé à l’année</p>
              <p class="price-desc">{d['plan_note']}</p>
              <a href="./tarifs.html" class="btn btn-on-dark w-full mt-2">Comparer les formules</a>
            </div>
          </div>
          <div class="reveal">{head('Questions fréquentes', 'Ce qu’on nous demande')}<div class="mt-6">{faq(d['faq'])}</div></div>
        </div>
      </section>'''


R = lambda dot, t: f'<span class="flex items-center gap-2"><i class="ui-dot" style="background:{dot}"></i>{t}</span>'
G, A, I, L = 'var(--emerald)', 'var(--amber)', 'var(--indigo)', '#EF4444'
B = badge
SEND = '<button class="btn btn-primary btn-sm" style="min-height:28px;padding:0 10px;font-size:12px">Valider</button>'

DATA = [
    dict(slug='agences.html', label='Agences', img='photo-1625297673112-06b459140555', alt='Mains sur un ordinateur portable après un rendez-vous client',
         title='Après chaque rendez-vous client, le suivi est déjà prêt.',
         sub='Comptes rendus, tâches, missions et factures au même endroit, pour les agences de 2 à 50 personnes.',
         card=ui('Compte rendu · Studio Nord', B('badge-done', 'Prêt'), [('3 décisions', '<span class="ui-muted">voir</span>'), ('3 tâches créées', '<span class="ui-muted">assignées</span>'), ('E-mail de suivi', SEND)]),
         chip=('Envoyé', 'E-mail de suivi'),
         problems_title='Ce qui vous fait perdre du temps',
         problems=['Les comptes rendus s’écrivent le soir, ou jamais.', 'Les relances clients dépendent de la mémoire de chacun.', 'Personne ne sait vraiment quelles missions sont rentables.'],
         loop_title='Du rendez-vous client à la facture',
         loop=[('Le rendez-vous est enregistré', 'Avec l’accord de chaque participant.'), ('Le compte rendu est prêt', 'Décisions, tâches et e-mail de suivi préparés.'), ('Vous validez', 'Un clic, et le suivi part.'), ('Rien ne se perd', 'Les engagements restent dans vos priorités jusqu’à ce qu’ils soient tenus.')], you=2,
         modules=[('Réunions', 'Compte rendu, décisions et tâches après chaque rendez-vous.', ui('Réunion Studio Nord', B('badge-done', 'Prêt'), [('Tâches', '<span class="ui-amount">3</span>')])),
                  ('Projets et missions', 'Temps passé et rentabilité par mission.', ui('Mission Studio Nord', B('badge-info', 'En cours'), [('Temps passé', '<span class="ui-amount">32 h</span>')])),
                  ('Factures', 'Relances automatiques, que vous validez.', ui('F-2026-118', B('badge-todo', 'À relancer'), [('Montant', '<span class="ui-amount">2 400 €</span>')]))],
         plan='Équipe', plan_note='Le même prix de 2 à 9 personnes. Au-delà, la formule Croissance.',
         faq=[('Mes clients doivent-ils accepter l’enregistrement ?', 'Oui. Une réunion n’est enregistrée que si chaque participant l’accepte.'),
              ('Puis-je suivre le temps passé par mission ?', 'Oui, avec la rentabilité de chaque mission et de chaque client.'),
              ('Tout le monde voit-il les factures ?', 'Non. Les droits se règlent par module et par rôle.')]),
    dict(slug='societes-de-services.html', label='Sociétés de services', img='photo-1521633286323-05b17f47cb74', alt='Un responsable planifie une mission sur sa tablette',
         title='Missions, équipes et plannings, enfin au même endroit.',
         sub='Pour les sociétés de services de 5 à 50 personnes qui jonglent entre missions, équipes et facturation.',
         card=ui('Équipe', '<span class="ui-muted">cette semaine</span>', [(R(I, 'Mission de mardi'), B('badge-info', 'À valider')), (R(G, 'Congés · 2 demandes'), B('badge-done', 'Validés')), (R(A, 'Facture de novembre'), B('badge-todo', 'À relancer'))]),
         chip=('Planifiée', 'Mission de mardi'),
         problems_title='Ce qui vous fait perdre du temps',
         problems=['Les plannings vivent dans des tableurs que personne ne met à jour.', 'Les congés et les validations se perdent dans les e-mails.', 'La facturation des missions prend du retard.'],
         loop_title='De la mission à la facture',
         loop=[('La mission est créée', 'Tâches, équipe et échéances au même endroit.'), ('Les demandes remontent', 'Congés, notes de frais et validations en attente arrivent dans vos priorités.'), ('Vous validez', 'Un clic pour chaque demande.'), ('La facture suit', 'Et sa relance, si le client tarde.')], you=2,
         modules=[('Projets et missions', 'Missions, tâches et rentabilité.', ui('Mission de mardi', B('badge-info', 'Planifiée'), [('Équipe', '<span class="ui-amount">3 pers.</span>')])),
                  ('Équipe et RH', 'Congés validés en deux étapes, paie préparée.', ui('Congés', B('badge-done', 'Validés'), [('Demandes', '<span class="ui-amount">2</span>')])),
                  ('Factures', 'Suivi de ce qui est payé, en attente ou en retard.', ui('Novembre', B('badge-todo', '1 à relancer'), [('Payées', '<span class="ui-amount">11</span>')]))],
         plan='Croissance', plan_note='De 10 à 20 personnes. Moins de 10 : la formule Équipe.',
         faq=[('Mon équipe a-t-elle besoin d’un compte chacun ?', 'Oui, chaque personne a son accès, avec ses droits. Le prix reste par tranche, pas par personne.'),
              ('Les congés suivent-ils une validation ?', 'Oui, en deux étapes : le responsable, puis les RH.'),
              ('Puis-je voir la rentabilité de chaque mission ?', 'Oui, par mission et par client, à partir de la formule Croissance pour le détail par client.')]),
    dict(slug='cabinets-conseil.html', label='Cabinets conseil', img='photo-1454165804606-c3d57bc86b40', alt='Rendez-vous client autour d’un ordinateur, prise de notes',
         title='Après chaque rendez-vous client, le compte rendu et le suivi sont prêts.',
         sub='Pour les cabinets qui passent leurs journées en rendez-vous et veulent que rien ne se perde entre deux missions.',
         card=ui('Affaires en cours', '<span class="ui-muted">décembre</span>', [(R(G, 'Studio Nord'), B('badge-done', 'Signé')), (R(A, 'Maison Lumière'), B('badge-todo', 'À relancer')), (R(I, 'Atelier Brun'), B('badge-info', 'Nouveau'))]),
         chip=('Signé', 'Devis 4 800 €'),
         problems_title='Ce qui vous fait perdre du temps',
         problems=['Les notes de rendez-vous restent dans un carnet.', 'Les devis envoyés restent sans réponse, sans relance.', 'Le temps passé par client n’est pas suivi.'],
         loop_title='Du rendez-vous au devis signé',
         loop=[('Le rendez-vous est enregistré', 'Avec l’accord de chacun.'), ('Le suivi est préparé', 'Compte rendu, tâches et e-mail.'), ('Vous validez', 'Le suivi part, le devis aussi.'), ('Les relances sont prêtes', 'Un devis sans réponse remonte dans vos priorités.')], you=2,
         modules=[('Réunions', 'Compte rendu et suivi prêts après chaque rendez-vous.', ui('Rendez-vous', B('badge-done', 'Prêt'), [('Suivi', '<span class="ui-amount">1</span>')])),
                  ('Clients et devis', 'Devis signés en ligne, affaires suivies.', ui('Devis 4 800 €', B('badge-done', 'Signé'), [('Client', 'Studio Nord')])),
                  ('Projets et missions', 'Temps passé et rentabilité par client.', ui('Studio Nord', B('badge-info', 'En cours'), [('Rentabilité', '<span class="ui-amount" style="color:var(--emerald-text)">+38 %</span>')]))],
         plan='Équipe', plan_note='Le même prix de 2 à 9 consultants. Seul : la formule Indépendant.',
         faq=[('Mes clients doivent-ils accepter l’enregistrement ?', 'Oui. Une réunion n’est enregistrée que si chaque participant l’accepte.'),
              ('Le devis peut-il être signé en ligne ?', 'Oui, avec une preuve de signature.'),
              ('L’e-mail de suivi part-il tout seul ?', 'Non. Il est préparé, vous le relisez et vous validez.')]),
    dict(slug='organismes-de-formation.html', label='Organismes de formation', img='photo-1503428593586-e225b39bddfe', alt='Participants qui prennent des notes pendant une formation',
         title='Convocations, émargements, OPCO : SAKSAE relance pour vous.',
         sub='Pour les organismes de formation qui veulent des sessions bien préparées et des dossiers de financement complets.',
         card=ui('Session du 4 décembre', B('badge-done', '12/12'), [('Convocations', B('badge-done', 'Envoyées')), ('Émargement', B('badge-done', 'Complet')), ('Dossier OPCO', B('badge-todo', 'À compléter'))]),
         chip=('12/12', 'Émargement'),
         problems_title='Ce qui vous fait perdre du temps',
         problems=['Les convocations partent une par une.', 'Les feuilles d’émargement sont à relancer après chaque session.', 'Il manque toujours une pièce au dossier de financement.'],
         loop_title='De la session au dossier complet',
         loop=[('La session est planifiée', 'Participants, salle et formateur.'), ('Les convocations sont prêtes', 'À envoyer en un clic.'), ('Vous validez', 'Rien ne part sans vous.'), ('Le dossier se complète', 'Émargements et pièces manquantes remontent dans vos priorités.')], you=2,
         modules=[('Formation', 'Convocations, émargement, dossiers OPCO.', ui('Session du 4 décembre', B('badge-done', '12/12'), [('Attestations', B('badge-done', 'Envoyées'))])),
                  ('Agenda', 'Sessions et rendez-vous au même endroit.', ui('Demain', '', [('09:00 · Session Excel', '<span class="ui-muted">salle 2</span>')])),
                  ('Factures', 'Factures et relances des financeurs.', ui('Novembre', B('badge-todo', '1 à relancer'), [('Payées', '<span class="ui-amount">8</span>')]))],
         plan='Équipe', plan_note='Le même prix de 2 à 9 personnes, formateurs compris.',
         faq=[('SAKSAE gère-t-il l’émargement ?', 'Oui, avec les convocations et les attestations.'),
              ('Et les dossiers OPCO ?', 'Oui, les pièces de chaque dossier sont suivies, et celles qui manquent remontent dans vos priorités.'),
              ('Les convocations partent-elles toutes seules ?', 'Non. Elles sont prêtes, vous validez leur envoi.')]),
    dict(slug='commercants-franchises.html', label='Commerçants et franchises', img='photo-1556741533-411cf82e4e2d', alt='Paiement au comptoir d’une boutique',
         title='Les priorités de chaque boutique, chaque matin.',
         sub='Pour les commerçants et les franchisés qui gèrent une équipe, des plannings et des fournisseurs.',
         card=ui('Aujourd’hui', '<span class="ui-muted">boutique</span>', [(R(A, 'Facture fournisseur'), B('badge-todo', 'À valider')), (R(I, 'Congés de Lina'), B('badge-info', 'On m’attend')), (R(G, 'Note de frais'), B('badge-done', 'Remboursée'))]),
         chip=('Payée', 'Facture 2 400 €'),
         problems_title='Ce qui vous fait perdre du temps',
         problems=['Les plannings et les congés se règlent sur un coin de comptoir.', 'Les notes de frais et les factures fournisseurs s’empilent.', 'Le recrutement des renforts prend du temps chaque saison.'],
         loop_title='Du matin au soir, au même endroit',
         loop=[('Les demandes arrivent', 'Congés, notes de frais, factures fournisseurs.'), ('SAKSAE les classe', 'Les plus urgentes en premier.'), ('Vous validez', 'Un clic pour chacune.'), ('Votre comptable reçoit tout', 'Ventes, achats et justificatifs.')], you=2,
         modules=[('Équipe et RH', 'Congés, plannings, recrutement.', ui('Congés', B('badge-info', 'À valider'), [('Demandes', '<span class="ui-amount">2</span>')])),
                  ('Notes de frais', 'Ticket lu, validation, remboursement.', ui('Déjeuner fournisseur', B('badge-todo', 'À valider'), [('Montant', '<span class="ui-amount">42 €</span>')])),
                  ('Catalogue et stock', 'Produits, commandes et stock simple.', ui('Catalogue', '', [('Articles', '<span class="ui-amount">128</span>')]))],
         plan='Équipe', plan_note='Le même prix de 2 à 9 personnes. Plusieurs sociétés : la formule Entreprise.',
         faq=[('J’ai plusieurs boutiques, comment ça marche ?', 'Chaque boutique a ses priorités. Si chaque boutique est une société, la formule Entreprise réunit plusieurs sociétés.'),
              ('Mes salariés peuvent-ils déposer leurs notes de frais ?', 'Oui, en photographiant le ticket. Vous validez, puis le remboursement suit.'),
              ('SAKSAE remplace-t-il ma caisse ?', 'Non. SAKSAE gère votre équipe, vos factures et vos priorités, à côté de votre caisse.')]),
    dict(slug='startups.html', label='Startups', img='photo-1579389083046-e3df9c2b3325', alt='Deux personnes travaillent sur un ordinateur portable',
         title='Clients, contrats et recrutement, sans empiler les outils.',
         sub='Pour les jeunes équipes qui veulent un seul outil pour vendre, recruter et s’organiser.',
         card=ui('Cette semaine', '', [(R(G, 'Contrat Studio Nord'), B('badge-done', 'Signé')), (R(A, 'Recrutement · 3 candidatures'), B('badge-todo', 'À lire')), (R(I, 'Réunion d’équipe'), B('badge-info', 'Compte rendu'))]),
         chip=('Signé', 'Contrat de mission'),
         problems_title='Ce qui vous fait perdre du temps',
         problems=['Un outil pour les clients, un autre pour les contrats, un troisième pour recruter.', 'Les décisions prises en réunion ne sont écrites nulle part.', 'Personne ne sait ce qui attend une validation.'],
         loop_title='Toute l’équipe sur la même page',
         loop=[('Tout arrive au même endroit', 'Clients, contrats, candidatures, réunions.'), ('SAKSAE propose', 'Vos 3 priorités du jour.'), ('Vous validez', 'Un clic pour chaque action.'), ('Les décisions restent', 'Écrites et suivies jusqu’à ce qu’elles soient tenues.')], you=2,
         modules=[('Clients et devis', 'Prospects, affaires et devis signés.', ui('Affaires', B('badge-done', '1 signée'), [('En cours', '<span class="ui-amount">4</span>')])),
                  ('Contrats et signature', 'Signés en ligne, avec preuve.', ui('Contrat de mission', B('badge-done', 'Signé'), [('Signataires', '<span class="ui-amount">2</span>')])),
                  ('Équipe et RH', 'Recrutement, arrivée, congés.', ui('Recrutement', B('badge-todo', 'À lire'), [('Candidatures', '<span class="ui-amount">3</span>')]))],
         plan='Équipe', plan_note='Le même prix de 2 à 9 personnes, pour grandir sans changer d’outil.',
         faq=[('Puis-je importer mes clients ?', 'Oui, depuis un fichier Excel ou CSV.'),
              ('Le recrutement est-il inclus ?', 'Oui : annonces, candidatures et entretiens.'),
              ('Que se passe-t-il quand nous passons à 10 ?', 'Vous passez à la formule Croissance, sans changer d’outil ni perdre vos données.')]),
]

for d in DATA:
    (ROOT / d['slug']).write_text(page(d['label'], d['sub'], metier_page(d)))

# ---------- Page Comptables ----------
comptables = f'''      <section class="pt-10 md:pt-16 pb-16 md:pb-24">
        <div class="max-w-[1200px] mx-auto px-4 md:px-6 module-block">
          <div>
            <span class="t-label">Experts-comptables</span>
            <h1 class="t-display mt-4" style="font-size:clamp(2.25rem,4.4vw,3.5rem)">Les pièces de vos clients arrivent complètes.</h1>
            <p class="t-body mt-5 max-w-[52ch]">SAKSAE n’est pas votre logiciel. C’est la source propre qui l’alimente : vos clients y gèrent leur activité, vous recevez ventes, achats et paie, sans rien réclamer.</p>
            <div class="mt-8 flex flex-wrap gap-3"><a href="https://app.saksae.com/book/org_098ac3a559f8/d%C3%A9mo-saksae" target="_blank" rel="noopener" class="btn btn-primary">Parler à l’équipe</a><a href="#cabinet" class="btn btn-secondary">Ce que vous recevez</a></div>
          </div>
          <div class="module-visual">
            <img src="{U}photo-1562564055-71e051d33c19?w=900&h=900&fit=crop&auto=format&q=72" alt="Deux personnes relisent des documents sur une table" />
            {ui('Espace comptable', '<span class="ui-muted">novembre</span>', [(R(G, 'Ventes · 24 factures'), B('badge-done', 'Transmis')), (R(G, 'Achats · 11 justificatifs'), B('badge-done', 'Complet')), (R(I, 'Paie du mois'), B('badge-info', 'Validée'))])}
            <span class="chip">{B('badge-done', 'Transmis')}Période de novembre</span>
          </div>
        </div>
      </section>

      <section id="cabinet" class="py-16 md:py-24 bg-soft">
        <div class="max-w-[1200px] mx-auto px-4 md:px-6">
          {head('Ce que vous recevez', 'Votre espace, gratuit et en lecture seule')}
          <div class="mt-10 grid md:grid-cols-3 gap-4">
            <div class="reveal bento-card"><div><b class="t-h3">Ventes</b><p class="text-sm text-text-2 mt-1">Factures et avoirs émis, paiements reçus, reste dû. Journal des ventes en CSV et toutes les pièces en un fichier ZIP.</p></div>{ui('Ventes · novembre', B('badge-done', 'Transmis'), [('Factures', '<span class="ui-amount">24</span>')])}</div>
            <div class="reveal bento-card"><div><b class="t-h3">Achats</b><p class="text-sm text-text-2 mt-1">Notes de frais et factures fournisseurs validées, avec leurs justificatifs. Journal des achats en CSV.</p></div>{ui('Achats · novembre', B('badge-done', 'Complet'), [('Justificatifs', '<span class="ui-amount">11</span>')])}</div>
            <div class="reveal bento-card"><div><b class="t-h3">Paie, sur option</b><p class="text-sm text-text-2 mt-1">Si votre client l’active : le mois de paie validé (absences, heures, primes, frais). Vous déposez les bulletins, SAKSAE les envoie à chaque salarié.</p></div>{ui('Paie · novembre', B('badge-info', 'Validée'), [('Salariés', '<span class="ui-amount">7</span>')])}</div>
          </div>
          <ul class="check-list list-none p-0 m-0 mt-10 md:grid md:grid-cols-2 gap-x-10">
            <li>Factures verrouillées à l’émission, avec la preuve qu’elles n’ont pas été modifiées</li>
            <li>Un commentaire sur une facture, une case « période transmise »</li>
            <li>Par mois ou par trimestre, à votre rythme</li>
            <li>Ni CRM, ni réunions, ni données RH : vous ne voyez que le financier</li>
          </ul>
        </div>
      </section>

      <section class="py-16 md:py-24">
        <div class="max-w-[1200px] mx-auto px-4 md:px-6 grid lg:grid-cols-[1fr_1.6fr] gap-10">
          {head('Bientôt', 'Ce qui arrive pour les cabinets', 'Annoncé sans date tant que la date n’est pas fixée.')}
          <div class="reveal grid sm:grid-cols-3 gap-4">
            <div class="card p-6"><span class="badge badge-info">Bientôt</span><b class="block mt-4">Écritures prêtes à importer</b><p class="text-sm text-text-2 mt-2">Plus de listes à ressaisir.</p></div>
            <div class="card p-6"><span class="badge badge-info">Bientôt</span><b class="block mt-4">Tous vos dossiers d’un coup</b><p class="text-sm text-text-2 mt-2">Une vue sur l’ensemble de vos clients.</p></div>
            <div class="card p-6"><span class="badge badge-info">Bientôt</span><b class="block mt-4">L’espace de vos clients, préparé par vous</b><p class="text-sm text-text-2 mt-2">Réglé à votre façon, avant de les inviter.</p></div>
          </div>
        </div>
      </section>

      <section class="py-16 md:py-24 bg-soft">
        <div class="max-w-[1200px] mx-auto px-4 md:px-6 grid lg:grid-cols-[1fr_1.6fr] gap-10">
          {head('Questions fréquentes', 'Ce que les cabinets nous demandent')}
          <div class="reveal">{faq([('Combien coûte l’accès pour le cabinet ?', 'Rien. Votre client vous invite gratuitement, deux comptables au plus par entreprise.'), ('Dois-je changer de logiciel ?', 'Non. Vous gardez vos outils ; SAKSAE vous transmet des pièces propres.'), ('Est-ce que je vois les données RH de mon client ?', 'Non. Ni fiches salariés, ni contrats, ni entretiens. Seulement la paie validée, si votre client l’active.')])}</div>
        </div>
      </section>'''
(ROOT / 'comptables.html').write_text(page('Experts-comptables', 'Les pièces de vos clients arrivent complètes.', comptables))

# ---------- Page Tarifs ----------
home_now = (ROOT / 'index.html').read_text()
grid = re.search(r'(<div class="flex flex-wrap items-end justify-between gap-6">\s*<div class="reveal max-w-\[720px\]"><span class="t-label">Tarifs</span>.*?</div>\s*</div>\s*</div>)\s*</section>', home_now, re.S).group(1)
grid = grid.replace('<h2 class="t-h2 mt-3">Un prix par équipe, pas par personne</h2>', '<h1 class="t-display mt-3" style="font-size:clamp(2.25rem,4.4vw,3.5rem)">Un prix par équipe, pas par personne</h1>')
OPS_ROWS = [('Clients, prospects et devis', 'devis', 1, 1, 1, 1), ('Factures et relances', 'factures', 1, 1, 1, 1), ('Notes de frais', 'ticket', 1, 1, 1, 1),
            ('RH essentiel', None, 1, 1, 1, 1), ('Réunions et visio', None, 0, 1, 1, 1), ('Temps passé et rentabilité par mission', None, 0, 1, 1, 1),
            ('Rentabilité par client', None, 0, 0, 1, 1), ('Circuits de validation', None, 0, 0, 1, 1), ('Contrats et signature', None, 0, 0, 1, 1),
            ('Droits d’accès avancés', None, 0, 0, 1, 1), ('Plusieurs sociétés', None, 0, 0, 0, 1), ('Intégrations sur mesure', None, 0, 0, 0, 1)]
LOOP_ROWS = [('Vos 3 priorités chaque matin', 'prio', 1, 1, 1, 1), ('Relances et e-mails rédigés', 'relance', 1, 1, 1, 1), ('Lecture des justificatifs', 'ticket', 1, 1, 1, 1),
             ('Réunions transcrites et analysées', 'reunion', 0, 1, 1, 1), ('Brief du matin', 'brief', 0, 1, 1, 1), ('Engagements suivis', 'engagements', 0, 1, 1, 1),
             ('Synthèses client et prospect', 'synthese', 0, 0, 1, 1), ('Agents et automatisations sur mesure', 'agents', 0, 0, 0, 1)]
YES = '<span class="badge badge-done">Inclus</span>'
NO = '<span class="text-muted">—</span>'


def rows_html(rows):
    return ''.join(f'<tr class="border-t border-line"><td class="py-3 pr-4"><span class="cmp-label">{r[0]}{tip(r[1], r[0]) if r[1] else ""}</span></td>'
                   + ''.join(f'<td class="py-3 px-2 text-center">{YES if v else NO}</td>' for v in r[2:]) + '</tr>' for r in rows)


trs = ('<tr><th colspan="5" class="cmp-group">Opérations</th></tr>' + rows_html(OPS_ROWS)
       + '<tr><th colspan="5" class="cmp-group cmp-group-ai"><span aria-hidden="true">✦</span> La boucle IA</th></tr>' + rows_html(LOOP_ROWS))
tarifs = f'''      <section class="pt-10 md:pt-16 pb-16 md:pb-24 bg-soft">
        <div class="max-w-[1200px] mx-auto px-4 md:px-6">
          {grid}
      </section>

      <section class="py-16 md:py-24">
        <div class="max-w-[1200px] mx-auto px-4 md:px-6">
          {head('Comparer', 'Ce que comprend chaque formule', 'Survolez ✦ pour voir ce que fait l’IA, et comment.')}
          <div class="reveal mt-10 overflow-x-auto"><table class="w-full min-w-[640px] text-[0.9375rem]">
            <thead><tr class="text-left"><th class="py-3 pr-4 font-semibold"></th><th class="py-3 px-2 text-center font-semibold">Indépendant</th><th class="py-3 px-2 text-center font-semibold">Équipe</th><th class="py-3 px-2 text-center font-semibold">Croissance</th><th class="py-3 px-2 text-center font-semibold">Entreprise</th></tr></thead>
            <tbody>{trs}</tbody></table></div>
          <p class="mt-4 text-sm text-muted">Rien ne part sans votre validation. L’accès de votre comptable est gratuit, quelle que soit la formule.</p>
        </div>
      </section>

      <section class="py-16 md:py-24 bg-soft">
        <div class="max-w-[1200px] mx-auto px-4 md:px-6 grid lg:grid-cols-[1fr_1.6fr] gap-10">
          {head('Questions fréquentes', 'Sur les tarifs')}
          <div class="reveal">{faq([('Y a-t-il un engagement ?', 'Le paiement au mois est sans engagement. Le paiement à l’année coûte 20 % de moins.'), ('Le prix dépend-il du nombre de personnes ?', 'Il dépend d’une tranche, pas de chaque personne : de 2 à 9 personnes, la formule Équipe coûte le même prix.'), ('Mon comptable paie-t-il ?', 'Non. Son accès est gratuit.'), ('Nous sommes plus de 20 ?', 'La formule Entreprise est sur devis. Parlez-en à l’équipe.')])}</div>
        </div>
      </section>'''
(ROOT / 'tarifs.html').write_text(page('Tarifs', 'Un prix par équipe, pas par personne. Tous les modules sont inclus.', tarifs))
print('pages :', ', '.join(d['slug'] for d in DATA), '+ comptables.html, tarifs.html')

# Tailles d'images (srcset) sur toutes les pages générées
import runpy
runpy.run_path(str(ROOT / 'optimize_images.py'))

# Photos servies depuis assets/photos (télécharge seulement celles qui manquent)
import subprocess, sys
subprocess.run([sys.executable, '-I', str(ROOT / 'fetch_photos.py')], check=True)
