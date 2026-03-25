'use client'

import { useReducer } from 'react'
import { filterProducts } from '@/lib/data/mock/products'
import type { Product } from '@/lib/data/types'
import ProductCard from './ProductCard'

type QuizState = {
  step: number
  logement: 'appartement' | 'maison' | null
  surface: number
  sol: 'parquet' | 'moquette' | 'mixte' | null
  animaux: boolean | null
  budget: number
  priorite: 'silence' | 'autonomie' | 'puissance' | null
  done: boolean
}

type QuizAction =
  | { type: 'SET_LOGEMENT'; value: QuizState['logement'] }
  | { type: 'SET_SURFACE'; value: number }
  | { type: 'SET_SOL'; value: QuizState['sol'] }
  | { type: 'SET_ANIMAUX'; value: boolean }
  | { type: 'SET_BUDGET'; value: number }
  | { type: 'SET_PRIORITE'; value: QuizState['priorite'] }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'RESET' }

const TOTAL_STEPS = 6

function reducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_LOGEMENT': return { ...state, logement: action.value }
    case 'SET_SURFACE':  return { ...state, surface: action.value }
    case 'SET_SOL':      return { ...state, sol: action.value }
    case 'SET_ANIMAUX':  return { ...state, animaux: action.value }
    case 'SET_BUDGET':   return { ...state, budget: action.value }
    case 'SET_PRIORITE': return { ...state, priorite: action.value }
    case 'NEXT': {
      const next = state.step + 1
      return { ...state, step: next, done: next > TOTAL_STEPS }
    }
    case 'PREV': return { ...state, step: Math.max(1, state.step - 1), done: false }
    case 'RESET': return initialState
    default: return state
  }
}

const initialState: QuizState = {
  step: 1, logement: null, surface: 80, sol: null, animaux: null,
  budget: 400, priorite: null, done: false,
}

type QuizStepperProps = {
  locale: string
  t: {
    title: string; subtitle: string; stepOf: string; next: string; previous: string
    seeResults: string; restart: string; resultsTitle: string; compatibility: string
    questions: {
      logement: { label: string; options: { appartement: string; maison: string } }
      surface: { label: string; hint: string }
      sol: { label: string; options: { parquet: string; moquette: string; mixte: string } }
      animaux: { label: string; options: { oui: string; non: string } }
      budget: { label: string; hint: string }
      priorite: { label: string; options: { silence: string; autonomie: string; puissance: string } }
    }
  }
}

function OptionBtn({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: 'var(--space-4) var(--space-6)',
        borderRadius: 'var(--radius-md)',
        border: selected ? '2px solid var(--accent-1)' : '1px solid var(--border)',
        background: selected ? 'rgba(204,74,26,0.06)' : 'var(--bg-surface)',
        color: selected ? 'var(--accent-1)' : 'var(--text-primary)',
        fontWeight: selected ? 700 : 500,
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'all 0.15s var(--ease-out)',
        textAlign: 'left',
      }}
    >
      {label}
    </button>
  )
}

export default function QuizStepper({ locale, t }: QuizStepperProps) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const q = t.questions

  const canAdvance = (): boolean => {
    if (state.step === 1) return state.logement !== null
    if (state.step === 2) return state.surface > 0
    if (state.step === 3) return state.sol !== null
    if (state.step === 4) return state.animaux !== null
    if (state.step === 5) return state.budget > 0
    if (state.step === 6) return state.priorite !== null
    return true
  }

  if (state.done) {
    const results = filterProducts({
      locale,
      maxPrice: state.budget,
      petFriendly: state.animaux === true,
      minSurface: state.surface,
      minAutonomy: state.priorite === 'autonomie' ? 100 : undefined,
    }).slice(0, 3)

    return (
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>
          {t.resultsTitle}
        </h2>
        {results.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>
            {locale === 'fr' ? 'Aucun modèle ne correspond exactement à vos critères. Essayez d\'augmenter votre budget.' : 'No model matches your exact criteria. Try increasing your budget.'}
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {results.map((p: Product) => <ProductCard key={p.slug} product={p} locale={locale} />)}
          </div>
        )}
        <button
          type="button"
          onClick={() => dispatch({ type: 'RESET' })}
          style={{ marginTop: 'var(--space-8)', padding: 'var(--space-3) var(--space-6)', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}
        >
          {t.restart}
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {t.stepOf.replace('{current}', String(state.step)).replace('{total}', String(TOTAL_STEPS))}
        </span>
        <div style={{ height: 4, flex: 1, maxWidth: 200, background: 'var(--border)', borderRadius: 'var(--radius-full)', margin: '0 var(--space-4)' }}>
          <div style={{ height: '100%', width: `${(state.step / TOTAL_STEPS) * 100}%`, background: 'var(--accent-1)', borderRadius: 'var(--radius-full)', transition: 'width 0.3s var(--ease-out)' }} />
        </div>
      </div>

      {/* Steps */}
      {state.step === 1 && (
        <div>
          <p style={{ fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>{q.logement.label}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <OptionBtn label={q.logement.options.appartement} selected={state.logement === 'appartement'} onClick={() => dispatch({ type: 'SET_LOGEMENT', value: 'appartement' })} />
            <OptionBtn label={q.logement.options.maison} selected={state.logement === 'maison'} onClick={() => dispatch({ type: 'SET_LOGEMENT', value: 'maison' })} />
          </div>
        </div>
      )}

      {state.step === 2 && (
        <div>
          <p style={{ fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>{q.surface.label}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>{q.surface.hint}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <input
              type="range" min={20} max={300} step={10}
              value={state.surface}
              onChange={(e) => dispatch({ type: 'SET_SURFACE', value: Number(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-1)' }}
            />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 900, color: 'var(--accent-1)', minWidth: 80, textAlign: 'right' }}>
              {state.surface} m²
            </span>
          </div>
        </div>
      )}

      {state.step === 3 && (
        <div>
          <p style={{ fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>{q.sol.label}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {(['parquet', 'moquette', 'mixte'] as const).map((v) => (
              <OptionBtn key={v} label={q.sol.options[v]} selected={state.sol === v} onClick={() => dispatch({ type: 'SET_SOL', value: v })} />
            ))}
          </div>
        </div>
      )}

      {state.step === 4 && (
        <div>
          <p style={{ fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>{q.animaux.label}</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <OptionBtn label={q.animaux.options.oui} selected={state.animaux === true} onClick={() => dispatch({ type: 'SET_ANIMAUX', value: true })} />
            <OptionBtn label={q.animaux.options.non} selected={state.animaux === false} onClick={() => dispatch({ type: 'SET_ANIMAUX', value: false })} />
          </div>
        </div>
      )}

      {state.step === 5 && (
        <div>
          <p style={{ fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>{q.budget.label}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>{q.budget.hint}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <input
              type="range" min={100} max={1000} step={50}
              value={state.budget}
              onChange={(e) => dispatch({ type: 'SET_BUDGET', value: Number(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-1)' }}
            />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 900, color: 'var(--accent-1)', minWidth: 80, textAlign: 'right' }}>
              {state.budget} €
            </span>
          </div>
        </div>
      )}

      {state.step === 6 && (
        <div>
          <p style={{ fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>{q.priorite.label}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {(['silence', 'autonomie', 'puissance'] as const).map((v) => (
              <OptionBtn key={v} label={q.priorite.options[v]} selected={state.priorite === v} onClick={() => dispatch({ type: 'SET_PRIORITE', value: v })} />
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
        {state.step > 1 && (
          <button type="button" onClick={() => dispatch({ type: 'PREV' })} style={{ padding: 'var(--space-3) var(--space-6)', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {t.previous}
          </button>
        )}
        <button
          type="button"
          onClick={() => dispatch({ type: 'NEXT' })}
          disabled={!canAdvance()}
          style={{ padding: 'var(--space-3) var(--space-8)', background: canAdvance() ? 'var(--accent-1)' : 'var(--border)', color: canAdvance() ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: 'var(--radius-full)', cursor: canAdvance() ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '15px', transition: 'background 0.15s' }}
        >
          {state.step === TOTAL_STEPS ? t.seeResults : t.next}
        </button>
      </div>
    </div>
  )
}
