import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import QuizStepper from '@/components/ui/QuizStepper'

export const dynamic = 'force-static'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'quiz.meta' })
  return { title: t('title'), description: t('description') }
}

export default async function QuizPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'quiz' })

  return (
    <main id="main-content">
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="typo-overline" style={{ color: 'var(--accent-1)', marginBottom: '.5rem' }}>
            Recommandation personnalisée
          </p>
          <h1 className="typo-h1-article" style={{ marginBottom: '.75rem' }}>{t('title')}</h1>
          <p className="typo-lead">{t('subtitle')}</p>
        </header>

        <QuizStepper />

      </div>
    </main>
  )
}
