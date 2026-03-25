import { ImageResponse } from 'next/og'
import { currentYear } from '@/lib/utils/year'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  const year = currentYear()

  return new ImageResponse(
    (
      <div
        style={{
          background: '#FAF8F3',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,149,109,0.20) 0%, transparent 70%)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -80, left: 300, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,196,154,0.25) 0%, transparent 70%)', display: 'flex' }} />

        {/* Logo mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, background: '#CC4A1A', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#FAF8F3', fontSize: 28, fontWeight: 900 }}>M</span>
          </div>
          <span style={{ fontSize: 22, color: '#4B4A48', fontWeight: 600 }}>mon-aspirateur.be</span>
        </div>

        {/* Title */}
        <div style={{ fontSize: 64, fontWeight: 900, color: '#CC4A1A', lineHeight: 1.05, marginBottom: 24, display: 'flex' }}>
          Le guide aspirateur Belgique {year}
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 28, color: '#8A8880', lineHeight: 1.4, maxWidth: 800, display: 'flex' }}>
          Guides d&apos;achat · Comparatifs · Outils interactifs pour le marché belge
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
