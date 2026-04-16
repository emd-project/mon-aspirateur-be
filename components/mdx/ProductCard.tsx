import fs from 'fs'
import path from 'path'

interface Props { slug: string }

function parseYaml(raw: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const lines = raw.split('\n')
  let currentList: string[] | null = null
  for (const line of lines) {
    const listItem = line.match(/^\s*-\s+(.+)$/)
    if (listItem && listItem[1]) { currentList?.push(listItem[1].trim()); continue }
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (kv) {
      currentList = null
      const key = kv[1]
      const v = (kv[2] ?? '').trim().replace(/^['"]|['"]$/g, '')
      if (!key) continue
      if (v === '' || v === '[]') { const list: string[] = []; result[key] = list; currentList = list }
      else { const n = Number(v); result[key] = isNaN(n) || v === '' ? v : n }
    }
  }
  return result
}

function resolveImage(src: string | undefined): string | null {
  if (!src || typeof src !== 'string') return null
  try { if (fs.existsSync(path.join(process.cwd(), 'public', src))) return src } catch { /* noop */ }
  return null
}

export default async function ProductCard({ slug }: Props) {
  let data: Record<string, unknown>
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'content/products', `${slug}.yaml`), 'utf-8')
    data = parseYaml(raw)
  } catch { return null }

  const name = String(data.name ?? slug)
  const brand = data.brand ? String(data.brand) : null
  const description = data.description ? String(data.description) : null
  const price = data.price != null ? Number(data.price) : null
  const rating = data.rating != null ? Number(data.rating) : null
  const affiliateUrl = data.affiliateUrl ? String(data.affiliateUrl) : null
  const batteryMinutes = data.batteryMinutes != null ? Number(data.batteryMinutes) : null
  const noiseLevelDb = data.noiseLevelDb != null ? Number(data.noiseLevelDb) : null
  const image = resolveImage(data.image1 as string | undefined)
  const imageAlt = data.image1Alt ? String(data.image1Alt) : `${brand ? `${brand} ` : ''}${name}`

  return (
    <aside
      aria-label={`Produit : ${brand ? `${brand} ` : ''}${name}`}
      style={{
        display: 'flex', alignItems: 'stretch',
        background: 'var(--bg-surface)', border: '1px solid var(--border-light, #EDE5D8)',
        borderRadius: 'var(--radius-md, 10px)', overflow: 'hidden', margin: '1.75rem 0',
      }}
    >
      {image && (
        <div style={{ flexShrink: 0, width: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-muted, #F5F1EB)', padding: '1rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={imageAlt} loading="lazy" decoding="async" style={{ maxWidth: '100%', maxHeight: 130, objectFit: 'contain' }} />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, padding: '1.125rem 1.375rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '.25rem' }}>
        <p style={{ margin: 0, fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent-1)' }}>
          Produit recommandé
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {brand ? `${brand} ` : ''}{name}
        </p>
        {description && (
          <p style={{ margin: '.125rem 0 0', fontSize: '.8rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            {description}
          </p>
        )}
        <div style={{ display: 'flex', gap: '.875rem', flexWrap: 'wrap', fontSize: '.8rem', color: 'var(--text-muted)', marginTop: '.375rem' }}>
          {price != null && !isNaN(price) && <span>Prix&nbsp;: <strong style={{ color: 'var(--accent-1)' }}>{price}&nbsp;€</strong></span>}
          {rating != null && !isNaN(rating) && <span>Note&nbsp;: <strong>{rating}/10</strong></span>}
          {batteryMinutes != null && !isNaN(batteryMinutes) && <span>Autonomie&nbsp;: <strong>{batteryMinutes}&nbsp;min</strong></span>}
          {noiseLevelDb != null && !isNaN(noiseLevelDb) && <span>Bruit&nbsp;: <strong>{noiseLevelDb}&nbsp;dB</strong></span>}
        </div>
      </div>

      {affiliateUrl && (
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', padding: '1rem 1.25rem 1rem 0' }}>
          <a href={affiliateUrl} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.5rem 1rem', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--accent-1)', color: 'var(--accent-1)', background: 'transparent', fontWeight: 600, fontSize: '.82rem', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'background .15s, color .15s' }}>
            Voir le prix →
          </a>
        </div>
      )}
    </aside>
  )
}
