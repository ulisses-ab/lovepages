import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import BlockRenderer from './BlockRenderer'
import BackgroundChooser from '../ui/BackgroundChooser'
import { BLOCK_TYPES, BLOCK_ICONS, BLOCK_LABELS, createBlock } from '../../lib/blockDefaults'

function SortableChildBlock({ block, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = BLOCK_ICONS[block.type]

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
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
      className={`rounded-xl border transition ${expanded ? 'border-primary/60 bg-base' : 'border-overlay bg-surface'}`}
    >
      {/* Header — drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing touch-none"
      >
        <span className="text-fg-ghost select-none">⠿</span>
        <Icon size={14} className="text-fg-secondary shrink-0" />
        <span className="text-sm font-medium text-fg-secondary flex-1 select-none">{BLOCK_LABELS[block.type]}</span>
        <button
          onClick={() => setExpanded(v => !v)}
          onPointerDown={e => e.stopPropagation()}
          className="text-xs text-fg-muted hover:text-primary-dim px-3 py-2 rounded hover:bg-primary-subtle/50 transition"
        >
          {expanded ? 'Done' : 'Edit'}
        </button>
        <button
          onClick={onDelete}
          onPointerDown={e => e.stopPropagation()}
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

function SegmentedControl({ label, value, options, onChange }) {
  return (
    <div>
      <p className="text-xs text-fg-muted mb-1">{label}</p>
      <div className="flex rounded-lg overflow-hidden border border-overlay">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            title={opt.label}
            className={`flex-1 py-1.5 text-xs transition flex items-center justify-center gap-1 ${
              value === opt.value
                ? 'bg-primary text-white font-medium'
                : 'bg-surface text-fg-muted hover:bg-overlay'
            }`}
          >
            {opt.icon ?? opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ContainerBlock({ block, isEditing, onChange }) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const children = block.children || []

  const flexDirection   = block.flexDirection   ?? 'row'
  const flexWrap        = block.flexWrap        ?? 'wrap'
  const justifyContent  = block.justifyContent  ?? 'center'
  const alignItems      = block.alignItems      ?? 'center'
  const gap             = block.gap             ?? 16
  const padding         = block.padding         ?? 24

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = children.findIndex(c => c.id === active.id)
    const newIdx = children.findIndex(c => c.id === over.id)
    onChange({ children: arrayMove(children, oldIdx, newIdx) })
  }

  const containerStyle = {
    display: 'flex',
    flexDirection,
    flexWrap,
    justifyContent,
    alignItems,
    gap,
    padding,
    width: '100%',
  }

  if (!isEditing) {
    return (
      <div style={containerStyle}>
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
    <div className="space-y-4">
      {/* Background */}
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

      {/* Layout controls */}
      <div>
        <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">Layout</p>
        <div className="space-y-3">
          <SegmentedControl
            label="Direction"
            value={flexDirection}
            onChange={v => onChange({ flexDirection: v })}
            options={[
              { value: 'row',    label: 'Row',    icon: '→' },
              { value: 'column', label: 'Column', icon: '↓' },
            ]}
          />

          <SegmentedControl
            label="Wrap"
            value={flexWrap}
            onChange={v => onChange({ flexWrap: v })}
            options={[
              { value: 'wrap',   label: 'Wrap' },
              { value: 'nowrap', label: 'No wrap' },
            ]}
          />

          <SegmentedControl
            label="Justify (main axis)"
            value={justifyContent}
            onChange={v => onChange({ justifyContent: v })}
            options={[
              { value: 'flex-start',    label: 'Start',   icon: '⇤' },
              { value: 'center',        label: 'Center',  icon: '⇔' },
              { value: 'flex-end',      label: 'End',     icon: '⇥' },
              { value: 'space-between', label: 'Between', icon: '↔' },
              { value: 'space-evenly',  label: 'Even',    icon: '⟺' },
            ]}
          />

          <SegmentedControl
            label="Align (cross axis)"
            value={alignItems}
            onChange={v => onChange({ alignItems: v })}
            options={[
              { value: 'flex-start', label: 'Start',   icon: '⇡' },
              { value: 'center',     label: 'Center',  icon: '⊙' },
              { value: 'flex-end',   label: 'End',     icon: '⇣' },
              { value: 'stretch',    label: 'Stretch', icon: '↕' },
            ]}
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs text-fg-muted mb-1">Gap <span className="text-fg-faint">{gap}px</span></p>
              <input
                type="range" min={0} max={64} step={4}
                value={gap}
                onChange={e => onChange({ gap: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-fg-muted mb-1">Padding <span className="text-fg-faint">{padding}px</span></p>
              <input
                type="range" min={0} max={80} step={4}
                value={padding}
                onChange={e => onChange({ padding: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sortable children */}
      {children.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Blocks inside</p>
          {/* stopPropagation prevents the outer EditorPage DndContext's PointerSensor
              from intercepting pointer events that belong to this inner context */}
          <div onPointerDown={e => e.stopPropagation()}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={children.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {children.map((child, idx) => (
                    <SortableChildBlock
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
              </SortableContext>
            </DndContext>
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
