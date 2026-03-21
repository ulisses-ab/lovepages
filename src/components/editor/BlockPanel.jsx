import { useDraggable } from '@dnd-kit/core'
import { Sparkles } from 'lucide-react'
import { BLOCK_TYPES, BLOCK_ICONS, createBlock } from '../../lib/blockDefaults'
import { useT } from '../../lib/i18n'

function DraggableBlockItem({ type, onAddBlock, t }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `panel::${type}`,
    data: { fromPanel: true, blockType: type },
  })
  const Icon = BLOCK_ICONS[type]

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onAddBlock(createBlock(type))}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-fg-tertiary hover:bg-primary-subtle/50 hover:text-primary-dim transition text-left cursor-grab active:cursor-grabbing select-none ${isDragging ? 'opacity-40' : ''}`}
    >
      <Icon size={15} className="shrink-0" />
      <span>{t(`block.${type}`)}</span>
    </button>
  )
}

const CONTENT_BLOCK_TYPES = Object.values(BLOCK_TYPES).filter(t => t !== BLOCK_TYPES.CONTAINER)

export default function BlockPanel({ onAddBlock, onOpenAi }) {
  const { t } = useT()

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* AI generate */}
      <button
        onClick={onOpenAi}
        className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/60 text-primary-dim rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
      >
        <Sparkles size={14} />
        Build with AI
      </button>

      <div>
        <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">{t('blockpanel.addBlock')}</p>
        <div className="space-y-1">
          {CONTENT_BLOCK_TYPES.map(type => (
            <DraggableBlockItem key={type} type={type} onAddBlock={onAddBlock} t={t} />
          ))}
        </div>
      </div>

      <div className="border-t border-overlay pt-3">
        <DraggableBlockItem type={BLOCK_TYPES.CONTAINER} onAddBlock={onAddBlock} t={t} />
      </div>
    </div>
  )
}
