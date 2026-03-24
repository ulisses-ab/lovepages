import { useRef, useState, useEffect } from 'react'
import { formatTime } from './useSongPlayer'

const BASE_W = 380
const BASE_H = 200

// ─── SVG icons ───────────────────────────────────────────────────────────────
function IconPlay({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: 'block' }}>
      <path d="M4.5 2L13 8L4.5 14V2Z" fill="currentColor" />
    </svg>
  )
}
function IconPause({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: 'block' }}>
      <rect x="3" y="2" width="3.5" height="12" rx="1.2" fill="currentColor" />
      <rect x="9.5" y="2" width="3.5" height="12" rx="1.2" fill="currentColor" />
    </svg>
  )
}
function IconPrev({ size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" style={{ display: 'block' }}>
      <path d="M8 1.5L3 5L8 8.5V1.5Z" fill="currentColor" />
      <rect x="1" y="1.5" width="1.8" height="7" rx="0.8" fill="currentColor" />
    </svg>
  )
}
function IconNext({ size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" style={{ display: 'block' }}>
      <path d="M2 1.5L7 5L2 8.5V1.5Z" fill="currentColor" />
      <rect x="7.2" y="1.5" width="1.8" height="7" rx="0.8" fill="currentColor" />
    </svg>
  )
}

export default function SongBubbleVariant({ block, playing, ready, progress, togglePlay, handleSeek }) {
  const { title, artist, coverUrl } = block

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
  const DISC_SIZE = 148
  const EQ = [4, 8, 12, 6, 10, 3, 9, 13, 5, 7, 11, 4, 8, 6, 12]

  return (
    <div ref={wrapRef} className="w-full select-none" style={{ position: 'relative', height: BASE_H * sc }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: BASE_W, height: BASE_H,
        transformOrigin: 'top left', transform: `scale(${sc})`,
      }}>

        {/* ═══════════════════════════════════════════════════════════════════════
            AMBIENT GLOW — colored halo behind the whole player
        ═══════════════════════════════════════════════════════════════════════ */}
        <div style={{
          position: 'absolute', inset: -16,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(80,180,255,0.12) 0%, rgba(60,160,240,0.06) 40%, transparent 70%)',
          filter: 'blur(16px)',
          pointerEvents: 'none',
        }} />

        {/* ═══════════════════════════════════════════════════════════════════════
            MAIN BODY — wide capsule / stadium shape
            Frosted translucent sky-blue with layered glass effects
        ═══════════════════════════════════════════════════════════════════════ */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: BASE_H / 2,
          background: 'linear-gradient(170deg, rgba(190,225,255,0.6) 0%, rgba(140,200,248,0.5) 20%, rgba(90,175,240,0.45) 45%, rgba(55,150,228,0.42) 65%, rgba(30,125,210,0.4) 85%, rgba(15,100,190,0.38) 100%)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
          boxShadow: [
            '0 20px 60px rgba(0,60,140,0.22)',
            '0 8px 24px rgba(0,50,120,0.16)',
            '0 2px 8px rgba(0,40,100,0.1)',
            'inset 0 1.5px 0 rgba(255,255,255,0.75)',
            'inset 0 -1px 0 rgba(0,40,100,0.1)',
            '0 0 0 1px rgba(255,255,255,0.28)',
          ].join(', '),
          overflow: 'hidden',
        }}>

          {/* Body — top highlight sweep */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
            background: 'linear-gradient(168deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.25) 14%, rgba(255,255,255,0.06) 28%, transparent 42%)',
          }} />

          {/* Body — specular edge */}
          <div style={{
            position: 'absolute', top: 2, left: '10%', right: '10%', height: 2,
            borderRadius: '50%', pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.75) 25%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.75) 75%, transparent 95%)',
            filter: 'blur(0.8px)',
          }} />

          {/* Body — bottom reflection */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '32%',
            borderRadius: 'inherit', pointerEvents: 'none',
            background: 'linear-gradient(to bottom, transparent, rgba(0,30,80,0.12))',
          }} />


          {/* ═══════════════════════════════════════════════════════════════════
              LEFT — SPINNING DISC / COVER ART CIRCLE
              The signature element: a large recessed circle that rotates
          ═══════════════════════════════════════════════════════════════════ */}
          <div style={{
            position: 'absolute',
            left: (BASE_H - DISC_SIZE) / 2 + 2,
            top: (BASE_H - DISC_SIZE) / 2,
            width: DISC_SIZE, height: DISC_SIZE,
          }}>
            {/* Recessed well the disc sits in */}
            <div style={{
              position: 'absolute', inset: -4,
              borderRadius: '50%',
              background: 'linear-gradient(to bottom, rgba(0,30,70,0.2), rgba(0,20,50,0.1))',
              boxShadow: [
                'inset 0 3px 10px rgba(0,0,0,0.2)',
                'inset 0 0 0 1px rgba(0,40,90,0.12)',
                '0 1px 0 rgba(255,255,255,0.2)',
              ].join(', '),
            }} />

            {/* The disc itself — rotates when playing */}
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              overflow: 'hidden',
              animation: playing ? 'aero-disc-spin 4s linear infinite' : 'none',
              boxShadow: [
                '0 4px 16px rgba(0,0,0,0.25)',
                '0 0 0 1px rgba(255,255,255,0.15)',
                'inset 0 0 0 1px rgba(0,0,0,0.15)',
              ].join(', '),
            }}>
              {/* Disc background — silver/chrome gradient */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'conic-gradient(from 0deg, #e8eef4, #c8d4e0, #dde6ee, #b8c8d8, #e0e8f0, #c0d0dc, #d8e2ec, #b0c4d4, #e8eef4)',
              }} />

              {/* Track grooves — concentric rings */}
              {[22, 30, 38, 46, 54, 62].map((r, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: `${50 - r / 2}%`, left: `${50 - r / 2}%`,
                  width: `${r}%`, height: `${r}%`,
                  borderRadius: '50%',
                  border: '0.5px solid rgba(0,0,0,0.06)',
                  pointerEvents: 'none',
                }} />
              ))}

              {/* Rainbow iridescence — CD refraction effect */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
                background: 'conic-gradient(from 120deg, rgba(255,100,100,0.08), rgba(255,200,50,0.08), rgba(100,255,100,0.08), rgba(50,200,255,0.1), rgba(150,100,255,0.08), rgba(255,100,200,0.08), rgba(255,100,100,0.08))',
                mixBlendMode: 'overlay',
              }} />

              {/* Cover art in the center label area */}
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '52%', height: '52%',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: [
                  '0 0 0 2px rgba(255,255,255,0.3)',
                  '0 0 0 3.5px rgba(180,200,220,0.5)',
                  'inset 0 0 8px rgba(0,0,0,0.15)',
                ].join(', '),
              }}>
                {coverUrl
                  ? <img src={coverUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{
                      width: '100%', height: '100%',
                      background: 'radial-gradient(circle, rgba(200,220,240,0.7) 0%, rgba(150,190,230,0.6) 50%, rgba(100,160,210,0.5) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="28" height="28" viewBox="0 0 44 44" fill="none" style={{ opacity: 0.35 }}>
                        <path d="M30 8v20a6 6 0 1 1-2-4.5V14l-12 3v15a6 6 0 1 1-2-4.5V10l16-4v2z" fill="rgba(40,80,140,0.5)" />
                      </svg>
                    </div>
                }
              </div>

              {/* Center spindle hole */}
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 8, height: 8,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 38% 32%, #f0f0f0, #b8b8b8 50%, #888 100%)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.2)',
                zIndex: 2,
              }} />

              {/* Disc gloss overlay */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 20%, transparent 40%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.12) 100%)',
              }} />
            </div>
          </div>


          {/* ═══════════════════════════════════════════════════════════════════
              RIGHT AREA — info + controls, vertically centered
          ═══════════════════════════════════════════════════════════════════ */}
          <div style={{
            position: 'absolute',
            left: DISC_SIZE + 16, right: 22, top: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            gap: 8,
          }}>

            {/* ── Track info — title & artist ── */}
            <div>
              <div style={{
                fontSize: 13, fontWeight: 700, letterSpacing: 0.2,
                color: 'rgba(255,255,255,0.92)',
                fontFamily: '"Segoe UI", system-ui, sans-serif',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                textShadow: '0 1px 4px rgba(0,40,100,0.35), 0 0 12px rgba(80,180,255,0.15)',
                lineHeight: 1.3,
              }}>
                {title || 'Untitled'}
              </div>
              <div style={{
                fontSize: 10, fontWeight: 500, letterSpacing: 0.1,
                color: 'rgba(255,255,255,0.55)',
                fontFamily: '"Segoe UI", system-ui, sans-serif',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                textShadow: '0 1px 3px rgba(0,30,80,0.25)',
                marginTop: 1,
              }}>
                {artist || '\u00a0'}
              </div>
            </div>

            {/* ── Progress bar — translucent pill ── */}
            <div>
              <div
                onClick={ready ? handleSeek : undefined}
                onTouchEnd={ready ? handleSeek : undefined}
                style={{ cursor: ready ? 'pointer' : 'default', padding: '2px 0', position: 'relative' }}
                role="slider"
                aria-valuenow={Math.round(progress.current)}
                aria-valuemin={0}
                aria-valuemax={Math.round(progress.duration)}
              >
                <div style={{
                  height: 5, borderRadius: 3,
                  background: 'rgba(0,30,70,0.3)',
                  boxShadow: [
                    'inset 0 1.5px 4px rgba(0,0,0,0.4)',
                    '0 0.5px 0 rgba(255,255,255,0.12)',
                  ].join(', '),
                  position: 'relative',
                  overflow: 'visible',
                }}>
                  {/* Fill */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${pct}%`,
                    borderRadius: pct >= 99 ? 3 : '3px 0 0 3px',
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.75), rgba(200,230,255,0.55))',
                    boxShadow: '0 0 6px rgba(200,230,255,0.4)',
                    transition: 'width 0.5s linear',
                  }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)',
                    }} />
                  </div>

                  {/* Knob — frosted glass dot */}
                  {pct > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '50%', transform: 'translate(-50%, -50%)',
                      left: `${Math.min(pct, 97)}%`,
                      width: 11, height: 11, borderRadius: '50%',
                      background: 'radial-gradient(circle at 38% 30%, rgba(255,255,255,0.95), rgba(220,235,250,0.8) 40%, rgba(180,210,240,0.7) 100%)',
                      boxShadow: [
                        '0 2px 5px rgba(0,30,80,0.35)',
                        '0 0 5px rgba(200,230,255,0.4)',
                        'inset 0 1px 0 rgba(255,255,255,0.9)',
                      ].join(', '),
                      zIndex: 2,
                      transition: 'left 0.5s linear',
                    }} />
                  )}
                </div>
              </div>

              {/* Time labels */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: 2,
              }}>
                <span style={{
                  fontSize: 8, letterSpacing: 0.5, fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: '"Courier New", monospace',
                }}>
                  {formatTime(progress.current)}
                </span>
                <span style={{
                  fontSize: 8, letterSpacing: 0.5, fontWeight: 600,
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: '"Courier New", monospace',
                }}>
                  {progress.duration > 0 ? formatTime(progress.duration) : '--:--'}
                </span>
              </div>
            </div>

            {/* ── Transport controls — frosted glass bubbles ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              justifyContent: 'center',
            }}>
              {/* Prev */}
              <button
                onClick={() => {}}
                disabled={!ready}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: 'none',
                  cursor: ready ? 'pointer' : 'default',
                  background: 'linear-gradient(175deg, rgba(255,255,255,0.5) 0%, rgba(200,225,248,0.35) 50%, rgba(160,200,240,0.25) 100%)',
                  boxShadow: [
                    'inset 0 1px 2px rgba(255,255,255,0.6)',
                    'inset 0 -1px 2px rgba(0,30,70,0.1)',
                    '0 2px 6px rgba(0,30,80,0.25)',
                    '0 0 0 0.5px rgba(255,255,255,0.2)',
                  ].join(', '),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.7)',
                  opacity: ready ? 1 : 0.35,
                  transition: 'opacity 0.15s',
                  position: 'relative', overflow: 'hidden',
                }}
                aria-label="Previous"
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '48%',
                  borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.45), transparent)',
                  pointerEvents: 'none',
                }} />
                <span style={{ position: 'relative', zIndex: 1 }}><IconPrev size={10} /></span>
              </button>

              {/* PLAY — larger, white frosted glass, the hero control */}
              <button
                onClick={togglePlay}
                disabled={!ready}
                style={{
                  width: 42, height: 42, borderRadius: '50%',
                  border: 'none',
                  cursor: ready ? 'pointer' : 'default',
                  background: 'linear-gradient(172deg, rgba(255,255,255,0.82) 0%, rgba(230,242,255,0.65) 30%, rgba(200,225,248,0.5) 60%, rgba(170,208,242,0.4) 100%)',
                  boxShadow: [
                    'inset 0 2px 4px rgba(255,255,255,0.8)',
                    'inset 0 -2px 4px rgba(0,40,90,0.1)',
                    '0 4px 14px rgba(0,40,100,0.3)',
                    '0 0 0 1px rgba(255,255,255,0.3)',
                    '0 0 18px rgba(130,200,255,0.15)',
                  ].join(', '),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(20,70,130,0.7)',
                  opacity: ready ? 1 : 0.35,
                  transition: 'opacity 0.15s',
                  position: 'relative', overflow: 'hidden',
                }}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {/* Gloss dome */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                  borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.15) 55%, transparent)',
                  pointerEvents: 'none',
                }} />
                {/* Specular hotspot */}
                <div style={{
                  position: 'absolute', top: '10%', left: '25%', width: '40%', height: '22%',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse, rgba(255,255,255,0.55), transparent)',
                  pointerEvents: 'none',
                  filter: 'blur(1.5px)',
                }} />
                <span style={{ position: 'relative', zIndex: 1, marginLeft: playing ? 0 : 1.5 }}>
                  {playing ? <IconPause size={16} /> : <IconPlay size={16} />}
                </span>
              </button>

              {/* Next */}
              <button
                onClick={() => {}}
                disabled={!ready}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: 'none',
                  cursor: ready ? 'pointer' : 'default',
                  background: 'linear-gradient(175deg, rgba(255,255,255,0.5) 0%, rgba(200,225,248,0.35) 50%, rgba(160,200,240,0.25) 100%)',
                  boxShadow: [
                    'inset 0 1px 2px rgba(255,255,255,0.6)',
                    'inset 0 -1px 2px rgba(0,30,70,0.1)',
                    '0 2px 6px rgba(0,30,80,0.25)',
                    '0 0 0 0.5px rgba(255,255,255,0.2)',
                  ].join(', '),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.7)',
                  opacity: ready ? 1 : 0.35,
                  transition: 'opacity 0.15s',
                  position: 'relative', overflow: 'hidden',
                }}
                aria-label="Next"
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '48%',
                  borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.45), transparent)',
                  pointerEvents: 'none',
                }} />
                <span style={{ position: 'relative', zIndex: 1 }}><IconNext size={10} /></span>
              </button>
            </div>

            {/* ── EQ bars — subtle, abstract ── */}
            <div style={{
              display: 'flex', gap: 2, alignItems: 'flex-end',
              height: 12, justifyContent: 'center',
            }}>
              {EQ.map((h, i) => (
                <div key={i} style={{
                  width: 2.5, borderRadius: '1.5px 1.5px 0 0',
                  height: playing ? h : Math.max(1.5, Math.round(h * 0.18)),
                  background: playing
                    ? 'linear-gradient(to top, rgba(255,255,255,0.35), rgba(255,255,255,0.6))'
                    : 'rgba(255,255,255,0.15)',
                  boxShadow: playing ? '0 0 3px rgba(200,230,255,0.25)' : 'none',
                  transition: `height ${0.18 + (i % 5) * 0.05}s ease-in-out`,
                  opacity: playing ? 0.85 : 0.4,
                }} />
              ))}
            </div>

          </div>{/* end right area */}


          {/* ═══════════════════════════════════════════════════════════════════
              ABSTRACT DECORATIONS — bokeh, light caustics, water ripples
          ═══════════════════════════════════════════════════════════════════ */}

          {/* Large soft bokeh orb — upper right */}
          <div style={{
            position: 'absolute', top: -14, right: 20,
            width: 55, height: 55, borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.12), rgba(200,230,255,0.04) 50%, transparent)',
            pointerEvents: 'none',
          }} />

          {/* Small bokeh cluster */}
          {[
            { size: 14, top: '72%', left: '44%', opacity: 0.08 },
            { size: 9,  top: '82%', left: '50%', opacity: 0.06 },
            { size: 20, top: '12%', left: '62%', opacity: 0.05 },
            { size: 7,  top: '22%', left: '55%', opacity: 0.04 },
            { size: 11, top: '78%', left: '72%', opacity: 0.05 },
          ].map((b, i) => (
            <div key={i} style={{
              position: 'absolute', top: b.top, left: b.left,
              width: b.size, height: b.size, borderRadius: '50%',
              background: `radial-gradient(circle at 36% 30%, rgba(255,255,255,${b.opacity * 2.5}), rgba(255,255,255,${b.opacity * 0.4}) 55%, transparent)`,
              border: `0.5px solid rgba(255,255,255,${b.opacity * 0.6})`,
              pointerEvents: 'none',
            }} />
          ))}

          {/* Light caustic — wavy refraction pattern across the body */}
          <svg
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04 }}
            width={BASE_W} height={BASE_H} viewBox={`0 0 ${BASE_W} ${BASE_H}`}
          >
            <defs>
              <pattern id="aero-caustic" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M10 30 Q20 10 30 30 Q40 50 50 30" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
                <path d="M0 50 Q15 35 30 50 Q45 65 60 50" fill="none" stroke="white" strokeWidth="1" opacity="0.4" />
              </pattern>
            </defs>
            <rect width={BASE_W} height={BASE_H} fill="url(#aero-caustic)" />
          </svg>

          {/* Water ripple rings — center-left, behind the disc */}
          <div style={{
            position: 'absolute', left: '18%', top: '55%',
            width: 30, height: 30, borderRadius: '50%', pointerEvents: 'none',
            boxShadow: [
              '0 0 0 0.5px rgba(255,255,255,0.04)',
              '0 0 0 4px rgba(255,255,255,0.025)',
              '0 0 0 10px rgba(255,255,255,0.012)',
            ].join(', '),
          }} />

          {/* Lens flare — tiny bright dot, top-left area */}
          <div style={{
            position: 'absolute', top: '14%', left: '7%', pointerEvents: 'none',
          }}>
            <div style={{
              width: 4, height: 4, borderRadius: '50%',
              background: 'rgba(255,255,255,0.65)',
              boxShadow: '0 0 8px 2px rgba(255,255,255,0.3), 0 0 18px 6px rgba(180,220,255,0.12)',
            }} />
          </div>

        </div>{/* end main body */}


        {/* ═══════════════════════════════════════════════════════════════════════
            CSS KEYFRAMES — disc spin animation
        ═══════════════════════════════════════════════════════════════════════ */}
        <style>{`
          @keyframes aero-disc-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>

      </div>
    </div>
  )
}
