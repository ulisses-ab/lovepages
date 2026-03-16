import { useState } from 'react'
import { Settings } from 'lucide-react'
import { useT } from '../../lib/i18n'
import BackgroundChooser from '../ui/BackgroundChooser'

export default function PageOptionsBlock({ pageSettings, onChange }) {
  const [expanded, setExpanded] = useState(false)
  const { t } = useT()

  return (
    <div
      className={`bg-surface rounded-xl border transition ${
        expanded
          ? 'border-primary shadow-md shadow-primary-subtle/30'
          : 'border-overlay hover:border-subtle'
      }`}
    >
      {/* Header */}
      <div className="flex items-center h-12 gap-2 px-3 pl-4 py-2">
        <Settings size={15} className="text-fg-secondary shrink-0" />
        <span className="text-sm font-medium text-fg-secondary flex-1 select-none">
          {t('pageOptions.title')}
        </span>
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-xs text-fg-muted hover:text-primary-dim px-2 py-1 rounded hover:bg-primary-subtle/50 transition"
        >
          {expanded ? t('sortable.done') : t('sortable.edit')}
        </button>
      </div>

      {/* Expanded controls */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-overlay pt-3 space-y-3">
          <p className="text-xs text-fg-muted">{t('pageOptions.background')}</p>
          <BackgroundChooser
            bgColor={pageSettings.bgColor || ''}
            bgImage={pageSettings.bgImage || ''}
            bgImageFit={pageSettings.bgImageFit || 'cover'}
            bgFade={pageSettings.bgFade || false}
            bgColor2={pageSettings.bgColor2 || ''}
            bgImage2={pageSettings.bgImage2 || ''}
            bgImageFit2={pageSettings.bgImageFit2 || 'cover'}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  )
}
