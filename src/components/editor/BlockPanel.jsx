import { BLOCK_TYPES, BLOCK_ICONS, createBlock } from '../../lib/blockDefaults'
import { useT } from '../../lib/i18n'

export default function BlockPanel({ onAddBlock }) {
  const { t } = useT()

  return (
    <div className="p-4">
      <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">{t('blockpanel.addBlock')}</p>
      <div className="space-y-1">
        {Object.values(BLOCK_TYPES).map(type => (
          <button
            key={type}
            onClick={() => onAddBlock(createBlock(type))}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-fg-tertiary hover:bg-primary-subtle/50 hover:text-primary-dim transition text-left"
          >
            {(() => { const Icon = BLOCK_ICONS[type]; return <Icon size={15} className="shrink-0" /> })()}
            <span>{t(`block.${type}`)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
