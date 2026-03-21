import { useState, useEffect, useRef } from 'react'
import { inputClass, colors } from '../../lib/theme'
import { useT } from '../../lib/i18n'
import { getTimeLeft, fireConfetti, LabelTag } from './countdown/CountdownShared'
import CountdownFlipVariant from './countdown/CountdownFlipVariant'
import CountdownMinimalVariant from './countdown/CountdownMinimalVariant'
import CountdownAeroVariant from './countdown/CountdownAeroVariant'
import CountdownXPVariant from './countdown/CountdownXPVariant'

function VariantCard({ label, selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-overlay bg-surface hover:border-subtle'
      }`}
    >
      <div className="w-full h-24 overflow-hidden rounded">
        {children}
      </div>
      <span className={`text-xs leading-tight text-center w-full truncate ${
        selected ? 'text-primary-dim font-medium' : 'text-fg-muted'
      }`}>
        {label}
      </span>
    </button>
  )
}

function ScaledPreview({ children, scale = 0.45 }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        width: '260px',
        left: '50%',
        top: 0,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: 'top center',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        {children}
      </div>
    </div>
  )
}

export default function CountdownBlock({ block, isEditing, onChange }) {
  const { targetDate, label, expiredMessage, variant = 'flip', clockColor = 'dark' } = block
  const { t } = useT()
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate))
  const confettiFired = useRef(false)
  const rootRef = useRef(null)

  useEffect(() => { confettiFired.current = false }, [targetDate])

  useEffect(() => {
    if (!targetDate) return
    const id = setInterval(() => {
      const next = getTimeLeft(targetDate)
      setTimeLeft(next)
      if (next.expired && !confettiFired.current) {
        confettiFired.current = true
        if (rootRef.current) fireConfetti(rootRef.current)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  useEffect(() => {
    if (timeLeft.expired && !confettiFired.current) {
      confettiFired.current = true
      if (rootRef.current) fireConfetti(rootRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isEditing) {
    const PREVIEW_TIME = { days: 5, hours: 12, minutes: 30, seconds: 45 }
    const VARIANTS = [
      { value: 'flip', label: t('countdown.variantFlip'), preview: (
        <ScaledPreview scale={0.35}>
          <div style={{ padding: '8px 0' }}>
            <CountdownFlipVariant {...PREVIEW_TIME} clockColor={clockColor} />
          </div>
        </ScaledPreview>
      )},
      { value: 'minimal', label: t('countdown.variantMinimal'), preview: (
        <ScaledPreview>
          <div className="py-2">
            <CountdownMinimalVariant {...PREVIEW_TIME} label="" />
          </div>
        </ScaledPreview>
      )},
      { value: 'aero', label: t('countdown.variantAero'), preview: (
        <ScaledPreview scale={0.4}>
          <div className="py-2">
            <CountdownAeroVariant {...PREVIEW_TIME} label="" />
          </div>
        </ScaledPreview>
      )},
      { value: 'xp', label: t('countdown.variantXp'), preview: (
        <ScaledPreview scale={0.4}>
          <div className="py-2">
            <CountdownXPVariant {...PREVIEW_TIME} label="" />
          </div>
        </ScaledPreview>
      )},
    ]
    return (
      <div className="space-y-3">
        {/* Date first */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-muted">{t('countdown.bigMoment')}</label>
          <input
            type="datetime-local"
            className={inputClass}
            value={targetDate || ''}
            onChange={e => onChange({ targetDate: e.target.value })}
          />
        </div>
        <input
          className={inputClass}
          placeholder={t('countdown.countingDownTo')}
          value={label || ''}
          onChange={e => onChange({ label: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder={t('countdown.whenTimeUp')}
          value={expiredMessage || ''}
          onChange={e => onChange({ expiredMessage: e.target.value })}
        />

        {/* Clock style */}
        <div>
          <p className="text-xs text-fg-muted mb-2">{t('countdown.clockStyle')}</p>
          <div className="grid grid-cols-2 gap-2">
            {VARIANTS.map(({ value, label: vLabel, preview }) => (
              <VariantCard key={value} label={vLabel} selected={variant === value} onClick={() => onChange({ variant: value })}>
                {preview}
              </VariantCard>
            ))}
          </div>
        </div>

        {/* Clock color — only for flip */}
        {variant === 'flip' && (
          <div>
            <p className="text-xs text-fg-muted mb-1.5">{t('countdown.clockColorLabel')}</p>
            <div className="flex gap-2">
              {[
                { value: 'dark',  label: t('countdown.colorDark'),  dot: '#282828' },
                { value: 'beige', label: t('countdown.colorBeige'), dot: '#ede4d0' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ clockColor: opt.value })}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg border-2 text-xs transition ${
                    clockColor === opt.value
                      ? 'border-primary bg-primary/10 text-primary-dim font-medium'
                      : 'border-overlay text-fg-muted hover:border-subtle'
                  }`}
                >
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: opt.dot, border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!targetDate) {
    return <p className="text-sm text-center" style={{ color: colors.fgMuted }}>{t('countdown.noDate')}</p>
  }

  if (timeLeft.expired) {
    return (
      <div ref={rootRef} className="text-center py-6">
        {label && (
          <p className="text-sm mb-3" style={{ color: colors.fgMuted }}>
            {label}
          </p>
        )}
        <p className="text-2xl font-bold" style={{ color: colors.fg }}>
          {expiredMessage || t('countdown.defaultExpired')}
        </p>
      </div>
    )
  }

  const { days, hours, minutes, seconds } = timeLeft

  if (variant === 'minimal') {
    return (
      <div ref={rootRef} className="py-2">
        <CountdownMinimalVariant days={days} hours={hours} minutes={minutes} seconds={seconds} label={label} />
      </div>
    )
  }

  if (variant === 'xp') {
    return (
      <div ref={rootRef} className="py-2">
        <CountdownXPVariant days={days} hours={hours} minutes={minutes} seconds={seconds} label={label} />
      </div>
    )
  }

  if (variant === 'aero') {
    return (
      <div ref={rootRef} className="py-2">
        <CountdownAeroVariant days={days} hours={hours} minutes={minutes} seconds={seconds} label={label} />
      </div>
    )
  }

  return (
    <div ref={rootRef} className="py-2">
      {label && <LabelTag text={label} />}
      <CountdownFlipVariant days={days} hours={hours} minutes={minutes} seconds={seconds} clockColor={clockColor} />
    </div>
  )
}
