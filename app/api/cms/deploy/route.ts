import { NextResponse } from 'next/server'
import { requireSession } from '@/packages/cms/lib/get-session'

export async function POST() {
  const session = await requireSession()
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  if (!hookUrl) {
    return NextResponse.json({ error: 'VERCEL_DEPLOY_HOOK_URL non configuré' }, { status: 503 })
  }

  const res = await fetch(hookUrl, { method: 'POST' })
  if (!res.ok) {
    return NextResponse.json({ error: `Vercel a répondu ${res.status}` }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
