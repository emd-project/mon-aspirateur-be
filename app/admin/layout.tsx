import { getSession } from '@/packages/cms/lib/get-session'
import Link from 'next/link'
import { cmsConfig } from '@/cms.config'

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg: '#0a0a0a',
  surface: '#111111',
  border: '#222222',
  text: '#e5e5e5',
  muted: '#aaaaaa',
  dim: '#444444',
  accent: '#ff3d57',
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getSession()

  return (
    <html lang="fr" style={{ colorScheme: 'dark' }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>Admin — {cmsConfig.siteName}</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; background: ${C.bg}; color: ${C.text}; font-family: system-ui, -apple-system, sans-serif; }
          a { color: inherit; text-decoration: none; }
          input, textarea, select, button { font-family: inherit; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: ${C.bg}; }
          ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
          @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
        `}</style>
      </head>
      <body>
        {session ? (
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <nav
              style={{
                width: 220,
                flexShrink: 0,
                background: C.surface,
                borderRight: `1px solid ${C.border}`,
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem 0',
                position: 'sticky',
                top: 0,
                height: '100vh',
                overflowY: 'auto',
              }}
            >
              {/* Logo */}
              <div style={{ padding: '0 1rem 1rem', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: C.accent,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cmsConfig.siteName}
                  </span>
                </div>
              </div>

              {/* Nav links */}
              <div style={{ padding: '0.75rem 0.5rem', flex: 1 }}>
                <SidebarLink href="/admin/dashboard" label="Dashboard" icon="⊞" />
                {Object.entries(cmsConfig.collections).map(([key, col]) => (
                  <SidebarLink key={key} href={`/admin/${key}`} label={col.label} icon="☰" />
                ))}
                <SidebarLink href="/admin/media" label="Médias" icon="🖼" />
                {session.role === 'admin' && (
                  <SidebarLink href="/admin/users" label="Utilisateurs" icon="👥" />
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '0.75rem 1rem', borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session.userId}
                </div>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/api/cms/auth/logout"
                  style={{
                    display: 'block',
                    padding: '0.375rem 0.5rem',
                    borderRadius: 6,
                    fontSize: '0.8125rem',
                    color: C.muted,
                    background: 'transparent',
                  }}
                >
                  Déconnexion
                </a>
              </div>
            </nav>

            {/* Main */}
            <main
              id="main-content"
              style={{
                flex: 1,
                minWidth: 0,
                padding: '2rem',
                maxWidth: '100%',
                overflowX: 'hidden',
              }}
            >
              {children}
            </main>
          </div>
        ) : (
          /* Login page: no sidebar */
          <main id="main-content">{children}</main>
        )}
      </body>
    </html>
  )
}

function SidebarLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        borderRadius: 7,
        fontSize: '0.875rem',
        color: '#aaaaaa',
        marginBottom: 2,
        transition: 'background 0.1s, color 0.1s',
      }}
    >
      <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{icon}</span>
      {label}
    </Link>
  )
}
