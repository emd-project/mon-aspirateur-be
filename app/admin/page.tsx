import { getSession } from '@/packages/cms/lib/get-session'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/packages/cms/components/LoginForm'
import { cmsConfig } from '@/cms.config'

export default async function AdminPage() {
  const session = await getSession()
  if (session) redirect('/admin/dashboard')

  return <LoginForm siteName={cmsConfig.siteName} />
}
