import { requireSession } from '@/packages/cms/lib/get-session'
import { notFound } from 'next/navigation'
import { listFilesRecursive, getFile } from '@/packages/cms/lib/github'
import { parseMdx, parseYaml } from '@/packages/cms/lib/parser'
import { CollectionList } from '@/packages/cms/components/CollectionList'
import { CsvImport } from '@/packages/cms/components/CsvImport'
import { cmsConfig } from '@/cms.config'

const C = {
  text: '#1A1714',
  muted: '#6B5E54',
  dim: '#9C8E84',
  border: '#EDE5D8',
  surface2: '#F0EBE3',
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
        const frontmatter =
          collectionDef.format === 'yaml'
            ? parseYaml(file.content)
            : parseMdx(file.content).frontmatter
        return {
          slug: f.name.replace(/\.(mdx|yaml)$/, ''),
          filePath: f.path,
          sha: file.sha,
          frontmatter,
        }
      })
    )

    entries = parsed.filter(Boolean) as typeof entries
  } catch {
    // GitHub API unreachable — show empty state
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: C.text, letterSpacing: '-0.02em' }}>
            {collectionDef.label}
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: C.muted }}>
            {entries.length} entrée{entries.length !== 1 ? 's' : ''}
          </p>
        </div>
        {collectionDef.csvEnabled && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <a
              href={`/api/cms/csv/${collection}?template=1`}
              download={`${collection}-template.csv`}
              style={{ padding: '0.5rem 0.875rem', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Template CSV
            </a>
            <a
              href={`/api/cms/csv/${collection}`}
              download={`${collection}.csv`}
              style={{ padding: '0.5rem 0.875rem', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Exporter CSV
            </a>
            <CsvImport collection={collection} />
          </div>
        )}
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
