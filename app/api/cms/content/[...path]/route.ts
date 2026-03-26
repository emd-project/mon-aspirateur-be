import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/packages/cms/lib/get-session'
import { getFile, putFile, deleteFile, listFilesRecursive } from '@/packages/cms/lib/github'
import { parseMdx, stringifyMdx } from '@/packages/cms/lib/parser'
import { cmsConfig } from '@/cms.config'

function getToken(): string | undefined {
  return process.env.CMS_GITHUB_TOKEN
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { path } = await params
    const [collection, ...rest] = path

    if (!collection) {
      return NextResponse.json({ error: 'Collection requise' }, { status: 400 })
    }

    const collectionDef = cmsConfig.collections[collection]
    if (!collectionDef) {
      return NextResponse.json({ error: 'Collection introuvable' }, { status: 404 })
    }

    const token = getToken()

    if (rest.length === 0) {
      const files = await listFilesRecursive(
        cmsConfig.repo,
        collectionDef.path,
        cmsConfig.branch,
        token
      )
      const mdxFiles = files.filter((f) => f.name.endsWith('.mdx') || f.name.endsWith('.yaml'))

      const entries = await Promise.all(
        mdxFiles.map(async (f) => {
          const file = await getFile(cmsConfig.repo, f.path, cmsConfig.branch, token)
          if (!file) return null
          if (collectionDef.format === 'mdx') {
            const parsed = parseMdx(file.content)
            return { slug: f.name.replace(/\.(mdx|yaml)$/, ''), filePath: f.path, frontmatter: parsed.frontmatter, sha: file.sha }
          }
          return { slug: f.name.replace(/\.yaml$/, ''), filePath: f.path, sha: file.sha }
        })
      )

      return NextResponse.json(entries.filter(Boolean))
    }

    const slugPath = rest.join('/')
    const ext = collectionDef.format === 'mdx' ? '.mdx' : '.yaml'
    const filePath = `${collectionDef.path}/${slugPath}${ext}`

    const file = await getFile(cmsConfig.repo, filePath, cmsConfig.branch, token)
    if (!file) return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })

    if (collectionDef.format === 'mdx') {
      const parsed = parseMdx(file.content)
      return NextResponse.json({
        slug: rest[rest.length - 1],
        filePath,
        frontmatter: parsed.frontmatter,
        body: parsed.body,
        sha: file.sha,
      })
    }

    return NextResponse.json({ filePath, content: file.content, sha: file.sha })
  } catch (err) {
    console.error('[cms/content GET]', err)
    const msg = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { path } = await params
    const [collection, ...rest] = path

    if (!collection) {
      return NextResponse.json({ error: 'Collection requise' }, { status: 400 })
    }

    const collectionDef = cmsConfig.collections[collection]
    if (!collectionDef) {
      return NextResponse.json({ error: 'Collection introuvable' }, { status: 404 })
    }

    let body: { filePath?: string; frontmatter?: Record<string, unknown>; body?: string; sha?: string }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
    }

    const { filePath, frontmatter, body: mdxBody, sha } = body
    if (!filePath || !frontmatter) {
      return NextResponse.json({ error: 'filePath et frontmatter requis' }, { status: 400 })
    }

    const token = getToken()
    const slugName = rest[rest.length - 1] ?? 'untitled'

    let content: string
    if (collectionDef.format === 'mdx') {
      content = stringifyMdx(frontmatter, mdxBody ?? '')
    } else {
      const { stringifyYaml } = await import('@/packages/cms/lib/parser')
      content = stringifyYaml(frontmatter)
    }

    const commitMsg = sha
      ? `cms: update ${collection}/${slugName}`
      : `cms: create ${collection}/${slugName}`

    const result = await putFile(
      cmsConfig.repo,
      filePath,
      cmsConfig.branch,
      content,
      commitMsg,
      sha,
      token
    )

    return NextResponse.json({ ok: true, sha: result.sha })
  } catch (err) {
    console.error('[cms/content PUT]', err)
    const msg = err instanceof Error ? err.message : 'Erreur sauvegarde'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Droits insuffisants' }, { status: 403 })
    }

    const { path } = await params
    const [collection, ...rest] = path

    if (!collection) {
      return NextResponse.json({ error: 'Collection requise' }, { status: 400 })
    }

    const collectionDef = cmsConfig.collections[collection]
    if (!collectionDef) {
      return NextResponse.json({ error: 'Collection introuvable' }, { status: 404 })
    }

    let body: { filePath?: string; sha?: string }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
    }

    if (!body.filePath || !body.sha) {
      return NextResponse.json({ error: 'filePath et sha requis' }, { status: 400 })
    }

    const token = getToken()
    const slugName = rest[rest.length - 1] ?? 'unknown'

    await deleteFile(
      cmsConfig.repo,
      body.filePath,
      cmsConfig.branch,
      body.sha,
      `cms: delete ${collection}/${slugName}`,
      token
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[cms/content DELETE]', err)
    const msg = err instanceof Error ? err.message : 'Erreur suppression'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
