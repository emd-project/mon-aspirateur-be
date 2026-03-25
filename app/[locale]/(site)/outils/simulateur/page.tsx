// @cdc 5.5 — Simulateur outil · SSG · 'use client' composant isolé
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SimulateurForm from '@/components/ui/SimulateurForm'
import NoiseOverlay from '@/components/effects/NoiseOverlay'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'tools.simulateur.meta' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: `/${locale}/outils/simulateur` },
  }
}

export default async function SimulateurPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'tools.simulateur' })

  const simT = {
    title: t('title'), subtitle: t('subtitle'),
    surface: t('surface'), rooms: t('rooms'), frequency: t('frequency'),
    floorType: t('floorType'), calculate: t('calculate'),
    results: {
      title: t('results.title'), minAutonomy: t('results.minAutonomy'),
      binCapacity: t('results.binCapacity'), noiseLevel: t('results.noiseLevel'),
      matchingProducts: t('results.matchingProducts'),
    },
  }

  return (
    <>
      <section style={{ position: 'relative', background: 'var(--text-primary)', padding: 'var(--space-16) var(--space-10)', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: '40%', height: '150%', background: 'radial-gradient(ellipse, rgba(204,74,26,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: 'var(--bg-surface)', margin: '0 0 var(--space-4)', lineHeight: 1.1 }}>
            {simT.title}
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(242,195,154,0.8)', margin: 0, maxWidth: 520, lineHeight: 1.7 }}>
            {simT.subtitle}
          </p>
        </div>
      </section>

      <section style={{ position: 'relative', background: 'var(--bg-surface)', padding: 'var(--space-12) var(--space-10)', overflow: 'hidden' }}>
        <NoiseOverlay />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <SimulateurForm locale={locale} t={simT} />
        </div>
      </section>
    </>
  )
}
