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

// ── Post-it label ─────────────────────────────────────────────────────────────
function LabelTag({ text }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
      <div style={{
        position: 'relative',
        display: 'inline-block',
        transform: 'rotate(-2deg)',
      }}>
        {/* Post-it body */}
        <div style={{
          position: 'relative',
          padding: '14px 22px 13px',
          background: 'linear-gradient(175deg, #fef08a 0%, #fde047 60%, #facc15 100%)',
          boxShadow: [
            '0 4px 18px rgba(0,0,0,0.55)',
            '0 1px 4px rgba(0,0,0,0.3)',
            '4px 5px 0 rgba(0,0,0,0.1)',
          ].join(', '),
          minWidth: 52,
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 28,
            fontWeight: 700,
            color: '#1c1400',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            position: 'relative',
          }}>
            {text}
          </span>
        </div>

        {/* Clear tape strip */}
        <div style={{
          position: 'absolute',
          top: -11, left: '50%', transform: 'translateX(-50%)',
          width: 60, height: 22,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}>
          {/* Top edge — brightest part, where tape catches light */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1.5,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.75) 20%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.75) 80%, transparent)',
          }} />
          {/* Tape body — nearly invisible warm film */}
          <div style={{
            position: 'absolute', top: 1.5, left: 0, right: 0, bottom: 1.5,
            background: 'rgba(248,242,218,0.13)',
          }} />
          {/* Diagonal glint across the body */}
          <div style={{
            position: 'absolute', top: 2, left: '-10%', right: '-10%', bottom: 2,
            background: 'linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0.32) 52%, transparent 70%)',
          }} />
          {/* Bottom edge — dimmer than top */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(210,200,170,0.5) 20%, rgba(210,200,170,0.6) 50%, rgba(210,200,170,0.5) 80%, transparent)',
          }} />
        </div>
      </div>
    </div>
  )
}

// ── Clock themes ──────────────────────────────────────────────────────────────
const CLOCK_THEMES = {
  dark: {
    housing: 'linear-gradient(168deg, #282828 0%, #181818 45%, #212121 75%, #111 100%)',
    housingTexture: [
      'repeating-linear-gradient(180deg, transparent 0px, transparent 2px, rgba(255,255,255,0.013) 2px, rgba(255,255,255,0.013) 3px)',
      'repeating-linear-gradient(180deg, transparent 0px, transparent 9px, rgba(0,0,0,0.05) 9px, rgba(0,0,0,0.05) 10px)',
      'repeating-linear-gradient(90deg, transparent 0px, transparent 14px, rgba(255,255,255,0.008) 14px, rgba(255,255,255,0.008) 15px)',
    ].join(','),
    housingTopGlow: 'linear-gradient(to bottom, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.01) 60%, transparent 100%)',
    housingBotShadow: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 100%)',
    housingBoxShadow: '0 18px 60px rgba(0,0,0,0.75), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 0 0 1px rgba(255,255,255,0.04)',
    panelTop: 'linear-gradient(to bottom, #1e1e1e 0%, #161616 100%)',
    panelBot: 'linear-gradient(to bottom, #131313 0%, #1a1a1a 100%)',
    panelBoxShadow: '0 8px 28px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.055), 0 0 0 1px rgba(0,0,0,0.9)',
    numColor: '#ddd7c8',
    divider: 'rgba(0,0,0,0.95)',
    dividerGlow: '0 1px 4px rgba(0,0,0,0.9), 0 -1px 2px rgba(0,0,0,0.5)',
    panelInnerGlow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
    colonDot: 'rgba(255,255,255,0.22)',
    colonGlow: '0 0 4px rgba(255,255,255,0.08)',
    unitLabel: 'rgba(255,255,255,0.22)',
    feet: 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)',
    feetShadow: '0 3px 6px rgba(0,0,0,0.7)',
  },
  beige: {
    housing: 'linear-gradient(168deg, #ede4d0 0%, #ddd3b8 45%, #e4dac4 75%, #cfc4a8 100%)',
    housingTexture: [
      'repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(160,130,80,0.04) 3px, rgba(160,130,80,0.04) 4px)',
      'repeating-linear-gradient(90deg, transparent 0px, transparent 11px, rgba(0,0,0,0.03) 11px, rgba(0,0,0,0.03) 12px)',
      'repeating-linear-gradient(180deg, transparent 0px, transparent 6px, rgba(255,255,255,0.06) 6px, rgba(255,255,255,0.06) 7px)',
    ].join(','),
    housingTopGlow: 'linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 60%, transparent 100%)',
    housingBotShadow: 'linear-gradient(to top, rgba(0,0,0,0.1) 0%, transparent 100%)',
    housingBoxShadow: '0 18px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 0 0 1px rgba(0,0,0,0.06)',
    panelTop: 'linear-gradient(to bottom, #f5ede0 0%, #ece3d0 100%)',
    panelBot: 'linear-gradient(to bottom, #e4dac8 0%, #eee5d4 100%)',
    panelBoxShadow: '0 4px 14px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.08)',
    numColor: '#2a1f0e',
    divider: 'rgba(0,0,0,0.12)',
    dividerGlow: '0 1px 2px rgba(0,0,0,0.08)',
    panelInnerGlow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
    colonDot: 'rgba(100,80,40,0.38)',
    colonGlow: 'none',
    unitLabel: 'rgba(100,80,40,0.45)',
    feet: 'linear-gradient(to bottom, #9a8060, #7a6040)',
    feetShadow: '0 3px 6px rgba(0,0,0,0.2)',
  },
}

// ── Housing texture ────────────────────────────────────────────────────────────
function HousingTexture({ theme }) {
  return (
    <>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 14, pointerEvents: 'none',
        backgroundImage: theme.housingTexture,
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
        borderRadius: '14px 14px 0 0', pointerEvents: 'none',
        background: theme.housingTopGlow,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%',
        borderRadius: '0 0 14px 14px', pointerEvents: 'none',
        background: theme.housingBotShadow,
      }} />
    </>
  )
}

// ── Single flip panel (one time unit) ─────────────────────────────────────────
const PANEL_W = 58
const PANEL_H = 70
const HALF    = 35

function FlipPanel({ value, theme }) {
  const { topVal, botVal, phase, prevTop, nextBot } = useFlipPanel(value)

  const numStyle = {
    position: 'absolute', left: 0, right: 0, top: 0, height: PANEL_H,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: 38, fontWeight: '700',
    color: theme.numColor,
    letterSpacing: 2,
    textShadow: theme === CLOCK_THEMES.dark ? '0 1px 8px rgba(0,0,0,0.6)' : 'none',
    userSelect: 'none',
  }

  const topHalf = (val, extra = {}) => (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: HALF,
      overflow: 'hidden',
      borderRadius: '5px 5px 0 0',
      background: theme.panelTop,
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
      background: theme.panelBot,
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
      boxShadow: theme.panelBoxShadow,
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
            background: theme.panelTop,
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
            background: theme.panelBot,
            backfaceVisibility: 'hidden',
          }}>
            <div style={{ ...numStyle, top: -HALF }}>{pad(nextBot)}</div>
          </div>
        </div>
      )}

      {/* Centre divider crease */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: HALF - 1, height: 2,
        background: theme.divider, zIndex: 5,
        boxShadow: theme.dividerGlow,
      }} />

      {/* Panel inner edge */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 6, pointerEvents: 'none', zIndex: 6,
        boxShadow: theme.panelInnerGlow,
      }} />
    </div>
  )
}

// ── Colon separator ────────────────────────────────────────────────────────────
function ColonSep({ theme }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 10,
      width: 14, height: PANEL_H, flexShrink: 0,
      paddingBottom: 16,
    }}>
      {[0, 1].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: theme.colonDot,
          boxShadow: theme.colonGlow,
        }} />
      ))}
    </div>
  )
}

// ── Full flip clock ────────────────────────────────────────────────────────────
const CLOCK_BASE_W = 310
const CLOCK_BASE_H = 122

function FlipClock({ days, hours, minutes, seconds, clockColor = 'dark' }) {
  const { t } = useT()
  const theme = CLOCK_THEMES[clockColor] || CLOCK_THEMES.dark
  const wrapRef  = useRef(null)
  const [scale, setScale] = useState(1)
  const [containerW, setContainerW] = useState(CLOCK_BASE_W)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => {
      const w = el.offsetWidth
      if (w > 10) {
        setContainerW(w)
        const raw = w < 500
          ? (w / CLOCK_BASE_W) * 1.4
          : (w / CLOCK_BASE_W) * 0.9
        setScale(Math.min(raw, (w * 0.9) / CLOCK_BASE_W))
      }
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
            background: theme.housing,
            borderRadius: 12,
            padding: '14px 18px 12px',
            boxShadow: theme.housingBoxShadow,
          }}>
            <HousingTexture theme={theme} />

            {/* Rubber feet */}
            {[{ left: 12, bottom: 6 }, { right: 12, bottom: 6 }, { left: 40, bottom: 6 }, { right: 40, bottom: 6 }].map((pos, i) => (
              <div key={i} style={{
                position: 'absolute', ...pos,
                width: 14, height: 7, borderRadius: '0 0 3px 3px',
                background: theme.feet,
                boxShadow: theme.feetShadow,
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
                    <FlipPanel value={value} theme={theme} />
                    <div style={{
                      fontSize: 8, letterSpacing: 2.5,
                      color: theme.unitLabel,
                      fontFamily: 'monospace', textTransform: 'uppercase',
                    }}>
                      {label}
                    </div>
                  </div>
                  {i < units.length - 1 && <ColonSep theme={theme} />}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Minimal variant ────────────────────────────────────────────────────────────
function MinimalCountdown({ days, hours, minutes, seconds, label }) {
  const { t } = useT()
  const units = [
    { value: days,    label: t('countdown.days') },
    { value: hours,   label: t('countdown.hours') },
    { value: minutes, label: t('countdown.minutes') },
    { value: seconds, label: t('countdown.seconds') },
  ]

  return (
    <div className="w-full py-2 text-center">
      {label && (
        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: colors.fgMuted,
          marginBottom: 20,
        }}>
          {label}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0 }}>
        {units.map(({ value, label: unitLabel }, i) => (
          <div key={unitLabel} style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56 }}>
              <span style={{
                fontFamily: 'Georgia, serif',
                fontSize: 48,
                fontWeight: 400,
                lineHeight: 1,
                color: colors.fg,
                letterSpacing: '-0.02em',
              }}>
                {pad(value)}
              </span>
              <div style={{
                width: 24, height: 1,
                background: colors.fgMuted,
                opacity: 0.3,
                margin: '8px auto 6px',
              }} />
              <span style={{
                fontFamily: 'Georgia, serif',
                fontSize: 9,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: colors.fgMuted,
              }}>
                {unitLabel}
              </span>
            </div>
            {i < units.length - 1 && (
              <span style={{
                fontFamily: 'Georgia, serif',
                fontSize: 36,
                fontWeight: 300,
                color: colors.fgMuted,
                opacity: 0.35,
                lineHeight: 1,
                padding: '0 2px',
                marginTop: 4,
              }}>·</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Aero variant ──────────────────────────────────────────────────────────────
const AERO_BASE_W = 340
const AERO_BASE_H = 152

function AeroCountdown({ days, hours, minutes, seconds, label }) {
  const { t } = useT()
  const wrapRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => {
      const w = el.offsetWidth
      if (w > 10) {
        const raw = w < 500
          ? (w / AERO_BASE_W) * 1.35
          : (w / AERO_BASE_W) * 0.88
        setScale(Math.min(raw, (w * 0.92) / AERO_BASE_W))
      }
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const secProgress = (seconds / 59) * 100

  return (
    <div className="w-full" ref={wrapRef}>
      <div style={{ position: 'relative', height: Math.round(AERO_BASE_H * scale) }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%',
          marginLeft: -(AERO_BASE_W / 2),
          width: AERO_BASE_W,
          transformOrigin: 'top center',
          transform: `scale(${scale})`,
        }}>
          {/* Outer housing — glossy sky-blue pill */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(160deg, #ddf1ff 0%, #b2dcf5 35%, #7ec5ee 65%, #9ed4f2 100%)',
            borderRadius: 38,
            padding: '14px 18px 16px',
            boxShadow: [
              '0 18px 55px rgba(0,80,170,0.28)',
              '0 5px 18px rgba(0,100,200,0.18)',
              'inset 0 2px 0 rgba(255,255,255,0.85)',
              'inset 0 0 0 1.5px rgba(255,255,255,0.5)',
              'inset 0 -3px 8px rgba(0,60,130,0.18)',
            ].join(', '),
            overflow: 'hidden',
          }}>
            {/* Top specular highlight */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '48%',
              borderRadius: '38px 38px 55% 55%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.15) 55%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            {/* Left edge reflection */}
            <div style={{
              position: 'absolute', top: '8%', left: 0, width: '8%', bottom: '12%',
              borderRadius: '38px 0 0 38px',
              background: 'linear-gradient(to right, rgba(255,255,255,0.38) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            {/* Right edge shadow */}
            <div style={{
              position: 'absolute', top: '8%', right: 0, width: '6%', bottom: '12%',
              borderRadius: '0 38px 38px 0',
              background: 'linear-gradient(to left, rgba(0,60,120,0.1) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />

            {/* Inner blue display capsule */}
            <div style={{
              position: 'relative',
              background: 'radial-gradient(ellipse at 50% 35%, #1560c8 0%, #0c3a88 40%, #07235a 80%, #051840 100%)',
              borderRadius: 22,
              padding: '8px 16px 10px',
              boxShadow: [
                'inset 0 3px 10px rgba(0,0,0,0.55)',
                'inset 0 0 40px rgba(0,10,60,0.4)',
                '0 2px 10px rgba(0,20,100,0.5)',
                '0 0 0 1.5px rgba(255,255,255,0.18)',
              ].join(', '),
              overflow: 'hidden',
            }}>
              {/* Display gloss highlight */}
              <div style={{
                position: 'absolute', top: 0, left: '8%', right: '8%', height: '38%',
                borderRadius: '22px 22px 50% 50%',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.22) 0%, transparent 100%)',
                pointerEvents: 'none',
              }} />

              {/* Status row: micro icons + label */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                marginBottom: 5, position: 'relative', zIndex: 1,
              }}>
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none" style={{ opacity: 0.5 }}>
                  <rect x="0" y="3" width="2.5" height="6" rx="1" fill="white"/>
                  <rect x="3.5" y="1.5" width="2.5" height="7.5" rx="1" fill="white"/>
                  <rect x="7" y="0" width="2.5" height="9" rx="1" fill="white"/>
                </svg>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(180,220,255,0.75)',
                }}>
                  {label || 'COUNTDOWN'}
                </span>
                <svg width="14" height="4" viewBox="0 0 14 4" fill="none" style={{ opacity: 0.5 }}>
                  <circle cx="2" cy="2" r="1.8" fill="white"/>
                  <circle cx="7" cy="2" r="1.8" fill="white"/>
                  <circle cx="12" cy="2" r="1.8" fill="white"/>
                </svg>
              </div>

              {/* Timer digits */}
              <div style={{
                textAlign: 'center',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 34,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.05em',
                lineHeight: 1,
                textShadow: '0 0 18px rgba(100,190,255,0.65), 0 2px 5px rgba(0,0,0,0.6)',
                position: 'relative', zIndex: 1,
              }}>
                {pad(days)}:{pad(hours)}:{pad(minutes)}:{pad(seconds)}
              </div>

              {/* Unit labels */}
              <div style={{
                display: 'flex', justifyContent: 'center',
                marginTop: 4, position: 'relative', zIndex: 1,
              }}>
                {[
                  t('countdown.days'),
                  t('countdown.hours'),
                  t('countdown.minutes'),
                  t('countdown.seconds'),
                ].map((lbl, i) => (
                  <span key={i} style={{
                    display: 'inline-block',
                    width: 58,
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontSize: 8,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(140,200,255,0.7)',
                  }}>
                    {lbl}
                  </span>
                ))}
              </div>
            </div>

            {/* Lime-green progress bar */}
            <div style={{
              marginTop: 10,
              position: 'relative',
              height: 9,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.38)',
              boxShadow: 'inset 0 1px 3px rgba(0,50,120,0.18)',
            }}>
              <div style={{
                position: 'absolute',
                left: 0, top: 0, bottom: 0,
                width: `${Math.max(secProgress, 2)}%`,
                background: 'linear-gradient(to right, #54e83a, #a8ff5a)',
                borderRadius: 8,
                boxShadow: '0 0 10px rgba(100,255,60,0.6), 0 0 4px rgba(100,255,60,0.4)',
                transition: 'width 0.9s linear',
              }} />
              <div style={{
                position: 'absolute',
                top: '50%', transform: 'translate(-50%, -50%)',
                left: `${Math.max(secProgress, 2)}%`,
                width: 13, height: 13,
                borderRadius: '50%',
                background: 'linear-gradient(145deg, #d4ffb0, #7af040)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.28), 0 0 8px rgba(100,255,60,0.55)',
                transition: 'left 0.9s linear',
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Public component ──────────────────────────────────────────────────────────
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

  if (variant === 'minimal') {
    return (
      <div ref={rootRef} className="py-2">
        <MinimalCountdown
          days={timeLeft.days}
          hours={timeLeft.hours}
          minutes={timeLeft.minutes}
          seconds={timeLeft.seconds}
          label={label}
        />
      </div>
    )
  }

  if (variant === 'aero') {
    return (
      <div ref={rootRef} className="py-2">
        <AeroCountdown
          days={timeLeft.days}
          hours={timeLeft.hours}
          minutes={timeLeft.minutes}
          seconds={timeLeft.seconds}
          label={label}
        />
      </div>
    )
  }

  return (
    <div ref={rootRef} className="py-2">
      {label && <LabelTag text={label} />}
      <FlipClock
        days={timeLeft.days}
        hours={timeLeft.hours}
        minutes={timeLeft.minutes}
        seconds={timeLeft.seconds}
        clockColor={clockColor}
      />
    </div>
  )
}
