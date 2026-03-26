import { requireSession } from '@/packages/cms/lib/get-session'
import Link from 'next/link'
import { cmsConfig } from '@/cms.config'
import { listFilesRecursive } from '@/packages/cms/lib/github'

const C = {
  surface: '#111111',
  border: '#222222',
  text: '#e5e5e5',
  muted: '#aaaaaa',
  accent: '#ff3d57',
}

export default async function DashboardPage() {
  const session = await requireSession()
  const token = session.githubToken ?? process.env.CMS_GITHUB_TOKEN

  const counts: Record<string, number> = {}
  for (const [key, col] of Object.entries(cmsConfig.collections)) {
    try {
      const files = await listFilesRecursive(cmsConfig.repo, col.path, cmsConfig.branch, token)
      counts[key] = files.filter((f) => f.name.endsWith('.mdx') || f.name.endsWith('.yaml')).length
    } catch {
      counts[key] = 0
    }
  }

  return (
    <div>
      <style>{`
        .dash-card {
          display: block;
          background: ${C.surface};
          border: 1px solid ${C.border};
          border-radius: 10px;
          padding: 1.25rem;
          text-decoration: none;
          transition: border-color 0.15s;
        }
        .dash-card:hover { border-color: #333; }
      `}</style>

      <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: C.text }}>
        Dashboard
      </h1>
      <p style={{ margin: '0 0 2rem', color: C.muted, fontSize: '0.875rem' }}>
        Bienvenue, {session.userId.replace('github:', '')}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {Object.entries(cmsConfig.collections).map(([key, col]) => (
          <Link key={key} href={`/admin/${key}`} className="dash-card">
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: C.accent, lineHeight: 1 }}>
              {counts[key] ?? 0}
            </div>
            <div style={{ marginTop: '0.375rem', fontWeight: 600, color: C.text, fontSize: '0.9375rem' }}>
              {col.label}
            </div>
            <div style={{ marginTop: '0.25rem', fontSize: '0.8125rem', color: C.muted }}>
              Voir tous →
            </div>
          </Link>
        ))}

        <Link href="/admin/media" className="dash-card">
          <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>🖼</div>
          <div style={{ marginTop: '0.375rem', fontWeight: 600, color: C.text, fontSize: '0.9375rem' }}>
            Médias
          </div>
          <div style={{ marginTop: '0.25rem', fontSize: '0.8125rem', color: C.muted }}>
            Images, SVG →
          </div>
        </Link>

        {session.role === 'admin' && (
          <Link href="/admin/users" className="dash-card">
            <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>👥</div>
            <div style={{ marginTop: '0.375rem', fontWeight: 600, color: C.text, fontSize: '0.9375rem' }}>
              Utilisateurs
            </div>
            <div style={{ marginTop: '0.25rem', fontSize: '0.8125rem', color: C.muted }}>
              Gestion accès →
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
