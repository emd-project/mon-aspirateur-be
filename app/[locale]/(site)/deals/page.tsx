import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

/**
 * /deals a été supprimée du site.
 *
 * La suppression physique du fichier n'étant pas possible via l'API de commit
 * utilisée, la route est neutralisée : redirection permanente vers l'accueil et
 * exclusion de l'index. Elle n'apparaît plus ni dans le sitemap, ni dans la nav,
 * ni dans le footer, ni dans les fichiers i18n.
 *
 * Le contenu éditorial qui vivait ici (sélections par catégorie) est repris par
 * /classement, alimenté par les fiches réelles de content/products.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type Props = { params: Promise<{ locale: string }> }

export default async function DealsPage({ params }: Props) {
  const { locale } = await params
  redirect(`/${locale}`)
}
