'use client'

import { useEffect, useImperativeHandle, forwardRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { cleanPastedHTML } from '../lib/paste-cleanup'

// ─── Palette ─────────────────────────────────────────────────────────────────
// Alignée sur editor-tokens.ts pour la cohérence visuelle avec le reste du CMS.
const C = {
  bg: '#FFFFFF',
  surface: '#FAF7F2',
  border: '#EDE5D8',
  text: '#1A1714',
  muted: '#6B5E54',
  accent: '#C4622D',
  accentSoft: 'rgba(196,98,45,.1)',
  toolbar: '#FAF7F2',
  codeBg: '#F0EBE3',
}

export interface WysiwygEditorRef {
  getHTML: () => string
  setHTML: (html: string) => void
}

interface WysiwygEditorProps {
  initialHTML?: string
  onChange?: (html: string) => void
  placeholder?: string
}

const ToolbarButton = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 30,
      height: 30,
      borderRadius: 5,
      border: 'none',
      background: active ? C.accent : 'transparent',
      color: active ? '#fff' : C.muted,
      cursor: 'pointer',
      fontSize: '0.8125rem',
      fontWeight: 600,
    }}
  >
    {children}
  </button>
)

export const WysiwygEditor = forwardRef<WysiwygEditorRef, WysiwygEditorProps>(
  ({ initialHTML = '', onChange, placeholder = 'Rédigez le contenu ici…' }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({ codeBlock: { HTMLAttributes: { class: 'code-block' } } }),
        Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
        Underline,
        Placeholder.configure({ placeholder }),
        // Tables — rendu natif dans le WYSIWYG. Tab/Shift-Tab pour naviguer
        // entre les cellules. Les tableaux Google Docs collés sont nettoyés
        // par cleanPastedHTML puis ingérés directement par ces extensions.
        Table.configure({ resizable: true, HTMLAttributes: { class: 'tt-table' } }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: initialHTML,
      onUpdate: ({ editor: e }) => onChange?.(e.getHTML()),
      editorProps: {
        attributes: {
          style: [
            `min-height:320px`,
            `padding:1rem`,
            `outline:none`,
            `color:${C.text}`,
            `font-size:0.9375rem`,
            `line-height:1.7`,
            `font-family:system-ui,-apple-system,sans-serif`,
          ].join(';'),
        },
        // Pré-nettoyage du HTML collé : Google Docs / Word / Notion enveloppent
        // les tableaux dans des `<style>`, `<meta>` et wrappers `docs-internal-guid`
        // qu'on retire avant que TipTap ne les ingère. La structure `<table>` reste
        // intacte et est rendue nativement par l'extension Table.
        transformPastedHTML: (html: string) => cleanPastedHTML(html),
      },
    })

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() ?? '',
      setHTML: (html: string) => { editor?.commands.setContent(html) },
    }))

    useEffect(() => {
      if (editor && initialHTML && editor.getHTML() !== initialHTML) {
        editor.commands.setContent(initialHTML)
      }
    }, [editor, initialHTML])

    if (!editor) return null

    const setLink = () => {
      const url = window.prompt('URL du lien')
      if (!url) return
      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      }
    }

    return (
      <div
        style={{
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          overflow: 'hidden',
          background: C.bg,
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            padding: '0.375rem 0.5rem',
            background: C.toolbar,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <ToolbarButton
            title="Gras (Ctrl+B)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            title="Italique (Ctrl+I)"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            title="Souligné (Ctrl+U)"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
          >
            <span style={{ textDecoration: 'underline' }}>U</span>
          </ToolbarButton>
          <ToolbarButton
            title="Barré"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
          >
            <s>S</s>
          </ToolbarButton>

          <div style={{ width: 1, background: C.border, margin: '0 4px', alignSelf: 'stretch' }} />

          {([1, 2, 3] as const).map((level) => (
            <ToolbarButton
              key={level}
              title={`Titre H${level}`}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              active={editor.isActive('heading', { level })}
            >
              H{level}
            </ToolbarButton>
          ))}

          <div style={{ width: 1, background: C.border, margin: '0 4px', alignSelf: 'stretch' }} />

          <ToolbarButton
            title="Liste à puces"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            •—
          </ToolbarButton>
          <ToolbarButton
            title="Liste numérotée"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
          >
            1.
          </ToolbarButton>
          <ToolbarButton
            title="Citation"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
          >
            &quot;
          </ToolbarButton>
          <ToolbarButton
            title="Code inline"
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
          >
            {'<>'}
          </ToolbarButton>
          <ToolbarButton title="Lien" onClick={setLink} active={editor.isActive('link')}>
            🔗
          </ToolbarButton>

          <div style={{ width: 1, background: C.border, margin: '0 4px', alignSelf: 'stretch' }} />

          <ToolbarButton
            title="Insérer un tableau (3 col × 3 lignes)"
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          >
            ▦
          </ToolbarButton>
          <ToolbarButton
            title="Ajouter une ligne en dessous"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            +↓
          </ToolbarButton>
          <ToolbarButton
            title="Ajouter une colonne à droite"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            +→
          </ToolbarButton>
          <ToolbarButton
            title="Supprimer la ligne"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            −↓
          </ToolbarButton>
          <ToolbarButton
            title="Supprimer la colonne"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            −→
          </ToolbarButton>
          <ToolbarButton
            title="Supprimer le tableau"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            ▦×
          </ToolbarButton>

          <div style={{ width: 1, background: C.border, margin: '0 4px', alignSelf: 'stretch' }} />

          <ToolbarButton
            title="Annuler (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
          >
            ↩
          </ToolbarButton>
          <ToolbarButton
            title="Rétablir (Ctrl+Y)"
            onClick={() => editor.chain().focus().redo().run()}
          >
            ↪
          </ToolbarButton>
        </div>

        {/* Editor area */}
        <EditorContent editor={editor} />

        {/* Tiptap styles injected inline for portability */}
        <style>{`
          .tiptap p.is-editor-empty:first-child::before {
            color: ${C.muted};
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
          .tiptap h1 { font-size:1.75rem; font-weight:700; margin:.75rem 0 .5rem; color:${C.text}; }
          .tiptap h2 { font-size:1.375rem; font-weight:700; margin:.75rem 0 .5rem; color:${C.text}; }
          .tiptap h3 { font-size:1.125rem; font-weight:600; margin:.75rem 0 .5rem; color:${C.text}; }
          .tiptap strong { font-weight:700; color:${C.text}; }
          .tiptap a { color:${C.accent}; text-decoration:underline; }
          .tiptap ul { padding-left:1.5rem; list-style:disc; }
          .tiptap ol { padding-left:1.5rem; list-style:decimal; }
          .tiptap li { margin:.25rem 0; }
          .tiptap blockquote { border-left:3px solid ${C.accent}; margin:0; padding:.5rem 1rem; color:${C.muted}; }
          .tiptap code { background:${C.codeBg}; padding:.125rem .375rem; border-radius:4px; font-family:monospace; font-size:.875em; color:${C.text}; }
          .tiptap pre { background:${C.codeBg}; padding:.75rem 1rem; border-radius:6px; overflow-x:auto; color:${C.text}; }
          .tiptap pre code { background:none; padding:0; }
          .tiptap hr { border:none; border-top:1px solid ${C.border}; margin:1rem 0; }
          .tiptap p { margin:.5rem 0; }
          .tiptap table.tt-table { border-collapse:collapse; margin:1rem 0; width:100%; table-layout:fixed; overflow:hidden; }
          .tiptap table.tt-table td, .tiptap table.tt-table th { border:1px solid ${C.border}; padding:.5rem .625rem; vertical-align:top; min-width:6ch; box-sizing:border-box; position:relative; }
          .tiptap table.tt-table th { background:${C.surface}; font-weight:700; text-align:left; }
          .tiptap table.tt-table tr:nth-child(even) td { background:${C.surface}; }
          .tiptap table.tt-table .selectedCell { background:${C.accentSoft}; }
          .tiptap table.tt-table .column-resize-handle { position:absolute; right:-2px; top:0; bottom:0; width:4px; background:${C.accent}; pointer-events:none; }
          .tiptap .tableWrapper { overflow-x:auto; }
        `}</style>
      </div>
    )
  }
)

WysiwygEditor.displayName = 'WysiwygEditor'
