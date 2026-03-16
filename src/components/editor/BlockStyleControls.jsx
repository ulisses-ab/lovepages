import { colors } from '../../lib/theme'
import { ALIGN_OPTIONS } from '../../lib/blockDefaults'
import { useT } from '../../lib/i18n'
import ImageUpload from '../ui/ImageUpload'

export default function BlockStyleControls({ block, onChange }) {
  const { t } = useT()

  return (
    <div className="space-y-3 border-t border-overlay pt-3 mt-3">
      <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">{t('style.style')}</p>

      {/* Align */}
      <div>
        <label className="text-xs text-fg-muted mb-1 block">{t('style.align')}</label>
        <div className="flex gap-1">
          {ALIGN_OPTIONS.map(a => (
            <button
              key={a}
              onClick={() => onChange({ align: a })}
              className={`flex-1 py-2 text-xs rounded border transition ${
                block.align === a
                  ? 'bg-primary text-white border-primary'
                  : 'bg-overlay text-fg-tertiary border-subtle hover:border-primary-dim'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Text color (text blocks only) */}
      {block.type === 'text' && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-fg-muted">{t('style.textColor')}</label>
          <input
            type="color"
            value={block.color || '#ffffff'}
            onChange={e => onChange({ color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
          {block.color && (
            <button
              onClick={() => onChange({ color: '' })}
              className="text-xs text-fg-faint hover:text-fg-tertiary"
            >
              {t('style.clear')}
            </button>
          )}
        </div>
      )}

      {/* Background color */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-fg-muted">{t('style.background')}</label>
        <input
          type="color"
          value={block.bgColor || colors.surface}
          onChange={e => onChange({ bgColor: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border-0"
        />
        {block.bgColor && (
          <button
            onClick={() => onChange({ bgColor: '' })}
            className="text-xs text-fg-faint hover:text-fg-tertiary"
          >
            {t('style.clear')}
          </button>
        )}
      </div>

      {/* Background image */}
      <div>
        <label className="text-xs text-fg-muted mb-1.5 block">{t('style.bgImage')}</label>
        <ImageUpload
          value={block.bgImage || ''}
          onChange={url => onChange({ bgImage: url })}
          previewClass="w-full h-12 rounded border border-overlay object-cover mt-1"
        />
        {block.bgImage && (
          <button
            onClick={() => onChange({ bgImage: '' })}
            className="text-xs text-fg-faint hover:text-fg-tertiary mt-1"
          >
            {t('style.clear')}
          </button>
        )}
      </div>

      {/* Border, Shadow & Full bleed toggles */}
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 text-xs text-fg-muted cursor-pointer">
          <input
            type="checkbox"
            checked={block.border || false}
            onChange={e => onChange({ border: e.target.checked })}
            className="accent-primary"
          />
          {t('style.border')}
        </label>
        <label className="flex items-center gap-2 text-xs text-fg-muted cursor-pointer">
          <input
            type="checkbox"
            checked={block.shadow || false}
            onChange={e => onChange({ shadow: e.target.checked })}
            className="accent-primary"
          />
          {t('style.shadow')}
        </label>
        <label className="flex items-center gap-2 text-xs text-fg-muted cursor-pointer">
          <input
            type="checkbox"
            checked={block.fullBleed || false}
            onChange={e => onChange({ fullBleed: e.target.checked })}
            className="accent-primary"
          />
          {t('style.fullBleed')}
        </label>
      </div>
    </div>
  )
}
