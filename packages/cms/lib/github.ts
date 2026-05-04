import type { GitHubFile, GitHubFileContent } from '../types'

const GITHUB_API = 'https://api.github.com'

function getToken(_sessionToken?: string): string {
  // Always use the PAT for GitHub API operations.
  // OAuth tokens only have read:user scope (identity), not repo access.
  return process.env.CMS_GITHUB_TOKEN ?? ''
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

// Bug 1 fix: UTF-8 safe base64 decode
function decodeBase64(base64: string): string {
  const cleaned = base64.replace(/\n/g, '')
  const bytes = Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

// Bug 1 fix: UTF-8 safe base64 encode
function encodeBase64(content: string): string {
  const bytes = new TextEncoder().encode(content)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

export async function listFiles(
  repo: string,
  path: string,
  branch: string,
  token?: string
): Promise<GitHubFile[]> {
  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/contents/${path}?ref=${branch}`,
    { headers: headers(getToken(token)), next: { revalidate: 0 } }
  )
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`GitHub listFiles failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as GitHubFile | GitHubFile[]
  return Array.isArray(data) ? data : [data]
}

export async function listFilesRecursive(
  repo: string,
  path: string,
  branch: string,
  token?: string
): Promise<GitHubFile[]> {
  const items = await listFiles(repo, path, branch, token)
  const results: GitHubFile[] = []
  for (const item of items) {
    if (item.type === 'dir') {
      const children = await listFilesRecursive(repo, item.path, branch, token)
      results.push(...children)
    } else {
      results.push(item)
    }
  }
  return results
}

export async function getFile(
  repo: string,
  path: string,
  branch: string,
  token?: string
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/contents/${path}?ref=${branch}`,
    { headers: headers(getToken(token)), next: { revalidate: 0 } }
  )
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub getFile failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as GitHubFileContent
  return { content: decodeBase64(data.content), sha: data.sha }
}

export async function putFile(
  repo: string,
  path: string,
  branch: string,
  content: string,
  message: string,
  sha: string | undefined,
  token?: string
): Promise<{ sha: string; commit: string }> {
  const body: Record<string, unknown> = {
    message,
    content: encodeBase64(content),
    branch,
  }
  if (sha) body.sha = sha

  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: headers(getToken(token)),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`GitHub putFile failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { content: GitHubFile; commit: { sha: string } }
  return { sha: data.content.sha, commit: data.commit.sha }
}

export async function deleteFile(
  repo: string,
  path: string,
  branch: string,
  sha: string,
  message: string,
  token?: string
): Promise<void> {
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: 'DELETE',
    headers: headers(getToken(token)),
    body: JSON.stringify({ message, sha, branch }),
  })
  if (!res.ok) throw new Error(`GitHub deleteFile failed: ${res.status} ${await res.text()}`)
}

// ─── Git low-level helpers (used by deploy) ──────────────────────────────────

export interface BranchInfo {
  commitSha: string
  treeSha: string
  date: string
}

export async function getBranchInfo(
  repo: string,
  branch: string,
  token?: string
): Promise<BranchInfo> {
  const res = await fetch(`${GITHUB_API}/repos/${repo}/branches/${encodeURIComponent(branch)}`, {
    headers: headers(getToken(token)),
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`GitHub getBranchInfo failed: ${res.status} ${await res.text()}`)
  const data = await res.json() as { commit: { sha: string; commit: { tree: { sha: string }; committer: { date: string } } } }
  return {
    commitSha: data.commit.sha,
    treeSha: data.commit.commit.tree.sha,
    date: data.commit.commit.committer.date,
  }
}

export interface TreeEntry {
  path: string
  mode: '100644' | '100755' | '040000' | '160000' | '120000'
  type: 'blob' | 'tree' | 'commit'
  sha: string | null
}

export async function getTreeRecursive(
  repo: string,
  treeSha: string,
  token?: string
): Promise<TreeEntry[]> {
  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/git/trees/${treeSha}?recursive=1`,
    { headers: headers(getToken(token)), next: { revalidate: 0 } }
  )
  if (!res.ok) throw new Error(`GitHub getTreeRecursive failed: ${res.status} ${await res.text()}`)
  const data = await res.json() as { tree: TreeEntry[]; truncated?: boolean }
  return data.tree
}

/** Strip leading slashes and collapse double slashes to avoid 422 from git/trees */
function sanitizePath(path: string): string {
  return path.replace(/^\/+/, '').replace(/\/\/+/g, '/').replace(/\/$/, '')
}

export async function createTree(
  repo: string,
  baseTreeSha: string,
  entries: Array<{ path: string; sha: string | null; mode?: TreeEntry['mode'] }>,
  token?: string
): Promise<string> {
  const tree = entries.map((e) => ({
    path: sanitizePath(e.path),
    mode: e.mode ?? '100644',
    type: 'blob' as const,
    sha: e.sha,
  }))

  const res = await fetch(`${GITHUB_API}/repos/${repo}/git/trees`, {
    method: 'POST',
    headers: headers(getToken(token)),
    body: JSON.stringify({ base_tree: baseTreeSha, tree }),
  })
  if (!res.ok) throw new Error(`git/trees failed: ${res.status} ${await res.text()}`)
  const data = await res.json() as { sha: string }
  return data.sha
}

export async function createCommit(
  repo: string,
  message: string,
  treeSha: string,
  parentSha: string,
  token?: string
): Promise<string> {
  const res = await fetch(`${GITHUB_API}/repos/${repo}/git/commits`, {
    method: 'POST',
    headers: headers(getToken(token)),
    body: JSON.stringify({ message, tree: treeSha, parents: [parentSha] }),
  })
  if (!res.ok) throw new Error(`GitHub createCommit failed: ${res.status} ${await res.text()}`)
  const data = await res.json() as { sha: string }
  return data.sha
}

export async function updateRef(
  repo: string,
  branch: string,
  commitSha: string,
  force = false,
  token?: string
): Promise<void> {
  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`,
    {
      method: 'PATCH',
      headers: headers(getToken(token)),
      body: JSON.stringify({ sha: commitSha, force }),
    }
  )
  if (!res.ok) throw new Error(`GitHub updateRef failed: ${res.status} ${await res.text()}`)
}

export async function getAheadBy(
  repo: string,
  base: string,
  head: string,
  token?: string
): Promise<number> {
  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`,
    { headers: headers(getToken(token)), next: { revalidate: 0 } }
  )
  if (!res.ok) return 0
  const data = await res.json() as { ahead_by: number }
  return data.ahead_by
}

export async function uploadMedia(
  repo: string,
  path: string,
  branch: string,
  base64Content: string,
  token?: string
): Promise<{ sha: string }> {
  // base64Content comes directly from the browser File API — already base64
  const body = {
    message: `cms: upload ${path.split('/').pop()}`,
    content: base64Content,
    branch,
  }
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: headers(getToken(token)),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`GitHub uploadMedia failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { content: GitHubFile }
  return { sha: data.content.sha }
}
