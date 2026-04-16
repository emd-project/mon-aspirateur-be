'use client'

const C = {
  surface: '#FAF7F2',
  imageBg: '#F0EBE3',
  border: '#EDE5D8',
  accent: '#C4622D',
  text: '#1A1714',
  muted: '#6B5E54',
}

interface Props {
  fields: Record<string, unknown>
}

export function ProductCardPreview({ fields }: Props) {
  const name = String(fields.name ?? '')
  const brand = fields.brand ? String(fields.brand) : null
  const description = fields.description ? String(fields.description) : null
  const price = fields.price != null ? Number(fields.price) : null
  const rating = fields.rating != null ? Number(fields.rating) : null
  const affiliateUrl = fields.affiliateUrl ? String(fields.affiliateUrl) : null
  const batteryMinutes = fields.batteryMinutes != null ? Number(fields.batteryMinutes) : null
  const noiseLevelDb = fields.noiseLevelDb != null ? Number(fields.noiseLevelDb) : null
  const image1 = fields.image1 ? String(fields.image1) : null
  const image1Alt = fields.image1Alt ? String(fields.image1Alt) : name

  if (!name) {
    return (
      <div style={{ padding: '1rem', color: C.muted, fontSize: '0.8125rem', fontStyle: 'italic', textAlign: 'center' }}>
        Renseignez un nom de produit pour voir l&apos;aperçu.
      </div>
    )
  }

  return (
    <aside style={{ display: 'flex', alignItems: 'stretch', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
      {image1 && (
        <div style={{ flexShrink: 0, width: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.imageBg, padding: '.75rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image1} alt={image1Alt} style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain' }} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0, padding: '1rem 1.125rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '.2rem' }}>
        <p style={{ margin: 0, fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.accent }}>
          Produit recommandé
        </p>
        <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: '1.05rem', fontWeight: 700, color: C.text, lineHeight: 1.3 }}>
          {brand ? `${brand} ` : ''}{name}
        </p>
        {description && (
          <p style={{ margin: '.125rem 0 0', fontSize: '.8rem', color: C.muted, lineHeight: 1.5 }}>
            {description}
          </p>
        )}
        <div style={{ display: 'flex', gap: '.875rem', flexWrap: 'wrap', fontSize: '.8rem', color: C.muted, marginTop: '.3rem' }}>
          {price != null && !isNaN(price) && price > 0 && <span>Prix&nbsp;: <strong style={{ color: C.accent }}>{price}&nbsp;€</strong></span>}
          {rating != null && !isNaN(rating) && rating > 0 && <span>Note&nbsp;: <strong>{rating}/10</strong></span>}
          {batteryMinutes != null && !isNaN(batteryMinutes) && batteryMinutes > 0 && <span>Autonomie&nbsp;: <strong>{batteryMinutes}&nbsp;min</strong></span>}
          {noiseLevelDb != null && !isNaN(noiseLevelDb) && noiseLevelDb > 0 && <span>Bruit&nbsp;: <strong>{noiseLevelDb}&nbsp;dB</strong></span>}
        </div>
      </div>
      {affiliateUrl && (
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', padding: '1rem 1.125rem 1rem 0' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.5rem 1rem', borderRadius: 6, border: `1px solid ${C.accent}`, color: C.accent, background: 'transparent', fontWeight: 600, fontSize: '.82rem', whiteSpace: 'nowrap' }}>
            Voir le prix →
          </span>
        </div>
      )}
    </aside>
  )
}
