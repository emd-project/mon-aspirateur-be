import { requireSession } from '@/packages/cms/lib/get-session'
import { list } from '@vercel/blob'
import { MediaBrowser } from '@/packages/cms/components/MediaBrowser'
import type { GitHubFile } from '@/packages/cms/types'

const C = {
  text: '#e5e5e5',
  muted: '#aaaaaa',
}

export default async function MediaPage() {
  const session = await requireSession()

  let files: GitHubFile[] = []
  try {
    const { blobs } = await list({ prefix: 'media/' })
    files = blobs
      .filter((b) => /\.(png|jpe?g|webp|svg|gif)$/i.test(b.pathname))
      .map((b) => ({
        name: b.pathname.split('/').pop() ?? b.pathname,
        path: b.pathname,
        url: b.url,
        size: b.size,
        type: 'file' as const,
        sha: b.url,
        download_url: b.url,
      }))
  } catch {
    // Blob store unreachable — show empty state
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.375rem', fontWeight: 700, color: C.text }}>
          Médias
        </h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: C.muted }}>
          {files.length} fichier{files.length !== 1 ? 's' : ''} · Vercel Blob
        </p>
      </div>

      <MediaBrowser files={files} isAdmin={session.role === 'admin'} />
    </div>
  )
}
