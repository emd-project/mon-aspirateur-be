# Progression — mon-aspirateur.be

## Complété — Étape 1 : Init
- [x] Bootstrap Next.js ~16.2.1 + TypeScript strict + noUncheckedIndexedAccess
- [x] middleware.ts — redirection / → /fr (PREMIER FICHIER)
- [x] next.config.ts — headers CSP + next-intl plugin
- [x] app/globals.css — tokens CSS complets + dark mode + animations
- [x] app/[locale]/layout.tsx — fonts (Inter+Playfair+JetBrains) + ThemeProvider + NextIntlClientProvider
- [x] i18n/routing.ts + i18n/request.ts — next-intl v4 setup
- [x] messages/fr.json + messages/en.json — i18n complet (toutes les sections)
- [x] lib/utils/year.ts — currentYear() serveur
- [x] lib/utils/formatScore.ts
- [x] lib/config/ai-providers.ts — 5 providers + prompt site:mon-aspirateur.be
- [x] lib/data/types.ts — interfaces TypeScript agnostiques CMS
- [x] lib/data/mock/ — authors, articles, guides, comparatifs, products
- [x] components/effects/ — AuroraBackground, NoiseOverlay, SectionDivider, AnimatedHeading
- [x] components/ui/ — AuthorByline, AuthorCard, ScoreBadge, FaqAccordion, ProductCard
- [x] public/icons/brand/ — logo.svg, favicon.svg, og-default.svg
- [x] .env.example — toutes les clés, valeurs vides
- [x] .github/workflows/ci.yml — lint + type-check + test + audit
- [x] vitest.config.ts + tests/setup.ts
- [x] docs/CDC.md, docs/SEO-GEO-REDACTION.md, docs/AUTHOR-thomas-v.md
- [x] CLAUDE.md, DECISIONS.md, README.md

## En cours — Étape 2 : Layout & Auteur
- [ ] components/layout/Header.tsx — navigation FR/EN + dark mode toggle
- [ ] components/layout/Footer.tsx — 3 colonnes + légaux
- [ ] app/[locale]/(site)/layout.tsx — wrapper site avec Header+Footer
- [ ] app/[locale]/not-found.tsx
- [ ] app/[locale]/error.tsx
- [ ] app/[locale]/(site)/auteurs/thomas-v/page.tsx

## Prochaine — Étape 3 : Pages & Contenu
- [ ] Home page — aurora hero + hubs
- [ ] Hub guides + 1 guide détail
- [ ] Hub comparatifs + 1 comparatif
- [ ] Hub blog + 1 article
- [ ] Pages légales (mentions, confidentialité, cookies)
- [ ] app/sitemap.ts · app/robots.ts
- [ ] app/[locale]/opengraph-image.tsx

## Prochaine — Étape 4 : Outils & SEO final
- [ ] /outils/quiz — QuizStepper 'use client'
- [ ] /outils/simulateur — SimulateurForm 'use client'
- [ ] /outils/comparateur — ComparateurTable 'use client' (skeleton V1)
- [ ] Lighthouse audit + budget JS vérification

## Bloqué
Rien à date.
