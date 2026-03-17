import { useState, useEffect, useRef } from 'react'
import { useT } from '../../../lib/i18n'
import { useFlipPanel } from './useFlipPanel'
import { pad } from './CountdownShared'

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

export default function CountdownFlipVariant({ days, hours, minutes, seconds, clockColor = 'dark' }) {
  const { t } = useT()
  const theme = CLOCK_THEMES[clockColor] || CLOCK_THEMES.dark
  const wrapRef  = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => {
      const w = el.offsetWidth
      if (w > 10) {
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
