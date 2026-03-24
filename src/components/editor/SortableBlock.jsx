import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import BlockRenderer from '../blocks/BlockRenderer'
import ContainerBlock, { ContainerSettingsPanel } from '../blocks/ContainerBlock'
import BlockStyleControls from './BlockStyleControls'
import { BLOCK_ICONS, BLOCK_LABELS, BLOCK_ACCENTS, BLOCK_ACCENT_VARS } from '../../lib/blockDefaults'
import { colors } from '../../lib/theme'
import { HelpCircle } from 'lucide-react'
import { useT } from '../../lib/i18n'

function getIcon(type) {
  return BLOCK_ICONS[type] ?? HelpCircle
}


export default function SortableBlock({ block, onUpdate, onDelete, isDropTarget, onHoverBlock }) {
  const [expanded, setExpanded] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const { t } = useT()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  function handleChange(patch) {
    onUpdate(block.id, patch)
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        className="rounded-xl border-2 border-dashed border-primary/60 h-12"
        style={{ ...style, background: 'rgba(19,17,24,0.5)' }}
      />
    )
  }

  const isContainerDropTarget = isDropTarget && block.type === 'container'
  const blockLabel = BLOCK_LABELS[block.type] ?? t(`block.${block.type}`)
  const accent = BLOCK_ACCENTS[block.type] || colors.logoBlue
  const accentVars = BLOCK_ACCENT_VARS[block.type] || {}

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => onHoverBlock?.(block.id)}
      onMouseLeave={() => onHoverBlock?.(null)}
      className={`relative rounded-xl border transition ${
        expanded
          ? ''
          : isContainerDropTarget
            ? 'border-primary ring-2 ring-primary/40'
            : 'border-overlay/70 hover:border-subtle'
      }`}
      style={{
        ...style,
        '--primary': accentVars['--primary'],
        '--primary-hover': accentVars['--primary-hover'],
        '--primary-dim': accentVars['--primary-dim'],
        '--primary-subtle': accentVars['--primary-subtle'],
        ...(expanded ? { borderColor: `${accent}b3` } : {}),
        background: `radial-gradient(circle at 95% 50%, ${accent}18 0%, rgba(19,17,24,0.80) 65%)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: expanded ? `0 0 0 1px ${accent}40, 0 4px 24px rgba(0,0,0,0.4)` : '0 2px 12px rgba(0,0,0,0.3)',
      }}
    >
      {isDropTarget && !isContainerDropTarget && (
        <div className="absolute -top-1.5 left-0 right-0 h-0.5 bg-primary rounded-full z-20 pointer-events-none" />
      )}
      {isContainerDropTarget && (
        <div className="absolute inset-0 rounded-xl bg-primary/5 pointer-events-none z-10 flex items-center justify-center">
          <span className="text-xs text-primary font-medium bg-surface/80 px-2 py-0.5 rounded-full">Drop inside container</span>
        </div>
      )}

      {/* Block header */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing touch-none"
      >
        <span className="text-fg-ghost select-none text-sm" title={t('sortable.dragToReorder')}>⠿</span>
        {(() => { const Icon = getIcon(block.type); return <Icon size={15} className="shrink-0" style={{ color: accent }} /> })()}
        <span className="text-sm font-medium text-fg-secondary flex-1 select-none">{blockLabel}</span>

        <button
          onClick={() => setExpanded(v => !v)}
          onPointerDown={e => e.stopPropagation()}
          className={`text-xs px-3 py-1.5 rounded transition font-medium ${
            expanded
              ? 'hover:opacity-80'
              : 'text-fg-muted hover:text-fg hover:bg-overlay'
          }`}
          style={expanded ? { backgroundColor: `${accent}33`, color: `${accent}cc` } : {}}
        >
          {expanded ? t('sortable.done') : t('sortable.edit')}
        </button>

        {confirming ? (
          <div className="flex items-center gap-1.5" onPointerDown={e => e.stopPropagation()}>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs px-2 py-1 rounded text-fg-muted hover:text-fg transition"
            >
              {t('dashboard.cancel')}
            </button>
            <button
              onClick={() => onDelete(block.id)}
              className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition font-medium"
            >
              {t('sortable.remove')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            onPointerDown={e => e.stopPropagation()}
            className="text-fg-ghost hover:text-red-400 w-6 h-6 flex items-center justify-center rounded transition text-base leading-none"
            title={t('sortable.deleteBlock')}
          >
            ×
          </button>
        )}
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-overlay">
          <div className="pt-3 space-y-4">
            {block.type === 'container'
              ? <ContainerSettingsPanel block={block} onChange={handleChange} />
              : <BlockRenderer block={block} isEditing onChange={handleChange} />
            }
            <div className="border-t border-overlay/60 pt-3">
              <BlockStyleControls block={block} onChange={handleChange} />
            </div>
          </div>
        </div>
      )}

      {/* Container children — always visible for container blocks */}
      {block.type === 'container' && (
        <div className="border-t border-overlay overflow-hidden rounded-b-xl" onPointerDown={e => e.stopPropagation()}>
          <ContainerBlock block={block} isEditing onChange={handleChange} />
        </div>
      )}
    </div>
  )
}
