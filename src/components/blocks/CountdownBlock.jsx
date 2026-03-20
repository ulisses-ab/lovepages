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
      <div className="w-full h-12 flex items-center justify-center overflow-hidden rounded">
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

function FlipPreview() {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {['0', '0'].map((d, i) => (
        <div key={i} style={{
          width: 18, height: 24, borderRadius: 2,
          background: 'linear-gradient(180deg, #282828 50%, #111 50%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#ddd7c8',
          boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
          position: 'relative',
        }}>
          {d}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.5)' }} />
        </div>
      ))}
      <div style={{ color: '#555', fontWeight: 700, fontSize: 14, alignSelf: 'center' }}>:</div>
      {['0', '0'].map((d, i) => (
        <div key={i} style={{
          width: 18, height: 24, borderRadius: 2,
          background: 'linear-gradient(180deg, #282828 50%, #111 50%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#ddd7c8',
          boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
          position: 'relative',
        }}>
          {d}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.5)' }} />
        </div>
      ))}
    </div>
  )
}

function MinimalPreview() {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {[['00', 'days'], ['00', 'hrs']].map(([n, u], i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: '#f3f4f6', lineHeight: 1 }}>{n}</div>
          <div style={{ fontSize: 7, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{u}</div>
          {i < 1 && <div style={{ width: 1, height: 14, background: '#3a4453', position: 'absolute' }} />}
        </div>
      ))}
    </div>
  )
}

function AeroPreview() {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #ddf1ff 0%, #7ec5ee 100%)',
      borderRadius: 14, padding: '4px 10px', border: '1px solid rgba(255,255,255,0.7)',
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #0c3a88, #07235a)',
        borderRadius: 10, padding: '3px 8px',
        fontFamily: 'monospace', fontSize: 9, color: '#b4dcff',
        textShadow: '0 0 6px #4af', letterSpacing: 1,
      }}>
        00:00:00
      </div>
    </div>
  )
}

function XPCountdownPreview() {
  return (
    <div style={{ border: '2px solid #999', borderRadius: 2, overflow: 'hidden', width: '100%' }}>
      <div style={{
        background: 'linear-gradient(180deg, #3a6ea5, #245cb5)',
        color: 'white', padding: '2px 5px', fontFamily: 'Tahoma, sans-serif', fontSize: 7, fontWeight: 700,
      }}>
        Date and Time
      </div>
      <div style={{ background: '#ece9d8', padding: '4px 5px', display: 'flex', justifyContent: 'center', gap: 3 }}>
        {['00', '00', '00'].map((v, i) => (
          <div key={i} style={{
            background: '#fff', border: '1px inset #999',
            fontFamily: 'monospace', fontSize: 9, padding: '1px 3px', color: '#000',
          }}>{v}</div>
        ))}
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
    const VARIANTS = [
      { value: 'flip',    label: t('countdown.variantFlip'),    Preview: FlipPreview },
      { value: 'minimal', label: t('countdown.variantMinimal'), Preview: MinimalPreview },
      { value: 'aero',    label: t('countdown.variantAero'),    Preview: AeroPreview },
      { value: 'xp',      label: t('countdown.variantXp'),      Preview: XPCountdownPreview },
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
            {VARIANTS.map(({ value, label: vLabel, Preview }) => (
              <VariantCard key={value} label={vLabel} selected={variant === value} onClick={() => onChange({ variant: value })}>
                <Preview />
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
