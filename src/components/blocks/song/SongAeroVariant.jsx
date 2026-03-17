import { useRef, useState, useEffect } from 'react'
import { formatTime } from './useSongPlayer'

// Design-space dimensions — scaled to fit the container via ResizeObserver
const BASE_W = 320
const BASE_H = 172

export default function SongAeroVariant({ block, playing, ready, progress, togglePlay, handleSeek }) {
  const { title, artist } = block

  const wrapRef = useRef(null)
  const [sc, setSc] = useState(1)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => {
      const w = el.offsetWidth
      if (w > 10) setSc(w / BASE_W)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pct = progress.duration > 0 ? (progress.current / progress.duration) * 100 : 0

  return (
    <div ref={wrapRef} className="w-full select-none" style={{ position: 'relative', height: BASE_H * sc }}>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: BASE_W, height: BASE_H,
        transformOrigin: 'top left',
        transform: `scale(${sc})`,
      }}>

        {/* ── Outer white glossy shell ─────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '48% 52% 44% 56% / 54% 60% 42% 50%',
          background: 'linear-gradient(155deg, #ffffff 0%, #eef3f8 38%, #e0eaf4 65%, #cddbe8 100%)',
          boxShadow: [
            'inset 0 3px 10px rgba(255,255,255,0.95)',
            'inset 0 -3px 8px rgba(160,195,225,0.45)',
            'inset 0 0 0 1.5px rgba(255,255,255,0.8)',
            '0 14px 44px rgba(0,40,100,0.22)',
            '0 4px 12px rgba(0,20,60,0.14)',
            '0 1px 3px rgba(0,0,0,0.10)',
          ].join(', '),
        }}>
          {/* Shell top-left gloss streak */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
            background: 'linear-gradient(148deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.38) 18%, rgba(255,255,255,0.06) 36%, transparent 55%)',
          }} />

          {/* ── Inner aqua-blue panel ─────────────────────────────── */}
          <div style={{
            position: 'absolute', inset: 11,
            borderRadius: '43% 47% 38% 52% / 48% 54% 38% 48%',
            background: 'linear-gradient(138deg, #1ba8de 0%, #2cc0f0 22%, #0e96d0 48%, #0778b4 72%, #05538a 100%)',
            boxShadow: [
              'inset 0 4px 16px rgba(255,255,255,0.28)',
              'inset 0 0 0 1px rgba(255,255,255,0.16)',
              'inset 0 -5px 14px rgba(0,0,90,0.42)',
              '0 2px 8px rgba(0,30,80,0.45)',
            ].join(', '),
            overflow: 'hidden',
          }}>

            {/* Panel top gloss */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
              background: 'linear-gradient(140deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.13) 22%, rgba(255,255,255,0.03) 42%, transparent 58%)',
            }} />
            {/* Panel depth sheen at bottom */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 75% 45% at 42% 90%, rgba(0,100,180,0.38) 0%, transparent 100%)',
            }} />
            {/* Scan-line shimmer — barely visible, adds depth */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(255,255,255,0.018) 3px, rgba(255,255,255,0.018) 4px)',
            }} />

            {/* ── Left column: display + meta + progress + pill buttons ── */}
            <div style={{
              position: 'absolute',
              top: 18, left: 18, right: 82,
              display: 'flex', flexDirection: 'column', gap: 7,
            }}>

              {/* LCD display window */}
              <div style={{
                height: 26,
                borderRadius: 13,
                background: 'linear-gradient(180deg, #021520 0%, #031e2c 55%, #052638 100%)',
                boxShadow: [
                  'inset 0 2px 7px rgba(0,0,0,0.85)',
                  'inset 0 0 0 1px rgba(0,170,230,0.16)',
                  '0 1px 3px rgba(0,0,0,0.45)',
                ].join(', '),
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 10px',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Screen inner top glow */}
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'linear-gradient(to bottom, rgba(0,170,230,0.09) 0%, transparent 65%)',
                }} />
                <span style={{
                  fontSize: 7.5, letterSpacing: 0.4,
                  color: '#7dd8f8', fontFamily: '"Courier New", monospace',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  maxWidth: '62%', position: 'relative',
                }}>
                  {title ? title.toUpperCase() : 'NO TRACK'}
                </span>
                <span style={{
                  fontSize: 9, letterSpacing: 1.4,
                  color: '#aaeeff', fontFamily: '"Courier New", monospace', fontWeight: 'bold',
                  position: 'relative',
                }}>
                  {formatTime(progress.current)}
                </span>
              </div>

              {/* Artist subtitle */}
              {artist && (
                <span style={{
                  fontSize: 7, color: 'rgba(195,232,255,0.6)',
                  letterSpacing: 0.5, fontFamily: 'sans-serif',
                  marginTop: -3,
                }}>
                  {artist}
                </span>
              )}

              {/* Progress track */}
              {ready ? (
                <div
                  onClick={handleSeek}
                  onTouchEnd={handleSeek}
                  style={{ cursor: 'pointer', padding: '5px 0' }}
                  role="slider"
                  aria-valuenow={Math.round(progress.current)}
                  aria-valuemin={0}
                  aria-valuemax={Math.round(progress.duration)}
                >
                  <div style={{
                    height: 4, borderRadius: 2,
                    background: 'rgba(0,0,0,0.38)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.09)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #5de8ff, #22d0ff, #00b8f5)',
                      boxShadow: '0 0 7px rgba(0,210,255,0.7)',
                      transition: 'width 0.5s',
                    }} />
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: 7, color: 'rgba(150,220,255,0.55)', letterSpacing: 0.4 }}>
                  loading…
                </span>
              )}

              {/* Pill buttons row — decorative controls */}
              <div style={{ display: 'flex', gap: 5, marginTop: 1 }}>
                {['⏮', '⏹', '⏭'].map((icon, i) => (
                  <div key={i} style={{
                    height: 12, paddingLeft: 7, paddingRight: 7,
                    borderRadius: 7,
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.52) 0%, rgba(190,228,252,0.22) 100%)',
                    boxShadow: [
                      'inset 0 1px 2px rgba(255,255,255,0.65)',
                      'inset 0 -1px 1px rgba(0,0,0,0.12)',
                      '0 1px 3px rgba(0,0,0,0.32)',
                    ].join(', '),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 6, color: 'rgba(255,255,255,0.82)',
                  }}>
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right column: neon green play button ────────────── */}
            <div style={{
              position: 'absolute', right: 16, top: '50%',
              transform: 'translateY(-50%)',
            }}>
              {/* Outer glow ring */}
              <div style={{
                width: 58, height: 58, borderRadius: '50%',
                background: 'rgba(60,200,0,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 14px rgba(60,210,0,0.3)',
              }}>
                {/* Middle ring */}
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  background: 'rgba(70,220,0,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 2px rgba(100,240,0,0.35)',
                }}>
                  {/* Button */}
                  <button
                    onClick={togglePlay}
                    disabled={!ready}
                    style={{
                      width: 40, height: 40, borderRadius: '50%',
                      border: 'none', cursor: ready ? 'pointer' : 'default',
                      background: 'radial-gradient(circle at 38% 30%, #99ff66, #55e800 52%, #2fc200 80%)',
                      boxShadow: [
                        'inset 0 2px 7px rgba(255,255,255,0.55)',
                        'inset 0 -2px 6px rgba(0,80,0,0.38)',
                        '0 4px 14px rgba(50,200,0,0.6)',
                        '0 2px 5px rgba(0,0,0,0.4)',
                        '0 0 0 1px rgba(100,255,0,0.4)',
                      ].join(', '),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, color: 'rgba(0,55,0,0.72)',
                      position: 'relative',
                      transition: 'filter 0.12s',
                    }}
                    aria-label={playing ? 'Pause' : 'Play'}
                  >
                    {/* Button gloss highlight */}
                    <div style={{
                      position: 'absolute', top: 4, left: 7, right: 7, height: '38%',
                      borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.58), rgba(255,255,255,0.12))',
                      pointerEvents: 'none',
                    }} />
                    <span style={{ position: 'relative', marginLeft: playing ? 0 : 2 }}>
                      {playing ? '⏸' : '▶'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

          </div>{/* end inner panel */}
        </div>{/* end outer shell */}

      </div>
    </div>
  )
}
