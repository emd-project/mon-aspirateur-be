'use client'

import { useState } from 'react'

const C = {
  surface: '#FFFFFF',
  surface2: '#F0EBE3',
  border: '#EDE5D8',
  text: '#1A1714',
  muted: '#6B5E54',
  accent: '#C4622D',
  accentSoft: 'rgba(196,98,45,.08)',
  success: '#6B8F71',
  successBorder: 'rgba(107,143,113,.3)',
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    void navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={copy}
      style={{
        padding: '0.375rem 0.75rem',
        background: copied ? C.accentSoft : C.surface2,
        border: `1px solid ${copied ? C.successBorder : C.border}`,
        borderRadius: 7,
        color: copied ? C.success : C.muted,
        fontSize: '0.75rem',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        fontWeight: 500,
        fontFamily: 'inherit',
      }}
    >
      {copied ? 'Copié ✓' : 'Copier'}
    </button>
  )
}

function MiniCard({ name, brand, price, rating }: { name: string; brand: string; price: string; rating: string }) {
  return (
    <div style={{ flex: '0 0 160px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '.625rem .75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '.375rem' }}>
      <div>
        <p style={{ margin: '0 0 .15rem', fontSize: '.6rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.accent }}>{brand}</p>
        <p style={{ margin: 0, fontSize: '.8rem', fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{name}</p>
      </div>
      <div style={{ display: 'flex', gap: '.5rem', fontSize: '.7rem', color: C.muted }}>
        <span><strong style={{ color: C.accent }}>{price}</strong></span>
        <span><strong>{rating}</strong></span>
      </div>
    </div>
  )
}

export const SHORTCODE_PREVIEWS: Record<string, React.ReactNode> = {
  carousel: (
    <div style={{ display: 'flex', gap: '.625rem', overflowX: 'auto', padding: '.25rem 0' }}>
      <MiniCard name="X-Clean 4" brand="Rowenta" price="269 €" rating="8/10" />
      <MiniCard name="X-Plorer 75s+" brand="Rowenta" price="449 €" rating="8.5/10" />
      <MiniCard name="X-Force Flex 14.60" brand="Rowenta" price="349 €" rating="7.5/10" />
    </div>
  ),
  product: (
    <aside style={{ display: 'flex', alignItems: 'stretch', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, width: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.surface2, padding: '.5rem' }}>
        <div style={{ width: 50, height: 50, borderRadius: 6, background: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', color: C.muted }}>img</div>
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: '.75rem .875rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '.15rem' }}>
        <p style={{ margin: 0, fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.accent }}>Produit recommandé</p>
        <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: '.9rem', fontWeight: 700, color: C.text }}>Rowenta X-Clean 4</p>
        <p style={{ margin: 0, fontSize: '.72rem', color: C.muted, lineHeight: 1.4 }}>Aspirateur laveur 2 en 1, 50 min d&apos;autonomie</p>
        <div style={{ display: 'flex', gap: '.625rem', fontSize: '.72rem', color: C.muted, marginTop: '.15rem' }}>
          <span>Prix : <strong style={{ color: C.accent }}>249 €</strong></span>
          <span>Note : <strong>8.5/10</strong></span>
        </div>
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', padding: '.75rem .75rem .75rem 0' }}>
        <span style={{ padding: '.35rem .7rem', borderRadius: 6, border: `1px solid ${C.accent}`, color: C.accent, fontWeight: 600, fontSize: '.72rem', whiteSpace: 'nowrap' }}>Voir le prix →</span>
      </div>
    </aside>
  ),
  tip: (
    <div style={{ borderLeft: `3px solid #2B7A5F`, background: 'rgba(43,122,95,.06)', borderRadius: '0 8px 8px 0', padding: '0.875rem 1rem' }}>
      <p style={{ margin: '0 0 .25rem', fontSize: '.72rem', fontWeight: 700, color: '#2B7A5F', textTransform: 'uppercase', letterSpacing: '.08em' }}>Le vrai tip</p>
      <p style={{ margin: 0, fontSize: '.82rem', color: C.text, lineHeight: 1.5 }}>Pour un ménage hebdomadaire sur 80 m², économisez les 150 € et prenez le Rowenta.</p>
    </div>
  ),
  warning: (
    <div style={{ borderLeft: `3px solid #C49A2D`, background: 'rgba(196,154,45,.06)', borderRadius: '0 8px 8px 0', padding: '0.875rem 1rem' }}>
      <p style={{ margin: '0 0 .25rem', fontSize: '.72rem', fontWeight: 700, color: '#C49A2D', textTransform: 'uppercase', letterSpacing: '.08em' }}>Attention</p>
      <p style={{ margin: 0, fontSize: '.82rem', color: C.text, lineHeight: 1.5 }}>Les prix varient selon les promotions — vérifiez au moment de l&apos;achat.</p>
    </div>
  ),
  verdict: (
    <div style={{ borderLeft: `3px solid ${C.accent}`, background: C.accentSoft, borderRadius: '0 8px 8px 0', padding: '0.875rem 1rem' }}>
      <p style={{ margin: '0 0 .25rem', fontSize: '.72rem', fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '.08em' }}>Notre verdict</p>
      <p style={{ margin: 0, fontSize: '.82rem', color: C.text, lineHeight: 1.5 }}>Pour un appartement de 60 à 80 m², c&apos;est le choix le plus simple à 299 €.</p>
    </div>
  ),
  pullquote: (
    <blockquote style={{ margin: 0, borderLeft: `3px solid ${C.accent}`, padding: '0.75rem 1rem', fontStyle: 'italic', fontSize: '.9rem', color: C.text, lineHeight: 1.6, background: C.accentSoft, borderRadius: '0 8px 8px 0' }}>
      Un bon robot à 350 € fait 90 % du travail d&apos;un modèle à 900 €.
    </blockquote>
  ),
  stat: (
    <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '0.875rem 1rem', textAlign: 'center', maxWidth: 220 }}>
      <p style={{ margin: '0 0 .15rem', fontSize: '1.5rem', fontWeight: 800, color: C.accent }}>45 min</p>
      <p style={{ margin: '0 0 .15rem', fontSize: '.78rem', fontWeight: 600, color: C.text }}>Durée moyenne sur 80 m²</p>
      <p style={{ margin: 0, fontSize: '.7rem', color: C.muted }}>Navigation LiDAR</p>
    </div>
  ),
  procon: (
    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '.78rem' }}>
      <div style={{ flex: 1, background: 'rgba(43,122,95,.06)', borderRadius: 8, padding: '.625rem .75rem' }}>
        <p style={{ margin: '0 0 .3rem', fontWeight: 700, color: '#2B7A5F' }}>Points forts</p>
        <ul style={{ margin: 0, padding: '0 0 0 1rem', lineHeight: 1.6, color: C.text }}>
          <li>Prix contenu (299 €)</li>
          <li>65 dB</li>
        </ul>
      </div>
      <div style={{ flex: 1, background: 'rgba(185,28,28,.04)', borderRadius: 8, padding: '.625rem .75rem' }}>
        <p style={{ margin: '0 0 .3rem', fontWeight: 700, color: '#B91C1C' }}>Points faibles</p>
        <ul style={{ margin: 0, padding: '0 0 0 1rem', lineHeight: 1.6, color: C.text }}>
          <li>Pas de LiDAR</li>
          <li>Bac 0,4 L</li>
        </ul>
      </div>
    </div>
  ),
}
