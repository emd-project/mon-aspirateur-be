import { NextResponse } from 'next/server'
import { requireSession } from '@/packages/cms/lib/get-session'
import {
  getBranchInfo,
  getTreeRecursive,
  createTree,
  createCommit,
  updateRef,
  getAheadBy,
} from '@/packages/cms/lib/github'
import { cmsConfig } from '@/cms.config'

const PUBLISH_BRANCH = process.env.CMS_PUBLISH_BRANCH ?? 'main'

function getToken(): string {
  return process.env.CMS_GITHUB_TOKEN ?? ''
}

/** Content path prefixes that are safe to publish to main */
function isContentPath(path: string): boolean {
  const contentPaths = Object.values(cmsConfig.collections).map((c) => c.path)
  return contentPaths.some((prefix) => path.startsWith(prefix + '/') || path === prefix)
}

export async function GET() {
  try {
    await requireSession()
    const token = getToken()
    const repo = cmsConfig.repo
    const cmsBranch = cmsConfig.branch

    const [ahead, mainInfo] = await Promise.all([
      getAheadBy(repo, PUBLISH_BRANCH, cmsBranch, token),
      getBranchInfo(repo, PUBLISH_BRANCH, token),
    ])

    return NextResponse.json({ ahead, lastDeploy: mainInfo.date })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await requireSession()
    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Droits insuffisants' }, { status: 403 })
    }

    const token = getToken()
    const repo = cmsConfig.repo
    const cmsBranch = cmsConfig.branch

    // Get current state of both branches
    const [mainInfo, cmsInfo] = await Promise.all([
      getBranchInfo(repo, PUBLISH_BRANCH, token),
      getBranchInfo(repo, cmsBranch, token),
    ])

    // Get the full tree of the CMS branch to find content blobs
    const cmsTree = await getTreeRecursive(repo, cmsInfo.treeSha, token)

    // Filter to only content files (MDX / YAML) — never code
    const contentEntries = cmsTree
      .filter((entry) => entry.type === 'blob' && isContentPath(entry.path))
      .map((entry) => ({ path: entry.path, sha: entry.sha, mode: entry.mode }))

    if (contentEntries.length === 0) {
      return NextResponse.json({ ok: true, message: 'Rien à publier' })
    }

    // Create a new tree on main that overlays the CMS content files
    const newTreeSha = await createTree(repo, mainInfo.treeSha, contentEntries, token)

    // Create the publish commit
    const newCommitSha = await createCommit(
      repo,
      `cms: publish content from ${cmsBranch}`,
      newTreeSha,
      mainInfo.commitSha,
      token
    )

    // Advance main to the new commit
    await updateRef(repo, PUBLISH_BRANCH, newCommitSha, false, token)

    return NextResponse.json({ ok: true, commit: newCommitSha })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur déploiement'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
