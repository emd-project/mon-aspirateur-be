import fs from 'fs'
import path from 'path'

interface Props { slugs: string }

interface ProductData {
  slug: string
  name: string
  brand: string | null
  description: string | null
  price: number | null
  rating: number | null
  affiliateUrl: string | null
  image: string | null
  imageAlt: string
}

function parseYaml(raw: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const line of raw.split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (!kv) continue
    const key = kv[1]
    const v = (kv[2] ?? '').trim().replace(/^['"]|['"]$/g, '')
    if (!key || !v) continue
    const n = Number(v)
    result[key] = isNaN(n) || v === '' ? v : n
  }
  return result
}

function resolveImage(src: string | undefined): string | null {
  if (!src || typeof src !== 'string') return null
  try { if (fs.existsSync(path.join(process.cwd(), 'public', src))) return src } catch { /* noop */ }
  return null
}

function loadProduct(slug: string): ProductData | null {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'content/products', `${slug}.yaml`), 'utf-8')
    const d = parseYaml(raw)
    const name = String(d.name ?? slug)
    const brand = d.brand ? String(d.brand) : null
    return {
      slug, name, brand,
      description: d.description ? String(d.description) : null,
      price: d.price != null ? Number(d.price) : null,
      rating: d.rating != null ? Number(d.rating) : null,
      affiliateUrl: d.affiliateUrl ? String(d.affiliateUrl) : null,
      image: resolveImage(d.image1 as string | undefined),
      imageAlt: d.image1Alt ? String(d.image1Alt) : `${brand ? `${brand} ` : ''}${name}`,
    }
  } catch { return null }
}

export default async function ProductCarousel({ slugs }: Props) {
  const products = slugs.split(',').map(s => s.trim()).filter(Boolean)
    .map(loadProduct).filter((p): p is ProductData => p !== null)
  if (products.length === 0) return null

  return (
    <div
      aria-label="Sélection de produits"
      role="region"
      style={{
        display: 'flex', gap: '1rem', overflowX: 'auto',
        scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
        padding: '0.5rem 0 1rem', margin: '1.75rem 0',
      }}
    >
      {products.map((p) => (
        <article
          key={p.slug}
          style={{
            flex: '0 0 min(280px, 80vw)', scrollSnapAlign: 'start',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            background: 'var(--bg-surface)', border: '1px solid var(--border-light, #EDE5D8)',
            borderRadius: 'var(--radius-md)', padding: '1rem 1.125rem',
          }}
        >
          {p.image && (
            <div style={{ background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)', padding: '.75rem', marginBottom: '.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.imageAlt} loading="lazy" decoding="async" style={{ maxWidth: '100%', height: 110, objectFit: 'contain' }} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 .2rem', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent-1)' }}>
              {p.brand ?? 'Produit'}
            </p>
            <p style={{ margin: '0 0 .375rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {p.name}
            </p>
            {p.description && (
              <p style={{ margin: '0 0 .5rem', fontSize: '.75rem', color: 'var(--text-muted)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.description}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem', marginTop: '.625rem' }}>
            <div style={{ display: 'flex', gap: '.75rem', fontSize: '.78rem', color: 'var(--text-muted)' }}>
              {p.price != null && !isNaN(p.price) && <span><strong style={{ color: 'var(--accent-1)' }}>{p.price} €</strong></span>}
              {p.rating != null && !isNaN(p.rating) && <span><strong>{p.rating}/10</strong></span>}
            </div>
            {p.affiliateUrl && (
              <a href={p.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored" style={{ padding: '.35rem .7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-1)', color: 'var(--accent-1)', background: 'transparent', fontWeight: 600, fontSize: '.75rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Voir →
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
