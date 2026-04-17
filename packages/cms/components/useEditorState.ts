import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import type { CollectionDef, ContentEntry } from '../types'
import { titleToSlug, importMarkdownFile } from '../lib/parser'
import { extractMdxBlocks, reinsertMdxBlocks, markdownToHtml, htmlToMarkdown } from '../lib/html-md'
import type { WysiwygEditorRef } from './WysiwygEditor'
import { getPendingChanges, addPendingChange } from './editor-pending'

interface Opts {
  collection: string; collectionDef: CollectionDef; entry?: ContentEntry
  onSaved?: (entry: ContentEntry) => void
}

export function useEditorState({ collection, collectionDef, entry, onSaved }: Opts) {
  const [fields, setFields] = useState<Record<string, unknown>>(() => entry?.frontmatter ?? {})
  const [slug, setSlug] = useState(entry?.slug ?? '')
  const [slugLocked, setSlugLocked] = useState(!!entry?.slug)
  const [bodyMode, setBodyMode] = useState<'wysiwyg' | 'source'>('wysiwyg')
  const [sourceBody, setSourceBody] = useState(entry?.body ?? '')
  const [mdxBlocks, setMdxBlocks] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const editorRef = useRef<WysiwygEditorRef>(null)
  const [wysiwygHtml, setWysiwygHtml] = useState('')
  const [dirty, setDirty] = useState(false)
  const [shortcodeCopied, setShortcodeCopied] = useState(false)
  const [hasPending, setHasPending] = useState(false)

  const isFlatPath = collectionDef.flatPath ?? false
  const isReadOnly = collectionDef.readOnly ?? false
  const isMdx = collectionDef.format === 'mdx'

  useEffect(() => {
    const pending = getPendingChanges()
    const ext = isMdx ? '.mdx' : '.yaml'
    const currentSlug = entry?.slug ?? slug
    if (!currentSlug) return
    let expectedPath: string
    if (isFlatPath) { expectedPath = `${collectionDef.path}/${currentSlug}${ext}` }
    else {
      const locale = String(entry?.frontmatter?.locale ?? fields.locale ?? 'fr')
      const catSlug = String(entry?.frontmatter?.categorySlug ?? fields.categorySlug ?? 'guide-achat')
      expectedPath = `${collectionDef.path}/${locale}/${catSlug}/${currentSlug}.mdx`
    }
    const match = pending.find((c) => c.filePath === expectedPath)
    if (match) {
      setFields(match.frontmatter)
      if (isMdx) { const { cleaned, blocks } = extractMdxBlocks(match.body); setMdxBlocks(blocks); setSourceBody(match.body); setWysiwygHtml(markdownToHtml(cleaned)) }
      setHasPending(true); setDirty(false); return
    }
    if (entry?.body) { const { cleaned, blocks } = extractMdxBlocks(entry.body); setMdxBlocks(blocks); setSourceBody(entry.body); setWysiwygHtml(markdownToHtml(cleaned)) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry])

  useEffect(() => { setDirty(true) }, [fields, slug, sourceBody])
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h) }, [dirty])

  function setField(key: string, value: unknown) { setFields((prev) => { const next = { ...prev, [key]: value }; if ((key === 'title' || key === 'name') && !slugLocked) setSlug(titleToSlug(String(value))); return next }) }
  function getCurrentBody(): string { if (bodyMode === 'source') return sourceBody; const html = editorRef.current?.getHTML() ?? wysiwygHtml; return reinsertMdxBlocks(htmlToMarkdown(html), mdxBlocks) }
  function switchToSource() { const html = editorRef.current?.getHTML() ?? wysiwygHtml; setSourceBody(reinsertMdxBlocks(htmlToMarkdown(html), mdxBlocks)); setBodyMode('source') }
  function switchToWysiwyg() { const { cleaned, blocks } = extractMdxBlocks(sourceBody); setMdxBlocks(blocks); const html = markdownToHtml(cleaned); setWysiwygHtml(html); editorRef.current?.setHTML(html); setBodyMode('wysiwyg') }

  function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => { const raw = reader.result as string; const { frontmatter: fm, body: ib } = importMarkdownFile(raw); setFields(fm); if (!slug && fm.title) setSlug(titleToSlug(String(fm.title))); const { cleaned, blocks } = extractMdxBlocks(ib); setMdxBlocks(blocks); setSourceBody(ib); const html = markdownToHtml(cleaned); setWysiwygHtml(html); editorRef.current?.setHTML(html) }
    reader.readAsText(file); e.target.value = ''
  }

  function handleSave() {
    if (saving) return; setSaving(true)
    try {
      const ext = isMdx ? '.mdx' : '.yaml'; const body = getCurrentBody()
      let filePath: string
      if (isFlatPath) { filePath = `${collectionDef.path}/${slug}${ext}` }
      else { filePath = `${collectionDef.path}/${String(fields.locale ?? 'fr')}/${String(fields.categorySlug ?? 'guide-achat')}/${slug}.mdx` }
      addPendingChange({ collection, filePath, slug, frontmatter: { ...fields }, body, timestamp: Date.now(), label: String(fields.title ?? fields.name ?? slug) })
      setToast({ message: 'Sauvegard\u00e9 (en attente de publication)', type: 'success' }); setDirty(false); setHasPending(true)
      onSaved?.({ slug, filePath, frontmatter: fields, body, sha: entry?.sha })
    } catch (err) { setToast({ message: String(err instanceof Error ? err.message : err), type: 'error' }) }
    finally { setSaving(false) }
  }

  function handleCopyShortcode(sc?: string) { if (sc) { void navigator.clipboard.writeText(sc); setShortcodeCopied(true); setTimeout(() => setShortcodeCopied(false), 2000) } }

  useEffect(() => { const h = (e: globalThis.KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); void handleSave() } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) })

  return {
    fields, setField, slug, setSlug, slugLocked, setSlugLocked,
    bodyMode, sourceBody, setSourceBody, mdxBlocks, wysiwygHtml, setWysiwygHtml,
    saving, dirty, hasPending, shortcodeCopied, toast, setToast,
    editorRef, isReadOnly, isMdx,
    switchToSource, switchToWysiwyg, handleImport, handleSave, handleCopyShortcode,
  }
}
