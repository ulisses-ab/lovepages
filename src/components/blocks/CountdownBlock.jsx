import { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { inputClass, colors } from '../../lib/theme'
import { useT } from '../../lib/i18n'

function getTimeLeft(targetDate) {
  const now = Date.now()
  const target = new Date(targetDate).getTime()
  const diff = target - now

  if (isNaN(target) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: diff <= 0 && !isNaN(target) }
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  }
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function fireConfetti(el) {
  const rect = el.getBoundingClientRect()
  const x = (rect.left + rect.width / 2) / window.innerWidth
  const y = (rect.top + rect.height / 2) / window.innerHeight

  confetti({
    particleCount: 120,
    spread: 100,
    startVelocity: 25,
    decay: 0.92,
    origin: { x, y },
    colors: [colors.primary, colors.primaryDim, colors.confettiPink, colors.confettiYellow, colors.confettiGreen],
  })
}

function FlipUnit({ value, unit }) {
  const [displayed, setDisplayed] = useState(value)
  const [flipping, setFlipping] = useState(false)
  const prev = useRef(value)

  useEffect(() => {
    if (value !== prev.current) {
      setFlipping(true)
      const t = setTimeout(() => {
        setDisplayed(value)
        setFlipping(false)
        prev.current = value
      }, 200)
      return () => clearTimeout(t)
    }
  }, [value])

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center rounded-xl w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${colors.overlay}, ${colors.surface})`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        {/* Center divider line */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-px h-px"
          style={{ background: `rgba(0,0,0,0.35)` }}
        />
        <span
          className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums transition-all duration-200"
          style={{
            color: colors.fg,
            transform: flipping ? 'scaleY(0.6) translateY(-4px)' : 'scaleY(1) translateY(0)',
            opacity: flipping ? 0.4 : 1,
          }}
        >
          {pad(displayed)}
        </span>
      </div>
      <span
        className="mt-2 text-xs font-semibold uppercase tracking-widest"
        style={{ color: colors.fgMuted }}
      >
        {unit}
      </span>
    </div>
  )
}

export default function CountdownBlock({ block, isEditing, onChange }) {
  const { targetDate, label, expiredMessage } = block
  const { t } = useT()
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate))
  const confettiFired = useRef(false)
  const rootRef = useRef(null)

  useEffect(() => {
    confettiFired.current = false
  }, [targetDate])

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

  // Also fire confetti if block mounts already expired (page re-open)
  useEffect(() => {
    if (timeLeft.expired && !confettiFired.current) {
      confettiFired.current = true
      if (rootRef.current) fireConfetti(rootRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isEditing) {
    return (
      <div className="space-y-2">
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
      <div ref={rootRef} className="text-center py-4">
        {label && (
          <p className="text-sm mb-3" style={{ color: colors.fgMuted }}>{label}</p>
        )}
        <p
          className="text-2xl font-bold"
          style={{ color: colors.primaryDim }}
        >
          {expiredMessage || t('countdown.defaultExpired')}
        </p>
      </div>
    )
  }

  const units = [
    { value: timeLeft.days, unit: t('countdown.days') },
    { value: timeLeft.hours, unit: t('countdown.hours') },
    { value: timeLeft.minutes, unit: t('countdown.minutes') },
    { value: timeLeft.seconds, unit: t('countdown.seconds') },
  ]

  return (
    <div ref={rootRef} className="text-center py-2">
      {label && (
        <p
          className="text-sm font-medium mb-5 tracking-wide"
          style={{ color: colors.fgMuted }}
        >
          {label}
        </p>
      )}
      <div className="flex justify-center items-end gap-3 sm:gap-4 flex-wrap">
        {units.map(({ value, unit }, i) => (
          <div key={unit} className="flex items-end gap-3 sm:gap-4">
            <FlipUnit value={value} unit={unit} />
            {i < units.length - 1 && (
              <span
                className="text-2xl font-bold mb-5 sm:mb-7 select-none"
                style={{ color: colors.fgGhost }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
