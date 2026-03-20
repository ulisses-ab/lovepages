import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import BlockRenderer from '../blocks/BlockRenderer'
import BlockStyleControls from './BlockStyleControls'
import { BLOCK_ICONS } from '../../lib/blockDefaults'
import { useT } from '../../lib/i18n'

export default function SortableBlock({ block, onUpdate, onDelete, isDropTarget, onHoverBlock }) {
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

  const isContainerDropTarget = isDropTarget && block.type === 'container'

  // ── Container blocks render differently: minimal drag-handle bar on top,
  //    the container's live visual body always shown below (no expand gate).
  if (block.type === 'container') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative w-full"
        onMouseEnter={() => onHoverBlock?.(block.id)}
        onMouseLeave={() => onHoverBlock?.(null)}
      >
        {isDropTarget && !isContainerDropTarget && (
          <div className="absolute -top-1.5 left-0 right-0 h-0.5 bg-primary rounded-full z-20 pointer-events-none" />
        )}
        {isContainerDropTarget && (
          <div className="absolute inset-0 rounded-xl bg-primary/5 pointer-events-none z-10 flex items-center justify-center">
            <span className="text-xs text-primary font-medium bg-surface/80 px-2 py-0.5 rounded-full">Drop inside container</span>
          </div>
        )}
        {/* Drag handle bar — sits above the container visual */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-t-xl border border-b-0 border-overlay cursor-grab active:cursor-grabbing touch-none"
        >
          <span className="text-fg-ghost text-xs select-none" title={t('sortable.dragToReorder')}>⠿</span>
          {(() => { const Icon = BLOCK_ICONS[block.type]; return <Icon size={14} className="text-fg-secondary shrink-0" /> })()}
          <span className="text-sm font-medium text-fg-secondary flex-1 select-none">{t(`block.${block.type}`)}</span>
          <button
            onClick={() => onDelete(block.id)}
            onPointerDown={e => e.stopPropagation()}
            className="text-xs text-fg-ghost hover:text-red-400 p-2 rounded transition"
            title={t('sortable.deleteBlock')}
          >
            ✕
          </button>
        </div>
        {/* Container body — always visible; ContainerBlock manages its own settings toggle */}
        <BlockRenderer block={block} isEditing onChange={handleChange} />
      </div>
    )
  }

  // ── All other block types ──────────────────────────────────────────────────
  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => onHoverBlock?.(block.id)}
      onMouseLeave={() => onHoverBlock?.(null)}
      className={`relative bg-surface rounded-xl border transition ${
        expanded
          ? 'border-primary shadow-md shadow-primary-subtle/30'
          : isContainerDropTarget
            ? 'border-primary ring-2 ring-primary/40'
            : 'border-overlay hover:border-subtle'
      }`}
    >
      {isDropTarget && !isContainerDropTarget && (
        <div className="absolute -top-1.5 left-0 right-0 h-0.5 bg-primary rounded-full z-20 pointer-events-none" />
      )}
      {/* Block header — draggable from anywhere */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing touch-none"
      >
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
