import { requireSession } from '@/packages/cms/lib/get-session'
import Link from 'next/link'
import { cmsConfig } from '@/cms.config'
import { listFilesRecursive } from '@/packages/cms/lib/github'

const C = {
  surface: '#111111',
  surface2: '#161616',
  border: '#222222',
  text: '#e5e5e5',
  muted: '#aaaaaa',
  accent: '#ff3d57',
}

export default async function DashboardPage() {
  const session = await requireSession()
  const token = session.githubToken ?? process.env.CMS_GITHUB_TOKEN

  // Fetch article counts per collection
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
          <Link
            key={key}
            href={`/admin/${key}`}
            style={{
              display: 'block',
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '1.25rem',
              textDecoration: 'none',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = '#333')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = C.border)}
          >
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

        {/* Media card */}
        <Link
          href="/admin/media"
          style={{
            display: 'block',
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '1.25rem',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>🖼</div>
          <div style={{ marginTop: '0.375rem', fontWeight: 600, color: C.text, fontSize: '0.9375rem' }}>
            Médias
          </div>
          <div style={{ marginTop: '0.25rem', fontSize: '0.8125rem', color: C.muted }}>
            Images, SVG →
          </div>
        </Link>

        {session.role === 'admin' && (
          <Link
            href="/admin/users"
            style={{
              display: 'block',
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '1.25rem',
              textDecoration: 'none',
            }}
          >
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
