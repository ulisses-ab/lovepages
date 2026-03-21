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
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { ChevronDown } from 'lucide-react'
import BlockRenderer from './BlockRenderer'
import SortableBlock from '../editor/SortableBlock'
import BackgroundChooser from '../ui/BackgroundChooser'
import { BLOCK_TYPES, BLOCK_ICONS, BLOCK_LABELS, createBlock } from '../../lib/blockDefaults'


// Layout presets map friendly names → flex property sets
const LAYOUT_PRESETS = {
  stacked: {
    label: 'Stacked',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spread: {
    label: 'Space between',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  around: {
    label: 'Space around',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  left: {
    label: 'Left-aligned',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  sidebyside: {
    label: 'Center aligned',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  right: {
    label: 'Right-aligned',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
}

function detectPreset(flexDirection, flexWrap, justifyContent) {
  if (flexDirection === 'column') return 'stacked'
  if (justifyContent === 'space-between' || justifyContent === 'space-evenly') return 'spread'
  if (justifyContent === 'space-around') return 'around'
  if (justifyContent === 'flex-start' && flexDirection === 'row') return 'left'
  if (justifyContent === 'flex-end'   && flexDirection === 'row') return 'right'
  if (flexDirection === 'row') return 'sidebyside'
  return null
}

function LayoutPresetCard({ id, selected, onClick }) {
  const { label } = LAYOUT_PRESETS[id]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-overlay bg-surface hover:border-subtle'
      }`}
    >
      <div className="w-full h-10 flex items-center justify-center">
        {id === 'sidebyside' && (
          <div className="flex justify-center items-center gap-1.5 w-full">
            {[0, 1].map(i => (
              <div key={i} className={`h-6 w-5 rounded-sm ${selected ? 'bg-primary/50' : 'bg-overlay'}`} />
            ))}
          </div>
        )}
        {id === 'stacked' && (
          <div className="flex flex-col gap-1 items-center w-full px-3">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-2 w-full rounded-sm ${selected ? 'bg-primary/50' : 'bg-overlay'}`} />
            ))}
          </div>
        )}
        {id === 'spread' && (
          <div className="flex justify-between items-center w-full px-1">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-6 w-5 rounded-sm ${selected ? 'bg-primary/50' : 'bg-overlay'}`} />
            ))}
          </div>
        )}
        {id === 'around' && (
          <div className="flex justify-around items-center w-full">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-6 w-5 rounded-sm ${selected ? 'bg-primary/50' : 'bg-overlay'}`} />
            ))}
          </div>
        )}
        {id === 'left' && (
          <div className="flex justify-start items-center gap-1.5 w-full px-1">
            {[0, 1].map(i => (
              <div key={i} className={`h-6 w-5 rounded-sm ${selected ? 'bg-primary/50' : 'bg-overlay'}`} />
            ))}
          </div>
        )}
        {id === 'right' && (
          <div className="flex justify-end items-center gap-1.5 w-full px-1">
            {[0, 1].map(i => (
              <div key={i} className={`h-6 w-5 rounded-sm ${selected ? 'bg-primary/50' : 'bg-overlay'}`} />
            ))}
          </div>
        )}
      </div>
      <span className={`text-xs leading-tight text-center ${selected ? 'text-primary-dim font-medium' : 'text-fg-muted'}`}>
        {label}
      </span>
    </button>
  )
}


export default function ContainerBlock({ block, isEditing, onChange }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const children = block.children || []

  const flexDirection  = block.flexDirection  ?? 'row'
  const flexWrap       = block.flexWrap       ?? 'wrap'
  const justifyContent = block.justifyContent ?? 'center'
  const alignItems     = block.alignItems     ?? 'center'
  const gap            = block.gap            ?? 16
  const padding        = block.padding        ?? 24

  const activePreset = detectPreset(flexDirection, flexWrap, justifyContent)

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

  function applyPreset(id) {
    const { flexDirection, flexWrap, justifyContent, alignItems } = LAYOUT_PRESETS[id]
    onChange({ flexDirection, flexWrap, justifyContent, alignItems })
  }

  const fit1 = block.bgImageFit  || 'cover'
  const fit2 = block.bgImageFit2 || 'cover'

  const flexStyle = {
    display: 'flex',
    flexDirection,
    flexWrap,
    justifyContent,
    alignItems,
    gap,
    padding,
    width: '100%',
  }

  // ── Preview mode ───────────────────────────────────────────────────────────
  if (!isEditing) {
    const children_el = (
      <>
        {children.map(child => (
          <div key={child.id} className="min-w-0" style={child.flexGrow ? { flexGrow: child.flexGrowFactor ?? 1 } : undefined}>
            <BlockRenderer block={child} noSizeWrapper />
          </div>
        ))}
        {children.length === 0 && (
          <p className="text-fg-faint text-sm w-full text-center py-4">Empty container</p>
        )}
      </>
    )

    if (block.bgFade) {
      const hasImage = block.bgImage || block.bgImage2

      if (!hasImage) {
        const from = block.bgColor  || 'transparent'
        const to   = block.bgColor2 || 'transparent'
        return (
          <div style={{ ...flexStyle, background: `linear-gradient(to bottom, ${from}, ${to})` }}>
            {children_el}
          </div>
        )
      }

      return (
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: block.bgColor2 || undefined,
            backgroundImage: block.bgImage2 ? `url(${block.bgImage2})` : undefined,
            backgroundSize: block.bgImage2 ? (fit2 === 'tile' ? 'var(--bg-tile-size)' : fit2) : undefined,
            backgroundRepeat: block.bgImage2 ? (fit2 === 'tile' ? 'repeat' : 'no-repeat') : undefined,
            backgroundPosition: 'center',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: block.bgColor || undefined,
            backgroundImage: block.bgImage ? `url(${block.bgImage})` : undefined,
            backgroundSize: block.bgImage ? (fit1 === 'tile' ? 'var(--bg-tile-size)' : fit1) : undefined,
            backgroundRepeat: block.bgImage ? (fit1 === 'tile' ? 'repeat' : 'no-repeat') : undefined,
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to bottom, black, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
          }} />
          <div style={{ position: 'relative', ...flexStyle }}>{children_el}</div>
        </div>
      )
    }

    return (
      <div style={{
        ...flexStyle,
        backgroundColor: block.bgColor || undefined,
        backgroundImage: block.bgImage ? `url(${block.bgImage})` : undefined,
        backgroundSize: block.bgImage ? (fit1 === 'tile' ? 'var(--bg-tile-size)' : fit1) : undefined,
        backgroundRepeat: block.bgImage ? (fit1 === 'tile' ? 'repeat' : 'no-repeat') : undefined,
        backgroundPosition: 'center',
      }}>
        {children_el}
      </div>
    )
  }

  // ── Edit mode — background style for the container body ───────────────────
  let bgStyle = {}
  if (block.bgFade && !block.bgImage && !block.bgImage2) {
    bgStyle = { background: `linear-gradient(to bottom, ${block.bgColor || 'transparent'}, ${block.bgColor2 || 'transparent'})` }
  } else if (!block.bgFade) {
    bgStyle = {
      backgroundColor: block.bgColor || undefined,
      backgroundImage: block.bgImage ? `url(${block.bgImage})` : undefined,
      backgroundSize: block.bgImage ? (fit1 === 'tile' ? 'var(--bg-tile-size)' : fit1) : undefined,
      backgroundRepeat: block.bgImage ? (fit1 === 'tile' ? 'repeat' : 'no-repeat') : undefined,
      backgroundPosition: 'center',
    }
  }

  return (
    <div className="w-full rounded-b-xl overflow-hidden border border-overlay border-t-0">

      {/* Settings toggle bar */}
      <button
        onClick={() => setSettingsOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-overlay/40 hover:bg-overlay/70 border-b border-overlay transition"
      >
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide">
          Background &amp; Layout
        </span>
        <ChevronDown size={14} className={`text-fg-muted transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Collapsible settings panel */}
      {settingsOpen && (
        <div className="px-4 py-4 bg-surface border-b border-overlay space-y-5">

          {/* Background */}
          <div>
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2.5">Background</p>
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

          {/* Layout */}
          <div>
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2.5">How items are arranged</p>

            {/* Visual preset cards */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {Object.keys(LAYOUT_PRESETS).map(id => (
                <LayoutPresetCard
                  key={id}
                  id={id}
                  selected={activePreset === id}
                  onClick={() => applyPreset(id)}
                />
              ))}
            </div>

            {/* Space & Padding sliders */}
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-xs text-fg-muted mb-1.5">
                  Space between items <span className="text-fg-faint">{gap}px</span>
                </p>
                <input
                  type="range" min={0} max={64} step={4}
                  value={gap}
                  onChange={e => onChange({ gap: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-fg-muted mb-1.5">
                  Padding around edges <span className="text-fg-faint">{padding}px</span>
                </p>
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
      )}

      {/* Container visual body — children rendered live with editing controls */}
      <div style={{ ...bgStyle, width: '100%' }} onPointerDown={e => e.stopPropagation()}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={children.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3 p-3">
              {children.map((child) => (
                <SortableBlock
                  key={child.id}
                  block={child}
                  onUpdate={(id, patch) => {
                    onChange({ children: children.map(c => c.id === id ? { ...c, ...patch } : c) })
                  }}
                  onDelete={(id) => onChange({ children: children.filter(c => c.id !== id) })}
                />
              ))}
              {children.length === 0 && (
                <p className="text-fg-faint text-sm w-full text-center py-8">
                  Empty — add blocks below
                </p>
              )}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add block inside */}
        <div className="px-3 pb-3">
          {showAddMenu ? (
            <div className="bg-overlay/90 rounded-xl overflow-hidden border border-overlay/60">
              <div className="flex items-center justify-between px-3 py-2 border-b border-overlay">
                <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide">Add a block</span>
                <button onClick={() => setShowAddMenu(false)} className="text-fg-muted text-lg leading-none hover:text-fg-secondary transition">×</button>
              </div>
              <div className="grid grid-cols-2 p-2 gap-1">
                {Object.values(BLOCK_TYPES).map(type => {
                  const Icon = BLOCK_ICONS[type]
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        onChange({ children: [...children, createBlock(type)] })
                        setShowAddMenu(false)
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-fg-secondary hover:bg-primary-subtle/40 hover:text-fg transition text-left"
                    >
                      <Icon size={14} className="shrink-0 text-fg-muted" />
                      {BLOCK_LABELS[type]}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddMenu(true)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-overlay text-fg-muted text-sm hover:border-primary hover:text-primary transition"
            >
              + Add a block
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
