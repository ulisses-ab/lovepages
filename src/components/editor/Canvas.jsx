import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useState } from 'react'
import SortableBlock from './SortableBlock'
import BlockRenderer from '../blocks/BlockRenderer'
import PageOptionsBlock from './PageOptionsBlock'
import { BLOCK_TYPES, BLOCK_ICONS, BLOCK_LABELS, createBlock } from '../../lib/blockDefaults'
import { useT } from '../../lib/i18n'

export default function Canvas({
  blocks,
  setBlocks,
  previewMode,
  pageSettings,
  onChangeSettings,
  onAddBlock,
  panelDragOverId,
  isDraggingFromPanel,
}) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const { t } = useT()

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
    if (blocks.length === 0) {
      return (
        <p className="text-fg-faint text-sm w-full text-center py-20">
          Nothing to preview yet. Add some blocks!
        </p>
      )
    }
    // Group consecutive non-fullBleed blocks so fullBleed blocks can stretch edge-to-edge
    const segments = []
    let group = []
    for (const block of blocks) {
      if (block.fullBleed) {
        if (group.length) { segments.push({ fullBleed: false, blocks: group }); group = [] }
        segments.push({ fullBleed: true, block })
      } else {
        group.push(block)
      }
    }
    if (group.length) segments.push({ fullBleed: false, blocks: group })

    return (
      <div className="w-full">
        {segments.map((seg, i) =>
          seg.fullBleed ? (
            <BlockRenderer key={seg.block.id} block={seg.block} />
          ) : (
            <div key={i} className="flex flex-wrap gap-4 p-6 max-w-3xl mx-auto">
              {seg.blocks.map(block => (
                <BlockRenderer key={block.id} block={block} />
              ))}
            </div>
          )
        )}
      </div>
    )
  }

  return (
    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
      <div className="p-6 space-y-3 w-full max-w-2xl mx-auto">
        {pageSettings && onChangeSettings && (
          <PageOptionsBlock pageSettings={pageSettings} onChange={onChangeSettings} />
        )}
        {blocks.length === 0 && (
          <div className={`text-center py-20 rounded-xl transition-all ${isDraggingFromPanel ? 'ring-2 ring-primary/50 ring-dashed bg-primary-subtle/10' : 'text-fg-faint'}`}>
            <p className="text-4xl mb-3">✨</p>
            <p className="text-sm hidden md:block">
              {isDraggingFromPanel ? 'Drop here to add your first block' : 'Click or drag a block from the left panel to get started.'}
            </p>
            <p className="text-sm md:hidden">Tap + below to add your first block.</p>
          </div>
        )}
        {blocks.map(block => (
          <SortableBlock
            key={block.id}
            block={block}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            isDropTarget={panelDragOverId === block.id}
          />
        ))}

        {/* "Append here" indicator when dragging from panel below all blocks */}
        {isDraggingFromPanel && blocks.length > 0 && !panelDragOverId && (
          <div className="h-0.5 rounded-full bg-primary/50 animate-pulse" />
        )}

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
  )
}
