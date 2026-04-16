import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/packages/cms/lib/get-session'
import { batchPutFiles, type BatchFileChange } from '@/packages/cms/lib/github'
import { stringifyMdx, stringifyYaml } from '@/packages/cms/lib/parser'
import { cmsConfig } from '@/cms.config'

interface PendingChange {
  collection: string
  filePath: string
  frontmatter: Record<string, unknown>
  body: string
}

export async function POST(req: NextRequest) {
  try {
    await requireSession()

    const { changes } = (await req.json()) as { changes: PendingChange[] }
    if (!Array.isArray(changes) || changes.length === 0) {
      return NextResponse.json({ error: 'Aucune modification à publier' }, { status: 400 })
    }

    const token = process.env.CMS_GITHUB_TOKEN
    const files: BatchFileChange[] = []

    for (const change of changes) {
      const collectionDef = cmsConfig.collections[change.collection]
      if (!collectionDef) continue

      let content: string
      if (collectionDef.format === 'mdx') {
        content = stringifyMdx(change.frontmatter, change.body)
      } else {
        content = stringifyYaml(change.frontmatter)
      }

      files.push({ path: change.filePath, content })
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier valide' }, { status: 400 })
    }

    const slugs = files.map((f) => f.path.split('/').pop()?.replace(/\.\w+$/, '')).join(', ')
    const message = files.length === 1
      ? `cms: update ${slugs}`
      : `cms: batch update ${files.length} files (${slugs})`

    const result = await batchPutFiles(cmsConfig.repo, cmsConfig.branch, files, message, token)

    const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
    if (hookUrl) {
      await fetch(hookUrl, { method: 'POST' }).catch(() => {})
    }

    return NextResponse.json({ ok: true, commitSha: result.commitSha, filesCount: files.length })
  } catch (err) {
    console.error('[cms/batch POST]', err)
    const msg = err instanceof Error ? err.message : 'Erreur batch'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
