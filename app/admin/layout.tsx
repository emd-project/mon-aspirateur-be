import { getSession } from '@/packages/cms/lib/get-session'
import Link from 'next/link'
import { cmsConfig } from '@/cms.config'

// ─── Design tokens (matching site warm palette) ───────────────────────────────
const S = {
  // Sidebar — warm dark
  sidebarBg: '#1C1917',
  sidebarBorder: '#2E2A27',
  sidebarText: '#F5EFE7',
  sidebarMuted: '#C4B5A5',
  sidebarHover: '#2C2926',
  // Main — warm light
  mainBg: '#FAF7F2',
  mainBorder: '#EDE5D8',
  // Accent
  accent: '#C4622D',
  accentText: '#FFFFFF',
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getSession()

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>Admin — {cmsConfig.siteName}</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html { color-scheme: light; }
          body { margin: 0; background: ${S.mainBg}; color: #1A1714; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; }
          a { color: inherit; text-decoration: none; }
          input, textarea, select, button { font-family: inherit; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: ${S.sidebarBg}; }
          ::-webkit-scrollbar-thumb { background: #3A3530; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: #4A4540; }
          @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
          .sidebar-link {
            display: flex; align-items: center; gap: 0.5rem;
            padding: 0.5rem 0.75rem; border-radius: 7px;
            font-size: 0.875rem; color: ${S.sidebarMuted};
            margin-bottom: 2px; transition: background 0.12s, color 0.12s;
          }
          .sidebar-link:hover { background: ${S.sidebarHover}; color: ${S.sidebarText}; }
          .sidebar-link.active { background: rgba(196,98,45,.2); color: ${S.accent}; }
        `}</style>
      </head>
      <body>
        {session ? (
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <nav
              style={{
                width: 228,
                flexShrink: 0,
                background: S.sidebarBg,
                borderRight: `1px solid ${S.sidebarBorder}`,
                display: 'flex',
                flexDirection: 'column',
                padding: '0',
                position: 'sticky',
                top: 0,
                height: '100vh',
                overflowY: 'auto',
              }}
            >
              {/* Logo */}
              <div style={{ padding: '1.25rem 1rem', borderBottom: `1px solid ${S.sidebarBorder}` }}>
                <Link href="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: S.accent,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M3 13c0-3 1-5 5-5s5 2 5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="8" cy="5" r="2" fill="#fff"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: S.sidebarText, letterSpacing: '-0.01em' }}>
                    {cmsConfig.siteName}
                  </span>
                </Link>
              </div>

              {/* Nav */}
              <div style={{ padding: '0.75rem 0.5rem', flex: 1 }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#4A4540', textTransform: 'uppercase', letterSpacing: '.08em', padding: '0.25rem 0.75rem', margin: '0 0 0.25rem' }}>
                  Contenu
                </p>
                <Link href="/admin/dashboard" className="sidebar-link">
                  <NavIcon d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" />
                  Dashboard
                </Link>
                {Object.entries(cmsConfig.collections).map(([key, col]) => (
                  <Link key={key} href={`/admin/${key}`} className="sidebar-link">
                    <NavIcon d={key === 'pages' ? "M4 6h8M4 9h6M4 12h4M6 2h8l2 3v11H2V2z" : "M4 6h8M4 9h8M4 12h5M6 2h8l2 3v11H2V2z"} />
                    {col.label}
                  </Link>
                ))}

                <div style={{ height: 1, background: S.sidebarBorder, margin: '0.75rem 0.5rem' }} />

                <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#4A4540', textTransform: 'uppercase', letterSpacing: '.08em', padding: '0.25rem 0.75rem', margin: '0 0 0.25rem' }}>
                  Outils
                </p>
                <Link href="/admin/media" className="sidebar-link">
                  <NavIcon d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm10 8l-3-3-2 2-2-2-3 3" />
                  Médias
                </Link>
                {session.role === 'admin' && (
                  <Link href="/admin/users" className="sidebar-link">
                    <NavIcon d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-9 8a6 6 0 0112 0H0zm13-6a3 3 0 11-6 0 3 3 0 016 0zm3 8a6 6 0 00-9-5.2" />
                    Utilisateurs
                  </Link>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '0.875rem 1rem', borderTop: `1px solid ${S.sidebarBorder}` }}>
                <div style={{ fontSize: '0.75rem', color: S.sidebarMuted, marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session.userId.replace('github:', '')}
                </div>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/api/cms/auth/logout"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.5rem',
                    borderRadius: 6,
                    fontSize: '0.8125rem',
                    color: '#6B5E54',
                    background: 'transparent',
                    transition: 'color 0.1s',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M6 2H2v12h4M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
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
                padding: '2rem 2.5rem',
                maxWidth: '100%',
                overflowX: 'hidden',
                background: S.mainBg,
              }}
            >
              {children}
            </main>
          </div>
        ) : (
          <main id="main-content">{children}</main>
        )}
      </body>
    </html>
  )
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden style={{ flexShrink: 0, opacity: 0.7 }}>
      <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
