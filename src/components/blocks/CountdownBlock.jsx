import { useState, useEffect, useRef } from 'react'
import { inputClass, colors } from '../../lib/theme'
import { useT } from '../../lib/i18n'
import { getTimeLeft, fireConfetti, LabelTag } from './countdown/CountdownShared'
import CountdownFlipVariant from './countdown/CountdownFlipVariant'
import CountdownMinimalVariant from './countdown/CountdownMinimalVariant'
import CountdownAeroVariant from './countdown/CountdownAeroVariant'

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
    const VARIANTS = [
      { value: 'flip',    label: t('countdown.variantFlip') },
      { value: 'minimal', label: t('countdown.variantMinimal') },
      { value: 'aero',    label: t('countdown.variantAero') },
    ]
    return (
      <div className="space-y-3">
        <div className="flex gap-1">
          {VARIANTS.map(v => (
            <button
              key={v.value}
              onClick={() => onChange({ variant: v.value })}
              className={`flex-1 py-1 rounded text-xs transition ${
                variant === v.value
                  ? 'bg-primary text-white'
                  : 'bg-overlay text-fg-muted hover:bg-subtle'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        {variant === 'flip' && (
          <div className="flex gap-1">
            {[{ value: 'dark', label: t('countdown.colorDark') }, { value: 'beige', label: t('countdown.colorBeige') }].map(opt => (
              <button
                key={opt.value}
                onClick={() => onChange({ clockColor: opt.value })}
                className={`flex-1 py-1 rounded text-xs transition ${
                  clockColor === opt.value
                    ? 'bg-primary text-white'
                    : 'bg-overlay text-fg-muted hover:bg-subtle'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
        <input
          className={inputClass}
          placeholder={t('countdown.label')}
          value={label || ''}
          onChange={e => onChange({ label: e.target.value })}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-muted">{t('countdown.targetDate')}</label>
          <input
            type="datetime-local"
            className={inputClass}
            value={targetDate || ''}
            onChange={e => onChange({ targetDate: e.target.value })}
          />
        </div>
        <input
          className={inputClass}
          placeholder={t('countdown.expiredMessage')}
          value={expiredMessage || ''}
          onChange={e => onChange({ expiredMessage: e.target.value })}
        />
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
