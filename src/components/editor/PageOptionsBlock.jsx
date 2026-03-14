import { useState } from 'react'
import { Settings } from 'lucide-react'
import { colors, inputClass } from '../../lib/theme'
import { useT } from '../../lib/i18n'
import ImageUpload from '../ui/ImageUpload'

export default function PageOptionsBlock({ pageSettings, onChange }) {
  const [expanded, setExpanded] = useState(false)
  const [bgMode, setBgMode] = useState(() => pageSettings.bgImage ? 'image' : 'color')
  const { t } = useT()

  function switchMode(mode) {
    setBgMode(mode)
    if (mode === 'color') {
      onChange({ bgImage: '', bgImageFit: '' })
    } else {
      onChange({ bgColor: '' })
    }
  }

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
          {/* Background label + mode toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">{t('pageOptions.background')}</span>
            <div className="flex rounded overflow-hidden border border-overlay text-xs">
              <button
                onClick={() => switchMode('color')}
                className={`px-3 py-2 transition ${
                  bgMode === 'color'
                    ? 'bg-primary text-fg'
                    : 'bg-overlay text-fg-muted hover:text-fg-secondary'
                }`}
              >
                {t('pageOptions.bgColor')}
              </button>
              <button
                onClick={() => switchMode('image')}
                className={`px-3 py-2 transition ${
                  bgMode === 'image'
                    ? 'bg-primary text-fg'
                    : 'bg-overlay text-fg-muted hover:text-fg-secondary'
                }`}
              >
                {t('pageOptions.bgImage')}
              </button>
            </div>
          </div>

          {/* Color mode */}
          {bgMode === 'color' && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={pageSettings.bgColor || colors.base}
                onChange={e => onChange({ bgColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              {pageSettings.bgColor && (
                <button
                  onClick={() => onChange({ bgColor: '' })}
                  className="text-xs text-fg-faint hover:text-fg-tertiary"
                >
                  {t('pageOptions.clear')}
                </button>
              )}
            </div>
          )}

          {/* Image mode */}
          {bgMode === 'image' && (
            <div className="space-y-2">
              <ImageUpload
                value={pageSettings.bgImage || ''}
                onChange={url => onChange({ bgImage: url, bgImageFit: pageSettings.bgImageFit || 'cover' })}
                previewClass="w-full h-16 rounded border border-overlay object-cover"
              />
              {pageSettings.bgImage && (
                <>
                  {/* Fit selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-fg-muted">{t('pageOptions.bgFit')}</span>
                    <select
                      value={pageSettings.bgImageFit || 'cover'}
                      onChange={e => onChange({ bgImageFit: e.target.value })}
                      className={inputClass + ' w-auto'}
                    >
                      <option value="cover">{t('pageOptions.bgFitCover')}</option>
                      <option value="contain">{t('pageOptions.bgFitContain')}</option>
                      <option value="tile">{t('pageOptions.bgFitTile')}</option>
                    </select>
                  </div>
                  <button
                    onClick={() => onChange({ bgImage: '', bgImageFit: '' })}
                    className="text-xs text-fg-faint hover:text-fg-tertiary"
                  >
                    {t('pageOptions.clear')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
