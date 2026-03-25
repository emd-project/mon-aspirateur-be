# SEO & GEO — Guide de rédaction mon-aspirateur.be

Lire ce fichier ET docs/AUTHOR-thomas-v.md avant de rédiger la première ligne.

---

## 7.1 Métadonnées

| Type de page | Format title | Format description |
|---|---|---|
| Home | `Aspirateur Belgique {year} \| mon-aspirateur.be` | Comparateur + guide d'achat BE. Max 155 chars. |
| Hub pilier | `Guide aspirateur [type] — Choisir en {year} \| mon-aspirateur.be` | Contenu + bénéfice + angle BE. Max 155 chars. |
| Article blog | `[Mot-clé] : [bénéfice] {year} \| mon-aspirateur.be` | Réponse directe à l'intention. Max 155 chars. |
| Comparatif | `[Marque A] vs [Marque B] {year} \| mon-aspirateur.be` | Analyse complète avec verdict. Max 155 chars. |
| Page auteur | `Thomas V. — Expert aspirateurs \| mon-aspirateur.be` | Bio 1 phrase + expertise. Max 155 chars. |
| Outil | `[Nom outil] aspirateur \| mon-aspirateur.be` | Ce que l'outil fait + bénéfice. Max 155 chars. |

**Règles :**
- Max 60 chars pour le titre · unique par page
- `generateMetadata()` serveur obligatoire — jamais côté client
- Jamais de balise `<title>` dans le JSX

### Années dynamiques

| Type | Exemples | Traitement |
|---|---|---|
| Dynamique | "Guide {year}", "Meilleur aspirateur {year}" | `currentYear()` côté serveur |
| Fixe | "Fondé en 2019", "Depuis 2024", "Mis à jour le 14/03/2026" | string littérale — jamais remplacée |

Marqueur dans les fichiers i18n : `{year}` — remplacé à la génération côté serveur.

```typescript
// lib/utils/year.ts
export const currentYear = (): number => new Date().getFullYear()

// Dans generateMetadata() — côté serveur uniquement
import { currentYear } from '@/lib/utils/year'
title: t('meta.title', { year: currentYear() })
```

**Jamais** dans un `useState` · **jamais** dans un `useEffect` · **jamais** hardcodé.

---

## 7.2 Schemas JSON-LD

| Type | Pages | Champs obligatoires |
|---|---|---|
| WebSite + SearchAction | Home | name, url, potentialAction |
| BreadcrumbList | Guides + Comparatifs + Blog | itemListElement position/name/item |
| Article | Blog + Guides + Comparatifs | headline, author→Person, datePublished, dateModified |
| Person | Page auteur + champ author | name, jobTitle, url, sameAs, description |
| FAQPage | Articles avec FAQ | mainEntity > Question + acceptedAnswer |
| ItemList | Page auteur | itemListElement url/name/position |

```typescript
// Person — depuis docs/AUTHOR-thomas-v.md
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Thomas V.',
  jobTitle: 'Expert électroménager & testeur aspirateurs',
  url: 'https://mon-aspirateur.be/auteurs/thomas-v',
  description: 'Thomas V. teste et compare les aspirateurs pour aider les ménages belges à choisir sans se faire avoir par le marketing.',
  sameAs: [],
  knowsAbout: ['aspirateurs', 'robots aspirateurs', 'électroménager', 'entretien maison'],
}
// Note : champ image omis — Google l'accepte. Jamais d'URL fictive.

// Article — author lié au Person
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '[TITRE — max 110 chars]',
  datePublished: '[YYYY-MM-DD]',
  dateModified: '[YYYY-MM-DD]',
  author: {
    '@type': 'Person',
    name: 'Thomas V.',
    url: 'https://mon-aspirateur.be/auteurs/thomas-v',
  },
  publisher: {
    '@type': 'Organization',
    name: 'mon-aspirateur.be',
  },
}
// Note : publisher.logo omis — pas d'image raster dans ce projet.
```

**Règles JSON-LD :**
- Serveur uniquement — jamais dans `useEffect`
- Placer `<script type="application/ld+json">` **avant** `<main>`
- Valider : Google Rich Results Test

---

## 7.3 Fichiers techniques

```
# robots.txt — app/robots.ts
User-agent: *
Disallow: /api/
Disallow: /studio/
Allow: /

Sitemap: https://mon-aspirateur.be/sitemap.xml
```

**Sitemap — app/sitemap.ts :**
- Inclure : /fr/, /en/, /fr/guides/*, /fr/comparatifs/*, /fr/blog/*/*, /fr/auteurs/thomas-v, /fr/outils/*
- Exclure : pages noindex, /api/, /studio/
- Fréquence : weekly · priorité home 1.0, hubs 0.8, articles 0.7, légales 0.3

---

## 7.4 Règles GEO (Answer Engine Optimization)

- **Réponse directe** dès le premier paragraphe de chaque H2 — pas d'intro générique
- **Chiffres sourcés** : prix EUR datés, dB mesurés (pas fabricant), m² testés
- **H2/H3 formulés en questions** : "Quel robot aspirateur pour 80 m² ?" plutôt que "Le robot aspirateur"
- **`<time datetime>`** systématique sur toutes les dates
- **Entités nommées explicites** : marques (Dyson, Miele, Roomba, iRobot, Bosch, Philips), modèles exacts, prix EUR avec date
- **Analyse concurrentielle** : max 3 URLs avant rédaction · ne pas citer les concurrents dans le corps
- **Vocabulaire SEO aspirateur** à utiliser : aspirateur robot, surface m², autonomie, filtration HEPA, bruit dB, aspirateur balai, sans fil, traineau, puissance Pa

---

## 7.5 Règles contenu SEO

### Structure obligatoire article > 600 mots
1. TL;DR : 3 bullets max après H1
2. H2 en question → réponse directe au premier paragraphe
3. Données chiffrées sourcées ou testées
4. Verdict explicite (formulation : "Notre verdict :")
5. FAQ : 6 questions minimum · accordéon accessible + JSON-LD FAQPage

### Hiérarchie titres
- H1 > H2 > H3 strict — jamais de H3 sans H2 parent
- HTML statique — jamais généré dans `useEffect`
- Zéro duplication de H1 entre pages

### Longueurs cibles
| Type | Mots |
|------|------|
| Page hub pilier | 600–900 |
| Article blog | 800–1200 |
| Guide d'achat | 1000–1500 |
| Comparatif | 800–1200 |

### Années
- `{year}` dans les fichiers i18n → `currentYear()` serveur
- Dates historiques/fondatrices = string littérale intouchable
- Jamais d'année hardcodée dans title/H1 pour contenus "édition courante"

---

## 7.6 Core Web Vitals — cibles

| Métrique | Cible | Avantage no-image |
|----------|-------|-------------------|
| LCP | < 2.5s | LCP = texte ou SVG — structurellement rapide |
| CLS | < 0.1 | Zéro CLS d'image — dimensions toujours connues |
| INP | < 200ms | Tools 'use client' isolés — pages SSG non affectées |
| FCP | < 1.8s | Fonts preload + adjustFontFallback elimine FOUT |
| TTFB | < 800ms | ISR + fra1 Vercel |

---

## 7.7 Checklist avant publication

### SEO technique
- [ ] Metadata uniques · JSON-LD valide · schema Person + Article author
- [ ] robots.ts · sitemap Search Console · /auteurs/ inclus
- [ ] OG 1200×630 générée via opengraph-image.tsx · `<time datetime>` · canoniques
- [ ] Breadcrumbs JSON-LD + composant visuel

### Auteur & EEAT
- [ ] Byline cliquable → /auteurs/thomas-v sur chaque article
- [ ] `<AuthorCard>` bas de chaque article (variant="inline")
- [ ] Page /auteurs/thomas-v publiée avant premier article
- [ ] AUTHOR-thomas-v.md rempli · crédentiels visibles

### Contenu
- [ ] Réponse directe en ouverture de chaque H2
- [ ] Chiffres sourcés · dates vérifiées
- [ ] FAQ 6 questions min · JSON-LD FAQPage serveur
- [ ] Zéro duplication contenu entre pages
- [ ] Mots interdits absents (révolutionnaire, incroyable, game-changer, meilleur sans source)
- [ ] Années dynamiques : aucune année hardcodée pour contenus "édition courante"

### Performance
- [ ] Lighthouse ≥ 90 · budget JS 120kb respecté
- [ ] CSP unsafe-eval absent · zéro fonts.googleapis.com
- [ ] adjustFontFallback:true · zéro `<img>` · zéro next/image éditorial

### DA no-image
- [ ] Chaque section a un fond traité documenté dans DECISIONS.md
- [ ] Hero typographique visible et mémorable sans JS
- [ ] prefers-reduced-motion respecté sur toutes les animations
- [ ] Contrastes texte/fond vérifiés (4.5:1 courant · 3:1 large)
