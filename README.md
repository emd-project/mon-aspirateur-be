# mon-aspirateur.be

Le guide de référence belge pour choisir son aspirateur.

## Stack

- **Framework** : Next.js ~16.2.1 (App Router)
- **Langage** : TypeScript strict + noUncheckedIndexedAccess
- **Styling** : Tailwind CSS v4 + variables CSS
- **i18n** : next-intl v4 (FR + EN)
- **Dark mode** : next-themes (data-theme)
- **CMS** : mock statique V1 → Sanity v3 V2
- **Hébergement** : Vercel fra1
- **Analytics** : Plausible CE self-hosted

## Démarrage

```bash
npm install
cp .env.example .env.local
# renseigner les variables dans .env.local
npm run dev
```

## Scripts

```bash
npm run dev          # développement local
npm run build        # build production
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
npm run test         # vitest run
npm run test:watch   # vitest watch
```

## Structure

```
/
├── app/[locale]/(site)/    # Pages du site
├── components/
│   ├── effects/            # AuroraBackground, NoiseOverlay, SectionDivider, AnimatedHeading
│   ├── ui/                 # AuthorByline, AuthorCard, ProductCard, FaqAccordion, ScoreBadge
│   └── layout/             # Header, Footer
├── lib/
│   ├── data/               # Types + mock data (→ Sanity V2)
│   ├── config/             # ai-providers.ts
│   └── utils/              # year.ts, formatScore.ts
├── messages/               # fr.json, en.json
├── docs/                   # CDC, SEO, AUTHOR
└── public/icons/brand/     # logo.svg, favicon.svg, og-default.svg
```

## Conventions

- Branches : `feature/` · `fix/` · `content/` · `author/`
- Commits : Conventional Commits anglais
- Jamais de push direct sur `main`
- Jamais d'image raster — SVG uniquement
- Jamais de secrets dans le repo — Vercel Dashboard uniquement

## Documentation

- `CLAUDE.md` — instructions pour Claude Code
- `DECISIONS.md` — décisions architecturales et DA
- `PROGRESS.md` — avancement par étape
- `docs/SEO-GEO-REDACTION.md` — guide SEO/GEO
- `docs/AUTHOR-thomas-v.md` — profil auteur
