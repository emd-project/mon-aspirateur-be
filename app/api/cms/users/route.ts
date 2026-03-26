import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/packages/cms/lib/get-session'
import { getUsers, saveUsers } from '@/packages/cms/lib/users'
import { hashPassword, validatePassword } from '@/packages/cms/lib/password'
import { cmsConfig } from '@/cms.config'
import type { UserRole } from '@/packages/cms/types'
import { randomBytes } from 'crypto'

async function requireAdmin(_req: NextRequest) {
  const session = await getSession()
  if (!session) return { session: null, error: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }) }
  if (session.role !== 'admin') return { session: null, error: NextResponse.json({ error: 'Droits insuffisants' }, { status: 403 }) }
  return { session, error: null }
}

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req)
    if (error) return error

    const session = await getSession()
    const token = process.env.CMS_GITHUB_TOKEN
    const { users } = await getUsers(cmsConfig.repo, cmsConfig.branch, token)
    const safe = users.map(({ passwordHash: _h, salt: _s, ...u }) => u)
    return NextResponse.json(safe)
  } catch (err) {
    console.error('[cms/users GET]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req)
    if (error) return error

    let body: { name?: string; email?: string; password?: string; role?: string }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
    }

    const { name, email, password, role } = body
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email et password requis' }, { status: 400 })
    }

    const pwError = validatePassword(password)
    if (pwError) return NextResponse.json({ error: pwError }, { status: 400 })

    const session = await getSession()
    const token = process.env.CMS_GITHUB_TOKEN
    const { users, sha } = await getUsers(cmsConfig.repo, cmsConfig.branch, token)

    if (users.find((u) => u.email === email)) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
    }

    const { hash, salt } = await hashPassword(password)
    const newUser = {
      id: randomBytes(8).toString('hex'),
      name,
      email,
      role: (role as UserRole) ?? 'editor',
      passwordHash: hash,
      salt,
    }

    await saveUsers(cmsConfig.repo, cmsConfig.branch, [...users, newUser], sha, token)
    const { passwordHash: _h, salt: _s, ...safe } = newUser
    return NextResponse.json(safe, { status: 201 })
  } catch (err) {
    console.error('[cms/users POST]', err)
    const msg = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req)
    if (error) return error

    let body: { id?: string; role?: string; password?: string }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
    }

    if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const session = await getSession()
    const token = process.env.CMS_GITHUB_TOKEN
    const { users, sha } = await getUsers(cmsConfig.repo, cmsConfig.branch, token)

    const idx = users.findIndex((u) => u.id === body.id)
    if (idx === -1) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

    const user = users[idx]
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

    if (body.role) user.role = body.role as UserRole
    if (body.password) {
      const pwError = validatePassword(body.password)
      if (pwError) return NextResponse.json({ error: pwError }, { status: 400 })
      const { hash, salt } = await hashPassword(body.password)
      user.passwordHash = hash
      user.salt = salt
    }

    await saveUsers(cmsConfig.repo, cmsConfig.branch, users, sha, token)
    const { passwordHash: _h, salt: _s, ...safe } = user
    return NextResponse.json(safe)
  } catch (err) {
    console.error('[cms/users PUT]', err)
    const msg = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req)
    if (error) return error

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const session = await getSession()
    const token = process.env.CMS_GITHUB_TOKEN
    const { users, sha } = await getUsers(cmsConfig.repo, cmsConfig.branch, token)

    const filtered = users.filter((u) => u.id !== id)
    if (filtered.length === users.length) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    await saveUsers(cmsConfig.repo, cmsConfig.branch, filtered, sha, token)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[cms/users DELETE]', err)
    const msg = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
