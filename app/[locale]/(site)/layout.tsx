import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

type SiteLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { locale } = await params

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  )
}
