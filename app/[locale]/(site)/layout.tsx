import { getTranslations } from 'next-intl/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

type SiteLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { locale } = await params
  const tNav = await getTranslations({ locale, namespace: 'nav' })
  const tFooter = await getTranslations({ locale, namespace: 'footer' })
  const tNav2 = await getTranslations({ locale, namespace: 'nav' })

  const headerT = {
    guides: tNav('guides'),
    comparatifs: tNav('comparatifs'),
    tools: tNav('tools'),
    toolsQuiz: tNav('toolsQuiz'),
    toolsComparateur: tNav('toolsComparateur'),
    toolsSimulateur: tNav('toolsSimulateur'),
    blog: tNav('blog'),
    toggleTheme: tNav('toggleTheme'),
    toggleMenu: tNav('toggleMenu'),
  }

  const footerT = {
    navigation: tFooter('navigation'),
    categories: tFooter('categories'),
    about: tFooter('about'),
    legal: tFooter('legal'),
    privacy: tFooter('privacy'),
    cookies: tFooter('cookies'),
    madeIn: tFooter('madeIn'),
    authorLink: tFooter('authorLink'),
    guides: tNav2('guides'),
    comparatifs: tNav2('comparatifs'),
    blog: tNav2('blog'),
    tools: tNav2('tools'),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header locale={locale} t={headerT} />
      <main id="main-content" style={{ flex: 1 }}>
        {children}
      </main>
      <Footer locale={locale} t={footerT} />
    </div>
  )
}
