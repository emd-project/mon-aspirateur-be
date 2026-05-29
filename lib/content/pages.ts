import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const PAGES_DIR = path.join(process.cwd(), 'content/pages')

export type PageContent = {
  // Homepage
  hero_headline?: string
  hero_subheadline?: string
  hero_cta?: string
  hero_cta_secondary?: string
  // Homepage editorial images (V2 — bande "Le terrain", 1 à 3 visuels)
  image1?: string
  image1Alt?: string
  image1Caption?: string
  image2?: string
  image2Alt?: string
  image2Caption?: string
  image3?: string
  image3Alt?: string
  image3Caption?: string
  // SEO
  meta_title?: string
  meta_description?: string
  // Generic page
  page_title?: string
  page_subtitle?: string
  section_label?: string
}

/**
 * Read a page content file from content/pages/{slug}.mdx
 * Falls back to an empty object if the file doesn't exist.
 */
export function getPageContent(slug: string): PageContent {
  const filePath = path.join(PAGES_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return {}
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    const { data } = matter(raw)
    return data as PageContent
  } catch {
    return {}
  }
}
