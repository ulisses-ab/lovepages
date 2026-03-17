import { useRef, useState, useEffect } from 'react'
import { formatTime } from './useSongPlayer'

const BASE_W = 340
const BASE_H = 188

// ─── Aqua gloss cap ────────────────────────────────────────────────────────
// Applied to every element in Frutiger Aero to simulate a 3-D glass surface.
// The white half-ellipse on the upper portion is THE defining visual signature.
function GlossCap({ opacity = 0.65 }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
      borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
      background: `linear-gradient(to bottom, rgba(255,255,255,${opacity}), rgba(255,255,255,0.06))`,
      pointerEvents: 'none',
    }} />
  )
}

// ─── Bokeh bubble (water / nature motif) ───────────────────────────────────
function Bubble({ size, top, left, opacity = 0.13 }) {
  return (
    <div style={{
      position: 'absolute', top, left,
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,${opacity * 1.8}), rgba(255,255,255,${opacity * 0.4}) 55%, transparent)`,
      border: `1px solid rgba(255,255,255,${opacity})`,
      pointerEvents: 'none',
    }} />
  )
}

export default function SongAeroVariant({ block, playing, ready, progress, togglePlay, handleSeek }) {
  const { title, artist } = block

  const wrapRef = useRef(null)
  const [sc, setSc] = useState(1)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => { const w = el.offsetWidth; if (w > 10) setSc(w / BASE_W) }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pct = progress.duration > 0 ? (progress.current / progress.duration) * 100 : 0

  return (
    <div ref={wrapRef} className="w-full select-none" style={{ position: 'relative', height: BASE_H * sc }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: BASE_W, height: BASE_H,
        transformOrigin: 'top left', transform: `scale(${sc})`,
      }}>

        {/* ── OUTER SHELL: glossy white plastic, smooth pebble form ──────── */}
        <div style={{
          position: 'absolute', inset: 0,
          // Pebble silhouette: subtly uneven, like a polished river stone
          borderRadius: '52% 48% 44% 56% / 56% 54% 46% 44%',
          background: 'linear-gradient(158deg, #f8faff 0%, #eaf1f9 32%, #dae6f4 58%, #cad8ec 100%)',
          boxShadow: [
            '0 16px 48px rgba(0,40,110,0.26)',
            '0 5px 14px rgba(0,20,70,0.18)',
            '0 1px 3px rgba(0,0,0,0.10)',
            'inset 0 1.5px 0 rgba(255,255,255,1)',
            'inset 0 0 0 1px rgba(255,255,255,0.55)',
          ].join(', '),
        }}>

          {/* Outer shell: main gloss diagonal sweep */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
            background: 'linear-gradient(148deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.50) 20%, rgba(255,255,255,0.12) 38%, rgba(255,255,255,0.02) 55%, transparent 68%)',
          }} />
          {/* Bottom depth shadow inside shell */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
            background: 'linear-gradient(to bottom, transparent 55%, rgba(140,185,225,0.22) 100%)',
          }} />
          {/* Thin bright edge rim at top */}
          <div style={{
            position: 'absolute', top: 0, left: '8%', right: '8%', height: 2,
            borderRadius: '50%', pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.9) 70%, transparent)',
          }} />

          {/* ── INNER AQUA PANEL ─────────────────────────────────────────── */}
          <div style={{
            position: 'absolute', inset: '13px 12px 12px 13px',
            borderRadius: '45% 40% 36% 50% / 48% 50% 38% 42%',
            // Frutiger Aero aqua: deep at edges, bright sky-blue center-left
            background: 'linear-gradient(140deg, #0070be 0%, #0096d8 28%, #00b8f0 52%, #0098d8 72%, #0068b0 100%)',
            boxShadow: [
              'inset 0 4px 18px rgba(255,255,255,0.22)',
              'inset 0 0 0 1px rgba(255,255,255,0.14)',
              'inset 0 -6px 18px rgba(0,0,80,0.44)',
              '0 2px 8px rgba(0,30,90,0.5)',
            ].join(', '),
            overflow: 'hidden',
          }}>

            {/* Panel: water ripple rings (nature motif) — kept inside bounds */}
            <div style={{
              position: 'absolute', right: '28%', top: '12%',
              width: 60, height: 60, borderRadius: '50%', pointerEvents: 'none',
              boxShadow: [
                '0 0 0 1px rgba(255,255,255,0.10)',
                '0 0 0 10px rgba(255,255,255,0.06)',
                '0 0 0 22px rgba(255,255,255,0.035)',
                '0 0 0 36px rgba(255,255,255,0.02)',
              ].join(', '),
            }} />

            {/* Bokeh bubbles */}
            <Bubble size={28} top="58%" left="4%"  opacity={0.14} />
            <Bubble size={16} top="48%" left="18%" opacity={0.10} />
            <Bubble size={10} top="72%" left="12%" opacity={0.09} />

            {/* Panel: the iconic Frutiger Aero gloss sweep */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.16) 26%, rgba(255,255,255,0.04) 46%, transparent 62%)',
            }} />
            {/* Panel: Aqua gloss cap on upper portion */}
            <div style={{
              position: 'absolute', top: 0, left: '5%', right: '5%', height: '32%',
              borderRadius: '0 0 50% 50% / 0 0 100% 100%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.28), rgba(255,255,255,0.03))',
              pointerEvents: 'none',
            }} />

            {/* ── LEFT COLUMN: display · progress · buttons ──────────── */}
            <div style={{
              position: 'absolute', top: 17, left: 17, right: 85,
              display: 'flex', flexDirection: 'column', gap: 7,
            }}>

              {/* LCD display — dark recessed oval window */}
              <div style={{
                height: 28, borderRadius: 14,
                background: 'linear-gradient(175deg, #010e1a 0%, #021624 55%, #031e30 100%)',
                boxShadow: [
                  'inset 0 3px 9px rgba(0,0,0,0.92)',
                  'inset 0 0 0 1px rgba(0,160,230,0.13)',
                  '0 0 0 0.5px rgba(0,100,180,0.22)',
                  '0 1px 3px rgba(0,0,0,0.55)',
                ].join(', '),
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 10px',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Screen: inner blue glow from top edge */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
                  background: 'linear-gradient(to bottom, rgba(0,170,240,0.08), transparent)',
                  pointerEvents: 'none',
                }} />
                {/* Screen: glass glare streak */}
                <div style={{
                  position: 'absolute', top: 3, left: '18%', width: '28%', height: 1.5,
                  borderRadius: 1, pointerEvents: 'none',
                  background: 'rgba(255,255,255,0.14)',
                }} />
                {/* Track title */}
                <span style={{
                  fontSize: 7.5, letterSpacing: 0.5,
                  color: '#62d0f2', fontFamily: '"Courier New", monospace',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  maxWidth: '60%', position: 'relative',
                }}>
                  {title ? title.toUpperCase() : 'NO TRACK'}
                </span>
                {/* Time */}
                <span style={{
                  fontSize: 9.5, letterSpacing: 1.5,
                  color: '#a0e8ff', fontFamily: '"Courier New", monospace', fontWeight: 'bold',
                  position: 'relative',
                }}>
                  {formatTime(progress.current)}
                </span>
              </div>

              {/* Artist */}
              {artist && (
                <span style={{
                  fontSize: 7, letterSpacing: 0.4,
                  color: 'rgba(185,232,255,0.58)',
                  fontFamily: 'sans-serif', marginTop: -3,
                }}>
                  {artist}
                </span>
              )}

              {/* Progress groove — always visible; fill appears when playing */}
              <div
                onClick={ready ? handleSeek : undefined}
                onTouchEnd={ready ? handleSeek : undefined}
                style={{ cursor: ready ? 'pointer' : 'default', padding: '5px 0' }}
                role="slider"
                aria-valuenow={Math.round(progress.current)}
                aria-valuemin={0}
                aria-valuemax={Math.round(progress.duration)}
              >
                <div style={{
                  height: 6, borderRadius: 3,
                  background: 'linear-gradient(to bottom, #010e1a, #021828)',
                  boxShadow: [
                    'inset 0 2px 5px rgba(0,0,0,0.85)',
                    'inset 0 0 0 0.5px rgba(0,130,210,0.35)',
                    '0 1px 0 rgba(255,255,255,0.10)',
                  ].join(', '),
                  overflow: 'hidden',
                }}>
                  {pct > 0 && (
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #00c8f0, #3ae0ff, #7af2ff)',
                      boxShadow: '0 0 10px rgba(0,215,255,0.85)',
                      transition: 'width 0.5s',
                    }} />
                  )}
                </div>
              </div>
              {!ready && (
                <span style={{ fontSize: 7, color: 'rgba(140,215,255,0.48)', marginTop: -4 }}>loading…</span>
              )}

              {/* Pill control buttons — each with Aqua gloss cap */}
              <div style={{ display: 'flex', gap: 5 }}>
                {['⏮', '⏹', '⏭'].map((icon, i) => (
                  <div key={i} style={{
                    height: 16, paddingLeft: 9, paddingRight: 9, borderRadius: 8,
                    background: 'linear-gradient(175deg, rgba(255,255,255,0.32) 0%, rgba(160,220,255,0.15) 55%, rgba(100,180,245,0.10) 100%)',
                    boxShadow: [
                      'inset 0 1px 2px rgba(255,255,255,0.62)',
                      'inset 0 -1px 1.5px rgba(0,0,0,0.20)',
                      '0 1px 4px rgba(0,0,0,0.35)',
                      '0 0 0 0.5px rgba(255,255,255,0.26)',
                    ].join(', '),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 7.5, color: 'rgba(255,255,255,0.88)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* Aqua gloss cap on each pill */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0.04))',
                      pointerEvents: 'none',
                    }} />
                    <span style={{ position: 'relative' }}>{icon}</span>
                  </div>
                ))}
              </div>

            </div>{/* end left column */}

            {/* ── RIGHT: neon green Aqua play button ─────────────────── */}
            <div style={{
              position: 'absolute', right: 16, top: '50%',
              transform: 'translateY(-50%)',
            }}>
              <button
                onClick={togglePlay}
                disabled={!ready}
                style={{
                  width: 52, height: 52, borderRadius: '50%',
                  border: 'none', cursor: ready ? 'pointer' : 'default',
                  // Radial gradient: bright lime centre → deep forest green edge
                  background: 'radial-gradient(circle at 42% 32%, #d4ff88 0%, #88ee00 32%, #44cc00 60%, #228800 82%, #155500 100%)',
                  boxShadow: [
                    // Stacked rings — the Frutiger Aero neon halo
                    '0 0 0 3px rgba(110,235,0,0.58)',
                    '0 0 0 7px rgba(88,215,0,0.28)',
                    '0 0 0 12px rgba(66,195,0,0.12)',
                    '0 0 22px rgba(80,220,0,0.50)',
                    // Physical shading
                    'inset 0 3px 8px rgba(255,255,255,0.52)',
                    'inset 0 -3px 8px rgba(0,60,0,0.42)',
                    '0 6px 18px rgba(40,180,0,0.65)',
                    '0 2px 5px rgba(0,0,0,0.42)',
                  ].join(', '),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: 'rgba(0,55,0,0.75)',
                  position: 'relative', overflow: 'hidden',
                  transition: 'filter 0.12s',
                }}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {/* Aqua gloss cap — upper half white highlight */}
                <GlossCap opacity={0.60} />
                <span style={{ position: 'relative', marginLeft: playing ? 0 : 2 }}>
                  {playing ? '⏸' : '▶'}
                </span>
              </button>
            </div>

          </div>{/* end inner panel */}
        </div>{/* end outer shell */}

      </div>
    </div>
  )
}
