// @cdc 5.5 — Quiz outil · SSG · 'use client' composant isolé
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import QuizStepper from '@/components/ui/QuizStepper'
import NoiseOverlay from '@/components/effects/NoiseOverlay'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'tools.quiz.meta' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: `/${locale}/outils/quiz` },
  }
}

export default async function QuizPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'tools.quiz' })

  const quizT = {
    title: t('title'), subtitle: t('subtitle'), stepOf: t('stepOf'),
    next: t('next'), previous: t('previous'), seeResults: t('seeResults'),
    restart: t('restart'), resultsTitle: t('resultsTitle'), compatibility: t('compatibility'),
    questions: {
      logement: { label: t('questions.logement.label'), options: { appartement: t('questions.logement.options.appartement'), maison: t('questions.logement.options.maison') } },
      surface:  { label: t('questions.surface.label'),  hint: t('questions.surface.hint') },
      sol:      { label: t('questions.sol.label'),      options: { parquet: t('questions.sol.options.parquet'), moquette: t('questions.sol.options.moquette'), mixte: t('questions.sol.options.mixte') } },
      animaux:  { label: t('questions.animaux.label'),  options: { oui: t('questions.animaux.options.oui'), non: t('questions.animaux.options.non') } },
      budget:   { label: t('questions.budget.label'),   hint: t('questions.budget.hint') },
      priorite: { label: t('questions.priorite.label'), options: { silence: t('questions.priorite.options.silence'), autonomie: t('questions.priorite.options.autonomie'), puissance: t('questions.priorite.options.puissance') } },
    },
  }

  return (
    <>
      {/* Hero — effect-tools-section */}
      <section style={{ position: 'relative', background: 'var(--text-primary)', padding: 'var(--space-16) var(--space-10)', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '-20%', right: '-5%', width: '40%', height: '150%', background: 'radial-gradient(ellipse, rgba(242,196,154,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: 'var(--bg-surface)', margin: '0 0 var(--space-4)', lineHeight: 1.1 }}>
            {quizT.title}
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(242,195,154,0.8)', margin: 0, maxWidth: 520, lineHeight: 1.7 }}>
            {quizT.subtitle}
          </p>
        </div>
      </section>

      <section style={{ position: 'relative', background: 'var(--bg-surface)', padding: 'var(--space-12) var(--space-10)', overflow: 'hidden' }}>
        <NoiseOverlay />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <QuizStepper locale={locale} t={quizT} />
        </div>
      </section>
    </>
  )
}
