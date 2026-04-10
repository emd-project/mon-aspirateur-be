import { randomBytes } from 'crypto'

export function getGithubAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CMS_CLIENT_ID ?? '',
    scope: 'read:user',
    state,
  })
  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

export function generateOAuthState(): string {
  return randomBytes(16).toString('hex')
}

export async function exchangeGithubCode(code: string): Promise<{ login: string; name: string; token: string }> {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CMS_CLIENT_ID,
      client_secret: process.env.GITHUB_CMS_CLIENT_SECRET,
      code,
    }),
  })

  if (!res.ok) throw new Error(`OAuth token exchange failed: ${res.status}`)

  const data = (await res.json()) as { access_token?: string; error?: string }
  if (!data.access_token) {
    throw new Error(data.error ?? 'No access token returned')
  }

  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })
  if (!userRes.ok) throw new Error('Failed to fetch GitHub user')

  const user = (await userRes.json()) as { login: string; name?: string }
  return { login: user.login, name: user.name ?? user.login, token: data.access_token }
}

export function isAllowedGithubUser(login: string): boolean {
  const allowed = (process.env.CMS_ALLOWED_USERS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return allowed.includes(login)
}
