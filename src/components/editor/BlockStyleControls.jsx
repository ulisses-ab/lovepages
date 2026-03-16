import { useT } from '../../lib/i18n'
import BackgroundChooser from '../ui/BackgroundChooser'
import ColorPicker from '../ui/ColorPicker'

export default function BlockStyleControls({ block, onChange }) {
  const { t } = useT()

  return (
    <div className="space-y-3 border-t border-overlay pt-3 mt-3">
      <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">{t('style.style')}</p>

      {/* Background */}
      <div>
        <p className="text-xs text-fg-muted mb-2">{t('style.background')}</p>
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

      {/* Text color — text blocks only */}
      {block.type === 'text' && (
        <ColorPicker
          value={block.color}
          onChange={val => onChange({ color: val })}
          label={t('style.textColor')}
          clearable
          onClear={() => onChange({ color: '' })}
        />
      )}

      {/* Border / Shadow / Full bleed — pill toggles */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { key: 'border',    label: t('style.border') },
          { key: 'shadow',    label: t('style.shadow') },
          { key: 'fullBleed', label: t('style.fullBleed') },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onChange({ [key]: !block[key] })}
            className={`px-3 py-1 text-xs rounded-full border transition ${
              block[key]
                ? 'bg-primary border-primary text-white'
                : 'bg-overlay border-subtle text-fg-muted hover:border-primary-dim'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
