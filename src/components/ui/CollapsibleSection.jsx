import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-overlay mt-3">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-2.5 text-xs font-semibold text-fg-muted uppercase tracking-wide hover:text-fg-secondary transition"
      >
        <span>{title}</span>
        <ChevronDown size={13} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}
