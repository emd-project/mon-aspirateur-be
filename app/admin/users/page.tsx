import { requireAdmin } from '@/packages/cms/lib/get-session'
import { getUsers } from '@/packages/cms/lib/users'
import { UsersManager } from '@/packages/cms/components/UsersManager'
import { cmsConfig } from '@/cms.config'

const C = {
  text: '#e5e5e5',
  muted: '#aaaaaa',
}

export default async function UsersPage() {
  const session = await requireAdmin()
  const token = session.githubToken ?? process.env.CMS_GITHUB_TOKEN

  const { users } = await getUsers(cmsConfig.repo, cmsConfig.branch, token)

  // Never expose password hashes to the client
  const safe = users.map(({ passwordHash: _h, salt: _s, ...u }) => u)

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.375rem', fontWeight: 700, color: C.text }}>
          Utilisateurs
        </h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: C.muted }}>
          {safe.length} compte{safe.length !== 1 ? 's' : ''} enregistré{safe.length !== 1 ? 's' : ''}
        </p>
      </div>

      <UsersManager users={safe} />
    </div>
  )
}
