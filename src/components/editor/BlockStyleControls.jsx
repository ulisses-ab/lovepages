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

  const rotate = block.rotate ?? 0
  // Support legacy scaleDesktop/scaleMobile fields by falling back to them
  const scale  = block.scale ?? block.scaleDesktop ?? 1

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
              label="Scale"
              value={scale}
              min={0.1} max={3} step={0.05}
              onChange={v => onChange({ scale: v })}
              displayFn={v => `${v.toFixed(2)}×`}
            />
            {(rotate !== 0 || scale !== 1) && (
              <button
                onClick={() => onChange({ rotate: 0, scale: 1 })}
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
