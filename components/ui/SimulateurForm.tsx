'use client'

import { useState } from 'react'
import { filterProducts } from '@/lib/data/mock/products'
import ProductCard from './ProductCard'

type SimResult = {
  minAutonomyMin: number
  binCapacityL: number
  maxNoiseDb: number
}

function calculate(surface: number, rooms: number, frequency: number): SimResult {
  const minAutonomyMin = Math.ceil((surface / 40) * 30 * (1 + rooms * 0.05))
  const binCapacityL = surface <= 60 ? 0.4 : surface <= 120 ? 0.6 : 0.8
  const maxNoiseDb = frequency >= 5 ? 65 : 70
  return { minAutonomyMin, binCapacityL, maxNoiseDb }
}

type SimulateurFormProps = {
  locale: string
  t: {
    title: string; subtitle: string; surface: string; rooms: string
    frequency: string; floorType: string; calculate: string
    results: { title: string; minAutonomy: string; binCapacity: string; noiseLevel: string; matchingProducts: string }
  }
}

export default function SimulateurForm({ locale, t }: SimulateurFormProps) {
  const [surface, setSurface]     = useState(80)
  const [rooms, setRooms]         = useState(3)
  const [frequency, setFrequency] = useState(3)
  const [result, setResult]       = useState<SimResult | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setResult(calculate(surface, rooms, frequency))
  }

  const matchingProducts = result
    ? filterProducts({ locale, minAutonomy: result.minAutonomyMin, minSurface: surface }).slice(0, 3)
    : []

  return (
    <div style={{ maxWidth: 640 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Surface */}
        <div>
          <label htmlFor="surface" style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)', fontSize: '15px' }}>
            {t.surface}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <input
              id="surface" type="range" min={20} max={300} step={5}
              value={surface}
              onChange={(e) => setSurface(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--accent-1)' }}
            />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 900, color: 'var(--accent-1)', minWidth: 80, textAlign: 'right' }}>
              {surface} m²
            </span>
          </div>
        </div>

        {/* Pièces */}
        <div>
          <label htmlFor="rooms" style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)', fontSize: '15px' }}>
            {t.rooms}
          </label>
          <input
            id="rooms" type="number" min={1} max={15} value={rooms}
            onChange={(e) => setRooms(Number(e.target.value))}
            style={{ width: 80, padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 600 }}
          />
        </div>

        {/* Fréquence */}
        <div>
          <label htmlFor="frequency" style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)', fontSize: '15px' }}>
            {t.frequency}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <input
              id="frequency" type="range" min={1} max={7} step={1}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--accent-1)' }}
            />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 900, color: 'var(--accent-1)', minWidth: 60, textAlign: 'right' }}>
              {frequency}×
            </span>
          </div>
        </div>

        <button
          type="submit"
          style={{ alignSelf: 'flex-start', padding: 'var(--space-3) var(--space-8)', background: 'var(--accent-1)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontWeight: 700, fontSize: '15px', boxShadow: 'var(--shadow-accent)' }}
        >
          {t.calculate}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 'var(--space-10)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {t.results.title}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            {[
              { label: t.results.minAutonomy, value: `${result.minAutonomyMin} min` },
              { label: t.results.binCapacity, value: `${result.binCapacityL} L` },
              { label: t.results.noiseLevel,  value: `< ${result.maxNoiseDb} dB` },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: 'var(--space-4)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 900, color: 'var(--accent-1)', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 'var(--space-2)', lineHeight: 1.4 }}>{label}</div>
              </div>
            ))}
          </div>

          {matchingProducts.length > 0 && (
            <div>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>{t.results.matchingProducts}</p>
              <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {matchingProducts.map((p) => <ProductCard key={p.slug} product={p} locale={locale} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
