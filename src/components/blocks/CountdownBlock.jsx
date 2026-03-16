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

// ── Flip animation state machine ──────────────────────────────────────────────
// Phases:
//   idle      — static display, no animation
//   fold-top  — old top card folds away (0→-90°); static top shows new value
//   fold-bot  — new bottom card folds in (90→0°); static bottom still shows old
//   done      — animation complete, static bottom updates to new value
function useFlipPanel(value) {
  const [topVal, setTopVal]     = useState(value)
  const [botVal, setBotVal]     = useState(value)
  const [phase, setPhase]       = useState('idle')
  const [prevTop, setPrevTop]   = useState(value)
  const [nextBot, setNextBot]   = useState(value)
  const prevRef  = useRef(value)
  const timers   = useRef([])

  useEffect(() => {
    if (value === prevRef.current) return

    timers.current.forEach(clearTimeout)
    timers.current = []

    const old = prevRef.current
    prevRef.current = value

    setPrevTop(old)
    setNextBot(value)
    setTopVal(value)     // static top already shows new value (hidden by animated layer)
    // botVal stays = old during fold-top
    setPhase('fold-top')

    timers.current.push(setTimeout(() => setPhase('fold-bot'), 160))
    timers.current.push(setTimeout(() => {
      setBotVal(value)
      setPhase('idle')
    }, 320))

    return () => timers.current.forEach(clearTimeout)
  }, [value])

  return { topVal, botVal, phase, prevTop, nextBot }
}

// ── Housing texture (brushed anodised aluminium) ──────────────────────────────
function HousingTexture() {
  return (
    <>
      {/* Fine horizontal brush lines */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 14, pointerEvents: 'none',
        backgroundImage: [
          'repeating-linear-gradient(180deg, transparent 0px, transparent 2px, rgba(255,255,255,0.013) 2px, rgba(255,255,255,0.013) 3px)',
          'repeating-linear-gradient(180deg, transparent 0px, transparent 9px, rgba(0,0,0,0.05) 9px, rgba(0,0,0,0.05) 10px)',
        ].join(','),
      }} />
      {/* Vertical subtle grain */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 14, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 14px, rgba(255,255,255,0.008) 14px, rgba(255,255,255,0.008) 15px)',
      }} />
      {/* Top specular streak */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
        borderRadius: '14px 14px 0 0', pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.01) 60%, transparent 100%)',
      }} />
      {/* Bottom edge shadow */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%',
        borderRadius: '0 0 14px 14px', pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 100%)',
      }} />
    </>
  )
}

// ── Single flip panel (one time unit) ─────────────────────────────────────────
const PANEL_W = 58
const PANEL_H = 70
const HALF    = 35

function FlipPanel({ value }) {
  const { topVal, botVal, phase, prevTop, nextBot } = useFlipPanel(value)

  const numStyle = {
    position: 'absolute', left: 0, right: 0, top: 0, height: PANEL_H,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: 38, fontWeight: '700',
    color: '#ddd7c8',
    letterSpacing: 2,
    textShadow: '0 1px 8px rgba(0,0,0,0.6)',
    userSelect: 'none',
  }

  const topHalf = (val, extra = {}) => (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: HALF,
      overflow: 'hidden',
      borderRadius: '5px 5px 0 0',
      background: 'linear-gradient(to bottom, #1e1e1e 0%, #161616 100%)',
      ...extra,
    }}>
      <div style={numStyle}>{pad(val)}</div>
    </div>
  )

  const botHalf = (val, extra = {}) => (
    <div style={{
      position: 'absolute', top: HALF, left: 0, right: 0, height: HALF,
      overflow: 'hidden',
      borderRadius: '0 0 5px 5px',
      background: 'linear-gradient(to bottom, #131313 0%, #1a1a1a 100%)',
      ...extra,
    }}>
      <div style={{ ...numStyle, top: -HALF }}>{pad(val)}</div>
    </div>
  )

  return (
    <div style={{
      position: 'relative',
      width: PANEL_W, height: PANEL_H,
      borderRadius: 6,
      flexShrink: 0,
      boxShadow: [
        '0 8px 28px rgba(0,0,0,0.85)',
        'inset 0 1px 0 rgba(255,255,255,0.055)',
        '0 0 0 1px rgba(0,0,0,0.9)',
      ].join(', '),
    }}>

      {/* Static bottom: shows current bottom value */}
      {botHalf(botVal)}

      {/* Static top: shows current top value (new value during animation) */}
      {topHalf(topVal)}

      {/* fold-top: old top card folds downward (0 → -90°), perspective via wrapper */}
      {phase === 'fold-top' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: HALF,
          zIndex: 4, perspective: 220,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            transformOrigin: 'center bottom',
            animation: 'flip-top 0.16s ease-in forwards',
            overflow: 'hidden',
            borderRadius: '5px 5px 0 0',
            background: 'linear-gradient(to bottom, #1e1e1e 0%, #161616 100%)',
            backfaceVisibility: 'hidden',
          }}>
            <div style={numStyle}>{pad(prevTop)}</div>
          </div>
        </div>
      )}

      {/* fold-bot: new bottom card falls in (90 → 0°) */}
      {phase === 'fold-bot' && (
        <div style={{
          position: 'absolute', top: HALF, left: 0, right: 0, height: HALF,
          zIndex: 4, perspective: 220,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            transformOrigin: 'center top',
            animation: 'flip-bottom 0.16s ease-out forwards',
            overflow: 'hidden',
            borderRadius: '0 0 5px 5px',
            background: 'linear-gradient(to bottom, #131313 0%, #1a1a1a 100%)',
            backfaceVisibility: 'hidden',
          }}>
            <div style={{ ...numStyle, top: -HALF }}>{pad(nextBot)}</div>
          </div>
        </div>
      )}

      {/* Centre divider crease */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: HALF - 1, height: 2,
        background: 'rgba(0,0,0,0.95)', zIndex: 5,
        boxShadow: '0 1px 4px rgba(0,0,0,0.9), 0 -1px 2px rgba(0,0,0,0.5)',
      }} />

      {/* Panel inner edge glow (top highlight) */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 6, pointerEvents: 'none', zIndex: 6,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
      }} />
    </div>
  )
}

// ── Colon separator ────────────────────────────────────────────────────────────
function ColonSep() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 10,
      width: 14, height: PANEL_H, flexShrink: 0,
      paddingBottom: 16,    // offset to align with digit center (clear of unit labels)
    }}>
      {[0, 1].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: 'rgba(255,255,255,0.22)',
          boxShadow: '0 0 4px rgba(255,255,255,0.08)',
        }} />
      ))}
    </div>
  )
}

// ── Full flip clock ────────────────────────────────────────────────────────────
const CLOCK_BASE_W = 360
const CLOCK_BASE_H = 122

function FlipClock({ days, hours, minutes, seconds }) {
  const { t } = useT()
  const wrapRef  = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => {
      const w = el.offsetWidth
      if (w > 10) setScale((w / CLOCK_BASE_W) * 0.9)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const units = [
    { value: days,    label: t('countdown.days') },
    { value: hours,   label: t('countdown.hours') },
    { value: minutes, label: t('countdown.minutes') },
    { value: seconds, label: t('countdown.seconds') },
  ]

  return (
    <div className="w-full" ref={wrapRef}>
      <div style={{ position: 'relative', height: Math.round(CLOCK_BASE_H * scale) }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%',
          marginLeft: -(CLOCK_BASE_W / 2),
          width: CLOCK_BASE_W,
          transformOrigin: 'top center',
          transform: `scale(${scale})`,
        }}>

          {/* Housing */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(168deg, #282828 0%, #181818 45%, #212121 75%, #111 100%)',
            borderRadius: 12,
            padding: '14px 22px 12px',
            boxShadow: [
              '0 18px 60px rgba(0,0,0,0.75)',
              '0 4px 16px rgba(0,0,0,0.5)',
              'inset 0 1px 0 rgba(255,255,255,0.07)',
              'inset 0 0 0 1px rgba(255,255,255,0.04)',
            ].join(', '),
          }}>
            <HousingTexture />

            {/* Rubber feet */}
            {[{ left: 12, bottom: 6 }, { right: 12, bottom: 6 }, { left: 40, bottom: 6 }, { right: 40, bottom: 6 }].map((pos, i) => (
              <div key={i} style={{
                position: 'absolute', ...pos,
                width: 14, height: 7, borderRadius: '0 0 3px 3px',
                background: 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)',
                boxShadow: '0 3px 6px rgba(0,0,0,0.7)',
              }} />
            ))}

            {/* Panel row */}
            <div style={{
              position: 'relative', zIndex: 1,
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'center', gap: 0,
            }}>
              {units.map(({ value, label }, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <FlipPanel value={value} />
                    <div style={{
                      fontSize: 8, letterSpacing: 2.5,
                      color: 'rgba(255,255,255,0.22)',
                      fontFamily: 'monospace', textTransform: 'uppercase',
                    }}>
                      {label}
                    </div>
                  </div>
                  {i < units.length - 1 && <ColonSep />}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Public component ──────────────────────────────────────────────────────────
export default function CountdownBlock({ block, isEditing, onChange }) {
  const { targetDate, label, expiredMessage } = block
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
    return (
      <div className="space-y-3">
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

  return (
    <div ref={rootRef} className="py-2">
      {label && (
        <p
          className="text-center text-sm font-medium mb-4 tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: 3 }}
        >
          {label}
        </p>
      )}
      <FlipClock
        days={timeLeft.days}
        hours={timeLeft.hours}
        minutes={timeLeft.minutes}
        seconds={timeLeft.seconds}
      />
    </div>
  )
}
