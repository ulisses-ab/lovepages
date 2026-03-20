import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState, useEffect, useRef } from 'react'
import BlockRenderer from '../blocks/BlockRenderer'
import BlockStyleControls from './BlockStyleControls'
import CollapsibleSection from '../ui/CollapsibleSection'
import { BLOCK_ICONS, BLOCK_LABELS } from '../../lib/blockDefaults'
import { HelpCircle } from 'lucide-react'
import { useT } from '../../lib/i18n'

function getIcon(type) {
  return BLOCK_ICONS[type] ?? HelpCircle
}

function DeleteMenu({ onDelete, onClose, t }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="py-1">
      {confirming ? (
        <div className="px-3 py-2 space-y-2">
          <p className="text-xs text-fg-muted">{t('sortable.removeBlock')}</p>
          <div className="flex gap-1.5">
            <button
              onClick={onClose}
              className="flex-1 text-xs py-1.5 rounded bg-overlay text-fg-muted hover:bg-subtle transition"
            >
              {t('dashboard.cancel')}
            </button>
            <button
              onClick={onDelete}
              className="flex-1 text-xs py-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition font-medium"
            >
              {t('sortable.remove')}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          {t('sortable.deleteBlock')}
        </button>
      )}
    </div>
  )
}

export default function SortableBlock({ block, onUpdate, onDelete, isDropTarget, onHoverBlock }) {
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const { t } = useT()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e) {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

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
  const blockLabel = BLOCK_LABELS[block.type] ?? t(`block.${block.type}`)

  // ── Container blocks ─────────────────────────────────────────────────────────
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
        {/* Drag handle bar */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-t-xl border border-b-0 border-overlay cursor-grab active:cursor-grabbing touch-none"
        >
          <span className="text-fg-ghost text-xs select-none" title={t('sortable.dragToReorder')}>⠿</span>
          {(() => { const Icon = getIcon(block.type); return <Icon size={14} className="text-fg-secondary shrink-0" /> })()}
          <span className="text-sm font-medium text-fg-secondary flex-1 select-none">{blockLabel}</span>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              onPointerDown={e => e.stopPropagation()}
              className="text-fg-ghost hover:text-fg-muted w-7 h-7 flex items-center justify-center rounded transition text-lg leading-none"
              title={t('sortable.more')}
            >
              ⋯
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-30 bg-surface border border-overlay rounded-lg shadow-xl min-w-[150px]">
                <DeleteMenu onDelete={() => { onDelete(block.id); setMenuOpen(false) }} onClose={() => setMenuOpen(false)} t={t} />
              </div>
            )}
          </div>
        </div>
        {/* Container body — always visible */}
        <BlockRenderer block={block} isEditing onChange={handleChange} />
      </div>
    )
  }

  // ── All other block types ─────────────────────────────────────────────────────
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

      {/* Block header */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing touch-none"
      >
        <span className="text-fg-ghost select-none text-sm" title={t('sortable.dragToReorder')}>⠿</span>
        {(() => { const Icon = getIcon(block.type); return <Icon size={15} className="text-fg-secondary shrink-0" /> })()}
        <span className="text-sm font-medium text-fg-secondary flex-1 select-none">{blockLabel}</span>

        <button
          onClick={() => setExpanded(v => !v)}
          onPointerDown={e => e.stopPropagation()}
          className={`text-xs px-3 py-1.5 rounded transition font-medium ${
            expanded
              ? 'bg-primary/20 text-primary-dim hover:bg-primary/30'
              : 'text-fg-muted hover:text-primary-dim hover:bg-primary-subtle/50'
          }`}
        >
          {expanded ? `✓ ${t('sortable.done')}` : `✏ ${t('sortable.edit')}`}
        </button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            onPointerDown={e => e.stopPropagation()}
            className="text-fg-ghost hover:text-fg-muted w-7 h-7 flex items-center justify-center rounded transition text-lg leading-none"
            title={t('sortable.more')}
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-30 bg-surface border border-overlay rounded-lg shadow-xl min-w-[150px]">
              <DeleteMenu onDelete={() => { onDelete(block.id); setMenuOpen(false) }} onClose={() => setMenuOpen(false)} t={t} />
            </div>
          )}
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-overlay">
          <div className="pt-3">
            <BlockRenderer block={block} isEditing onChange={handleChange} />
          </div>
          <CollapsibleSection title={t('style.howWide')}>
            <BlockStyleControls block={block} onChange={handleChange} />
          </CollapsibleSection>
        </div>
      )}
    </div>
  )
}
