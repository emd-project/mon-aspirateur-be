'use client'

const C = {
  surface: '#FAF7F2',
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
    <aside
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1.25rem',
        flexWrap: 'wrap',
        borderLeft: `3px solid ${C.accent}`,
        background: C.surface,
        borderRadius: '0 8px 8px 0',
        padding: '1rem 1.25rem',
      }}
    >
      {image1 && (
        <div style={{ flexShrink: 0, alignSelf: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image1} alt={image1Alt} style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 4 }} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: '0 0 .25rem',
          fontSize: '.68rem',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: C.accent,
        }}>
          Produit recommandé
        </p>
        <p style={{
          margin: '0 0 .375rem',
          fontFamily: 'Georgia, serif',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: C.text,
          lineHeight: 1.3,
        }}>
          {brand ? `${brand} ` : ''}{name}
        </p>
        {description && (
          <p style={{
            margin: '0 0 .5rem',
            fontSize: '.8rem',
            color: C.muted,
            lineHeight: 1.5,
          }}>
            {description}
          </p>
        )}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '.8125rem', color: C.muted }}>
          {price != null && !isNaN(price) && price > 0 && (
            <span>Prix&nbsp;: <strong style={{ color: C.accent }}>{price} €</strong></span>
          )}
          {rating != null && !isNaN(rating) && rating > 0 && (
            <span>Note&nbsp;: <strong>{rating}/10</strong></span>
          )}
          {batteryMinutes != null && !isNaN(batteryMinutes) && batteryMinutes > 0 && (
            <span>Autonomie&nbsp;: <strong>{batteryMinutes} min</strong></span>
          )}
          {noiseLevelDb != null && !isNaN(noiseLevelDb) && noiseLevelDb > 0 && (
            <span>Bruit&nbsp;: <strong>{noiseLevelDb} dB</strong></span>
          )}
        </div>
      </div>

      {affiliateUrl && (
        <div style={{ flexShrink: 0, alignSelf: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.3rem',
              padding: '.45rem .9rem',
              borderRadius: 6,
              border: `1px solid ${C.accent}`,
              color: C.accent,
              background: 'transparent',
              fontWeight: 600,
              fontSize: '.82rem',
              whiteSpace: 'nowrap',
            }}
          >
            Voir le prix →
          </span>
        </div>
      )}
    </aside>
  )
}
