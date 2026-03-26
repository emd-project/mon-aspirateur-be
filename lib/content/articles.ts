import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content/articles')

export type ArticleFrontmatter = {
  title: string
  metaTitle?: string
  metaDescription?: string
  excerpt: string
  category: string
  categorySlug: string
  publishedAt: string
  updatedAt?: string
  readingTimeMin: number
  authorSlug: string
  locale: string
}

export type ArticleWithContent = ArticleFrontmatter & {
  slug: string
  content: string
}

export type ArticleMeta = ArticleFrontmatter & {
  slug: string
}

/** Read one MDX article by locale + slug */
export function getArticleMdx(
  locale: string,
  categorySlug: string,
  slug: string,
): ArticleWithContent | null {
  const filePath = path.join(CONTENT_DIR, locale, categorySlug, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  return { ...(data as ArticleFrontmatter), slug, content }
}

/** List all MDX articles for a locale (frontmatter only, sorted by date desc) */
export function getArticlesMdx(locale: string): ArticleMeta[] {
  const localeDir = path.join(CONTENT_DIR, locale)
  if (!fs.existsSync(localeDir)) return []

  const metas: ArticleMeta[] = []

  for (const category of fs.readdirSync(localeDir)) {
    const catDir = path.join(localeDir, category)
    if (!fs.statSync(catDir).isDirectory()) continue

    for (const file of fs.readdirSync(catDir)) {
      if (!file.endsWith('.mdx')) continue
      const slug = file.replace(/\.mdx$/, '')
      const raw = fs.readFileSync(path.join(catDir, file), 'utf8')
      const { data } = matter(raw)
      metas.push({ ...(data as ArticleFrontmatter), slug })
    }
  }

  return metas.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

/** Generate all static params for MDX articles */
export function getAllArticleParams(): { locale: string; categorie: string; slug: string }[] {
  const params: { locale: string; categorie: string; slug: string }[] = []

  if (!fs.existsSync(CONTENT_DIR)) return params

  for (const locale of fs.readdirSync(CONTENT_DIR)) {
    const localeDir = path.join(CONTENT_DIR, locale)
    if (!fs.statSync(localeDir).isDirectory()) continue

    for (const category of fs.readdirSync(localeDir)) {
      const catDir = path.join(localeDir, category)
      if (!fs.statSync(catDir).isDirectory()) continue

      for (const file of fs.readdirSync(catDir)) {
        if (!file.endsWith('.mdx')) continue
        params.push({ locale, categorie: category, slug: file.replace(/\.mdx$/, '') })
      }
    }
  }

  return params
}
