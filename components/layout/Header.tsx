'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useTranslations, useLocale } from 'next-intl'
import { categoryOrder } from '@/lib/data/comparateur'

type NavLeaf  = { href: string; label: string }
type NavGroup = { label: string; children: NavLeaf[] }
type NavItem  = NavLeaf | NavGroup

const isNavGroup = (item: NavItem): item is NavGroup => 'children' in item

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

export default function Header() {
  const t      = useTranslations('nav')
  const locale = useLocale()
  const { resolvedTheme, setTheme } = useTheme()

  const [menuOpen,  setMenuOpen]  = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [scrolled,  setScrolled]  = useState(false)

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 12)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const base = `/${locale}`

  const categoryLabels: Record<string, string> = {
    balai:       t('categories.balai'),
    robot:       t('categories.robot'),
    traineau:    t('categories.traineau'),
    laveur:      t('categories.laveur'),
    accessoires: t('categories.accessoires'),
  }

  const navLinks: NavItem[] = [
    {
      label: t('comparer'),
      children: categoryOrder.map(cat => ({
        href:  `${base}/comparer/${cat}`,
        label: categoryLabels[cat] ?? cat,
      })),
    },
    {
      label: t('choisir'),
      children: categoryOrder.slice(0, 4).map(cat => ({
        href:  `${base}/choisir/${cat}`,
        label: categoryLabels[cat] ?? cat,
      })),
    },
    { href: `${base}/marques`, label: t('marques') },
    { href: `${base}/deals`,   label: t('deals') },
    { href: `${base}/blog`,    label: t('blog') },
  ]

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'box-shadow .25s',
        boxShadow: scrolled ? '0 1px 0 var(--border-light)' : 'none',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        background: scrolled ? 'rgba(250,247,242,.9)' : 'transparent',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '64px', gap: '1.5rem' }}>

          {/* Logo */}
          <Link
            href={base}
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: '1.2rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              textDecoration: 'none',
              letterSpacing: '-.02em',
              flexShrink: 0,
            }}
          >
            Mon<span style={{ color: 'var(--accent-1)' }}>Aspirateur</span>
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label="Navigation principale"
            style={{ display: 'flex', alignItems: 'center', gap: '.1rem', flex: 1 }}
          >
            {navLinks.map(item => (
              isNavGroup(item) ? (
                <div key={item.label} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setOpenGroup(openGroup === item.label ? null : item.label)}
                    aria-expanded={openGroup === item.label}
                    aria-haspopup="true"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.3rem',
                      padding: '.4rem .75rem',
                      borderRadius: 'var(--radius-pill)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '.9rem',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {item.label}
                    <ChevronDown />
                  </button>

                  {openGroup === item.label && (
                    <>
                      <div
                        style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                        onClick={() => setOpenGroup(null)}
                        aria-hidden="true"
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + .5rem)',
                          left: 0,
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-lg)',
                          boxShadow: 'var(--shadow-lg)',
                          padding: '.5rem',
                          minWidth: '200px',
                          zIndex: 20,
                        }}
                      >
                        {item.children.map(child => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpenGroup(null)}
                            style={{
                              display: 'block',
                              padding: '.5rem .75rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '.875rem',
                              color: 'var(--text-secondary)',
                              textDecoration: 'none',
                            }}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  key={(item as NavLeaf).href}
                  href={(item as NavLeaf).href}
                  style={{
                    padding: '.4rem .75rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '.9rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <Link
              href={`${base}/quiz`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '.5rem 1rem',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--accent-1)',
                color: '#fff',
                fontSize: '.85rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Quiz
            </Link>

            {resolvedTheme !== undefined && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                aria-label={t('toggleTheme')}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={t('toggleMenu')}
              aria-expanded={menuOpen}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {menuOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-light)',
            padding: '1rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '.25rem',
          }}
        >
          {navLinks.map(item =>
            isNavGroup(item) ? (
              <div key={item.label}>
                <div style={{
                  fontSize: '.72rem',
                  fontWeight: 700,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  padding: '.75rem .5rem .3rem',
                }}>
                  {item.label}
                </div>
                {item.children.map(child => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '.45rem .5rem',
                      fontSize: '.9rem',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                    }}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={(item as NavLeaf).href}
                href={(item as NavLeaf).href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '.65rem .5rem',
                  fontSize: '.95rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  borderTop: '1px solid var(--border-light)',
                }}
              >
                {item.label}
              </Link>
            )
          )}

          <Link
            href={`${base}/quiz`}
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block',
              marginTop: '.75rem',
              padding: '.75rem',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--accent-1)',
              color: '#fff',
              textAlign: 'center',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Quiz — Trouver mon aspirateur
          </Link>
        </div>
      )}
    </header>
  )
}
