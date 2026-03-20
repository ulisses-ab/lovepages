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

            {/* Column layout */}
          <div>
            <p className="text-xs text-fg-muted mb-2">Layout</p>
            <div className="space-y-2">
              {[
                { key: 'columnGap',     label: 'Block gap',  min: 0, max: 64, step: 4,  default: 16, unit: 'px' },
                { key: 'columnPadding', label: 'Page padding', min: 0, max: 80, step: 4, default: 24, unit: 'px' },
              ].map(({ key, label, min, max, step, default: def, unit }) => {
                const val = pageSettings[key] ?? def
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-fg-muted w-24 shrink-0">{label}</span>
                    <input
                      type="range" min={min} max={max} step={step}
                      value={val}
                      onChange={e => onChange({ [key]: Number(e.target.value) })}
                      className="flex-1 h-1 accent-primary"
                    />
                    <span className="text-xs text-fg-muted tabular-nums w-8 text-right shrink-0">{val}{unit}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Background effect */}
          <div>
            <p className="text-xs text-fg-muted mb-2">{t('pageOptions.effect')}</p>
            <div className="flex gap-1.5">
              {[
                { value: '',        label: t('pageOptions.effectNone') },
                { value: 'bubbles', label: t('pageOptions.effectBubbles') },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ bgEffect: opt.value })}
                  className={`px-3 py-1 text-xs rounded-full border transition ${
                    (pageSettings.bgEffect || '') === opt.value
                      ? 'bg-primary border-primary text-white'
                      : 'bg-overlay border-subtle text-fg-muted hover:border-primary-dim'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
