'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Menu, X, Sun, Moon, Monitor } from 'lucide-react'

type HeaderProps = {
  locale: string
  t: {
    guides: string
    comparatifs: string
    tools: string
    toolsQuiz: string
    toolsComparateur: string
    toolsSimulateur: string
    blog: string
    toggleTheme: string
    toggleMenu: string
  }
}

function LogoSvg() {
  return (
    <svg
      viewBox="0 0 180 36"
      fill="none"
      aria-hidden="true"
      style={{ height: 32, width: 'auto' }}
    >
      {/* Manche aspirateur */}
      <line x1="16" y1="3" x2="8" y2="28" stroke="var(--accent-1)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tête */}
      <rect x="2" y="26" width="20" height="6" rx="3" fill="var(--accent-1)" />
      {/* Dot lumineux */}
      <circle cx="25" cy="27" r="2" fill="var(--accent-2)" />
      {/* Wordmark */}
      <text x="32" y="23" fontFamily="Georgia, serif" fontSize="14" fontWeight="700" fill="var(--text-primary)" letterSpacing="-0.2">
        mon-aspirateur
        <tspan fill="var(--accent-1)">.be</tspan>
      </text>
    </svg>
  )
}

function ThemeToggle({ label }: { label: string }) {
  const { theme, setTheme } = useTheme()

  const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setTheme(next)}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '6px',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        transition: 'border-color 0.2s var(--ease-out)',
      }}
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  )
}

type NavLeaf = { href: string; label: string }
type NavGroup = { label: string; children: NavLeaf[] }
type NavItem = NavLeaf | NavGroup

const isNavGroup = (item: NavItem): item is NavGroup => 'children' in item

export default function Header({ locale, t }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const otherLocale = locale === 'fr' ? 'en' : 'fr'

  const navLinks: NavItem[] = [
    { href: `/${locale}/guides`, label: t.guides },
    { href: `/${locale}/comparatifs`, label: t.comparatifs },
    {
      label: t.tools,
      children: [
        { href: `/${locale}/outils/quiz`, label: t.toolsQuiz },
        { href: `/${locale}/outils/comparateur`, label: t.toolsComparateur },
        { href: `/${locale}/outils/simulateur`, label: t.toolsSimulateur },
      ],
    },
    { href: `/${locale}/blog`, label: t.blog },
  ]

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 var(--space-10)',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-6)',
        }}
      >
        {/* Logo */}
        <Link href={`/${locale}`} aria-label="mon-aspirateur.be — accueil" style={{ flexShrink: 0 }}>
          <LogoSvg />
        </Link>

        {/* Nav desktop */}
        <nav aria-label="Navigation principale" style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
          {navLinks.map((item) =>
            isNavGroup(item) ? (
              <div key={item.label} style={{ position: 'relative' }} className="nav-dropdown-parent">
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    cursor: 'default',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {item.label}
                  <span aria-hidden="true" style={{ fontSize: '10px' }}>▾</span>
                </span>
                {/* Dropdown — shown on hover via CSS would need stylesheet; using simple approach */}
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    minWidth: 160,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-2) 0',
                    marginTop: 'var(--space-2)',
                    boxShadow: 'var(--shadow-md)',
                    display: 'none',
                  }}
                  className="nav-dropdown"
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      style={{
                        display: 'block',
                        padding: 'var(--space-2) var(--space-4)',
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                      }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
          {/* Langue */}
          <Link
            href={`/${otherLocale}`}
            aria-label={`Switch to ${otherLocale === 'en' ? 'English' : 'Français'}`}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {otherLocale}
          </Link>

          <ThemeToggle label={t.toggleTheme} />

          {/* Burger mobile */}
          <button
            type="button"
            aria-label={t.toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
            className="mobile-menu-btn"
          >
            {menuOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Navigation mobile"
          style={{
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            padding: 'var(--space-4) var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          {navLinks.map((item) =>
            isNavGroup(item) ? (
              <div key={item.label}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {item.label}
                </span>
                <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingLeft: 'var(--space-4)' }}>
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href} onClick={() => setMenuOpen(false)} style={{ fontSize: '15px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>
                {item.label}
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  )
}
