import { useState } from 'react'
import BlockRenderer from './BlockRenderer'
import BackgroundChooser from '../ui/BackgroundChooser'
import { BLOCK_TYPES, BLOCK_ICONS, BLOCK_LABELS, createBlock } from '../../lib/blockDefaults'

function ChildBlockEditor({ block, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = BLOCK_ICONS[block.type]

  return (
    <div className={`rounded-xl border transition ${expanded ? 'border-primary/60 bg-base' : 'border-overlay bg-surface'}`}>
      <div className="flex items-center gap-2 px-3 py-2">
        <Icon size={14} className="text-fg-secondary shrink-0" />
        <span className="text-sm font-medium text-fg-secondary flex-1 select-none">{BLOCK_LABELS[block.type]}</span>
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-xs text-fg-muted hover:text-primary-dim px-3 py-2 rounded hover:bg-primary-subtle/50 transition"
        >
          {expanded ? 'Done' : 'Edit'}
        </button>
        <button
          onClick={onDelete}
          className="text-xs text-fg-ghost hover:text-red-400 p-2 rounded transition"
          title="Remove block"
        >
          ✕
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-overlay pt-3">
          <BlockRenderer
            block={block}
            isEditing
            onChange={patch => onUpdate({ ...block, ...patch })}
          />
        </div>
      )}
    </div>
  )
}

export default function ContainerBlock({ block, isEditing, onChange }) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const children = block.children || []

  if (!isEditing) {
    return (
      <div className="flex flex-wrap gap-4 p-6 max-w-3xl mx-auto w-full">
        {children.map(child => (
          <BlockRenderer key={child.id} block={child} />
        ))}
        {children.length === 0 && (
          <p className="text-fg-faint text-sm w-full text-center py-4">Empty container</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Background chooser */}
      <div>
        <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Background</p>
        <BackgroundChooser
          bgColor={block.bgColor}
          bgImage={block.bgImage}
          bgImageFit={block.bgImageFit}
          bgFade={block.bgFade}
          bgColor2={block.bgColor2}
          bgImage2={block.bgImage2}
          onChange={onChange}
        />
      </div>

      {/* Children */}
      {children.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Blocks inside</p>
          <div className="space-y-2">
            {children.map((child, idx) => (
              <ChildBlockEditor
                key={child.id}
                block={child}
                onUpdate={updated => {
                  const next = [...children]
                  next[idx] = updated
                  onChange({ children: next })
                }}
                onDelete={() => onChange({ children: children.filter((_, i) => i !== idx) })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add block */}
      {showAddMenu ? (
        <div className="bg-overlay rounded-xl overflow-hidden border border-subtle">
          <div className="flex items-center justify-between px-4 py-2 border-b border-overlay">
            <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide">Add a block</span>
            <button onClick={() => setShowAddMenu(false)} className="text-fg-muted text-lg leading-none">×</button>
          </div>
          <div className="divide-y divide-overlay">
            {Object.values(BLOCK_TYPES)
              .filter(t => t !== 'container')
              .map(type => {
                const Icon = BLOCK_ICONS[type]
                return (
                  <button
                    key={type}
                    onClick={() => {
                      onChange({ children: [...children, createBlock(type)] })
                      setShowAddMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-fg-secondary hover:bg-primary-subtle/40 transition text-left"
                  >
                    <Icon size={16} className="shrink-0" />
                    {BLOCK_LABELS[type]}
                  </button>
                )
              })}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddMenu(true)}
          className="w-full py-2 rounded-xl border-2 border-dashed border-overlay text-fg-muted text-sm hover:border-primary hover:text-primary transition"
        >
          + Add block inside
        </button>
      )}
    </div>
  )
}
