# Progression — Mon Aspirateur

## Complété — Pivot V2 : DA + Architecture affiliation

### DA & Design system
- [x] globals.css — palette chaude light-first (beige, terracotta, vert sauge, bleu pétrole, doré)
- [x] Tokens catégorie : --color-balai/robot/traineau/laveur/accessoires
- [x] Grain papier CSS (body::after, opacity .022)
- [x] Suppression Aurora / NoiseOverlay / dark-first

### Data layer
- [x] lib/data/types.ts — ajout ProductCategory type
- [x] lib/data/brands.ts — 13 marques + top produits (Rowenta inclus)
- [x] lib/data/comparateur.ts — 5 catégories, specs, produits réels
- [x] lib/data/mock/products.ts — migration type → category

### Composants éditoriaux
- [x] ProductCTA — carte Amazon avec prix oversize, score, highlight
- [x] StatCard — chiffre clé Playfair 900
- [x] CompareBar — barre de comparaison avec couleur catégorie
- [x] PullQuote — citation éditoriale avec bordure gauche catégorie
- [x] Verdict — encadré verdict honnête (bord terracotta)
- [x] StickyCTA — barre fixe glass blur
- [x] ProductCard — migré vers category, badges warm

### Layout
- [x] Header — 'use client', scroll glass, nav Comparer/Choisir/Marques/Deals/Blog, CTA Quiz
- [x] Footer — async server component, traductions propres
- [x] layout.tsx — simplifié (Header + Footer autonomes)

### Pages
- [x] Home — hero warm, sections catégories, top picks, marques, outils
- [x] /comparer/[categorie] — ISR 3600, CompareBar + ProductCTA
- [x] /choisir/[categorie] — ISR 3600, Verdict + PullQuote honnête
- [x] /marques — SSG, grille 13 marques
- [x] /marques/[slug] — ISR 3600, top produits par marque
- [x] /quiz — SSG, QuizStepper 4 étapes (useTranslations interne)
- [x] /deals — SSG, top picks par catégorie
- [x] /simulateur — SSG, calendrier cycles prix Amazon
- [x] /blog, /auteurs/thomas-v, pages légales — conservées

### Messages
- [x] fr.json — refonte complète (nav, comparer, choisir, marques, deals, simulateur, quiz)

### Qualité
- [x] tsc --noEmit → 0 erreurs
- [x] eslint → 0 erreurs, 0 warnings
- [x] vitest → 5/5 tests

## Prochaine session
- [ ] MDX pipeline (next-mdx-remote/rsc) pour articles
- [ ] Contenu éditorial : 12 articles + 5 comparateurs brand vs brand
- [ ] Sanity V2 — swap lib/data/mock → GROQ
- [ ] Lighthouse audit
