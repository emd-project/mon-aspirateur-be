# Claude Code — mon-aspirateur.be

Lis PROGRESS.md avant chaque session. Lis /docs/ selon ta tâche.
Tâche transversale → docs/CDC.md uniquement.
Article ou page de contenu → lire docs/SEO-GEO-REDACTION.md ET docs/AUTHOR-thomas-v.md avant la première ligne.

## Projet
Domaine : mon-aspirateur.be · Stack : Next.js ~16.2.1 + next-intl + next-themes
Langues : FR + EN · Repo : github.com/emd-project/mon-aspirateur-be
Vercel région fra1 · prod sur main

## Philosophie visuelle (V2)
La DA repose d'abord sur : typographie · effets CSS · SVG inline · composition · motion.
Depuis la V2, des **images éditoriales/lifestyle (raster)** sont autorisées pour rendre
le site plus vivant et humain : bande « Le terrain » de la page d'accueil (1 à 3 visuels)
et images d'articles (image1–3). Elles passent par un `<img>` natif (cf. ArticleImage /
HomeImageBand), jamais par next/image. Une image absente ne doit jamais casser la mise en
page : les composants ne rendent rien si la source est vide.
Toute autre section vide visuellement reste un bug de DA, pas un placeholder en attente.

## CMS — Sanity (V2)
V1 : données statiques dans lib/data/mock/
V2 : swap lib/data/ vers Sanity GROQ — les composants ne changent pas
Ne pas implémenter Sanity avant confirmation explicite.

## Assets autorisés
SVG — icônes, logo, éléments décoratifs
Images raster éditoriales/lifestyle (jpg/png/webp) — via `<img>` natif uniquement,
hébergées dans public/images (ou blob Vercel). Gérées par le CMS (champs image1–3).
OG : générées via app/[locale]/opengraph-image.tsx
Jamais : next/image éditorial · picsum · unsplash · placeholder.com

## Auteurs actifs
| Slug      | Nom       | Fichier                 | Statut |
|-----------|-----------|-------------------------|--------|
| thomas-v  | Thomas V. | docs/AUTHOR-thomas-v.md | actif  |

Nouvel auteur → AUTHOR-[slug].md + /auteurs/[slug] avant tout article.

## Comportement
- Tâche 3+ étapes → plan tasks/todo.md avant
- Blocage → STOP + re-plan
- Done → prouver avant de marquer

## Voix éditoriale — règles absolues
- Pronom : **vous** (jamais tu) — sans exception
- Interdit : "honnête" comme marqueur de marque · "révolutionnaire" · "game-changer" · "coup de cœur" · "incroyable" · "impressionnant" · conditionnel dans un verdict
- Formules maison : "Le vrai tip :" · "En clair :" · "En pratique,"
- Gras : entités nommées + prix + chiffres clés — max 3-4 par paragraphe, jamais des adjectifs
- H2/H3 : toujours sous forme de question contenant le mot-clé (GEO)
- Premier paragraphe H2 : réponse directe en ouverture (jamais contexte d'abord)

## Filtre qualité — avant chaque commit
- [ ] tsc --noEmit · next lint · vitest run
- [ ] Images raster via `<img>` uniquement · zéro next/image éditorial · SVG pour icônes/déco
- [ ] Composants image robustes : source vide → ne rend rien (jamais de slot cassé)
- [ ] middleware.ts présent et fonctionnel (/ → /fr)
- [ ] Variables CSS · zéro hardcode hex · composants < 150 lignes
- [ ] Secrets hors repo · params await · CSP sans unsafe-eval
- [ ] Zéro fonts.googleapis.com · adjustFontFallback:true
- [ ] Article : byline + AuthorCard + JSON-LD author
- [ ] Article : no-go list AUTHOR-thomas-v.md vérifiée · zéro "tu" · zéro "honnête" comme marque
- [ ] Page auteur publiée avant premier article
- [ ] Chaque section a un fond traité documenté dans DECISIONS.md
- [ ] prefers-reduced-motion respecté sur toutes les animations
- [ ] Aucune année hardcodée dans title/H1 pour "édition courante"

## Git
Jamais direct sur main · feature = branche = PR · Conventional Commits anglais
Branches : feature/ · fix/ · content/ · author/

## Code
TS strict · HTML sémantique · params Promise await
Jamais 'use client' sur page.tsx · getData() serveur · fetch cache explicite

## Fin de session
git add PROGRESS.md DECISIONS.md && git commit -m "docs: update PROGRESS and DECISIONS"
Pusher branche courante — jamais main.
