import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { inputClass } from '../../lib/theme'
import GameWordleVariant from './game/GameWordleVariant'

/* ── CRT TV shell (resting state) ──────────────────────────────────────────── */

/* Warm silver-gray plastic body — like a real 90s/2000s tube TV */
const TV_PLASTIC     = '#c8c0b8'   /* main body — warm gray plastic */
const TV_PLASTIC_LIT = '#d8d2ca'   /* top highlight — light catch on plastic */
const TV_PLASTIC_DK  = '#9e968e'   /* underside shadow */
const TV_BEZEL_RING  = '#3a3632'   /* dark ring around the screen inset */

function CrtScreen({ label }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      paddingBottom: '72%',
      overflow: 'hidden',
      borderRadius: 12,
      /* Blue-channel idle screen — like a TV tuned to no signal */
      background: 'radial-gradient(ellipse 90% 80% at 50% 48%, #2844a8 0%, #1a2e78 40%, #0e1a4a 75%, #060d2a 100%)',
      boxShadow: 'inset 0 0 50px rgba(30,60,160,0.15), inset 0 0 20px rgba(0,0,0,0.4)',
    }}>
      {/* Convex glass highlight — strong curved reflection */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 40% at 35% 30%, rgba(255,255,255,0.13) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      {/* Secondary specular — bottom-right edge glow from room light */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 30% 20% at 75% 80%, rgba(180,200,255,0.06) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Subtle scanlines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Screen content — warm white channel text */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 2,
      }}>
        {/* Subtle static noise */}
        <CrtNoise />

        {/* Channel number — top left like a real TV */}
        <div style={{
          position: 'absolute', top: '8%', left: '7%',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 18, fontWeight: 700,
          color: 'rgba(220,225,255,0.7)',
          textShadow: '0 0 10px rgba(180,200,255,0.4)',
          zIndex: 3,
        }}>
          CH 03
        </div>

        {/* Play triangle + label — centered */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 10, zIndex: 3,
        }}>
          {/* Play triangle */}
          <div style={{
            width: 0, height: 0,
            borderLeft: '20px solid rgba(230,235,255,0.85)',
            borderTop: '13px solid transparent',
            borderBottom: '13px solid transparent',
            filter: 'drop-shadow(0 0 12px rgba(180,200,255,0.4))',
          }} />
          {/* Label */}
          <div style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: 13, fontWeight: 600,
            color: 'rgba(220,230,255,0.9)',
            textShadow: '0 0 12px rgba(180,200,255,0.5)',
            textTransform: 'uppercase',
            letterSpacing: 2.5,
            textAlign: 'center',
            padding: '0 16px',
          }}>
            {label || 'Press to play'}
          </div>
        </div>
      </div>

      {/* Edge vignette — strong for convex glass tube look */}
      <div style={{
        position: 'absolute', inset: 0,
        boxShadow: 'inset 0 0 50px 20px rgba(0,0,0,0.55)',
        borderRadius: 12,
        pointerEvents: 'none',
        zIndex: 3,
      }} />
    </div>
  )
}

function CrtNoise() {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = 120
    canvas.height = 80
    let frame = 0

    const draw = () => {
      frame++
      if (frame % 5 !== 0) { rafRef.current = requestAnimationFrame(draw); return }
      const imgData = ctx.createImageData(120, 80)
      for (let i = 0; i < imgData.data.length; i += 4) {
        const v = Math.random() * 30 + 10
        imgData.data[i]   = v * 0.7        /* R — muted */
        imgData.data[i+1] = v * 0.75       /* G */
        imgData.data[i+2] = v * 1.1        /* B — slight blue tint */
        imgData.data[i+3] = 12             /* very subtle */
      }
      ctx.putImageData(imgData, 0, 0)
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity: 0.4,
        pointerEvents: 'none',
        imageRendering: 'pixelated',
      }}
    />
  )
}

function CrtTvShell({ block, onClick }) {
  const [hover, setHover] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        maxWidth: 400,
        margin: '0 auto',
        display: 'block',
        width: '100%',
        background: 'none',
        border: 'none',
        padding: 0,
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Outer plastic body — chunky tube TV shape */}
      <div style={{
        position: 'relative',
        background: `linear-gradient(175deg, ${TV_PLASTIC_LIT} 0%, ${TV_PLASTIC} 35%, ${TV_PLASTIC_DK} 100%)`,
        borderRadius: '20px 20px 12px 12px',
        padding: '20px 22px 10px',
        boxShadow: hover
          ? '0 10px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)'
          : '0 6px 24px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.35)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        transform: hover ? 'scale(1.015)' : 'scale(1)',
      }}>
        {/* Subtle plastic texture — top sheen line */}
        <div style={{
          position: 'absolute', top: 0, left: 20, right: 20, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
          borderRadius: '20px 20px 0 0',
          pointerEvents: 'none',
        }} />

        {/* Dark screen inset — thick bezel ring */}
        <div style={{
          background: TV_BEZEL_RING,
          borderRadius: 14,
          padding: '8px 8px 6px',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.1)',
        }}>
          <CrtScreen label={block.gameTitle || 'Press to play'} />
        </div>

        {/* Bottom panel — speaker + controls side by side like a real TV */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 6px 6px',
        }}>
          {/* Speaker grille — horizontal slots */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 2.5,
            padding: '2px 0',
          }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{
                width: 48, height: 2, borderRadius: 1,
                backgroundColor: i % 2 === 0 ? '#a8a098' : '#b8b0a8',
                boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.15)',
              }} />
            ))}
          </div>

          {/* Brand label — embossed into plastic */}
          <div style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: 8, fontWeight: 700,
            color: '#8a8480',
            letterSpacing: 2,
            textTransform: 'uppercase',
            textShadow: '0 1px 0 rgba(255,255,255,0.3)',
          }}>
            lovepages
          </div>

          {/* Controls cluster — power LED + two knobs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {/* Power LED */}
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              backgroundColor: '#e83030',
              boxShadow: '0 0 4px rgba(232,48,48,0.5), 0 0 10px rgba(232,48,48,0.2)',
            }} />
            {/* Channel knob */}
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              background: 'linear-gradient(135deg, #b0a8a0, #888078)',
              border: '1.5px solid #6e6860',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25)',
              position: 'relative',
            }}>
              {/* Knob indicator line */}
              <div style={{
                position: 'absolute', top: 3, left: '50%',
                width: 1.5, height: 5, borderRadius: 1,
                backgroundColor: '#555',
                transform: 'translateX(-50%) rotate(20deg)',
                transformOrigin: 'bottom center',
              }} />
            </div>
            {/* Volume knob */}
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              background: 'linear-gradient(135deg, #b0a8a0, #888078)',
              border: '1.5px solid #6e6860',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: '50%',
                width: 1.5, height: 5, borderRadius: 1,
                backgroundColor: '#555',
                transform: 'translateX(-50%) rotate(-40deg)',
                transformOrigin: 'bottom center',
              }} />
            </div>
          </div>
        </div>
      </div>

    </button>
  )
}

/* ── Fullscreen game modal ─────────────────────────────────────────────────── */

function GameModal({ block, onClose }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Trigger the grow animation after mount
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setReady(true))
    })
    // Lock body scroll
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(8,6,16,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }} />

      {/* Content container — scales up from small */}
      <div style={{
        position: 'relative', zIndex: 1,
        transform: ready ? 'scale(1)' : 'scale(0.3)',
        opacity: ready ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
        width: '100%',
        maxWidth: 480,
        maxHeight: '100dvh',
        overflowY: 'auto',
        padding: '20px 12px',
      }}>
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'fixed', top: 16, right: 16,
            width: 36, height: 36, borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: 18, fontWeight: 300,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            zIndex: 10,
          }}
        >
          ✕
        </button>

        <GameWordleVariant block={block} />
      </div>
    </div>,
    document.body
  )
}

/* ── Main GameBlock ────────────────────────────────────────────────────────── */

export default function GameBlock({ block, isEditing, onChange }) {
  const [modalOpen, setModalOpen] = useState(false)

  if (isEditing) {
    return (
      <div className="space-y-3">
        {/* Word input */}
        <div>
          <label className="text-xs text-fg-muted mb-1 block">Secret word</label>
          <input
            className={inputClass}
            placeholder="e.g. HEART"
            value={block.word || ''}
            onChange={e => onChange({ word: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })}
            maxLength={8}
          />
          <p className="text-xs text-fg-faint mt-1">Letters only, 3–8 characters. Visitors will try to guess this!</p>
        </div>

        {/* Optional title */}
        <div>
          <label className="text-xs text-fg-muted mb-1 block">Title (optional)</label>
          <input
            className={inputClass}
            placeholder="e.g. Guess our song"
            value={block.gameTitle || ''}
            onChange={e => onChange({ gameTitle: e.target.value })}
          />
        </div>

        {/* Win message */}
        <div>
          <label className="text-xs text-fg-muted mb-1 block">Win message</label>
          <input
            className={inputClass}
            placeholder="You got it! 🎉"
            value={block.winMessage || ''}
            onChange={e => onChange({ winMessage: e.target.value })}
          />
        </div>

        {/* Lose message */}
        <div>
          <label className="text-xs text-fg-muted mb-1 block">Lose message</label>
          <input
            className={inputClass}
            placeholder="The word was:"
            value={block.loseMessage || ''}
            onChange={e => onChange({ loseMessage: e.target.value })}
          />
        </div>

        {/* TV preview */}
        <div>
          <p className="text-xs text-fg-muted mb-2">Preview</p>
          <div style={{ pointerEvents: 'none', opacity: 0.85, transform: 'scale(0.7)', transformOrigin: 'top center' }}>
            <CrtTvShell block={{ ...block, word: block.word || 'LOVE' }} onClick={() => {}} />
          </div>
        </div>
      </div>
    )
  }

  // Public / preview mode — show CRT TV, click to open game
  return (
    <>
      <CrtTvShell block={block} onClick={() => setModalOpen(true)} />
      {modalOpen && <GameModal block={block} onClose={() => setModalOpen(false)} />}
    </>
  )
}
