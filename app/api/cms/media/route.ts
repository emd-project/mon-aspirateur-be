import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/packages/cms/lib/get-session'
import { put, del, list } from '@vercel/blob'
import { cmsConfig } from '@/cms.config'

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { blobs } = await list({ prefix: 'media/' })
    const images = blobs
      .filter((b) => /\.(png|jpg|jpeg|webp|svg|gif)$/i.test(b.pathname))
      .map((b) => ({
        name: b.pathname.split('/').pop() ?? b.pathname,
        path: b.pathname,
        url: b.url,
        size: b.size,
        type: 'file' as const,
        sha: b.url, // use URL as identifier for delete
        download_url: b.url,
      }))

    return NextResponse.json(images)
  } catch (err) {
    console.error('[cms/media GET]', err)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const sizeBytes = (base64.length * 3) / 4
    if (sizeBytes > cmsConfig.media.maxSizeMB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Taille maximale : ${cmsConfig.media.maxSizeMB} Mo` },
        { status: 400 }
      )
    }

    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
    const buffer = Buffer.from(base64, 'base64')

    const blob = await put(`media/${safeName}`, buffer, {
      access: 'public',
      contentType: mimeType,
    })

    return NextResponse.json({
      ok: true,
      sha: blob.url,
      url: blob.url,
      path: blob.pathname,
    })
  } catch (err) {
    console.error('[cms/media POST]', err)
    const msg = err instanceof Error ? err.message : 'Erreur upload'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Droits insuffisants' }, { status: 403 })
    }

    let body: { url?: string; path?: string; sha?: string }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
    }

    // Accept either url or sha (sha stores the blob URL)
    const blobUrl = body.url ?? body.sha
    if (!blobUrl) {
      return NextResponse.json({ error: 'url requis' }, { status: 400 })
    }

    await del(blobUrl)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[cms/media DELETE]', err)
    const msg = err instanceof Error ? err.message : 'Erreur suppression'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
