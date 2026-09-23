# SAKSAE — spécification du site

Ce qu'est le produit, ce que dit la page, et sur quelles règles elle est
construite. La documentation technique — build, i18n, polices, contrôles —
vit dans [`static/README.md`](static/README.md).

Remplace `design_guidelines.json` et `memory/PRD.md`, hérités de l'outil de
génération initial. Ce qu'ils décrivaient d'encore vrai a été repris ici et
vérifié contre le code ; le reste est consigné en fin de document, pour éviter
qu'on le ressuscite.

---

## Le produit

SAKSAE est une **plateforme d'Exécution Business IA** pour indépendants, TPE
et PME.

La promesse tient en trois temps, et la page les suit dans cet ordre :
centraliser les outils dispersés, analyser les données d'opérations et de
revenus, transformer le tout en actions concrètes. L'argument différenciant
est celui de la section [04] : **une IA qui agit, pas qui suggère**.

Le site est une page unique, vitrine. Il ne crée pas de compte, ne prend pas
de paiement, n'expose aucune API. Le seul appel à l'action est la prise de
rendez-vous.

---

## La page

Six sections, dont cinq numérotées. La numérotation `[0n]` est un élément de
direction artistique, affichée dans la couleur d'accent.

| Ancre | Tag | Rôle |
|---|---|---|
| `#platform` | `[01] Plateforme unifiée et actionnable` | Six onglets, maquette d'interface par onglet (CRM, Services, Produits, Management, Admin & Finances, Équipe) |
| `#onboarding` | `[02] Onboarding intelligent` | Carrousel à rotation automatique, quatre étapes : import, synchronisation, enrichissement, mapping |
| `#ai-tools` | `[03] Outils IA` | Sept onglets outil, plus le modal « calculez vos économies » qui compare une pile d'outils du marché au prix SAKSAE |
| `#ai` | `[04] Intelligence artificielle` | Fil d'actions à deux colonnes, cartes dépliables avec aperçu d'e-mail. Animation de frappe sur la salutation |
| `#testimonials` | — | Citation unique, dégradé gris vers noir |
| `#pricing` | `[05] Tarification` | Quatre formules, bascule mensuel / annuel |

Plus l'en-tête (navigation, sélecteur de langue), le héros (titre, deux
sous-titres, CTA, signaux d'ambiance animés), le CTA final sur fond noir et le
pied de page.

**Le modal du calculateur est le seul aimant à prospects de la page.** Il
n'envoie rien : le calcul est local et sert d'argument, pas de capture.

---

## Système de design

Direction **Attio** : minimaliste, noir et blanc, typographie serrée, icônes
en trait fin. Les valeurs ci-dessous sont celles de `static/src/input.css`,
pas une intention.

### Couleurs

| Jeton | Valeur | Emploi |
|---|---|---|
| `--bg-primary` | `#FAFAFA` | fond de page |
| `--bg-secondary` | `#FFFFFF` | cartes, panneaux |
| `--bg-dark` | `#0A0A0A` | CTA final, boutons primaires |
| `--text-primary` | `#0A0A0A` | titres, texte fort |
| `--text-secondary` | `#52525B` | paragraphes |
| `--text-muted` | `#A1A1AA` | le jeton ne sert qu'à l'ascenseur ; la valeur reste employée en dur sur du décoratif — **échoue au contraste sur du texte réel** |
| `--text-light` | `#D4D4D8` | dégradé du témoignage |
| `--border-light` | `#E4E4E7` | bordures de cartes |
| `--accent` | `#295CF0` | tags de section uniquement |

Le gris de texte sourd conforme est **`#6E6E77`** (4,59:1 au pire des fonds de
la page). `#6B7280` est employé dans les maquettes ; il passe là où il sert
mais tomberait sous le seuil sur `#F3F4F6` et `#F4F4F5`.

Trois exceptions au contraste WCAG AA sont **assumées** : la deuxième ligne du
titre héros (grand texte, bichromie voulue), le dégradé du témoignage — qui
est l'idée même de la section — et les signaux d'ambiance, décoratifs et déjà
masqués aux lecteurs d'écran. Les badges d'accent restants sont une décision
de design system, non tranchée.

### Typographie

**Inter** partout, en 400 / 500 / 600 / 700 uniquement. Pas de police de
titrage distincte.

- `.text-hero` — `clamp(2.75rem, 5.5vw, 4.25rem)`, 600, interligne 1,04
- `.text-section-title` — `clamp(2.25rem, 4.5vw, 3.25rem)`, 700
- `.section-tag` — 14px, 500, couleur d'accent, précédé d'un filet de 20px

Le crénage négatif (`-0.035em` sur le titrage) est pensé pour le latin. Il est
neutralisé en thaï, avec des interlignes desserrées.

### Mouvement

| Jeton | Valeur |
|---|---|
| `--ease-premium` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-out` | `cubic-bezier(0.33, 1, 0.68, 1)` |
| `--duration-fast` | `180ms` — survols, changements d'onglet |
| `--duration-normal` | `240ms` — boutons, cartes |

Révélations au défilement entre 400 et 700 ms, en cascade. Tout s'annule sous
`prefers-reduced-motion`.

### Fond

Trame pointillée à 5 % d'opacité, maille de 28px, sur le héros uniquement.

---

## Langues

Quatre, chacune sur son URL — une URL ne peut être indexée que dans une seule
langue.

| | URL | État |
|---|---|---|
| Français | `/` | source, écrite à la main |
| Anglais | `/en/` | générée |
| Vietnamien | `/vi/` | générée — **non relue par un natif** |
| Thaï | `/th/` | générée — **non relue par un natif** |

Le français est la source : il vit dans `static/index.html`, les autres sont
produites au déploiement. Mécanique détaillée dans le README.

---

## Données produit

### Formules

| Formule | Cible | Mensuel | Annuel |
|---|---|---|---|
| Indépendant | 1 utilisateur | 99 € | 79 € |
| **Équipe** *(mise en avant)* | 2 à 9 utilisateurs | 349 € | 279 € |
| Croissance | 10 à 20 utilisateurs | 749 € | 599 € |
| Entreprise | 20+ utilisateurs | dès 1 200 € | sur devis |

L'annuel est affiché par défaut, avec 20 % de remise. **Ces montants existent
à trois endroits** : les attributs `data-*` des cartes, la table `DYN` de
`main.js` pour Entreprise, et le JSON-LD. `npm run check` refuse de déployer
s'ils divergent.

### Prise de rendez-vous

```
https://app.saksae.com/book/org_098ac3a559f8/d%C3%A9mo-saksae
```

Sept CTA y mènent. Écrite sous forme percent-encodée : les navigateurs
encodent d'eux-mêmes, les robots et vérificateurs de liens pas toujours.

Le lien précédent (Calendly) est tombé en 404 sans que personne ne le
remarque. Un contrôle vérifie maintenant que les sept CTA pointent vers une
URL unique, **mais rien ne teste que cette URL répond** : à revérifier
périodiquement.

### Prix de référence du calculateur

SAKSAE est comparé à 63 €/mois/utilisateur, face à dix outils du marché
(Zoom 15, Otter.ai 17, Asana 25, Monday 30, Calendly 12, DocuSign 25,
PandaDoc 35, Notion 10, Slack 12, PayFit 50).

Ce chiffre de 63 € **ne correspond à aucune formule de la grille**. Il tombe
dans la fourchette par utilisateur d'Équipe (31 à 140 €) et de Croissance
(30 à 60 €), mais Indépendant est à 79 €. C'est donc un tarif moyen
d'argumentaire : à assumer comme tel, ou à aligner sur une formule.

---

## État du contenu

Trois choses à savoir avant de considérer la page comme finie.

**Le témoignage est vraisemblablement du remplissage.** « Marie Dupont,
CEO · TechStart » : le même nom sert de collaboratrice fictive dans la
maquette Équipe, « TechStart » apparaît dans les fausses factures, l'avatar
est un dégradé gris. Un témoignage nominatif inventé sur un site commercial
relève de la pratique commerciale trompeuse. À remplacer par un vrai, ou à
retirer.

**Les maquettes produit sont en français sur les quatre pages.** Elles n'ont
jamais porté de clé de traduction. Sur la page thaïe, des captures d'interface
en français se remarquent.

**Aucun avis client n'existe**, d'où l'absence d'`aggregateRating` dans les
données structurées. Le Rich Results Test le signale comme facultatif. Ne pas
en inventer : c'est sanctionné, et sur tout le site.

Le reste des données affichées — KPI, factures, collaborateurs, actions IA —
est explicitement de la démonstration, et c'est lisible comme tel.

---

## Abandonné

À ne pas ressusciter sans décision explicite.

**Une première direction artistique**, décrite par l'ancien
`design_guidelines.json` : palette indigo `#312E81` et orange `#F97316` sur
fond `#F7F9FC`, titres en Satoshi, monospace Geist. **Aucune de ces valeurs
n'apparaît dans le code** — elle a été remplacée par la direction Attio avant
livraison.

**Cinq sections construites puis retirées** : calculateur de ROI à curseurs,
checklist de coût des outils, comparaison avant/après avec photos de bureau,
onglets par métier (CEO / Sales / RH / Finance), bandeau de logos clients.
Elles sont récupérables dans l'historique git, avant la suppression de
`frontend/`.

**Un backend** — FastAPI, MongoDB, authentification JWT, endpoints leads et
newsletter — décrit par l'ancien PRD. Il n'a jamais existé dans ce dépôt. Les
pages Login et Register non plus.

**La convention `data-testid`** imposée par l'ancien guide. Le site n'en
contient plus aucun : les suites de vérification ciblent des sélecteurs
sémantiques et des attributs de données fonctionnels (`data-tab`,
`data-plan`, `data-panels`), qui décrivent le comportement plutôt que le test.

---

## Questions ouvertes

1. Faire relire le vietnamien et le thaï par des locuteurs natifs.
2. Trancher sur le témoignage : vrai ou retiré.
3. Traduire les maquettes produit, ou assumer le français partout.
4. Réconcilier le prix de référence de 63 € avec la grille tarifaire.
5. Décider du contraste des badges d'accent — 33 éléments encore sous le seuil.
6. Fournir les comptes sociaux pour compléter `sameAs` dans les données
   structurées.
