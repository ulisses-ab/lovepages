import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import BlockRenderer from '../blocks/BlockRenderer'
import BlockStyleControls from './BlockStyleControls'
import { BLOCK_ICONS } from '../../lib/blockDefaults'
import { useT } from '../../lib/i18n'

export default function SortableBlock({ block, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const { t } = useT()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  // CSS.Translate avoids the scale distortion that CSS.Transform can produce
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
        style={style}
        className="rounded-xl border-2 border-dashed border-primary bg-surface h-12"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-surface rounded-xl border transition ${
        expanded
          ? 'border-primary shadow-md shadow-primary-subtle/30'
          : 'border-overlay hover:border-subtle'
      }`}
    >
      {/* Block header — draggable from anywhere */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing touch-none"
      >
        {/* Drag handle indicator */}
        <span className="text-fg-ghost select-none" title={t('sortable.dragToReorder')}>⠿</span>

        {(() => { const Icon = BLOCK_ICONS[block.type]; return <Icon size={15} className="text-fg-secondary shrink-0" /> })()}
        <span className="text-sm font-medium text-fg-secondary flex-1 select-none">{t(`block.${block.type}`)}</span>

        <button
          onClick={() => setExpanded(v => !v)}
          onPointerDown={e => e.stopPropagation()}
          className="text-xs text-fg-muted hover:text-primary-dim px-3 py-2 rounded hover:bg-primary-subtle/50 transition"
        >
          {expanded ? t('sortable.done') : t('sortable.edit')}
        </button>
        <button
          onClick={() => onDelete(block.id)}
          onPointerDown={e => e.stopPropagation()}
          className="text-xs text-fg-ghost hover:text-red-400 p-2 rounded transition"
          title={t('sortable.deleteBlock')}
        >
          ✕
        </button>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-overlay">
          <div className="pt-3">
            <BlockRenderer block={block} isEditing onChange={handleChange} />
          </div>
          <BlockStyleControls block={block} onChange={handleChange} />
        </div>
      )}
    </div>
  )
}
