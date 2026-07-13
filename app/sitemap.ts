import type { MetadataRoute } from 'next'
import { categoryOrder, categoryMeta } from '@/lib/data/comparateur'
import { getAllCmsProducts } from '@/lib/content/products'
import { getAllBrands } from '@/lib/content/brands'
import { getArticlesMdx } from '@/lib/content/articles'
import { getClassementSlugs } from '@/lib/content/classements'
import type { ProductCategory } from '@/lib/data/types'

/**
 * Sitemap — miroir strict de app/[locale]/(site)/.
 *
 * Toute URL listée ici correspond à un fichier page.tsx existant :
 *   /                      → (site)/page.tsx
 *   /comparer              → (site)/comparer/page.tsx
 *   /comparer/[categorie]  → (site)/comparer/[categorie]/page.tsx
 *   /choisir               → (site)/choisir/page.tsx
 *   /choisir/[categorie]   → (site)/choisir/[categorie]/page.tsx
 *   /classement            → (site)/classement/page.tsx
 *   /classement/[slug]     → (site)/classement/[slug]/page.tsx
 *   /marques[/slug]        → (site)/marques/...
 *   /blog[/cat/slug]       → (site)/blog/...
 *   /quiz, /simulateur, /auteurs/thomas-v, /mentions-legales, /confidentialite, /cookies
 *
 * Les données viennent de content/ (produits YAML, marques YAML, articles MDX).
 * Aucune référence à lib/data/mock/*. /deals, /guides, /comparatifs et /outils/*
 * n'existent pas et ne sont pas listés.
 */

const BASE = 'https://www.mon-aspirateur.be'
const LOCALES = ['fr', 'en'] as const

/** Doit rester identique à EXCLUDED dans choisir/[categorie]/page.tsx */
const CHOISIR_EXCLUDED: ProductCategory[] = ['accessoires']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()
  const entries: MetadataRoute.Sitemap = []

  const products = getAllCmsProducts()
  const brands = getAllBrands()
  const classementSlugs = getClassementSlugs()

  // Catégories comparateur qui ont au moins une fiche produit réelle
  const comparerCategories = categoryOrder.filter(
    cat => Boolean(categoryMeta[cat]) && products.some(p => p.category === cat),
  )

  // Catégories guides — mirrors choisir/[categorie]/generateStaticParams
  const choisirCategories = categoryOrder.filter(
    cat => Boolean(categoryMeta[cat]) && !CHOISIR_EXCLUDED.includes(cat),
  )

  for (const locale of LOCALES) {
    const root = `${BASE}/${locale}`

    // ── Pages statiques ──────────────────────────────────────
    entries.push(
      { url: root,                      lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
      { url: `${root}/classement`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
      { url: `${root}/comparer`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
      { url: `${root}/choisir`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
      { url: `${root}/marques`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
      { url: `${root}/blog`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
      { url: `${root}/quiz`,            lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
      { url: `${root}/simulateur`,      lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${root}/auteurs/thomas-v`,lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${root}/mentions-legales`,lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
      { url: `${root}/confidentialite`, lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
      { url: `${root}/cookies`,         lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    )

    // ── Classements ─────────────────────────────────────────
    for (const slug of classementSlugs) {
      entries.push({
        url: `${root}/classement/${slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      })
    }

    // ── Comparateur par catégorie ──────────────────────────────
    for (const cat of comparerCategories) {
      entries.push({
        url: `${root}/comparer/${cat}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }

    // ── Guides d'achat par catégorie ───────────────────────────
    for (const cat of choisirCategories) {
      entries.push({
        url: `${root}/choisir/${cat}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
      })
    }

    // ── Marques ────────────────────────────────────────────
    for (const brand of brands) {
      entries.push({
        url: `${root}/marques/${brand.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }

    // ── Articles de blog (MDX — uniquement les locales qui en ont) ──────
    for (const article of getArticlesMdx(locale)) {
      entries.push({
        url: `${root}/blog/${article.categorySlug}/${article.slug}`,
        lastModified: article.updatedAt ?? article.publishedAt ?? now,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  return entries
}
