'use client'

import { useReducer } from 'react'
import { useTranslations } from 'next-intl'
import { getProductsByBudget } from '@/lib/data/brands'
import type { ProductCategory } from '@/lib/data/types'

type QuizState = {
  step: number
  logement: 'studio' | 'appartement' | 'maison' | null
  sol: 'parquet' | 'moquette' | 'mixte' | null
  animaux: 'non' | 'chat' | 'chien' | 'plusieurs' | null
  budget: 'moins200' | '200_400' | '400_700' | 'plus700' | null
  done: boolean
}

type QuizAction =
  | { type: 'SET_LOGEMENT'; value: QuizState['logement'] }
  | { type: 'SET_SOL';      value: QuizState['sol'] }
  | { type: 'SET_ANIMAUX';  value: QuizState['animaux'] }
  | { type: 'SET_BUDGET';   value: QuizState['budget'] }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'RESET' }

const TOTAL_STEPS = 4

const initialState: QuizState = {
  step: 1, logement: null, sol: null, animaux: null, budget: null, done: false,
}

function reducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_LOGEMENT': return { ...state, logement: action.value }
    case 'SET_SOL':      return { ...state, sol: action.value }
    case 'SET_ANIMAUX':  return { ...state, animaux: action.value }
    case 'SET_BUDGET':   return { ...state, budget: action.value }
    case 'NEXT': {
      const next = state.step + 1
      return { ...state, step: next, done: next > TOTAL_STEPS }
    }
    case 'PREV': return { ...state, step: Math.max(1, state.step - 1), done: false }
    case 'RESET': return initialState
    default: return state
  }
}

// Recommande une catégorie selon les réponses
function recommendCategory(state: QuizState): ProductCategory {
  if (state.logement === 'studio') return 'balai'
  if (state.budget === 'moins200') return 'balai'
  if (state.budget === 'plus700') return 'robot'
  if (state.animaux === 'chien' || state.animaux === 'plusieurs') return 'robot'
  if (state.sol === 'moquette') return 'traineau'
  return 'balai'
}

function OptionBtn({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '.75rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        border: selected ? '2px solid var(--accent-1)' : '1.5px solid var(--border-medium)',
        background: selected ? 'var(--accent-1-soft)' : 'var(--bg-surface)',
        color: selected ? 'var(--accent-1)' : 'var(--text-primary)',
        fontWeight: selected ? 700 : 500,
        fontSize: '.9rem',
        cursor: 'pointer',
        transition: 'all .15s',
        textAlign: 'left',
        width: '100%',
      }}
    >
      {label}
    </button>
  )
}

export default function QuizStepper() {
  const t = useTranslations('quiz')
  const [state, dispatch] = useReducer(reducer, initialState)

  const canAdvance = (): boolean => {
    if (state.step === 1) return state.logement !== null
    if (state.step === 2) return state.sol !== null
    if (state.step === 3) return state.animaux !== null
    if (state.step === 4) return state.budget !== null
    return true
  }

  if (state.done) {
    const category = recommendCategory(state)
    const budget = state.budget ?? 'moins200'
    const results = getProductsByBudget(category, budget)
    const catLabel: Record<ProductCategory, string> = {
      balai: 'Aspirateurs balai', robot: 'Robots aspirateurs',
      traineau: 'Aspirateurs traîneau', laveur: 'Laveurs de sol', accessoires: 'Accessoires',
    }

    return (
      <div>
        <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '.5rem', color: 'var(--text-primary)' }}>
          {t('resultsTitle')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '.9rem' }}>
          Pour vous, on recommande les <strong>{catLabel[category]}</strong>.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {results.map(p => {
            const href = p.affiliateUrl !== '#'
              ? p.affiliateUrl
              : `https://www.amazon.fr/s?k=${encodeURIComponent(`${p.brandName} ${p.name}`)}`
            return (
              <div key={p.name} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem' }}>
                <div>
                  <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.2rem' }}>
                    {p.brandName}
                  </div>
                  <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '.25rem' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>{p.highlight}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, fontSize: '1.25rem', color: 'var(--accent-1)' }}>
                    {p.priceEur} €
                  </span>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="btn btn-primary"
                    style={{ fontSize: '.85rem', padding: '.5rem 1rem' }}
                  >
                    Voir sur Amazon →
                  </a>
                </div>
              </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: 'RESET' })}
          className="btn btn-ghost"
          style={{ marginTop: '1.5rem' }}
        >
          {t('restart')}
        </button>
      </div>
    )
  }

  const progress = (state.step / TOTAL_STEPS) * 100

  return (
    <div>
      {/* Barre de progression */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem', fontSize: '.8rem', color: 'var(--text-muted)' }}>
          <span>{t('stepOf', { current: state.step, total: TOTAL_STEPS })}</span>
          <span>{Math.round(progress)} %</span>
        </div>
        <div className="compare-bar-track">
          <div className="compare-bar-fill" style={{ width: `${progress}%`, background: 'var(--accent-1)', transition: 'width .3s' }} />
        </div>
      </div>

      {/* Step 1 — Logement */}
      {state.step === 1 && (
        <div>
          <p style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
            {t('questions.logement.label')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {(['studio', 'appartement', 'maison'] as const).map(v => (
              <OptionBtn key={v} label={t(`questions.logement.options.${v}`)} selected={state.logement === v} onClick={() => dispatch({ type: 'SET_LOGEMENT', value: v })} />
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Sol */}
      {state.step === 2 && (
        <div>
          <p style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
            {t('questions.sol.label')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {(['parquet', 'moquette', 'mixte'] as const).map(v => (
              <OptionBtn key={v} label={t(`questions.sol.options.${v}`)} selected={state.sol === v} onClick={() => dispatch({ type: 'SET_SOL', value: v })} />
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Animaux */}
      {state.step === 3 && (
        <div>
          <p style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
            {t('questions.animaux.label')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {(['non', 'chat', 'chien', 'plusieurs'] as const).map(v => (
              <OptionBtn key={v} label={t(`questions.animaux.options.${v}`)} selected={state.animaux === v} onClick={() => dispatch({ type: 'SET_ANIMAUX', value: v })} />
            ))}
          </div>
        </div>
      )}

      {/* Step 4 — Budget */}
      {state.step === 4 && (
        <div>
          <p style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
            {t('questions.budget.label')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {(['moins200', '200_400', '400_700', 'plus700'] as const).map(v => (
              <OptionBtn key={v} label={t(`questions.budget.options.${v}`)} selected={state.budget === v} onClick={() => dispatch({ type: 'SET_BUDGET', value: v })} />
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        {state.step > 1 && (
          <button type="button" onClick={() => dispatch({ type: 'PREV' })} className="btn btn-ghost">
            {t('previous')}
          </button>
        )}
        <button
          type="button"
          onClick={() => dispatch({ type: 'NEXT' })}
          disabled={!canAdvance()}
          className="btn btn-primary"
          style={{ opacity: canAdvance() ? 1 : .45, cursor: canAdvance() ? 'pointer' : 'not-allowed' }}
        >
          {state.step === TOTAL_STEPS ? t('seeResults') : t('next')}
        </button>
      </div>
    </div>
  )
}
