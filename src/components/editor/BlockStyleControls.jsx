import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useT } from '../../lib/i18n'

function SizeIcon({ type }) {
  const bar = 'h-1.5 rounded-sm bg-current opacity-80'
  if (type === 'full')  return <div className="flex w-full px-1"><div className={`${bar} w-full`} /></div>
  if (type === 'half')  return <div className="flex gap-1 w-full px-1"><div className={`${bar} flex-1`} /><div className={`${bar} flex-1`} /></div>
  if (type === 'third') return <div className="flex gap-0.5 w-full px-1"><div className={`${bar} flex-1`} /><div className={`${bar} flex-1`} /><div className={`${bar} flex-1`} /></div>
  // auto / compact
  return <div className="flex w-full px-1 justify-center"><div className={`${bar}`} style={{ width: '55%' }} /></div>
}

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
  const current = block.size ?? 'full'

  const SIZE_OPTIONS = [
    { value: 'full',  label: t('style.fullWidth') },
    { value: 'half',  label: t('style.sideBySide') },
    { value: 'third', label: t('style.threeInRow') },
    { value: 'auto',  label: t('style.compact') },
  ]

  const rotate       = block.rotate       ?? 0
  const scaleDesktop = block.scaleDesktop ?? 1
  const scaleMobile  = block.scaleMobile  ?? 1

  return (
    <div className="space-y-3">
      {/* Size picker */}
      <div className="grid grid-cols-4 gap-1.5">
        {SIZE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange({ size: opt.value })}
            className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg border-2 transition ${
              current === opt.value
                ? 'border-primary bg-primary/10 text-primary-dim'
                : 'border-overlay bg-surface text-fg-ghost hover:border-subtle hover:text-fg-muted'
            }`}
          >
            <SizeIcon type={opt.value} />
            <span className="text-xs leading-tight text-center">{opt.label}</span>
          </button>
        ))}
      </div>

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
              label="Scale (desktop)"
              value={scaleDesktop}
              min={0.1} max={3} step={0.05}
              onChange={v => onChange({ scaleDesktop: v })}
              displayFn={v => `${v.toFixed(2)}×`}
            />
            <SliderRow
              label="Scale (mobile)"
              value={scaleMobile}
              min={0.1} max={3} step={0.05}
              onChange={v => onChange({ scaleMobile: v })}
              displayFn={v => `${v.toFixed(2)}×`}
            />
            {(rotate !== 0 || scaleDesktop !== 1 || scaleMobile !== 1) && (
              <button
                onClick={() => onChange({ rotate: 0, scaleDesktop: 1, scaleMobile: 1 })}
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
