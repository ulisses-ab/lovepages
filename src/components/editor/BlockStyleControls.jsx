import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useT } from '../../lib/i18n'
import BackgroundChooser from '../ui/BackgroundChooser'
import ColorPicker from '../ui/ColorPicker'

export default function BlockStyleControls({ block, onChange }) {
  const { t } = useT()
  const [advancedOpen, setAdvancedOpen] = useState(false)

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

      {/* Advanced options — collapsible */}
      <div>
        <button
          type="button"
          onClick={() => setAdvancedOpen(v => !v)}
          className="flex items-center gap-1.5 text-xs text-fg-ghost hover:text-fg-muted transition"
        >
          <ChevronDown size={13} className={`transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
          Advanced
        </button>

        {advancedOpen && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-fg-muted">{t('style.scale')}</p>
            {[
              { key: 'scaleDesktop', label: t('style.scaleDesktop') },
              { key: 'scaleMobile',  label: t('style.scaleMobile')  },
            ].map(({ key, label }) => {
              const val = block[key] ?? 100
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs text-fg-muted w-12 shrink-0">{label}</span>
                  <input
                    type="range"
                    min={30}
                    max={150}
                    step={5}
                    value={val}
                    onChange={e => onChange({ [key]: Number(e.target.value) })}
                    className="flex-1 h-1 accent-primary"
                  />
                  <span className="text-xs text-fg-muted tabular-nums w-8 text-right shrink-0">{val}%</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
