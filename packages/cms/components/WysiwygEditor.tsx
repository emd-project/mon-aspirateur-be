'use client'

import { useEffect, useImperativeHandle, forwardRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg: '#0d0d0d',
  surface: '#111111',
  border: '#222222',
  text: '#e5e5e5',
  muted: '#666666',
  accent: '#ff3d57',
  toolbar: '#161616',
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
      color: active ? '#fff' : C.text,
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
          .tiptap strong { font-weight:700; }
          .tiptap a { color:${C.accent}; text-decoration:underline; }
          .tiptap ul { padding-left:1.5rem; list-style:disc; }
          .tiptap ol { padding-left:1.5rem; list-style:decimal; }
          .tiptap li { margin:.25rem 0; }
          .tiptap blockquote { border-left:3px solid ${C.accent}; margin:0; padding:.5rem 1rem; color:#aaa; }
          .tiptap code { background:#1a1a1a; padding:.125rem .375rem; border-radius:4px; font-family:monospace; font-size:.875em; }
          .tiptap pre { background:#1a1a1a; padding:.75rem 1rem; border-radius:6px; overflow-x:auto; }
          .tiptap pre code { background:none; padding:0; }
          .tiptap hr { border:none; border-top:1px solid ${C.border}; margin:1rem 0; }
          .tiptap p { margin:.5rem 0; }
        `}</style>
      </div>
    )
  }
)

WysiwygEditor.displayName = 'WysiwygEditor'
