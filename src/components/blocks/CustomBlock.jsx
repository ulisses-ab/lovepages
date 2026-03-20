export default function CustomBlock({ block, isEditing, onChange }) {
  if (!isEditing) {
    if (!block.html?.trim()) return null
    return (
      <div
        className="w-full"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    )
  }

  return (
    <div className="space-y-3">
      <textarea
        className="w-full bg-overlay border border-subtle text-fg-secondary placeholder-fg-faint rounded px-3 py-2 text-xs font-mono resize-y min-h-32 focus:outline-none focus:border-primary"
        placeholder={'<div style="...">\n  Paste any HTML here\n</div>'}
        value={block.html || ''}
        onChange={e => onChange({ html: e.target.value })}
        spellCheck={false}
      />
      {block.html?.trim() && (
        <div>
          <p className="text-xs text-fg-muted mb-2">Preview</p>
          <div
            className="rounded-lg overflow-hidden border border-overlay p-3 bg-white/5"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        </div>
      )}
    </div>
  )
}
