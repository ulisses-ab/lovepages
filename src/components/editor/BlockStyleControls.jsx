import { useT } from '../../lib/i18n'
import BackgroundChooser from '../ui/BackgroundChooser'
import ColorPicker from '../ui/ColorPicker'

export default function BlockStyleControls({ block, onChange }) {
  const { t } = useT()

  return (
    <div className="space-y-3 mt-3">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide shrink-0">{t('style.style')}</p>
        <div className="flex-1 h-px bg-overlay" />
      </div>

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

      {/* Scale */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-fg-muted">{t('style.scale')}</p>
          <span className="text-xs text-fg-muted tabular-nums">{block.scale ?? 100}%</span>
        </div>
        <input
          type="range"
          min={30}
          max={150}
          step={5}
          value={block.scale ?? 100}
          onChange={e => onChange({ scale: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

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
