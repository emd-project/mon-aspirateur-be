import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/packages/cms/lib/get-session'
import { listFiles, uploadMedia, deleteFile } from '@/packages/cms/lib/github'
import { cmsConfig } from '@/cms.config'

function getToken(githubToken?: string): string | undefined {
  return githubToken ?? process.env.CMS_GITHUB_TOKEN
}

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const token = getToken(session.githubToken)

  try {
    const files = await listFiles(
      cmsConfig.repo,
      cmsConfig.media.path,
      cmsConfig.branch,
      token
    )
    const images = files.filter(
      (f) => f.type === 'file' && /\.(png|jpg|jpeg|webp|svg|gif)$/i.test(f.name)
    )
    return NextResponse.json(images)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  let body: { name?: string; base64?: string; mimeType?: string }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const { name, base64, mimeType } = body
  if (!name || !base64 || !mimeType) {
    return NextResponse.json({ error: 'name, base64 et mimeType requis' }, { status: 400 })
  }

  if (!cmsConfig.media.allowedTypes.includes(mimeType)) {
    return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 })
  }

  // Validate size (base64 ≈ 4/3 of raw bytes)
  const sizeBytes = (base64.length * 3) / 4
  if (sizeBytes > cmsConfig.media.maxSizeMB * 1024 * 1024) {
    return NextResponse.json(
      { error: `Taille maximale : ${cmsConfig.media.maxSizeMB} Mo` },
      { status: 400 }
    )
  }

  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
  const filePath = `${cmsConfig.media.path}/${safeName}`
  const token = getToken(session.githubToken)

  const result = await uploadMedia(cmsConfig.repo, filePath, cmsConfig.branch, base64, token)
  const publicUrl = `/${cmsConfig.media.path.replace(/^public\//, '')}/${safeName}`

  return NextResponse.json({ ok: true, sha: result.sha, url: publicUrl, path: filePath })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Droits insuffisants' }, { status: 403 })
  }

  let body: { path?: string; sha?: string }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  if (!body.path || !body.sha) {
    return NextResponse.json({ error: 'path et sha requis' }, { status: 400 })
  }

  const token = getToken(session.githubToken)
  await deleteFile(
    cmsConfig.repo,
    body.path,
    cmsConfig.branch,
    body.sha,
    `cms: delete media ${body.path.split('/').pop()}`,
    token
  )

  return NextResponse.json({ ok: true })
}
