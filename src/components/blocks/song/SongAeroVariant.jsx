import { useRef, useState, useEffect } from 'react'
import { formatTime } from './useSongPlayer'

const BASE_W = 400
const BASE_H = 220

// ─── SVG transport icons ─────────────────────────────────────────────────────
function IconPlay({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: 'block' }}>
      <path d="M4 2.5L13.5 8L4 13.5V2.5Z" fill="currentColor" strokeLinejoin="round" />
    </svg>
  )
}
function IconPause({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: 'block' }}>
      <rect x="2.5" y="2" width="4"  height="12" rx="1.5" fill="currentColor" />
      <rect x="9.5" y="2" width="4"  height="12" rx="1.5" fill="currentColor" />
    </svg>
  )
}
function IconSkipBack({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{ display: 'block' }}>
      <path d="M9.5 2L3.8 6L9.5 10V2Z" fill="currentColor" />
      <rect x="1.5" y="2" width="2.2" height="8" rx="1" fill="currentColor" />
    </svg>
  )
}
function IconSkipFwd({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{ display: 'block' }}>
      <path d="M2.5 2L8.2 6L2.5 10V2Z" fill="currentColor" />
      <rect x="8.3" y="2" width="2.2" height="8" rx="1" fill="currentColor" />
    </svg>
  )
}
function IconStop({ size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" style={{ display: 'block' }}>
      <rect x="1.5" y="1.5" width="7" height="7" rx="1" fill="currentColor" />
    </svg>
  )
}

export default function SongAeroVariant({ block, playing, ready, progress, togglePlay, handleSeek }) {
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

  const EQ_HEIGHTS = [5, 9, 13, 7, 11, 4, 10, 14, 6, 8, 12, 5, 9, 7, 13, 6, 10, 8]

  return (
    <div ref={wrapRef} className="w-full select-none" style={{ position: 'relative', height: BASE_H * sc }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: BASE_W, height: BASE_H,
        transformOrigin: 'top left', transform: `scale(${sc})`,
      }}>

        {/* ═══════════════════════════════════════════════════════════════════════
            DROP SHADOW — soft diffuse glow beneath
        ═══════════════════════════════════════════════════════════════════════ */}
        <div style={{
          position: 'absolute',
          bottom: -6, left: '10%', right: '10%', height: 24,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,120,200,0.25) 0%, rgba(0,80,160,0.1) 50%, transparent 75%)',
          filter: 'blur(10px)',
          pointerEvents: 'none',
        }} />

        {/* ═══════════════════════════════════════════════════════════════════════
            OUTER SHELL — frosted translucent white, organic pebble shape
            Large border-radius with generous padding so content stays inside
        ═══════════════════════════════════════════════════════════════════════ */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: 40,
          background: 'linear-gradient(165deg, rgba(255,255,255,0.72) 0%, rgba(240,245,252,0.58) 25%, rgba(220,232,245,0.48) 50%, rgba(200,218,240,0.42) 75%, rgba(185,205,230,0.38) 100%)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
          boxShadow: [
            '0 16px 48px rgba(0,40,100,0.22)',
            '0 6px 18px rgba(0,30,80,0.14)',
            '0 2px 6px rgba(0,20,60,0.1)',
            'inset 0 1.5px 0 rgba(255,255,255,0.85)',
            'inset 0 -1px 0 rgba(0,40,100,0.08)',
            '0 0 0 1px rgba(255,255,255,0.35)',
          ].join(', '),
          overflow: 'hidden',
        }}>

          {/* Shell — top gloss sweep (frosted glass highlight) */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
            background: 'linear-gradient(162deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.3) 15%, rgba(255,255,255,0.08) 28%, transparent 42%)',
          }} />

          {/* Shell — specular edge streak */}
          <div style={{
            position: 'absolute', top: 2, left: '14%', right: '14%', height: 2.5,
            borderRadius: '50%', pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent 8%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.8) 70%, transparent 92%)',
            filter: 'blur(1px)',
          }} />

          {/* Shell — bottom edge reflection */}
          <div style={{
            position: 'absolute', bottom: 3, left: '18%', right: '18%', height: 2,
            borderRadius: '50%', pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25) 30%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.25) 70%, transparent)',
            filter: 'blur(1.5px)',
          }} />


          {/* ═══════════════════════════════════════════════════════════════════
              INNER BLUE PANEL — translucent aqua glass, inset with generous margin
          ═══════════════════════════════════════════════════════════════════ */}
          <div style={{
            position: 'absolute',
            top: 14, bottom: 14, left: 14, right: 14,
            borderRadius: 28,
            background: 'linear-gradient(158deg, rgba(160,210,248,0.65) 0%, rgba(100,180,235,0.55) 20%, rgba(60,155,220,0.50) 40%, rgba(35,130,200,0.48) 60%, rgba(20,110,180,0.45) 80%, rgba(12,90,160,0.42) 100%)',
            boxShadow: [
              'inset 0 3px 12px rgba(0,40,100,0.25)',
              'inset 0 0 0 1px rgba(255,255,255,0.2)',
              '0 -1px 0 rgba(255,255,255,0.5)',
              '0 1px 0 rgba(0,30,70,0.1)',
            ].join(', '),
            overflow: 'hidden',
          }}>

            {/* Blue panel — diagonal gloss */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
              background: 'linear-gradient(155deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.25) 12%, rgba(255,255,255,0.08) 24%, transparent 38%)',
            }} />

            {/* Blue panel — bottom fade */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
              borderRadius: 'inherit', pointerEvents: 'none',
              background: 'linear-gradient(to bottom, transparent, rgba(0,30,80,0.15))',
            }} />

            {/* Blue panel — top specular streak */}
            <div style={{
              position: 'absolute', top: 3, left: '12%', right: '16%', height: 2,
              borderRadius: '50%', pointerEvents: 'none',
              background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 70%, transparent 90%)',
              filter: 'blur(0.8px)',
            }} />


            {/* ═══════════════════════════════════════════════════════════════
                COVER ART — rounded, recessed, inside the blue area
            ═══════════════════════════════════════════════════════════════ */}
            <div style={{
              position: 'absolute', left: 14, top: 14, width: 104, bottom: 14,
              borderRadius: 18,
              background: 'rgba(0,15,35,0.5)',
              boxShadow: [
                'inset 0 3px 12px rgba(0,0,0,0.55)',
                'inset 0 0 0 1px rgba(0,0,0,0.3)',
                '0 1.5px 0 rgba(255,255,255,0.15)',
              ].join(', '),
              overflow: 'hidden',
            }}>
              {coverUrl
                ? <img src={coverUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(140deg, rgba(15,40,70,0.8) 0%, rgba(10,28,55,0.7) 50%, rgba(8,15,30,0.9) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="36" height="36" viewBox="0 0 44 44" fill="none" style={{ opacity: 0.4 }}>
                      <path d="M30 8v20a6 6 0 1 1-2-4.5V14l-12 3v15a6 6 0 1 1-2-4.5V10l16-4v2z" fill="rgba(100,180,255,0.5)" />
                    </svg>
                  </div>
              }
              {/* Glass reflection */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
                background: 'linear-gradient(150deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 22%, transparent 40%)',
              }} />
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
                boxShadow: 'inset 0 0 16px rgba(0,0,0,0.3)',
              }} />
            </div>


            {/* ═══════════════════════════════════════════════════════════════
                CENTER COLUMN — LCD + progress + transport + EQ
            ═══════════════════════════════════════════════════════════════ */}
            <div style={{
              position: 'absolute',
              left: 130, right: 72, top: 14, bottom: 14,
              display: 'flex', flexDirection: 'column', gap: 5,
            }}>

              {/* ── LCD screen ── */}
              <div style={{
                flex: '0 0 auto',
                borderRadius: 12,
                background: 'linear-gradient(178deg, rgba(0,10,22,0.85) 0%, rgba(0,14,30,0.8) 50%, rgba(0,18,38,0.85) 100%)',
                boxShadow: [
                  'inset 0 3px 10px rgba(0,0,0,0.8)',
                  'inset 0 0 0 1px rgba(0,100,180,0.15)',
                  '0 1px 0 rgba(255,255,255,0.15)',
                ].join(', '),
                position: 'relative', overflow: 'hidden',
                padding: '7px 10px 6px',
              }}>
                {/* Screen glow */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                  background: 'linear-gradient(to bottom, rgba(0,140,220,0.06), transparent)',
                  pointerEvents: 'none',
                }} />
                {/* Scanlines */}
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 3px)',
                }} />

                {/* Time */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  position: 'relative', zIndex: 1, marginBottom: 3,
                }}>
                  <span style={{
                    fontSize: 14, letterSpacing: 2, fontWeight: 700,
                    color: '#55ddff',
                    fontFamily: '"Courier New", monospace',
                    textShadow: '0 0 10px rgba(0,200,255,0.65), 0 0 20px rgba(0,180,255,0.25)',
                  }}>
                    {formatTime(progress.current)}
                  </span>
                  {progress.duration > 0 && (
                    <span style={{
                      fontSize: 8, letterSpacing: 1,
                      color: 'rgba(100,200,255,0.35)',
                      fontFamily: '"Courier New", monospace',
                    }}>
                      {formatTime(progress.duration)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div style={{
                  fontSize: 7.5, letterSpacing: 0.5, fontWeight: 600,
                  color: '#88eeff',
                  fontFamily: '"Courier New", monospace',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  textShadow: '0 0 5px rgba(0,200,255,0.45)',
                  position: 'relative', zIndex: 1,
                }}>
                  {title ? title.toUpperCase() : 'NO TRACK'}
                </div>

                {/* Artist */}
                <div style={{
                  fontSize: 6.5, letterSpacing: 0.3, marginTop: 1.5,
                  color: 'rgba(90,190,255,0.4)',
                  fontFamily: 'system-ui, sans-serif',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  position: 'relative', zIndex: 1,
                }}>
                  {artist || '\u00a0'}
                </div>

                {/* Status icons */}
                <div style={{
                  display: 'flex', gap: 4, marginTop: 3,
                  position: 'relative', zIndex: 1,
                }}>
                  <svg width="5" height="5" viewBox="0 0 6 6" fill="none">
                    <path d="M1 0.5L5.5 3L1 5.5V0.5Z" fill={playing ? '#55ddff' : 'rgba(80,160,220,0.25)'} />
                  </svg>
                  <svg width="9" height="5" viewBox="0 0 10 6" fill="none">
                    <rect x="0" y="4" width="1.5" height="2" rx="0.3" fill="rgba(80,160,220,0.25)" />
                    <rect x="2.5" y="2.5" width="1.5" height="3.5" rx="0.3" fill="rgba(80,160,220,0.25)" />
                    <rect x="5" y="1" width="1.5" height="5" rx="0.3" fill="rgba(80,160,220,0.25)" />
                    <rect x="7.5" y="0" width="1.5" height="6" rx="0.3" fill="rgba(80,160,220,0.25)" />
                  </svg>
                  <svg width="11" height="5" viewBox="0 0 12 6" fill="none" style={{ marginLeft: 'auto' }}>
                    <rect x="0.5" y="0.5" width="9" height="5" rx="1" stroke="rgba(80,160,220,0.3)" strokeWidth="0.8" fill="none" />
                    <rect x="9.5" y="1.5" width="1.5" height="3" rx="0.5" fill="rgba(80,160,220,0.3)" />
                    <rect x="1.5" y="1.5" width="7" height="3" rx="0.5" fill="rgba(0,200,255,0.2)" />
                  </svg>
                </div>
              </div>

              {/* ── Progress track ── */}
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
                  height: 6, borderRadius: 3,
                  background: 'linear-gradient(to bottom, rgba(0,16,32,0.7), rgba(0,24,48,0.6))',
                  boxShadow: [
                    'inset 0 2px 5px rgba(0,0,0,0.7)',
                    'inset 0 0 0 0.5px rgba(0,80,160,0.2)',
                    '0 1px 0 rgba(255,255,255,0.12)',
                  ].join(', '),
                  position: 'relative',
                  overflow: 'visible',
                }}>
                  {/* Aqua fill */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${pct}%`,
                    borderRadius: pct >= 99 ? 3 : '3px 0 0 3px',
                    background: 'linear-gradient(to bottom, #77eeff 0%, #33ccee 40%, #0099cc 100%)',
                    boxShadow: '0 0 7px rgba(0,200,255,0.55)',
                    transition: 'width 0.5s linear',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.45), transparent)',
                    }} />
                  </div>

                  {/* Knob */}
                  {pct > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '50%', transform: 'translate(-50%, -50%)',
                      left: `${Math.min(pct, 97)}%`,
                      width: 12, height: 12, borderRadius: '50%',
                      background: 'radial-gradient(circle at 36% 28%, #ffffff 0%, #d0e8ff 30%, #90c4e0 60%, #5098b8 100%)',
                      boxShadow: [
                        '0 2px 5px rgba(0,0,0,0.4)',
                        '0 0 6px rgba(0,180,255,0.45)',
                        'inset 0 1px 0 rgba(255,255,255,0.9)',
                      ].join(', '),
                      zIndex: 2,
                      transition: 'left 0.5s linear',
                    }} />
                  )}
                </div>
              </div>

              {/* ── Transport pills ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                {[
                  { icon: <IconSkipBack size={9} />, action: () => {}, label: 'Previous' },
                  { icon: <IconStop size={7} />, action: () => {}, label: 'Stop' },
                  { icon: <IconSkipFwd size={9} />, action: () => {}, label: 'Next' },
                ].map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.action}
                    disabled={!ready}
                    aria-label={btn.label}
                    style={{
                      width: 26, height: 16,
                      borderRadius: 8,
                      border: 'none',
                      cursor: ready ? 'pointer' : 'default',
                      background: 'linear-gradient(178deg, rgba(255,255,255,0.85) 0%, rgba(225,238,248,0.75) 40%, rgba(195,215,235,0.65) 100%)',
                      boxShadow: [
                        'inset 0 1px 1.5px rgba(255,255,255,0.85)',
                        'inset 0 -1px 1.5px rgba(0,20,50,0.1)',
                        '0 1.5px 4px rgba(0,20,60,0.3)',
                        '0 0 0 0.5px rgba(255,255,255,0.3)',
                      ].join(', '),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(20,60,100,0.6)',
                      position: 'relative', overflow: 'hidden',
                      opacity: ready ? 1 : 0.4,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                      borderRadius: '8px 8px 0 0',
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.05))',
                      pointerEvents: 'none',
                    }} />
                    <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}>
                      {btn.icon}
                    </span>
                  </button>
                ))}

                {!ready && (
                  <span style={{
                    fontSize: 6, color: 'rgba(120,200,255,0.45)',
                    fontFamily: '"Courier New", monospace',
                    marginLeft: 3,
                  }}>
                    loading…
                  </span>
                )}
              </div>

              {/* ── EQ bars ── */}
              <div style={{
                display: 'flex', gap: 1.5, alignItems: 'flex-end',
                height: 14, marginTop: 'auto',
              }}>
                {EQ_HEIGHTS.map((h, i) => (
                  <div key={i} style={{
                    width: 2.5, borderRadius: '1.5px 1.5px 0 0',
                    height: playing ? h : Math.max(1.5, Math.round(h * 0.2)),
                    background: playing
                      ? `linear-gradient(to top, rgba(0,136,187,0.7), rgba(51,204,255,0.6) ${60 + (i % 3) * 10}%, rgba(136,238,255,0.5))`
                      : 'rgba(80,160,220,0.2)',
                    boxShadow: playing ? '0 0 3px rgba(0,200,255,0.35)' : 'none',
                    transition: `height ${0.2 + (i % 5) * 0.06}s ease-in-out`,
                    opacity: playing ? 1 : 0.5,
                  }} />
                ))}
              </div>

            </div>{/* end center column */}


            {/* ═══════════════════════════════════════════════════════════════════
                PLAY BUTTON — neon green with concentric glow rings
            ═══════════════════════════════════════════════════════════════════ */}
            <div style={{
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)',
            }}>
              {/* Recessed well */}
              <div style={{
                width: 50, height: 50, borderRadius: '50%',
                background: 'linear-gradient(to bottom, rgba(0,30,60,0.2), rgba(0,20,50,0.1))',
                boxShadow: [
                  'inset 0 2px 5px rgba(0,0,0,0.2)',
                  '0 1px 0 rgba(255,255,255,0.1)',
                ].join(', '),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <button
                  onClick={togglePlay}
                  disabled={!ready}
                  style={{
                    width: 42, height: 42, borderRadius: '50%',
                    border: 'none',
                    cursor: ready ? 'pointer' : 'default',
                    background: 'radial-gradient(circle at 38% 26%, #e8ff88 0%, #bbff22 20%, #88ee00 36%, #66cc00 54%, #44aa00 72%, #228800 90%, #116600 100%)',
                    boxShadow: [
                      '0 0 0 2px rgba(120,240,0,0.65)',
                      '0 0 0 4.5px rgba(100,220,0,0.3)',
                      '0 0 0 8px rgba(80,200,0,0.15)',
                      '0 0 0 12px rgba(60,180,0,0.06)',
                      '0 0 20px rgba(100,230,0,0.45)',
                      '0 0 40px rgba(80,200,0,0.2)',
                      'inset 0 2.5px 8px rgba(255,255,255,0.5)',
                      'inset 0 -2.5px 8px rgba(0,60,0,0.4)',
                      '0 5px 14px rgba(40,160,0,0.55)',
                      '0 2px 4px rgba(0,0,0,0.35)',
                    ].join(', '),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(0,50,0,0.75)',
                    position: 'relative', overflow: 'hidden',
                    opacity: ready ? 1 : 0.4,
                    transition: 'opacity 0.15s',
                  }}
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  {/* Gloss dome */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                    borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.65), rgba(255,255,255,0.12) 60%, transparent)',
                    pointerEvents: 'none',
                  }} />
                  {/* Specular hotspot */}
                  <div style={{
                    position: 'absolute', top: '14%', left: '30%', width: '30%', height: '18%',
                    borderRadius: '50%',
                    background: 'radial-gradient(ellipse, rgba(255,255,255,0.5), transparent)',
                    pointerEvents: 'none',
                    filter: 'blur(1.5px)',
                  }} />
                  <span style={{ position: 'relative', zIndex: 1, marginLeft: playing ? 0 : 2 }}>
                    {playing ? <IconPause size={17} /> : <IconPlay size={17} />}
                  </span>
                </button>
              </div>
            </div>


            {/* ═══════════════════════════════════════════════════════════════════
                ABSTRACT DECORATIONS — soft bokeh, light orbs, ripples
            ═══════════════════════════════════════════════════════════════════ */}

            {/* Bokeh orbs — soft, abstract, floating */}
            {[
              { size: 20, top: '65%', left: '80%', opacity: 0.1 },
              { size: 12, top: '76%', left: '88%', opacity: 0.07 },
              { size: 8,  top: '80%', left: '76%', opacity: 0.06 },
              { size: 15, top: '16%', left: '70%', opacity: 0.05 },
              { size: 6,  top: '28%', left: '82%', opacity: 0.04 },
              { size: 28, top: '40%', left: '92%', opacity: 0.04 },
            ].map((b, i) => (
              <div key={i} style={{
                position: 'absolute', top: b.top, left: b.left,
                width: b.size, height: b.size, borderRadius: '50%',
                background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,${b.opacity * 2}), rgba(255,255,255,${b.opacity * 0.4}) 50%, transparent)`,
                border: `0.5px solid rgba(255,255,255,${b.opacity * 0.7})`,
                pointerEvents: 'none',
              }} />
            ))}

            {/* Soft ripple rings — abstract water motif */}
            <div style={{
              position: 'absolute', right: '18%', bottom: '16%',
              width: 34, height: 34, borderRadius: '50%', pointerEvents: 'none',
              boxShadow: [
                '0 0 0 0.5px rgba(255,255,255,0.05)',
                '0 0 0 5px rgba(255,255,255,0.03)',
                '0 0 0 12px rgba(255,255,255,0.015)',
              ].join(', '),
            }} />

            {/* Light orb — upper left, soft lens flare feel */}
            <div style={{
              position: 'absolute', top: '10%', left: '8%', pointerEvents: 'none',
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
                boxShadow: '0 0 10px 3px rgba(255,255,255,0.3), 0 0 22px 8px rgba(200,230,255,0.15)',
              }} />
              {/* Soft cross rays */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 18, height: 0.5,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.2) 60%, transparent)',
              }} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 0.5, height: 14,
                background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.18) 40%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.18) 60%, transparent)',
              }} />
            </div>

          </div>{/* end blue panel */}

        </div>{/* end outer shell */}
      </div>
    </div>
  )
}
