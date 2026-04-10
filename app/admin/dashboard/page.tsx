import { requireSession } from '@/packages/cms/lib/get-session'
import { getUsers } from '@/packages/cms/lib/users'
import Link from 'next/link'
import { cmsConfig } from '@/cms.config'
import { listFilesRecursive } from '@/packages/cms/lib/github'

const C = {
  surface: '#FFFFFF',
  border: '#EDE5D8',
  text: '#1A1714',
  muted: '#6B5E54',
  dim: '#9C8E84',
  accent: '#C4622D',
  accentSoft: 'rgba(196,98,45,.08)',
  accentBorder: 'rgba(196,98,45,.2)',
}

export default async function DashboardPage() {
  const session = await requireSession()
  const token = process.env.CMS_GITHUB_TOKEN

  const counts: Record<string, number> = {}
  for (const [key, col] of Object.entries(cmsConfig.collections)) {
    try {
      const files = await listFilesRecursive(cmsConfig.repo, col.path, cmsConfig.branch, token)
      counts[key] = files.filter((f) => f.name.endsWith('.mdx') || f.name.endsWith('.yaml')).length
    } catch {
      counts[key] = 0
    }
  }

  let displayName = session.name
  if (!displayName) {
    if (session.userId.startsWith('github:')) {
      displayName = session.userId.replace('github:', '')
    } else {
      try {
        const token = process.env.CMS_GITHUB_TOKEN
        const { users } = await getUsers(cmsConfig.repo, cmsConfig.branch, token)
        displayName = users.find((u) => u.id === session.userId)?.name ?? session.userId
      } catch {
        displayName = session.userId
      }
    }
  }
  const firstName = displayName.split(' ')[0] ?? displayName
  const initial = firstName[0]?.toUpperCase() ?? '?'

  return (
    <div>
      <style>{`
        .dash-card {
          display: block;
          background: ${C.surface};
          border: 1px solid ${C.border};
          border-radius: 12px;
          padding: 1.375rem 1.25rem;
          text-decoration: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .dash-card:hover {
          border-color: #D9CEBC;
          box-shadow: 0 4px 12px rgba(26,23,20,.06);
        }
      `}</style>

      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: C.accent,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.375rem',
          fontWeight: 700,
          color: '#fff',
          userSelect: 'none',
          letterSpacing: 0,
        }}>
          {initial}
        </div>
        <div>
          <h1 style={{ margin: '0 0 0.2rem', fontSize: '1.625rem', fontWeight: 700, color: C.text, letterSpacing: '-0.02em' }}>
            Bonjour, {firstName}
          </h1>
          <p style={{ margin: 0, color: C.muted, fontSize: '0.9375rem' }}>
            {cmsConfig.siteName} — tableau de bord
          </p>
        </div>
      </div>

      <p style={{ margin: '0 0 0.875rem', fontSize: '0.75rem', fontWeight: 600, color: C.dim, textTransform: 'uppercase', letterSpacing: '.08em' }}>
        Collections
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '0.875rem',
          marginBottom: '2rem',
        }}
      >
        {Object.entries(cmsConfig.collections).map(([key, col]) => (
          <Link key={key} href={`/admin/${key}`} className="dash-card">
            <div style={{ fontSize: '2rem', fontWeight: 800, color: C.accent, lineHeight: 1, letterSpacing: '-0.04em' }}>
              {counts[key] ?? 0}
            </div>
            <div style={{ marginTop: '0.5rem', fontWeight: 600, color: C.text, fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>
              {col.label}
            </div>
            <div style={{ marginTop: '0.25rem', fontSize: '0.8125rem', color: C.dim }}>
              {col.readOnly ? 'Modifier →' : 'Gérer →'}
            </div>
          </Link>
        ))}
      </div>

      <p style={{ margin: '0 0 0.875rem', fontSize: '0.75rem', fontWeight: 600, color: C.dim, textTransform: 'uppercase', letterSpacing: '.08em' }}>
        Outils
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.875rem' }}>
        <Link href="/admin/media" className="dash-card">
          <div style={{ width: 36, height: 36, borderRadius: 9, background: C.accentSoft, border: `1px solid ${C.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.625rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="2" y="4" width="20" height="16" rx="2" stroke={C.accent} strokeWidth="1.5"/>
              <path d="M2 16l5-5 4 4 3-3 5 4" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="9" r="1.5" fill={C.accent}/>
            </svg>
          </div>
          <div style={{ fontWeight: 600, color: C.text, fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>Médias</div>
          <div style={{ marginTop: '0.25rem', fontSize: '0.8125rem', color: C.dim }}>Images, SVG →</div>
        </Link>

        {session.role === 'admin' && (
          <Link href="/admin/users" className="dash-card">
            <div style={{ width: 36, height: 36, borderRadius: 9, background: C.accentSoft, border: `1px solid ${C.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.625rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="9" cy="7" r="3" stroke={C.accent} strokeWidth="1.5"/>
                <path d="M3 19a6 6 0 0112 0" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16 3c1.66 0 3 1.34 3 3s-1.34 3-3 3M19 19a4 4 0 00-4-4" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontWeight: 600, color: C.text, fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>Utilisateurs</div>
            <div style={{ marginTop: '0.25rem', fontSize: '0.8125rem', color: C.dim }}>Gestion accès →</div>
          </Link>
        )}
      </div>
    </div>
  )
}
