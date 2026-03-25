import type { MetadataRoute } from 'next'
import { getGuides } from '@/lib/data/mock/guides'
import { getComparatifs } from '@/lib/data/mock/comparatifs'
import { getArticles } from '@/lib/data/mock/articles'

const BASE = 'https://mon-aspirateur.be'
const LOCALES = ['fr', 'en'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()
  const entries: MetadataRoute.Sitemap = []

  // Static pages — both locales
  for (const locale of LOCALES) {
    entries.push(
      { url: `${BASE}/${locale}`,               lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
      { url: `${BASE}/${locale}/guides`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
      { url: `${BASE}/${locale}/comparatifs`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
      { url: `${BASE}/${locale}/blog`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
      { url: `${BASE}/${locale}/outils/quiz`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE}/${locale}/outils/simulateur`,  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE}/${locale}/outils/comparateur`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE}/${locale}/auteurs/thomas-v`,   lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${BASE}/${locale}/mentions-legales`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
      { url: `${BASE}/${locale}/confidentialite`,    lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
      { url: `${BASE}/${locale}/cookies`,            lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    )

    // Guides
    for (const guide of getGuides(locale)) {
      entries.push({
        url: `${BASE}/${locale}/guides/${guide.slug}`,
        lastModified: guide.updatedAt ?? guide.publishedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }

    // Comparatifs
    for (const comp of getComparatifs(locale)) {
      entries.push({
        url: `${BASE}/${locale}/comparatifs/${comp.slug}`,
        lastModified: comp.publishedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }

    // Articles
    for (const article of getArticles(locale)) {
      entries.push({
        url: `${BASE}/${locale}/blog/${article.categorySlug}/${article.slug}`,
        lastModified: article.updatedAt ?? article.publishedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  return entries
}
