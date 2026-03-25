// @cdc 5.5 — Comparateur outil · SSG · 'use client' composant isolé
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ComparateurTable from '@/components/ui/ComparateurTable'
import NoiseOverlay from '@/components/effects/NoiseOverlay'
import SectionDivider from '@/components/effects/SectionDivider'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'tools.comparateur.meta' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: `/${locale}/outils/comparateur` },
  }
}

export default async function ComparateurPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'tools.comparateur' })

  const compT = {
    title: t('title'), subtitle: t('subtitle'),
    selectModel: t('selectModel'), addModel: t('addModel'),
    criteria: {
      price: t('criteria.price'), autonomy: t('criteria.autonomy'),
      noise: t('criteria.noise'), surface: t('criteria.surface'),
      hepa: t('criteria.hepa'), pet: t('criteria.pet'), score: t('criteria.score'),
    },
    best: t('best'), yes: t('yes'), no: t('no'),
  }

  return (
    <>
      <section style={{ position: 'relative', background: 'var(--text-primary)', padding: 'var(--space-16) var(--space-10)', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '-30%', right: '10%', width: '50%', height: '200%', background: 'radial-gradient(ellipse, rgba(232,149,109,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: 'var(--bg-surface)', margin: '0 0 var(--space-4)', lineHeight: 1.1 }}>
            {compT.title}
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(242,195,154,0.8)', margin: 0, maxWidth: 520, lineHeight: 1.7 }}>
            {compT.subtitle}
          </p>
        </div>
      </section>

      <SectionDivider variant="diagonal" fill="var(--bg-surface)" />

      <section style={{ position: 'relative', background: 'var(--bg-surface)', padding: 'var(--space-12) var(--space-10)', overflow: 'hidden' }}>
        <NoiseOverlay />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <ComparateurTable locale={locale} t={compT} />
        </div>
      </section>
    </>
  )
}
