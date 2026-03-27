import { requireSession } from '@/packages/cms/lib/get-session'
import { notFound } from 'next/navigation'
import { getFile } from '@/packages/cms/lib/github'
import { parseMdx } from '@/packages/cms/lib/parser'
import { ContentEditor } from '@/packages/cms/components/ContentEditor'
import { cmsConfig } from '@/cms.config'
import type { ContentEntry } from '@/packages/cms/types'
import Link from 'next/link'

const C = {
  text: '#1A1714',
  muted: '#6B5E54',
  dim: '#9C8E84',
  border: '#EDE5D8',
  accent: '#C4622D',
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ collection: string; slug: string[] }>
}) {
  const { collection, slug } = await params
  await requireSession()

  const collectionDef = cmsConfig.collections[collection]
  if (!collectionDef) notFound()

  const isNew = slug[0] === 'new'
  let entry: ContentEntry | undefined

  if (!isNew) {
    const token = process.env.CMS_GITHUB_TOKEN
    const ext = collectionDef.format === 'mdx' ? '.mdx' : '.yaml'
    const filePath = `${collectionDef.path}/${slug.join('/')}${ext}`

    const file = await getFile(cmsConfig.repo, filePath, cmsConfig.branch, token)
    if (!file) notFound()

    const parsed = parseMdx(file.content)
    entry = {
      slug: slug[slug.length - 1] ?? '',
      filePath,
      frontmatter: parsed.frontmatter,
      body: parsed.body,
      sha: file.sha,
    }
  }

  const entryLabel = isNew
    ? 'Nouveau'
    : String(entry?.frontmatter.title ?? entry?.frontmatter.hero_headline ?? slug.join('/'))

  return (
    <div>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1.75rem', fontSize: '0.8125rem', color: C.muted, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <Link href={`/admin/${collection}`} style={{ color: C.muted, textDecoration: 'none' }}>
          {collectionDef.label}
        </Link>
        <span style={{ color: C.dim }}>/</span>
        <span style={{ color: C.text, fontWeight: 500 }}>{entryLabel}</span>
      </nav>

      <ContentEditor
        collection={collection}
        collectionDef={collectionDef}
        entry={entry}
      />
    </div>
  )
}
