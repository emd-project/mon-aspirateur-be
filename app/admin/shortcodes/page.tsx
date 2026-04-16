import { requireSession } from '@/packages/cms/lib/get-session'
import { SHORTCODE_DOCS } from '@/lib/content/shortcodes'
import { ShortcodesReference } from '@/packages/cms/components/ShortcodesReference'

const C = {
  text: '#1A1714',
  muted: '#6B5E54',
  dim: '#9C8E84',
}

export default async function ShortcodesPage() {
  // Accès admin ET rédacteur (tous les rôles authentifiés)
  await requireSession()

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 600, color: C.dim, textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Référence
        </p>
        <h1 style={{ margin: '0 0 0.375rem', fontSize: '1.625rem', fontWeight: 700, color: C.text, letterSpacing: '-0.02em' }}>
          Shortcodes disponibles
        </h1>
        <p style={{ margin: 0, color: C.muted, fontSize: '0.9375rem', maxWidth: '62ch', lineHeight: 1.6 }}>
          Copiez-collez ces blocs dans vos articles pour intégrer produits, encarts et tableaux sans manipuler de JSX.
        </p>
      </header>

      <ShortcodesReference docs={SHORTCODE_DOCS} />
    </div>
  )
}
