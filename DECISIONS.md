# Décisions — mon-aspirateur.be

## Tranchées
- [x] Next.js ~16.2.1 · Vercel fra1 · GitHub Actions CI
- [x] Tailwind v4 + variables CSS · dark mode next-themes data-theme
- [x] Langues FR + EN · next-intl v4 · middleware.ts obligatoire dès commit 1
- [x] Budget JS 120kb · CSP sans unsafe-eval
- [x] next/font Inter 400+500+700 · Playfair Display 700+900 · JetBrains Mono 400
- [x] adjustFontFallback:true · subset:latin
- [x] Monétisation : structure préparée, non activée V1
- [x] Auteur : thomas-v · AUTHOR-thomas-v.md · byline textuel · pas de photo · pas de LinkedIn
- [x] EEAT : schema Person + Article author · champ image omis (Google l'accepte)
- [x] Images : aucune image raster · SVG uniquement · OG via opengraph-image.tsx
- [x] Années dynamiques : currentYear() lib/utils/year.ts · marqueur {year} i18n
- [x] CMS : V1 mock statique lib/data/mock/ · V2 Sanity v3 + GROQ · swap transparent
- [x] Analytics : Plausible CE self-hosted · RGPD-friendly (à configurer après déploiement)
- [x] Email : Resend + react-email (à configurer V2)
- [x] AI Résumé : 5 providers (ChatGPT, Claude, Mistral, Perplexity, Grok) · prompt site:mon-aspirateur.be
- [x] TypeScript : strict + noUncheckedIndexedAccess:true

## DA — effets retenus par section
<!-- Format : effect-[section] → [effet] · [raison] -->
effect-hero          → aurora CSS animée 3 orbes + noise SVG 0.04 + H1 clip-text · mémorable sans image
effect-featured-post → glassmorphism card (--glass-bg/blur/border) · profondeur sans photo
effect-categories    → bento grid asymétrique + diagonal clip-path hover · dynamisme éditorial
effect-articles-grid → card lift translateY-4px + shadow-accent + border animée · feedback tactile
effect-tools-section → fond sombre (--text-primary) + halo radial --accent-3 + numérotation oversize watermark · section distincte
effect-comparateur   → fond --bg-surface + noise overlay + SectionDivider diagonal · transition douce
effect-footer        → fond --text-primary + texte inversé + SVG ligne géométrique · ancrage visuel
effect-page-auteur   → monogramme CSS 'TV' Playfair 900 120px --accent-1 · identité sans photo

## DA — traitements typographiques retenus
typo-h1-home    → clamp(40px,6vw,72px) + Playfair 900 + background-clip:text dégradé --accent-1→--accent-2
typo-h1-article → text-wrap:balance + Playfair 700 + ::first-letter --accent-1
typo-quote      → font-variant-ligatures + 120% + border-left 3px --accent-1 + color --text-muted
typo-score      → font-variant-numeric:oldstyle-nums · dates et notes produits

## Décisions spécifiques au projet
- Auteur "Thomas V." — pas de nom complet ni de LinkedIn — monogramme TV
- schema Person : sameAs:[] (pas de LinkedIn) · image omis · Google l'accepte
- Slug auteur : thomas-v (cohérent avec identité partielle)
- lib/data/types.ts : interfaces TypeScript agnostiques CMS — swap Sanity transparent en V2
- AI Résumé 6.Y : prompt inject site:mon-aspirateur.be pour éviter sources externes

## À valider
- [ ] Affiliation Awin BE — activer quand trafic > 5k/mois [DÉCISION À VALIDER]
- [ ] Display ads — activer V2 si affiliation insuffisante [DÉCISION À VALIDER]
- [ ] Sanity project ID — à renseigner dans .env.local quand créé

## Abandonnées / Exceptions
- next/image : non utilisé pour contenu éditorial — exception : OG via opengraph-image.tsx
- Geist fonts : supprimées, remplacées par Inter + Playfair Display + JetBrains Mono (CDC §2.3)
