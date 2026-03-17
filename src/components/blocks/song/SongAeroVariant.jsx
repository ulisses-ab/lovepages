import { useRef, useState, useEffect } from 'react'
import { formatTime } from './useSongPlayer'

const BASE_W = 400
const BASE_H = 218

// ─── SVG transport icons (crisp, no emoji) ──────────────────────────────────
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

// ─── Gloss cap: white upper-half highlight — THE defining Aero signature ────
// Works on any element; pass the borderRadius of the host.
function GlossCap({ radius = '50% 50% 0 0 / 80% 80% 0 0', opacity = 0.62, height = '52%' }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height,
      borderRadius: radius,
      background: `linear-gradient(to bottom, rgba(255,255,255,${opacity}), rgba(255,255,255,0.04))`,
      pointerEvents: 'none',
    }} />
  )
}

// ─── Bokeh bubble (water / nature motif) ─────────────────────────────────────
function Bubble({ size, top, left, opacity = 0.14 }) {
  return (
    <div style={{
      position: 'absolute', top, left,
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,${opacity * 2.0}), rgba(255,255,255,${opacity * 0.4}) 55%, transparent)`,
      border: `1px solid rgba(255,255,255,${opacity})`,
      pointerEvents: 'none',
    }} />
  )
}

// ─── Pill button (transport controls) ───────────────────────────────────────
function PillButton({ onClick, children, disabled = false, wide = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 24,
        minWidth: wide ? 44 : 34,
        paddingLeft: 10, paddingRight: 10,
        borderRadius: 12,
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        background: 'linear-gradient(178deg, rgba(255,255,255,0.38) 0%, rgba(180,225,255,0.22) 40%, rgba(100,175,240,0.14) 100%)',
        boxShadow: [
          'inset 0 1.5px 3px rgba(255,255,255,0.70)',
          'inset 0 -1.5px 2.5px rgba(0,0,0,0.22)',
          '0 2px 6px rgba(0,0,0,0.38)',
          '0 0 0 0.5px rgba(255,255,255,0.32)',
        ].join(', '),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.92)',
        position: 'relative', overflow: 'hidden',
        opacity: disabled ? 0.45 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {/* Gloss cap on each pill */}
      <GlossCap radius="12px 12px 0 0" opacity={0.55} height="52%" />
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}>
        {children}
      </span>
    </button>
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

  // Decorative EQ bars — heights cycle slowly when playing
  const EQ_HEIGHTS = [6, 10, 14, 8, 12, 5, 11, 13, 7, 9, 11, 6, 10, 8, 13]

  return (
    <div ref={wrapRef} className="w-full select-none" style={{ position: 'relative', height: BASE_H * sc }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: BASE_W, height: BASE_H,
        transformOrigin: 'top left', transform: `scale(${sc})`,
      }}>

        {/* ═══════════════════════════════════════════════════════════════════
            OUTER BODY — glossy aqua-blue plastic device shell
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: 26,
          // Sky-to-deep-blue gradient; aqua is the signature Frutiger Aero hue
          background: 'linear-gradient(152deg, #d2ecff 0%, #a8d8f4 20%, #72bcec 42%, #4aa4de 62%, #2a88cc 80%, #1870b4 100%)',
          boxShadow: [
            '0 26px 72px rgba(0,40,120,0.50)',
            '0 10px 26px rgba(0,20,80,0.32)',
            '0 3px 8px rgba(0,0,0,0.22)',
            // Bright inset top bevel
            'inset 0 2.5px 0 rgba(255,255,255,1)',
            'inset 0 0 0 1.5px rgba(255,255,255,0.55)',
            // Subtle inner bottom shadow
            'inset 0 -5px 16px rgba(0,50,120,0.28)',
          ].join(', '),
          overflow: 'hidden',
        }}>

          {/* Main diagonal gloss sweep across body */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
            background: 'linear-gradient(152deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.52) 16%, rgba(255,255,255,0.14) 30%, rgba(255,255,255,0.02) 46%, transparent 58%)',
          }} />
          {/* Top bright rim highlight */}
          <div style={{
            position: 'absolute', top: 1.5, left: '7%', right: '7%', height: 2.5,
            borderRadius: '50%', pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,1) 22%, rgba(255,255,255,1) 78%, transparent)',
          }} />
          {/* Bottom tint darkening */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%',
            borderRadius: '0 0 26px 26px', pointerEvents: 'none',
            background: 'linear-gradient(to bottom, transparent, rgba(0,40,100,0.30))',
          }} />
          {/* Right edge shadow */}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: '6%',
            borderRadius: '0 26px 26px 0', pointerEvents: 'none',
            background: 'linear-gradient(to left, rgba(0,40,100,0.20), transparent)',
          }} />
          {/* Left edge shine */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: '4%',
            borderRadius: '26px 0 0 26px', pointerEvents: 'none',
            background: 'linear-gradient(to right, rgba(255,255,255,0.22), transparent)',
          }} />

          {/* ═══════════════════════════════════════════════════════════════
              COVER ART PANEL — left inset, recessed into the body
          ═══════════════════════════════════════════════════════════════ */}
          <div style={{
            position: 'absolute', left: 16, top: 15, width: 136, bottom: 15,
            borderRadius: 12,
            // Recessed surround / bezel
            background: 'rgba(0,10,28,0.60)',
            boxShadow: [
              'inset 0 4px 14px rgba(0,0,0,0.75)',
              'inset 0 0 0 1px rgba(0,0,0,0.60)',
              // Outer rim highlight (the bevel lip shows above the recess)
              '0 2px 0 rgba(255,255,255,0.30)',
              '0 -1px 0 rgba(0,0,0,0.20)',
            ].join(', '),
            overflow: 'hidden',
          }}>
            {/* Actual cover or placeholder */}
            {coverUrl
              ? <img src={coverUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{
                  width: '100%', height: '100%',
                  background: 'linear-gradient(140deg, #0f2744 0%, #0a1c36 45%, #132c50 70%, #080f1e 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 40, opacity: 0.65,
                }}>🎵</div>
            }
            {/* Glass reflection overlay on cover */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
              background: 'linear-gradient(152deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.07) 28%, transparent 48%)',
            }} />
            {/* Cover: bottom specular strip */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, pointerEvents: 'none',
              background: 'linear-gradient(to top, rgba(255,255,255,0.09), transparent)',
            }} />
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              CENTER COLUMN — LCD + progress + transport + EQ
          ═══════════════════════════════════════════════════════════════ */}
          <div style={{
            position: 'absolute',
            left: 164, right: 80, top: 15, bottom: 15,
            display: 'flex', flexDirection: 'column', gap: 7,
          }}>

            {/* ── LCD screen ── */}
            <div style={{
              height: 48, borderRadius: 10,
              background: 'linear-gradient(175deg, #00070f 0%, #000c18 55%, #000f22 100%)',
              boxShadow: [
                'inset 0 4px 12px rgba(0,0,0,0.95)',
                'inset 0 0 0 1px rgba(0,140,220,0.18)',
                '0 1.5px 0 rgba(255,255,255,0.22)',
                '0 0 0 0.5px rgba(0,70,150,0.35)',
              ].join(', '),
              position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: '5px 11px 4px',
            }}>
              {/* Screen edge glow from top */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
                background: 'linear-gradient(to bottom, rgba(0,170,255,0.07), transparent)',
                pointerEvents: 'none',
              }} />
              {/* Screen glass glare streak */}
              <div style={{
                position: 'absolute', top: 4, left: '16%', width: '26%', height: 1.5,
                borderRadius: 1, background: 'rgba(255,255,255,0.12)', pointerEvents: 'none',
              }} />
              {/* Screen: very subtle scanlines */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 3px)',
              }} />

              {/* Title row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', position: 'relative', zIndex: 1 }}>
                <span style={{
                  fontSize: 8.5, letterSpacing: 0.7, fontWeight: 700,
                  color: '#44d4ff',
                  fontFamily: '"Courier New", monospace',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  maxWidth: '60%',
                  textShadow: '0 0 8px rgba(0,210,255,0.65)',
                }}>
                  {title ? title.toUpperCase() : 'NO TRACK'}
                </span>
                <span style={{
                  fontSize: 11, letterSpacing: 2, fontWeight: 700,
                  color: '#88eeff',
                  fontFamily: '"Courier New", monospace',
                  textShadow: '0 0 10px rgba(0,230,255,0.75)',
                  flexShrink: 0, marginLeft: 5,
                }}>
                  {formatTime(progress.current)}
                </span>
              </div>

              {/* Artist */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', position: 'relative', zIndex: 1, marginTop: 3 }}>
                <span style={{
                  fontSize: 7, letterSpacing: 0.3,
                  color: 'rgba(90,195,255,0.50)',
                  fontFamily: 'system-ui, sans-serif',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  maxWidth: '65%',
                }}>
                  {artist || '\u00a0'}
                </span>
                {progress.duration > 0 && (
                  <span style={{
                    fontSize: 7, letterSpacing: 0.8,
                    color: 'rgba(90,195,255,0.38)',
                    fontFamily: '"Courier New", monospace',
                    flexShrink: 0,
                  }}>
                    -{formatTime(progress.duration - progress.current)}
                  </span>
                )}
              </div>
            </div>

            {/* ── Progress track ── */}
            <div
              onClick={ready ? handleSeek : undefined}
              onTouchEnd={ready ? handleSeek : undefined}
              style={{ cursor: ready ? 'pointer' : 'default', padding: '5px 0', position: 'relative' }}
              role="slider"
              aria-valuenow={Math.round(progress.current)}
              aria-valuemin={0}
              aria-valuemax={Math.round(progress.duration)}
            >
              {/* Outer groove — recessed channel */}
              <div style={{
                height: 8, borderRadius: 4,
                background: 'linear-gradient(to bottom, #00060f, #001424)',
                boxShadow: [
                  'inset 0 3px 7px rgba(0,0,0,0.92)',
                  'inset 0 0 0 0.5px rgba(0,110,200,0.30)',
                  '0 1.5px 0 rgba(255,255,255,0.18)',
                ].join(', '),
                position: 'relative',
                overflow: 'visible',
              }}>
                {/* Aqua fill with inner gloss */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${pct}%`,
                  borderRadius: '4px 0 0 4px',
                  background: 'linear-gradient(to bottom, #66ddff 0%, #22bbee 45%, #0099cc 100%)',
                  boxShadow: '0 0 9px rgba(0,200,255,0.72)',
                  transition: 'width 0.5s linear',
                  overflow: 'hidden',
                }}>
                  {/* Fill inner highlight */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '48%',
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.44), transparent)',
                    borderRadius: '4px 0 0 0',
                  }} />
                </div>

                {/* Slider knob */}
                {pct > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '50%', transform: 'translate(-50%, -50%)',
                    left: `${Math.min(pct, 98)}%`,
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'radial-gradient(circle at 38% 30%, #ffffff 0%, #cce8ff 32%, #88c4e8 62%, #4898c0 100%)',
                    boxShadow: [
                      '0 2px 7px rgba(0,0,0,0.48)',
                      '0 0 10px rgba(0,190,255,0.55)',
                      'inset 0 1.5px 0 rgba(255,255,255,0.92)',
                    ].join(', '),
                    zIndex: 2,
                    transition: 'left 0.5s linear',
                  }}>
                    {/* Knob gloss cap */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                      borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.75), transparent)',
                    }} />
                  </div>
                )}
              </div>
            </div>

            {/* ── Transport buttons ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <PillButton onClick={() => {}} disabled={!ready}>
                <IconSkipBack size={12} />
              </PillButton>
              <PillButton onClick={() => {}} disabled={!ready}>
                <IconSkipFwd size={12} />
              </PillButton>
              <div style={{ flex: 1 }} />
              {!ready && (
                <span style={{ fontSize: 7, color: 'rgba(130,210,255,0.52)', fontFamily: '"Courier New", monospace' }}>
                  loading…
                </span>
              )}
            </div>

            {/* ── EQ bars (decorative visualizer) ── */}
            <div style={{
              display: 'flex', gap: 2.5, alignItems: 'flex-end',
              height: 18, marginTop: 'auto', paddingBottom: 2,
            }}>
              {EQ_HEIGHTS.map((h, i) => (
                <div key={i} style={{
                  width: 3.5, borderRadius: '2px 2px 0 0',
                  height: playing ? h : Math.max(2, Math.round(h * 0.25)),
                  background: playing
                    ? 'linear-gradient(to top, #0099cc, #33ccff, #88eeff)'
                    : 'rgba(100,180,255,0.28)',
                  boxShadow: playing ? '0 0 5px rgba(0,200,255,0.55)' : 'none',
                  transition: `height ${0.25 + (i % 4) * 0.08}s ease-in-out`,
                  opacity: playing ? 1 : 0.55,
                }} />
              ))}
            </div>

          </div>{/* end center column */}

          {/* ═══════════════════════════════════════════════════════════════
              RIGHT — neon green play/pause button
          ═══════════════════════════════════════════════════════════════ */}
          <div style={{
            position: 'absolute', right: 15, top: '50%',
            transform: 'translateY(-50%)',
          }}>
            <button
              onClick={togglePlay}
              disabled={!ready}
              style={{
                width: 54, height: 54, borderRadius: '50%',
                border: 'none',
                cursor: ready ? 'pointer' : 'default',
                // Neon lime-green radial gradient — high center highlight
                background: 'radial-gradient(circle at 40% 28%, #e8ff80 0%, #aaff00 22%, #66dd00 48%, #33aa00 72%, #1a6400 100%)',
                boxShadow: [
                  // Concentric neon glow rings — the Frutiger Aero halo
                  '0 0 0 2.5px rgba(130,245,0,0.62)',
                  '0 0 0 6px rgba(100,220,0,0.30)',
                  '0 0 0 11px rgba(70,190,0,0.15)',
                  '0 0 0 18px rgba(50,165,0,0.07)',
                  '0 0 30px rgba(110,235,0,0.55)',
                  // Physical shading
                  'inset 0 3px 9px rgba(255,255,255,0.58)',
                  'inset 0 -3px 9px rgba(0,60,0,0.48)',
                  '0 7px 22px rgba(50,185,0,0.72)',
                  '0 2px 6px rgba(0,0,0,0.46)',
                ].join(', '),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(0,55,0,0.82)',
                position: 'relative', overflow: 'hidden',
                opacity: ready ? 1 : 0.45,
                transition: 'opacity 0.15s, filter 0.15s',
              }}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {/* Gloss cap — upper white dome */}
              <GlossCap opacity={0.65} />
              <span style={{ position: 'relative', zIndex: 1, marginLeft: playing ? 0 : 2 }}>
                {playing ? <IconPause size={18} /> : <IconPlay size={18} />}
              </span>
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              DECORATIONS — bokeh bubbles, water ripple, lens flare
          ═══════════════════════════════════════════════════════════════ */}

          {/* Bokeh bubbles (right half, clear of content) */}
          <Bubble size={26} top="60%" left="79%" opacity={0.12} />
          <Bubble size={16} top="72%" left="87%" opacity={0.09} />
          <Bubble size={10} top="78%" left="76%" opacity={0.08} />
          <Bubble size={8}  top="83%" left="83%" opacity={0.07} />
          <Bubble size={14} top="55%" left="85%" opacity={0.08} />

          {/* Water ripple rings — subtly overlaid near bottom-right */}
          <div style={{
            position: 'absolute', right: '14%', bottom: '12%',
            width: 50, height: 50, borderRadius: '50%', pointerEvents: 'none',
            boxShadow: [
              '0 0 0 1px rgba(255,255,255,0.07)',
              '0 0 0 9px rgba(255,255,255,0.045)',
              '0 0 0 20px rgba(255,255,255,0.025)',
              '0 0 0 33px rgba(255,255,255,0.012)',
            ].join(', '),
          }} />

          {/* Lens flare — small bright dot near top-left with cross-hairs */}
          <div style={{
            position: 'absolute', top: '11%', left: '11%', pointerEvents: 'none',
          }}>
            {/* Central bright orb */}
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'rgba(255,255,255,0.88)',
              boxShadow: '0 0 14px 5px rgba(255,255,255,0.42), 0 0 34px 12px rgba(200,230,255,0.22)',
            }} />
            {/* Horizontal ray */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 28, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.30) 40%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.30) 60%, transparent)',
            }} />
            {/* Vertical ray */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 1, height: 22,
              background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.30) 38%, rgba(255,255,255,0.50) 50%, rgba(255,255,255,0.30) 62%, transparent)',
            }} />
          </div>

          {/* Secondary micro lens flare (ghost reflection lower) */}
          <div style={{
            position: 'absolute', top: '24%', left: '17%', pointerEvents: 'none',
            width: 4, height: 4, borderRadius: '50%',
            background: 'rgba(255,255,255,0.38)',
            boxShadow: '0 0 8px 3px rgba(180,220,255,0.25)',
          }} />

        </div>{/* end outer body */}
      </div>
    </div>
  )
}
