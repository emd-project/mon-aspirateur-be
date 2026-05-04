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

export interface BatchFileChange {
  path: string
  content: string
}

/** Strip leading/trailing slashes and collapse double slashes — GitHub git/trees rejects malformed path components */
function sanitizeTreePath(path: string): string {
  return path.replace(/^\/+/, '').replace(/\/\/+/g, '/').replace(/\/$/, '')
}

export async function batchPutFiles(
  repo: string,
  branch: string,
  files: BatchFileChange[],
  message: string,
  token?: string
): Promise<{ commitSha: string }> {
  if (files.length === 0) throw new Error('No files to commit')
  const tok = getToken(token)
  const h = headers(tok)

  const refRes = await fetch(
    `${GITHUB_API}/repos/${repo}/git/refs/heads/${branch}`,
    { headers: h }
  )
  if (!refRes.ok) throw new Error(`git/ref failed: ${refRes.status}`)
  const refData = (await refRes.json()) as { object: { sha: string } }
  const baseCommitSha = refData.object.sha

  const commitRes = await fetch(
    `${GITHUB_API}/repos/${repo}/git/commits/${baseCommitSha}`,
    { headers: h }
  )
  if (!commitRes.ok) throw new Error(`git/commits failed: ${commitRes.status}`)
  const commitData = (await commitRes.json()) as { tree: { sha: string } }
  const baseTreeSha = commitData.tree.sha

  const treeEntries = files.map((f) => ({
    path: sanitizeTreePath(f.path),
    mode: '100644' as const,
    type: 'blob' as const,
    content: f.content,
  }))

  const treeRes = await fetch(`${GITHUB_API}/repos/${repo}/git/trees`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  })
  if (!treeRes.ok) throw new Error(`git/trees failed: ${treeRes.status} ${await treeRes.text()}`)
  const treeData = (await treeRes.json()) as { sha: string }

  const newCommitRes = await fetch(`${GITHUB_API}/repos/${repo}/git/commits`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      message,
      tree: treeData.sha,
      parents: [baseCommitSha],
    }),
  })
  if (!newCommitRes.ok) throw new Error(`git/commits create failed: ${newCommitRes.status}`)
  const newCommitData = (await newCommitRes.json()) as { sha: string }

  const updateRefRes = await fetch(
    `${GITHUB_API}/repos/${repo}/git/refs/heads/${branch}`,
    {
      method: 'PATCH',
      headers: h,
      body: JSON.stringify({ sha: newCommitData.sha }),
    }
  )
  if (!updateRefRes.ok) throw new Error(`git/refs update failed: ${updateRefRes.status}`)

  return { commitSha: newCommitData.sha }
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
