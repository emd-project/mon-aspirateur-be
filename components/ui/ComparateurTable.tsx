'use client'

import { useState } from 'react'
import { getProducts } from '@/lib/data/mock/products'
import type { Product } from '@/lib/data/types'
import ScoreBadge from './ScoreBadge'

type ComparateurTableProps = {
  locale: string
  t: {
    title: string; subtitle: string; selectModel: string; addModel: string
    criteria: { price: string; autonomy: string; noise: string; surface: string; hepa: string; pet: string; score: string }
    best: string; yes: string; no: string
  }
}

export default function ComparateurTable({ locale, t }: ComparateurTableProps) {
  const allProducts = getProducts(locale)
  const [modelA, setModelA] = useState<Product | null>(null)
  const [modelB, setModelB] = useState<Product | null>(null)

  const criteria: { key: keyof Product; label: string; format: (v: unknown) => string; bestFn?: (a: unknown, b: unknown) => 'a' | 'b' | null }[] = [
    { key: 'score',       label: t.criteria.score,    format: (v) => `${v}/100`, bestFn: (a, b) => (a as number) >= (b as number) ? 'a' : 'b' },
    { key: 'priceEur',    label: t.criteria.price,    format: (v) => `${v} €`,  bestFn: (a, b) => (a as number) <= (b as number) ? 'a' : 'b' },
    { key: 'autonomyMin', label: t.criteria.autonomy,  format: (v) => `${v} min`, bestFn: (a, b) => (a as number) >= (b as number) ? 'a' : 'b' },
    { key: 'noiseDb',     label: t.criteria.noise,     format: (v) => `${v} dB`,  bestFn: (a, b) => (a as number) <= (b as number) ? 'a' : 'b' },
    { key: 'surfaceM2Max',label: t.criteria.surface,   format: (v) => `${v} m²`, bestFn: (a, b) => (a as number) >= (b as number) ? 'a' : 'b' },
    { key: 'hepaFilter',  label: t.criteria.hepa,      format: (v) => (v ? t.yes : t.no) },
    { key: 'petFriendly', label: t.criteria.pet,       format: (v) => (v ? t.yes : t.no) },
  ]

  const selectStyle = { width: '100%', padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '15px', cursor: 'pointer' }

  return (
    <div>
      {/* Model selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {[
          { model: modelA, setter: setModelA, exclude: modelB },
          { model: modelB, setter: setModelB, exclude: modelA },
        ].map(({ model, setter, exclude }, i) => (
          <div key={i}>
            <label style={{ display: 'block', fontWeight: 600, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
              {`${locale === 'fr' ? 'Modèle' : 'Model'} ${i + 1}`}
            </label>
            <select
              value={model?.slug ?? ''}
              onChange={(e) => setter(allProducts.find((p) => p.slug === e.target.value) ?? null)}
              style={selectStyle}
            >
              <option value="">{t.selectModel}</option>
              {allProducts
                .filter((p) => p.slug !== exclude?.slug)
                .map((p) => <option key={p.slug} value={p.slug}>{p.brand} {p.name}</option>)}
            </select>
            {model && (
              <p style={{ marginTop: 'var(--space-2)', fontSize: '13px', color: 'var(--text-muted)' }}>
                {model.priceEur} € · <ScoreBadge score={model.score} size="sm" />
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      {modelA && modelB && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
            <thead>
              <tr>
                <th style={{ padding: 'var(--space-4)', textAlign: 'left', borderBottom: '2px solid var(--border-strong)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', width: '40%' }}>
                  {locale === 'fr' ? 'Critère' : 'Criterion'}
                </th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'center', borderBottom: '2px solid var(--border-strong)', color: 'var(--text-primary)', fontWeight: 700 }}>
                  {modelA.brand} {modelA.name}
                </th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'center', borderBottom: '2px solid var(--border-strong)', color: 'var(--text-primary)', fontWeight: 700 }}>
                  {modelB.brand} {modelB.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {criteria.map(({ key, label, format, bestFn }) => {
                const valA = modelA[key]
                const valB = modelB[key]
                const best = bestFn ? bestFn(valA, valB) : null

                return (
                  <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center', fontWeight: best === 'a' ? 700 : 400, color: best === 'a' ? 'var(--success)' : 'var(--text-secondary)', background: best === 'a' ? 'rgba(42,122,75,0.05)' : 'transparent' }}>
                      {format(valA)}
                      {best === 'a' && <span style={{ marginLeft: 'var(--space-2)', fontSize: '11px', fontWeight: 700, color: 'var(--success)' }}>✓ {t.best}</span>}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center', fontWeight: best === 'b' ? 700 : 400, color: best === 'b' ? 'var(--success)' : 'var(--text-secondary)', background: best === 'b' ? 'rgba(42,122,75,0.05)' : 'transparent' }}>
                      {format(valB)}
                      {best === 'b' && <span style={{ marginLeft: 'var(--space-2)', fontSize: '11px', fontWeight: 700, color: 'var(--success)' }}>✓ {t.best}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {(!modelA || !modelB) && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-12) 0', fontSize: '15px' }}>
          {locale === 'fr' ? 'Sélectionnez deux modèles pour lancer la comparaison.' : 'Select two models to start the comparison.'}
        </p>
      )}
    </div>
  )
}
