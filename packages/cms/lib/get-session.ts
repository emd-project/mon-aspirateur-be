import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decryptSession, SESSION_COOKIE } from './session'
import type { CmsSession } from '../types'

export async function getSession(): Promise<CmsSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return decryptSession(token)
}

export async function requireSession(): Promise<CmsSession> {
  const session = await getSession()
  if (!session) redirect('/admin')
  return session
}

export async function requireAdmin(): Promise<CmsSession> {
  const session = await requireSession()
  if (session.role !== 'admin') redirect('/admin')
  return session
}
