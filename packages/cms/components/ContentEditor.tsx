'use client'

import type { CollectionDef, FieldDef, ContentEntry } from '../types'
import { useEditorState } from './useEditorState'
import { ProductCardPreview } from './ProductCardPreview'
import { C, inputStyle, labelStyle } from './editor-tokens'
import { EditorHeader } from './EditorHeader'
import { EditorSection } from './EditorSection'
import { EditorImageCard } from './EditorImageCard'
import { EditorBody } from './EditorBody'
import { TextField, TextareaField, SelectField, TagsField, ListField, RepeaterField, CheckboxGroupField } from './EditorFields'
import { Toast } from './EditorToast'
import { getGroups, IMAGE_SETS, IMAGE_KEYS } from './editor-groups'
export { getPendingChanges, clearPendingChanges } from './editor-pending'
export type { PendingChange } from './editor-pending'

interface ContentEditorProps {
  collection: string; collectionDef: CollectionDef; entry?: ContentEntry; shortcode?: string
  onSaved?: (entry: ContentEntry) => void
}

export function ContentEditor({ collection, collectionDef, entry, shortcode, onSaved }: ContentEditorProps) {
  const s = useEditorState({ collection, collectionDef, entry, onSaved })
  const groups = getGroups(collection)
  const groupedKeys = new Set(groups.flatMap((g) => g.keys))
  const hasImages = Object.keys(collectionDef.fields).some((k) => k.startsWith('image'))
  const hasCaption = 'image1Caption' in collectionDef.fields
  const filledImages = IMAGE_SETS.filter((img) => !!s.fields[img.image]).length
  const mainGroups = groups.filter((g) => g.column === 'main')
  const sideGroups = groups.filter((g) => g.column === 'side')
  const ungrouped = Object.entries(collectionDef.fields).filter(([k]) => !groupedKeys.has(k) && !IMAGE_KEYS.has(k) && collectionDef.fields[k]?.type !== 'repeater')
  const repeaters = Object.entries(collectionDef.fields).filter(([, f]) => f.type === 'repeater')

  function renderField(key: string, field: FieldDef) {
    const val = s.fields[key]
    return (
      <div key={key}>
        <label style={labelStyle}>{field.label}{field.required && <span style={{ color: C.accent, marginLeft: 2 }}>*</span>}</label>
        {field.type === 'image' && <TextField field={{ ...field, key }} value={String(val ?? '')} onChange={(v) => s.setField(key, v)} />}
        {(field.type === 'text' || field.type === 'slug') && <TextField field={{ ...field, key }} value={String(val ?? '')} onChange={(v) => s.setField(key, v)} />}
        {field.type === 'textarea' && <TextareaField field={{ ...field, key }} value={String(val ?? '')} onChange={(v) => s.setField(key, v)} />}
        {field.type === 'number' && <input type="number" value={String(val ?? '')} onChange={(e) => s.setField(key, e.target.valueAsNumber || '')} style={inputStyle} />}
        {field.type === 'date' && <input type="date" value={String(val ?? '').slice(0, 10)} onChange={(e) => s.setField(key, e.target.value)} style={inputStyle} />}
        {field.type === 'select' && <SelectField field={{ ...field, key }} value={String(val ?? '')} onChange={(v) => s.setField(key, v)} />}
        {field.type === 'tags' && <TagsField value={Array.isArray(val) ? (val as string[]) : []} onChange={(v) => s.setField(key, v)} />}
        {field.type === 'list' && <ListField field={{ ...field, key }} value={Array.isArray(val) ? (val as string[]) : []} onChange={(v) => s.setField(key, v)} />}
        {field.type === 'checkboxgroup' && <CheckboxGroupField field={{ ...field, key }} value={Array.isArray(val) ? (val as string[]) : []} onChange={(v) => s.setField(key, v)} />}
        {field.type === 'repeater' && <RepeaterField field={{ ...field, key }} value={Array.isArray(val) ? (val as Record<string, string>[]) : []} onChange={(v) => s.setField(key, v)} />}
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <EditorHeader entrySlug={entry?.slug} dirty={s.dirty} hasPending={s.hasPending} saving={s.saving} isMdx={s.isMdx} isReadOnly={s.isReadOnly} shortcode={shortcode} shortcodeCopied={s.shortcodeCopied} onSave={s.handleSave} onImport={s.handleImport} onCopyShortcode={() => s.handleCopyShortcode(shortcode)} />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: '1.25rem', marginTop: '1.25rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!s.isReadOnly && (
            <EditorSection title="Identifiant" defaultOpen={!entry?.slug}>
              <div>
                <label style={labelStyle}>Slug{s.slugLocked && <button type="button" onClick={() => s.setSlugLocked(false)} style={{ marginLeft: 8, background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: '0.75rem' }}>Modifier</button>}</label>
                <input type="text" value={s.slug} onChange={(e) => s.setSlug(e.target.value)} readOnly={s.slugLocked} style={{ ...inputStyle, color: s.slugLocked ? C.dim : C.text }} />
              </div>
            </EditorSection>
          )}
          {mainGroups.map((g) => (
            <EditorSection key={g.title} title={g.title} accent={g.accent} defaultOpen={g.defaultOpen}>
              {g.keys.map((k) => collectionDef.fields[k] ? renderField(k, collectionDef.fields[k]) : null)}
            </EditorSection>
          ))}
          {hasImages && (
            <EditorSection title="Images" badge={`${filledImages}/3`} accent="#8B6914">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {IMAGE_SETS.map((img) => collectionDef.fields[img.image] ? (
                  <EditorImageCard key={img.n} n={img.n} featured={img.n === 1} imageUrl={String(s.fields[img.image] ?? '')} altText={String(s.fields[img.alt] ?? '')} caption={hasCaption ? String(s.fields[img.caption] ?? '') : undefined} onImageChange={(v) => s.setField(img.image, v)} onAltChange={(v) => s.setField(img.alt, v)} onCaptionChange={hasCaption ? (v) => s.setField(img.caption, v) : undefined} />
                ) : null)}
              </div>
            </EditorSection>
          )}
          {ungrouped.length > 0 && (
            <EditorSection title="Autres champs">
              {ungrouped.map(([k, f]) => renderField(k, f))}
            </EditorSection>
          )}
          {repeaters.map(([k, f]) => (
            <EditorSection key={k} title={f.label} accent="#6B5E54" badge={`${(Array.isArray(s.fields[k]) ? (s.fields[k] as unknown[]).length : 0)}`}>
              {renderField(k, f)}
            </EditorSection>
          ))}
          {s.isMdx && <EditorBody bodyMode={s.bodyMode} onSwitchToWysiwyg={s.switchToWysiwyg} onSwitchToSource={s.switchToSource} sourceBody={s.sourceBody} onSourceChange={s.setSourceBody} mdxBlocks={s.mdxBlocks} wysiwygHtml={s.wysiwygHtml} onWysiwygChange={s.setWysiwygHtml} editorRef={s.editorRef} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 70, alignSelf: 'start' }}>
          {collection === 'products' && (
            <EditorSection title="Aperçu" accent={C.accent}>
              <ProductCardPreview fields={s.fields} />
            </EditorSection>
          )}
          {sideGroups.map((g) => (
            <EditorSection key={g.title} title={g.title} accent={g.accent}>
              {g.keys.map((k) => collectionDef.fields[k] ? renderField(k, collectionDef.fields[k]) : null)}
            </EditorSection>
          ))}
        </div>
      </div>
      {s.toast && <Toast message={s.toast.message} type={s.toast.type} onDone={() => s.setToast(null)} />}
    </div>
  )
}
