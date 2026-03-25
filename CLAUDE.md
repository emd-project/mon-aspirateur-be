# Claude Code — mon-aspirateur.be

Lis PROGRESS.md avant chaque session. Lis /docs/ selon ta tâche.
Tâche transversale → docs/CDC.md uniquement.
Article ou page de contenu → lire docs/SEO-GEO-REDACTION.md ET docs/AUTHOR-thomas-v.md avant la première ligne.

## Projet
Domaine : mon-aspirateur.be · Stack : Next.js ~16.2.1 + next-intl + next-themes
Langues : FR + EN · Repo : github.com/emd-project/mon-aspirateur-be
Vercel région fra1 · prod sur main

## Philosophie no-image
Ce projet ne contient aucune image raster. La DA repose sur :
typographie · effets CSS · SVG inline · composition · motion
Toute section vide visuellement est un bug de DA, pas un placeholder en attente.

## CMS — Sanity (V2)
V1 : données statiques dans lib/data/mock/
V2 : swap lib/data/ vers Sanity GROQ — les composants ne changent pas
Ne pas implémenter Sanity avant confirmation explicite.

## Assets autorisés
SVG uniquement — icônes, logo, éléments décoratifs
OG : générées via app/[locale]/opengraph-image.tsx
Jamais : <img> · next/image éditorial · picsum · unsplash · placeholder.com

## Auteurs actifs
| Slug      | Nom       | Fichier                 | Statut |
|-----------|-----------|-------------------------|--------|
| thomas-v  | Thomas V. | docs/AUTHOR-thomas-v.md | actif  |

Nouvel auteur → AUTHOR-[slug].md + /auteurs/[slug] avant tout article.

## Comportement
- Tâche 3+ étapes → plan tasks/todo.md avant
- Blocage → STOP + re-plan
- Done → prouver avant de marquer

## Filtre qualité — avant chaque commit
- [ ] tsc --noEmit · next lint · vitest run
- [ ] Zéro <img> · zéro next/image éditorial · SVG only
- [ ] middleware.ts présent et fonctionnel (/ → /fr)
- [ ] Variables CSS · zéro hardcode hex · composants < 150 lignes
- [ ] Secrets hors repo · params await · CSP sans unsafe-eval
- [ ] Zéro fonts.googleapis.com · adjustFontFallback:true
- [ ] Article : byline + AuthorCard + JSON-LD author
- [ ] Article : no-go list AUTHOR-thomas-v.md vérifiée
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
