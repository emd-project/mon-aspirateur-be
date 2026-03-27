import { requireSession } from '@/packages/cms/lib/get-session'
import { notFound } from 'next/navigation'
import { listFilesRecursive, getFile } from '@/packages/cms/lib/github'
import { parseMdx } from '@/packages/cms/lib/parser'
import { CollectionList } from '@/packages/cms/components/CollectionList'
import { cmsConfig } from '@/cms.config'

const C = {
  text: '#1A1714',
  muted: '#6B5E54',
  accent: '#C4622D',
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>
}) {
  const { collection } = await params
  const session = await requireSession()

  const collectionDef = cmsConfig.collections[collection]
  if (!collectionDef) notFound()

  const token = process.env.CMS_GITHUB_TOKEN

  let entries: {
    slug: string
    filePath: string
    sha?: string
    frontmatter: Record<string, unknown>
  }[] = []

  try {
    const files = await listFilesRecursive(cmsConfig.repo, collectionDef.path, cmsConfig.branch, token)
    const mdxFiles = files.filter((f) => f.name.endsWith('.mdx') || f.name.endsWith('.yaml'))

    const parsed = await Promise.all(
      mdxFiles.map(async (f) => {
        const file = await getFile(cmsConfig.repo, f.path, cmsConfig.branch, token)
        if (!file) return null
        const entry = parseMdx(file.content)
        return {
          slug: f.name.replace(/\.(mdx|yaml)$/, ''),
          filePath: f.path,
          sha: file.sha,
          frontmatter: entry.frontmatter,
        }
      })
    )

    entries = parsed.filter(Boolean) as typeof entries
  } catch {
    // GitHub API unreachable — show empty state
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: C.text, letterSpacing: '-0.02em' }}>
            {collectionDef.label}
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: C.muted }}>
            {entries.length} entrée{entries.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <CollectionList
        collection={collection}
        collectionDef={collectionDef}
        entries={entries}
        isAdmin={session.role === 'admin'}
      />
    </div>
  )
}
