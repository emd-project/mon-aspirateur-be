import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import type { CmsSession } from '../types'

const ALGORITHM = 'aes-256-gcm'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 jours
export const SESSION_COOKIE = 'cms_session'

function getKey(): Buffer {
  return createHash('sha256').update(process.env.CMS_SECRET ?? 'insecure-dev-key').digest()
}

export function encryptSession(data: Omit<CmsSession, 'expiresAt'>): string {
  const session: CmsSession = { ...data, expiresAt: Date.now() + SESSION_TTL_MS }
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const json = JSON.stringify(session)
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64url')
}

export function decryptSession(token: string): CmsSession | null {
  try {
    const buf = Buffer.from(token, 'base64url')
    const iv = buf.subarray(0, 12)
    const tag = buf.subarray(12, 28)
    const encrypted = buf.subarray(28)
    const key = getKey()
    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    const session = JSON.parse(decrypted.toString('utf8')) as CmsSession
    if (session.expiresAt < Date.now()) return null
    return session
  } catch {
    return null
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  }
}
