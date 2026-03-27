import { requireAdmin } from '@/packages/cms/lib/get-session'
import { getUsers } from '@/packages/cms/lib/users'
import { UsersManager } from '@/packages/cms/components/UsersManager'
import { cmsConfig } from '@/cms.config'

const C = {
  text: '#1A1714',
  muted: '#6B5E54',
}

export default async function UsersPage() {
  const session = await requireAdmin()
  const token = process.env.CMS_GITHUB_TOKEN

  const { users } = await getUsers(cmsConfig.repo, cmsConfig.branch, token)
  const safe = users.map(({ passwordHash: _h, salt: _s, ...u }) => u)

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: C.text, letterSpacing: '-0.02em' }}>
          Utilisateurs
        </h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: C.muted }}>
          {safe.length} compte{safe.length !== 1 ? 's' : ''} · {session.role === 'admin' ? 'Administration' : 'Lecture seule'}
        </p>
      </div>

      <UsersManager users={safe} />
    </div>
  )
}
