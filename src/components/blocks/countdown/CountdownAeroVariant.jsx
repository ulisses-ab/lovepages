import { useState, useEffect, useRef } from 'react'
import { useT } from '../../../lib/i18n'
import { pad } from './CountdownShared'

const AERO_BASE_W = 340
const AERO_BASE_H = 152

export default function CountdownAeroVariant({ days, hours, minutes, seconds, label }) {
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
