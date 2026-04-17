const PENDING_STORAGE_KEY = 'cms_pending_changes'

export interface PendingChange {
  collection: string
  filePath: string
  slug: string
  frontmatter: Record<string, unknown>
  body: string
  timestamp: number
  label: string
}

export function getPendingChanges(): PendingChange[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(PENDING_STORAGE_KEY) ?? '[]') as PendingChange[]
  } catch { return [] }
}

function setPendingChanges(changes: PendingChange[]) {
  localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(changes))
  window.dispatchEvent(new Event('cms_pending_update'))
}

export function clearPendingChanges() {
  localStorage.removeItem(PENDING_STORAGE_KEY)
  window.dispatchEvent(new Event('cms_pending_update'))
}

export function addPendingChange(change: PendingChange) {
  const cur = getPendingChanges()
  const idx = cur.findIndex((c) => c.filePath === change.filePath)
  if (idx >= 0) cur[idx] = change; else cur.push(change)
  setPendingChanges(cur)
}
