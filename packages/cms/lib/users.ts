import type { CmsUser, UserRole } from '../types'
import { getFile, putFile } from './github'
import { stringifyYaml } from './parser'

const USERS_PATH = 'content/users.yaml'

// ─── Simple YAML parser for flat arrays of objects ─────────────────────────

function parseUsersYaml(raw: string): CmsUser[] {
  if (!raw.trim()) return []
  const users: CmsUser[] = []
  const blocks = raw.split(/\n(?=- )/)
  for (const block of blocks) {
    const lines = block
      .trim()
      .replace(/^- /, '')
      .split('\n')
      .map((l) => l.replace(/^\s+/, ''))
    const obj: Record<string, string> = {}
    let firstKey = false
    for (const line of lines) {
      if (!firstKey && !line.includes(':')) continue
      const m = line.match(/^([^:]+):\s*(.*)$/)
      if (m?.[1] != null && m[2] != null) {
        obj[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
        firstKey = true
      }
    }
    if (obj.id && obj.email) {
      users.push({
        id: obj.id,
        name: obj.name ?? '',
        email: obj.email,
        role: (obj.role as UserRole) ?? 'editor',
        passwordHash: obj.passwordHash ?? '',
        salt: obj.salt ?? '',
      })
    }
  }
  return users
}

function stringifyUsers(users: CmsUser[]): string {
  if (users.length === 0) return ''
  return users
    .map((u) => {
      const obj: Record<string, unknown> = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        passwordHash: u.passwordHash,
        salt: u.salt,
      }
      return '- ' + stringifyYaml(obj, 0).replace(/\n/g, '\n  ')
    })
    .join('\n')
}

export async function getUsers(repo: string, branch: string, token?: string): Promise<{ users: CmsUser[]; sha: string | undefined }> {
  const file = await getFile(repo, USERS_PATH, branch, token)
  if (!file) return { users: [], sha: undefined }
  return { users: parseUsersYaml(file.content), sha: file.sha }
}

export async function saveUsers(
  repo: string,
  branch: string,
  users: CmsUser[],
  sha: string | undefined,
  token?: string
): Promise<void> {
  const content = stringifyUsers(users)
  await putFile(repo, USERS_PATH, branch, content, 'cms: update users', sha, token)
}

export async function findUserByEmail(
  repo: string,
  branch: string,
  email: string,
  token?: string
): Promise<CmsUser | null> {
  const { users } = await getUsers(repo, branch, token)
  return users.find((u) => u.email === email) ?? null
}
