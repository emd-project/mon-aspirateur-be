import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  getGithubAuthUrl,
  generateOAuthState,
  exchangeGithubCode,
  isAllowedGithubUser,
} from '@/packages/cms/lib/auth'
import { encryptSession, SESSION_COOKIE, sessionCookieOptions } from '@/packages/cms/lib/session'
import { checkRateLimit, resetRateLimit } from '@/packages/cms/lib/rate-limit'
import { findUserByEmail } from '@/packages/cms/lib/users'
import { verifyPassword } from '@/packages/cms/lib/password'
import { cmsConfig } from '@/cms.config'

const OAUTH_STATE_COOKIE = 'cms_oauth_state'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ action: string[] }> }
) {
  const { action } = await params
  const route = action.join('/')

  // ── GET /api/cms/auth/login → redirect to GitHub OAuth
  if (route === 'login') {
    const state = generateOAuthState()
    const url = getGithubAuthUrl(state)
    const res = NextResponse.redirect(url)
    res.cookies.set(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 min
      path: '/',
    })
    return res
  }

  // ── GET /api/cms/auth/callback?code=xxx&state=xxx
  if (route === 'callback') {
    const code = req.nextUrl.searchParams.get('code')
    const state = req.nextUrl.searchParams.get('state')
    const cookieStore = await cookies()
    const savedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value

    if (!code || !state || state !== savedState) {
      return NextResponse.redirect(new URL('/admin?error=oauth', req.url))
    }

    try {
      const { login, token } = await exchangeGithubCode(code)
      if (!isAllowedGithubUser(login)) {
        return NextResponse.redirect(new URL('/admin?error=unauthorized', req.url))
      }

      const sessionToken = encryptSession({
        userId: `github:${login}`,
        role: 'admin',
        loginMethod: 'github',
        githubToken: token,
      })

      const res = NextResponse.redirect(new URL('/admin/dashboard', req.url))
      res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions())
      res.cookies.delete(OAUTH_STATE_COOKIE)
      return res
    } catch {
      return NextResponse.redirect(new URL('/admin?error=oauth', req.url))
    }
  }

  // ── GET /api/cms/auth/logout
  if (route === 'logout') {
    const res = NextResponse.redirect(new URL('/admin', req.url))
    res.cookies.delete(SESSION_COOKIE)
    return res
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string[] }> }
) {
  const { action } = await params
  const route = action.join('/')

  // ── POST /api/cms/auth/login → email + password
  if (route === 'login') {
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
    const { allowed } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
        { status: 429 }
      )
    }

    let body: { email?: string; password?: string }
    try {
      body = (await req.json()) as { email?: string; password?: string }
    } catch {
      return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
    }

    const { email, password } = body
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const user = await findUserByEmail(
      cmsConfig.repo,
      cmsConfig.branch,
      email,
      process.env.CMS_GITHUB_TOKEN
    )

    if (!user) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.passwordHash, user.salt)
    if (!valid) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    resetRateLimit(ip)

    const sessionToken = encryptSession({
      userId: user.id,
      role: user.role,
      loginMethod: 'password',
    })

    const res = NextResponse.json({ ok: true })
    res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions())
    return res
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
