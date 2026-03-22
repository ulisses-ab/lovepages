import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useT } from '../../lib/i18n'

function SliderRow({ label, value, min, max, step, onChange, displayFn }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-fg-muted w-28 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-primary h-1.5 cursor-pointer"
      />
      <span className="text-xs text-fg-muted w-10 text-right tabular-nums">{displayFn ? displayFn(value) : value}</span>
    </div>
  )
}

export default function BlockStyleControls({ block, onChange }) {
  const { t } = useT()
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const rotate       = block.rotate ?? 0
  // Legacy: if only `scale` is set, use it as the default for both axes
  const legacy       = block.scale ?? 1
  const scaleDesktop = block.scaleDesktop ?? legacy
  const scaleMobile  = block.scaleMobile  ?? legacy
  const marginTop    = block.marginTop    ?? 0
  const marginBottom = block.marginBottom ?? 0

  const isDefault = rotate === 0 && scaleDesktop === 1 && scaleMobile === 1 && marginTop === 0 && marginBottom === 0

  return (
    <div className="space-y-3">
      {/* Advanced: rotate + scale */}
      <div>
        <button
          onClick={() => setAdvancedOpen(v => !v)}
          className="flex items-center gap-1 text-xs text-fg-ghost hover:text-fg-muted transition w-full"
        >
          <ChevronDown
            size={13}
            className={`transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
          />
          Advanced
        </button>
        {advancedOpen && (
          <div className="mt-2 space-y-2.5 bg-overlay/30 rounded-lg px-3 py-3">
            <SliderRow
              label="Rotate"
              value={rotate}
              min={-180} max={180} step={1}
              onChange={v => onChange({ rotate: v })}
              displayFn={v => `${v}°`}
            />
            <SliderRow
              label="Scale (wide)"
              value={scaleDesktop}
              min={0.1} max={3} step={0.05}
              onChange={v => onChange({ scaleDesktop: v, scale: undefined })}
              displayFn={v => `${v.toFixed(2)}×`}
            />
            <SliderRow
              label="Scale (narrow)"
              value={scaleMobile}
              min={0.1} max={3} step={0.05}
              onChange={v => onChange({ scaleMobile: v, scale: undefined })}
              displayFn={v => `${v.toFixed(2)}×`}
            />
            <SliderRow
              label="Margin top"
              value={marginTop}
              min={-100} max={100} step={1}
              onChange={v => onChange({ marginTop: v })}
              displayFn={v => `${v}px`}
            />
            <SliderRow
              label="Margin bottom"
              value={marginBottom}
              min={-100} max={100} step={1}
              onChange={v => onChange({ marginBottom: v })}
              displayFn={v => `${v}px`}
            />
            {!isDefault && (
              <button
                onClick={() => onChange({ rotate: 0, scaleDesktop: 1, scaleMobile: 1, scale: undefined, marginTop: 0, marginBottom: 0 })}
                className="text-xs text-fg-ghost hover:text-fg-muted transition mt-1"
              >
                Reset transforms
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
