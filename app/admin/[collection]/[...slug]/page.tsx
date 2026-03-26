import { requireSession } from '@/packages/cms/lib/get-session'
import { notFound } from 'next/navigation'
import { getFile } from '@/packages/cms/lib/github'
import { parseMdx } from '@/packages/cms/lib/parser'
import { ContentEditor } from '@/packages/cms/components/ContentEditor'
import { cmsConfig } from '@/cms.config'
import type { ContentEntry } from '@/packages/cms/types'

const C = {
  text: '#e5e5e5',
  muted: '#aaaaaa',
  border: '#222222',
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ collection: string; slug: string[] }>
}) {
  const { collection, slug } = await params
  const session = await requireSession()

  const collectionDef = cmsConfig.collections[collection]
  if (!collectionDef) notFound()

  const isNew = slug[0] === 'new'
  let entry: ContentEntry | undefined

  if (!isNew) {
    const token = session.githubToken ?? process.env.CMS_GITHUB_TOKEN
    // slug is e.g. ['fr', 'guide-achat', 'my-article'] for MDX collections
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

  return (
    <div>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.8125rem', color: C.muted }}>
        <a href={`/admin/${collection}`} style={{ color: C.muted, textDecoration: 'none' }}>
          {collectionDef.label}
        </a>
        <span style={{ margin: '0 0.5rem', color: C.border }}>/</span>
        <span style={{ color: C.text }}>
          {isNew ? 'Nouvel article' : (entry?.frontmatter.title as string | undefined) ?? slug.join('/')}
        </span>
      </nav>

      <ContentEditor
        collection={collection}
        collectionDef={collectionDef}
        entry={entry}
      />
    </div>
  )
}
