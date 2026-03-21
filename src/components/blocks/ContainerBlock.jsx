import { useState, lazy, Suspense } from 'react'

const ShaderBgLayer = lazy(() => import('../ui/ShaderBgLayer'))
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

// ── Settings panel (background + layout) — rendered by SortableBlock when expanded ──
export function ContainerSettingsPanel({ block, onChange }) {
  const flexDirection  = block.flexDirection  ?? 'row'
  const flexWrap       = block.flexWrap       ?? 'wrap'
  const justifyContent = block.justifyContent ?? 'center'
  const gap            = block.gap            ?? 16
  const padding        = block.padding        ?? 24
  const activePreset   = detectPreset(flexDirection, flexWrap, justifyContent)

  function applyPreset(id) {
    const { flexDirection, flexWrap, justifyContent, alignItems } = LAYOUT_PRESETS[id]
    onChange({ flexDirection, flexWrap, justifyContent, alignItems })
  }

  return (
    <div className="space-y-5">
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
      <div>
        <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2.5">How items are arranged</p>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {Object.keys(LAYOUT_PRESETS).map(id => (
            <LayoutPresetCard key={id} id={id} selected={activePreset === id} onClick={() => applyPreset(id)} />
          ))}
        </div>
        <div className="flex gap-4 mb-3">
          <div className="flex-1">
            <p className="text-xs text-fg-muted mb-1.5">
              Space between items <span className="text-fg-faint">{gap}px</span>
            </p>
            <input type="range" min={0} max={64} step={4} value={gap}
              onChange={e => onChange({ gap: Number(e.target.value) })}
              className="w-full accent-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-fg-muted mb-1.5">
              Padding around edges <span className="text-fg-faint">{padding}px</span>
            </p>
            <input type="range" min={0} max={80} step={4} value={padding}
              onChange={e => onChange({ padding: Number(e.target.value) })}
              className="w-full accent-primary" />
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none group">
          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${
            flexWrap === 'wrap'
              ? 'bg-primary border-primary'
              : 'bg-transparent border-overlay group-hover:border-subtle'
          }`}>
            {flexWrap === 'wrap' && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" style={{ display: 'block' }}>
                <path d="M1 3.5L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <input type="checkbox" checked={flexWrap === 'wrap'}
            onChange={e => onChange({ flexWrap: e.target.checked ? 'wrap' : 'nowrap' })}
            className="sr-only" />
          <span className="text-sm text-fg-muted group-hover:text-fg-secondary transition-colors">Stack items if space is limited</span>
        </label>
      </div>
    </div>
  )
}

export default function ContainerBlock({ block, isEditing, onChange }) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const children = block.children || []

  const flexDirection  = block.flexDirection  ?? 'row'
  const flexWrap       = block.flexWrap       ?? 'wrap'
  const justifyContent = block.justifyContent ?? 'center'
  const alignItems     = block.alignItems     ?? 'center'
  const gap            = block.gap            ?? 16
  const padding        = block.padding        ?? 24

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

    if (block.bgShader) {
      return (
        <div style={{ position: 'relative', width: '100%' }}>
          <Suspense fallback={null}>
            <ShaderBgLayer shaderProps={block.bgShader} pos="absolute" />
          </Suspense>
          <div style={{ position: 'relative', zIndex: 1, ...flexStyle }}>
            {children_el}
          </div>
        </div>
      )
    }

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

  // ── Edit mode — children management only (settings rendered by SortableBlock) ──
  return (
    <div style={{ width: '100%' }}>
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
  )
}
