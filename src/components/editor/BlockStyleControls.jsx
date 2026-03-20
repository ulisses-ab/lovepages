const SIZE_OPTIONS = [
  { value: 'full',  label: 'Full row' },
  { value: 'half',  label: 'Half' },
  { value: 'third', label: 'Third' },
  { value: 'auto',  label: 'Fit' },
]

export default function BlockStyleControls({ block, onChange }) {
  const current = block.size ?? 'full'

  return (
    <div className="space-y-3 mt-3">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide shrink-0">Size</p>
        <div className="flex-1 h-px bg-overlay" />
      </div>
      <div className="flex rounded-lg overflow-hidden border border-overlay">
        {SIZE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange({ size: opt.value })}
            className={`flex-1 py-1.5 text-xs transition ${
              current === opt.value
                ? 'bg-primary text-white font-medium'
                : 'bg-surface text-fg-muted hover:bg-overlay'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
