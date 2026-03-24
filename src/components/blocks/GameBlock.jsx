import { useState, useRef, useCallback, useEffect } from 'react'
import { inputClass } from '../../lib/theme'
import GameWordleVariant from './game/GameWordleVariant'

/* ── CRT TV shell (resting state) ──────────────────────────────────────────── */

const TV_BEZEL = '#1a1a1e'
const TV_BODY  = '#232328'
const TV_LIGHT = '#3a3a40'
const TV_EDGE  = '#111114'

function CrtScreen({ label, isOn }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      paddingBottom: '66%',
      overflow: 'hidden',
      borderRadius: 8,
      background: isOn ? 'radial-gradient(ellipse at center, #1a2a1a 0%, #0a0f0a 80%)' : '#0a0a0c',
      boxShadow: isOn
        ? 'inset 0 0 60px rgba(80,200,80,0.08), inset 0 0 20px rgba(0,0,0,0.5)'
        : 'inset 0 0 30px rgba(0,0,0,0.6)',
    }}>
      {/* Convex glass highlight */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 55% at 40% 35%, rgba(255,255,255,0.07) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Screen content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 2,
      }}>
        {isOn ? (
          <>
            {/* Static noise canvas (subtle) */}
            <CrtNoise />
            {/* Title / prompt */}
            <div style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: 13, fontWeight: 700,
              color: '#5aff5a',
              textShadow: '0 0 8px rgba(90,255,90,0.6), 0 0 20px rgba(90,255,90,0.3)',
              textTransform: 'uppercase',
              letterSpacing: 3,
              textAlign: 'center',
              padding: '0 20px',
              zIndex: 3,
              animation: 'crt-blink 1.2s ease-in-out infinite',
            }}>
              {label || 'Press to play'}
            </div>
            {/* Blinking cursor */}
            <div style={{
              width: 10, height: 2,
              backgroundColor: '#5aff5a',
              boxShadow: '0 0 6px rgba(90,255,90,0.8)',
              marginTop: 8,
              animation: 'crt-blink 1s step-end infinite',
              zIndex: 3,
            }} />
          </>
        ) : (
          <div style={{
            width: 3, height: 3, borderRadius: '50%',
            backgroundColor: '#333',
          }} />
        )}
      </div>

      {/* Edge vignette for convex effect */}
      <div style={{
        position: 'absolute', inset: 0,
        boxShadow: 'inset 0 0 40px 15px rgba(0,0,0,0.5)',
        borderRadius: 8,
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
      if (frame % 4 !== 0) { rafRef.current = requestAnimationFrame(draw); return }
      const imgData = ctx.createImageData(120, 80)
      for (let i = 0; i < imgData.data.length; i += 4) {
        const v = Math.random() * 20
        imgData.data[i] = v
        imgData.data[i+1] = v + Math.random() * 8
        imgData.data[i+2] = v
        imgData.data[i+3] = 18
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
        opacity: 0.5,
        pointerEvents: 'none',
        imageRendering: 'pixelated',
      }}
    />
  )
}

function CrtTvShell({ block, onClick }) {
  const [hover, setHover] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: 'pointer', userSelect: 'none', maxWidth: 420, margin: '0 auto' }}
    >
      {/* Outer body */}
      <div style={{
        position: 'relative',
        background: `linear-gradient(170deg, ${TV_LIGHT} 0%, ${TV_BODY} 25%, ${TV_BEZEL} 60%, ${TV_EDGE} 100%)`,
        borderRadius: 18,
        padding: '18px 18px 12px',
        boxShadow: hover
          ? '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 6px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        transform: hover ? 'scale(1.015)' : 'scale(1)',
      }}>
        {/* Inner bezel */}
        <div style={{
          border: '3px solid #0c0c0e',
          borderRadius: 10,
          padding: 4,
          backgroundColor: '#0e0e10',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
        }}>
          <CrtScreen label={block.gameTitle || 'Press to play'} isOn={true} />
        </div>

        {/* Bottom bar: speaker grille + power LED + brand */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 8px 2px',
        }}>
          {/* Speaker grille */}
          <div style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                width: 2, height: 12, borderRadius: 1,
                backgroundColor: i % 2 === 0 ? '#2a2a2e' : '#1e1e22',
              }} />
            ))}
          </div>

          {/* Brand label */}
          <div style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: 9, fontWeight: 600,
            color: '#555',
            letterSpacing: 2.5,
            textTransform: 'uppercase',
          }}>
            lovepages
          </div>

          {/* Power LED + channel knob */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              backgroundColor: '#3ade3a',
              boxShadow: '0 0 6px rgba(58,222,58,0.6), 0 0 12px rgba(58,222,58,0.3)',
            }} />
            {/* Volume dial */}
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: 'linear-gradient(145deg, #3a3a3e, #222226)',
              border: '1px solid #444',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 2, left: '50%',
                width: 1.5, height: 4, borderRadius: 1,
                backgroundColor: '#666',
                transform: 'translateX(-50%) rotate(-30deg)',
                transformOrigin: 'bottom center',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Feet / stand */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 100, marginTop: -2 }}>
        <div style={{
          width: 40, height: 6,
          background: `linear-gradient(to bottom, ${TV_BODY}, ${TV_EDGE})`,
          borderRadius: '0 0 6px 6px',
        }} />
        <div style={{
          width: 40, height: 6,
          background: `linear-gradient(to bottom, ${TV_BODY}, ${TV_EDGE})`,
          borderRadius: '0 0 6px 6px',
        }} />
      </div>

      <style>{`
        @keyframes crt-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
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

  return (
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
    </div>
  )
}

/* ── Main GameBlock ────────────────────────────────────────────────────────── */

export default function GameBlock({ block, isEditing, onChange }) {
  const [modalOpen, setModalOpen] = useState(false)

  const handleOpen = useCallback(() => {
    if (block.word) setModalOpen(true)
  }, [block.word])

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
      <CrtTvShell block={block} onClick={handleOpen} />
      {modalOpen && <GameModal block={block} onClose={() => setModalOpen(false)} />}
    </>
  )
}
