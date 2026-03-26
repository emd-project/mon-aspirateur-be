import { requireSession } from '@/packages/cms/lib/get-session'
import { listFiles } from '@/packages/cms/lib/github'
import { MediaBrowser } from '@/packages/cms/components/MediaBrowser'
import { cmsConfig } from '@/cms.config'
import type { GitHubFile } from '@/packages/cms/types'

const C = {
  text: '#e5e5e5',
  muted: '#aaaaaa',
}

export default async function MediaPage() {
  const session = await requireSession()
  const token = process.env.CMS_GITHUB_TOKEN

  let files: GitHubFile[] = []
  try {
    const all = await listFiles(
      cmsConfig.repo,
      cmsConfig.media.path,
      cmsConfig.branch,
      token
    )
    files = all.filter(
      (f) => f.type === 'file' && /\.(png|jpe?g|webp|svg|gif)$/i.test(f.name)
    )
  } catch {
    // GitHub API unreachable — show empty state
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.375rem', fontWeight: 700, color: C.text }}>
          Médias
        </h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: C.muted }}>
          {files.length} fichier{files.length !== 1 ? 's' : ''} · {cmsConfig.media.path}
        </p>
      </div>

      <MediaBrowser files={files} isAdmin={session.role === 'admin'} />
    </div>
  )
}
