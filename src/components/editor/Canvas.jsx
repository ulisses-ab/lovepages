import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers'
import { useState } from 'react'
import SortableBlock from './SortableBlock'
import BlockRenderer from '../blocks/BlockRenderer'
import PageOptionsBlock from './PageOptionsBlock'
import { BLOCK_TYPES, BLOCK_ICONS, BLOCK_LABELS, createBlock } from '../../lib/blockDefaults'
import { useT } from '../../lib/i18n'

export default function Canvas({ blocks, setBlocks, previewMode, pageSettings, onChangeSettings, onAddBlock }) {
  const [activeId, setActiveId] = useState(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const { t } = useT()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // must move 8px before drag starts
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 }, // hold 200ms on touch
    }),
  )

  const activeBlock = blocks.find(b => b.id === activeId)

  function handleDragStart(event) {
    setActiveId(event.active.id)
  }

  function handleDragEnd(event) {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    setBlocks(prev => {
      const oldIndex = prev.findIndex(b => b.id === active.id)
      const newIndex = prev.findIndex(b => b.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  function handleUpdate(id, patch) {
    setBlocks(prev => prev.map(b => {
      if (b.id === id) return { ...b, ...patch }
      // Only one song block can have autoplay on
      if (patch.autoplay && b.type === 'song') return { ...b, autoplay: false }
      return b
    }))
  }

  function handleDelete(id) {
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  if (previewMode) {
    return (
      <div className="flex flex-wrap gap-4 p-6 max-w-3xl mx-auto">
        {blocks.length === 0 && (
          <p className="text-fg-faint text-sm w-full text-center py-20">
            Nothing to preview yet. Add some blocks!
          </p>
        )}
        {blocks.map(block => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        <div className="p-6 space-y-3 w-full max-w-2xl mx-auto">
          {pageSettings && onChangeSettings && (
            <PageOptionsBlock pageSettings={pageSettings} onChange={onChangeSettings} />
          )}
          {blocks.length === 0 && (
            <div className="text-center py-20 text-fg-faint">
              <p className="text-4xl mb-3">✨</p>
              <p className="text-sm hidden md:block">Add a block from the left panel to get started.</p>
              <p className="text-sm md:hidden">Tap + below to add your first block.</p>
            </div>
          )}
          {blocks.map(block => (
            <SortableBlock
              key={block.id}
              block={block}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}

          {/* Mobile inline add-block button */}
          {onAddBlock && (
            <div className="md:hidden mt-2">
              {showAddMenu ? (
                <div className="bg-surface border border-overlay rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-overlay">
                    <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide">Add a block</span>
                    <button onClick={() => setShowAddMenu(false)} className="text-fg-muted text-lg leading-none">×</button>
                  </div>
                  <div className="divide-y divide-overlay">
                    {Object.values(BLOCK_TYPES).map(type => {
                      const Icon = BLOCK_ICONS[type]
                      return (
                        <button
                          key={type}
                          onClick={() => { onAddBlock(createBlock(type)); setShowAddMenu(false) }}
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
                  className="w-full py-3 rounded-xl border-2 border-dashed border-overlay text-fg-muted text-xl hover:border-primary hover:text-primary transition"
                >
                  +
                </button>
              )}
            </div>
          )}
        </div>
      </SortableContext>

      {/* Ghost overlay that follows the cursor while dragging */}
      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeBlock ? (
          <div className="bg-surface rounded-xl border h-12 border-primary shadow-xl px-3 py-2 flex items-center gap-2 opacity-95">
            <span className="text-fg-ghost">⠿</span>
            {(() => { const Icon = BLOCK_ICONS[activeBlock.type]; return <Icon size={15} className="text-fg-secondary shrink-0" /> })()}
            <span className="text-sm font-medium text-fg-secondary">{t(`block.${activeBlock.type}`)}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
