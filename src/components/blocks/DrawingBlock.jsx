import { useRef, useState, useEffect } from 'react'
import { X, Plus, Trash2, Pencil } from 'lucide-react'
import { nanoid } from 'nanoid'
import { inputClass } from '../../lib/theme'
import { supabase } from '../../lib/supabase'

// ── Animation keyframes ────────────────────────────────────────────────────────
const ANIM_STYLES = `
  @keyframes db-lightbox-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes db-img-in {
    from { transform: scale(0.6); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  @keyframes db-img-nav {
    from { transform: scale(0.88); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }
`
let _animStyleInjected = false
function ensureAnimStyles() {
  if (_animStyleInjected) return
  _animStyleInjected = true
  const el = document.createElement('style')
  el.textContent = ANIM_STYLES
  document.head.appendChild(el)
}

// ── Art supply SVGs (vertical, tip at top) ────────────────────────────────────
function BrushVertical() {
  return (
    <svg width="14" height="180" viewBox="0 0 14 180" fill="none">
      {/* Bristle tip */}
      <ellipse cx="7" cy="4" rx="2" ry="4" fill="#0e0b06" />
      {/* Bristle body */}
      <ellipse cx="7" cy="20" rx="5" ry="20" fill="#1a1208" />
      <ellipse cx="7" cy="16" rx="3.5" ry="14" fill="#2d2010" />
      {/* Bristle sheen */}
      <rect x="5" y="7" width="2" height="14" rx="1" fill="rgba(255,255,255,0.07)" />
      {/* Ferrule */}
      <rect x="2" y="37" width="10" height="15" rx="1" fill="#bdbdbd" />
      <rect x="2" y="37" width="10" height="5.5" rx="1" fill="#d8d8d8" />
      <rect x="2" y="46" width="10" height="2" fill="#a0a0a0" />
      <rect x="2" y="49" width="10" height="1.5" fill="#acacac" />
      {/* Handle */}
      <rect x="3.5" y="52" width="7" height="116" rx="3.5" fill="url(#dbBrH)" />
      <rect x="4.5" y="52" width="2.5" height="116" rx="1.25" fill="rgba(255,255,255,0.17)" />
      {/* Grain lines on handle */}
      <line x1="3.5" y1="80" x2="10.5" y2="82" stroke="rgba(0,0,0,0.07)" strokeWidth="0.8" />
      <line x1="3.5" y1="105" x2="10.5" y2="107" stroke="rgba(0,0,0,0.07)" strokeWidth="0.8" />
      <line x1="3.5" y1="130" x2="10.5" y2="132" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
      {/* End cap */}
      <rect x="3.5" y="163" width="7" height="17" rx="3.5" fill="#7a4820" />
      <rect x="4.5" y="165" width="3" height="8" rx="1.5" fill="rgba(255,255,255,0.1)" />
      <defs>
        <linearGradient id="dbBrH" x1="3.5" y1="0" x2="10.5" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0"    stopColor="#7a4e22" />
          <stop offset="0.3"  stopColor="#c48848" />
          <stop offset="0.65" stopColor="#d8a860" />
          <stop offset="1"    stopColor="#8b5828" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function PencilVertical() {
  return (
    <svg width="12" height="158" viewBox="0 0 12 158" fill="none">
      {/* Graphite point */}
      <polygon points="6,0 3,14 9,14" fill="#2a2a2a" />
      <polygon points="6,0 4.5,9 7.5,9" fill="#111" />
      {/* Sharpened wood cone */}
      <polygon points="3,14 0.5,28 11.5,28 9,14" fill="#deb887" />
      <polygon points="3,14 2.5,24 5.5,24 5,14" fill="rgba(255,255,255,0.18)" />
      {/* Yellow body */}
      <rect x="0.5" y="27" width="11" height="104" fill="url(#dbPcB)" />
      {/* Facet lines */}
      <line x1="0.5" y1="27" x2="0.5" y2="131" stroke="#e0b010" strokeWidth="0.8" />
      <line x1="3.5" y1="27" x2="3.5" y2="131" stroke="rgba(0,0,0,0.06)" strokeWidth="0.6" />
      <line x1="7.5" y1="27" x2="7.5" y2="131" stroke="rgba(0,0,0,0.06)" strokeWidth="0.6" />
      <line x1="11.5" y1="27" x2="11.5" y2="131" stroke="#e0b010" strokeWidth="0.8" />
      {/* Ferrule */}
      <rect x="0" y="130" width="12" height="13" fill="#c0c0c0" />
      <rect x="0" y="130" width="12" height="5" fill="#d8d8d8" />
      <rect x="0" y="137" width="12" height="2" fill="#a4a4a4" />
      <rect x="0" y="140" width="12" height="1.5" fill="#b0b0b0" />
      {/* Eraser */}
      <rect x="0.5" y="143" width="11" height="15" rx="1.5" fill="#f07878" />
      <rect x="0.5" y="143" width="5.5" height="15" rx="1" fill="rgba(255,255,255,0.2)" />
      <defs>
        <linearGradient id="dbPcB" x1="0.5" y1="0" x2="11.5" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0"   stopColor="#e8b800" />
          <stop offset="0.25" stopColor="#f7d040" />
          <stop offset="0.55" stopColor="#f5c518" />
          <stop offset="1"   stopColor="#d4a800" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function MarkerVertical() {
  return (
    <svg width="17" height="148" viewBox="0 0 17 148" fill="none">
      {/* Cap top — rounded */}
      <rect x="2" y="0" width="13" height="30" rx="4" fill="#1a3f7a" />
      <rect x="2" y="0" width="6" height="30" rx="4" fill="rgba(255,255,255,0.1)" />
      {/* Cap clip */}
      <rect x="11.5" y="4" width="3" height="30" rx="1.5" fill="#152e5c" />
      <rect x="12" y="4" width="1.5" height="30" rx="0.75" fill="rgba(255,255,255,0.08)" />
      {/* Cap / body join ridge */}
      <rect x="1" y="27" width="15" height="5" rx="2" fill="#1a3f7a" />
      {/* Body */}
      <rect x="1" y="30" width="15" height="102" rx="2" fill="url(#dbMkB)" />
      <rect x="1" y="30" width="5.5" height="102" rx="2" fill="rgba(255,255,255,0.12)" />
      {/* Label stripe */}
      <rect x="2.5" y="54" width="12" height="26" rx="1.5" fill="rgba(255,255,255,0.07)" />
      <rect x="4" y="59" width="9" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
      <rect x="4" y="64" width="7" height="2" rx="1" fill="rgba(255,255,255,0.1)" />
      <rect x="4" y="69" width="8" height="2" rx="1" fill="rgba(255,255,255,0.1)" />
      {/* Bottom end */}
      <rect x="1" y="128" width="15" height="20" rx="4" fill="#1a3a6e" />
      <rect x="1" y="128" width="6.5" height="20" rx="3" fill="rgba(255,255,255,0.07)" />
      <defs>
        <linearGradient id="dbMkB" x1="1" y1="0" x2="16" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0"    stopColor="#1d4ed8" />
          <stop offset="0.35" stopColor="#3b82f6" />
          <stop offset="0.65" stopColor="#2563eb" />
          <stop offset="1"    stopColor="#1e40af" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── Scattered paper preview ───────────────────────────────────────────────────
const PAPER_POSITIONS = [
  { left: '6%',  top: '16%', rot: -7, zIndex: 2, width: '33%' },
  { left: '31%', top:  '9%', rot:  5, zIndex: 3, width: '35%' },
  { left: '57%', top: '18%', rot: -4, zIndex: 2, width: '33%' },
]

function ScatteredPaper({ pos, drawing, shake, hovered }) {
  const shadow = pos.rot > 0
    ? '5px 7px 20px rgba(0,0,0,0.38)'
    : '-5px 7px 20px rgba(0,0,0,0.38)'
  return (
    <div style={{
      position: 'absolute',
      left: pos.left, top: pos.top, width: pos.width,
      zIndex: pos.zIndex,
      transform: `rotate(${pos.rot + shake}deg) translateY(${hovered ? -4 : 0}px) scale(${hovered ? 1.03 : 1})`,
      transformOrigin: 'center center',
      transition: 'transform 0.2s ease-out',
    }}>
      <div style={{
        background: '#f7f3ec',
        boxShadow: shadow,
        position: 'relative',
      }}>
        {drawing ? (
          <img src={drawing.src} alt={drawing.caption || ''}
            style={{ display: 'block', width: '100%', aspectRatio: '23/16', objectFit: 'cover', position: 'relative', zIndex: 1 }}
          />
        ) : (
          <div style={{
            width: '100%', aspectRatio: '23/16',
            border: '1.5px dashed rgba(180,170,150,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
          }}>
            <Pencil size={16} color="rgba(160,145,120,0.4)" />
          </div>
        )}
      </div>
    </div>
  )
}

// Each paper shakes with a slightly different magnitude and sign so they
// don't all move identically. Values are multipliers on the base shake.
const SHAKE_FACTORS = [1, -0.7, 0.9]

function getScrollParent(el) {
  if (!el || el === document.body) return window
  const { overflowY } = getComputedStyle(el)
  if (overflowY === 'auto' || overflowY === 'scroll') return el
  return getScrollParent(el.parentElement)
}

function PreviewView({ drawings, boardTitle, onClick }) {
  const [hovered, setHovered] = useState(false)
  const [shake, setShake] = useState(0)
  const containerRef = useRef(null)
  const shakeRef = useRef(0)
  const rafRef = useRef(null)
  const count = drawings.length

  useEffect(() => {
    const scrollEl = getScrollParent(containerRef.current)
    let lastY = scrollEl === window ? window.scrollY : scrollEl.scrollTop

    function decay() {
      shakeRef.current *= 0.80
      setShake(shakeRef.current)
      if (Math.abs(shakeRef.current) > 0.04) {
        rafRef.current = requestAnimationFrame(decay)
      } else {
        shakeRef.current = 0
        setShake(0)
      }
    }

    function onScroll() {
      const currentY = scrollEl === window ? window.scrollY : scrollEl.scrollTop
      const delta = currentY - lastY
      lastY = currentY
      shakeRef.current = Math.max(-6, Math.min(6, delta * 0.45))
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(decay)
    }

    scrollEl.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scrollEl.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={containerRef}
      style={{
        position: 'relative', width: '100%', height: 260,
        cursor: 'pointer', userSelect: 'none',
        borderRadius: 14,
        transition: 'border-color 0.2s',
      }}
    >
      {/* Art supplies — grouped on the right */}
      <div style={{ position: 'absolute', right: 14, bottom: 18, display: 'flex', alignItems: 'flex-end', gap: 7, pointerEvents: 'none', zIndex: 1 }}>
        <div style={{ transform: 'rotate(-4deg)', transformOrigin: 'bottom center' }}><BrushVertical /></div>
        <div style={{ transform: 'rotate(2deg)', transformOrigin: 'bottom center' }}><PencilVertical /></div>
        <div style={{ transform: 'rotate(-7deg)', transformOrigin: 'bottom center' }}><MarkerVertical /></div>
      </div>

      {/* Papers — lift slightly on hover */}
      {PAPER_POSITIONS.map((pos, i) => (
        <ScatteredPaper
          key={i} pos={pos} drawing={i === 1 ? null : (drawings[i < 1 ? i : i - 1] ?? null)}
          shake={shake * SHAKE_FACTORS[i]} hovered={hovered}
        />
      ))}

      {/* Board title */}
      {boardTitle && (
        <div style={{
          position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(30,38,52,0.82)', backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6, padding: '3px 12px',
          fontFamily: "'Caveat', cursive", fontSize: 16, fontWeight: 700,
          color: '#f3f4f6', whiteSpace: 'nowrap', zIndex: 9, pointerEvents: 'none',
        }}>
          {boardTitle}
        </div>
      )}

      {/* Always-visible CTA at the bottom */}
      <div style={{
        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9, pointerEvents: 'none',
        display: 'flex', alignItems: 'center', gap: 6,
        background: hovered ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(6px)',
        borderRadius: 20, padding: '5px 16px',
        boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.2)',
        fontFamily: "'Caveat', cursive", fontSize: 15, fontWeight: 700,
        color: '#1a202a',
        whiteSpace: 'nowrap',
        transition: 'background 0.2s, box-shadow 0.2s',
      }}>
        <Plus size={14} strokeWidth={2.5} />
        {count > 0 ? `See ${count} drawing${count === 1 ? '' : 's'}` : 'Start drawing'}
      </div>
    </div>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ drawings, index, onClose, onNav }) {
  const drawing = drawings[index]
  const hasPrev = index > 0
  const hasNext = index < drawings.length - 1
  const [animKey, setAnimKey] = useState(0)
  const isFirstRender = useRef(true)

  ensureAnimStyles()

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft'  && hasPrev) onNav(index - 1)
      if (e.key === 'ArrowRight' && hasNext) onNav(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, hasPrev, hasNext])

  // Bump animKey whenever index changes so the image re-animates
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setAnimKey(k => k + 1)
  }, [index])

  const imgAnim = animKey === 0
    ? 'db-img-in 0.28s cubic-bezier(0.34,1.56,0.64,1) both'
    : 'db-img-nav 0.18s ease both'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10010,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'db-lightbox-in 0.18s ease both',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16,
        width: 38, height: 38, borderRadius: '50%', border: 'none',
        background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <X size={18} />
      </button>

      {/* Prev */}
      {hasPrev && (
        <button onClick={() => onNav(index - 1)} style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer',
          fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>‹</button>
      )}

      {/* Next */}
      {hasNext && (
        <button onClick={() => onNav(index + 1)} style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer',
          fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>›</button>
      )}

      {/* Image */}
      <div
        key={`${index}-${animKey}`}
        style={{
          maxWidth: 'min(90vw, 800px)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 14,
          animation: imgAnim,
        }}
      >
        <img
          src={drawing.src}
          alt={drawing.caption || 'drawing'}
          style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 4, boxShadow: '0 8px 48px rgba(0,0,0,0.6)' }}
        />
        {drawing.caption && (
          <p style={{
            fontFamily: "'Caveat', cursive", fontSize: 20,
            color: 'rgba(255,255,255,0.8)', margin: 0, textAlign: 'center',
          }}>
            {drawing.caption}
          </p>
        )}
        {drawings.length > 1 && (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>
            {index + 1} / {drawings.length}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Gallery paper card ────────────────────────────────────────────────────────
function GalleryPaper({ drawing, onRemove, showRemove, onClick }) {
  const seed = (drawing.id ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rot = ((seed % 11) - 5) * 0.7
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{
      position: 'relative',
      transform: `rotate(${rot}deg) scale(${hovered ? 1.08 : 1})`,
      transformOrigin: 'center center',
      flexShrink: 0,
      transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {showRemove && (
        <button
          onClick={() => onRemove(drawing.id)}
          style={{
            position: 'absolute', top: -8, right: -8, zIndex: 10,
            width: 22, height: 22, borderRadius: '50%',
            background: '#e53e3e', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }}
        >
          <X size={12} />
        </button>
      )}

      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#f7f3ec',
          boxShadow: hovered
            ? `${rot > 0 ? 8 : -8}px 16px 36px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.25)`
            : `${rot > 0 ? 5 : -5}px 8px 24px rgba(0,0,0,0.32), 0 2px 6px rgba(0,0,0,0.16)`,
          width: 160,
          position: 'relative',
          cursor: 'zoom-in',
          transition: 'box-shadow 0.18s ease',
        }}
      >
        <img
          src={drawing.src}
          alt={drawing.caption || 'drawing'}
          style={{
            display: 'block', width: '100%',
            aspectRatio: '23/16', objectFit: 'cover',
          }}
        />
        {drawing.caption && (
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 13, color: '#4a3a28',
            margin: 0, padding: '5px 8px 7px',
            textAlign: 'center', lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {drawing.caption}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Drawing canvas ────────────────────────────────────────────────────────────
const PALETTE = ['#1c1c1c', '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce', '#805ad5', '#d53f8c', '#ffffff']
const BRUSH_SIZES = [2, 4, 8, 14]
const CANVAS_W = 460
const CANVAS_H = 300
const PAPER_BG = '#faf5e4'

function DrawingCanvas({ onSave, uploading }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#1c1c1c')
  const [brushSize, setBrushSize] = useState(4)
  const [tool, setTool] = useState('pen')
  const [caption, setCaption] = useState('')
  const lastPos = useRef(null)

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = PAPER_BG
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  }, [])

  function getPos(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches?.[0] ?? e
    return {
      x: (touch.clientX - rect.left) * (CANVAS_W / rect.width),
      y: (touch.clientY - rect.top) * (CANVAS_H / rect.height),
    }
  }

  function startDraw(e) {
    e.preventDefault()
    const pos = getPos(e)
    lastPos.current = pos
    setIsDrawing(true)
    const ctx = canvasRef.current.getContext('2d')
    const r = (tool === 'eraser' ? brushSize * 2.5 : brushSize) / 2
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
    ctx.fillStyle = tool === 'eraser' ? PAPER_BG : color
    ctx.fill()
  }

  function onDraw(e) {
    if (!isDrawing) return
    e.preventDefault()
    const pos = getPos(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = tool === 'eraser' ? PAPER_BG : color
    ctx.lineWidth = tool === 'eraser' ? brushSize * 2.5 : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
  }

  function stopDraw() {
    setIsDrawing(false)
    lastPos.current = null
  }

  function clearCanvas() {
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = PAPER_BG
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  }

  function handleSave() {
    canvasRef.current.toBlob(blob => onSave(blob, caption.trim()), 'image/png')
  }

  const isEraser = tool === 'eraser'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      {/* Canvas — floating paper sheet */}
      <div style={{
        background: PAPER_BG,
        border: '1px solid rgba(180,165,130,0.35)',
        boxShadow: '0 12px 48px rgba(0,0,0,0.6), 0 3px 10px rgba(0,0,0,0.3)',
        borderRadius: 2,
        padding: 2,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 2,
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, rgba(180,190,220,0.28) 23px, rgba(180,190,220,0.28) 24px)',
          backgroundPosition: '0 28px',
          pointerEvents: 'none', borderRadius: 1,
        }} />
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{
            width: '100%', display: 'block',
            cursor: isEraser ? 'cell' : 'crosshair',
            touchAction: 'none', userSelect: 'none',
            position: 'relative', zIndex: 1,
          }}
          onMouseDown={startDraw}
          onMouseMove={onDraw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={onDraw}
          onTouchEnd={stopDraw}
        />
      </div>

      {/* Floating glass toolbar */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14, padding: '10px 14px',
      }}>
        {/* Colors */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {PALETTE.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool('pen') }}
              style={{
                width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer', flexShrink: 0,
                border: color === c && !isEraser ? '3px solid #ff3131' : c === '#ffffff' ? '2px solid rgba(255,255,255,0.35)' : '2px solid transparent',
                transform: color === c && !isEraser ? 'scale(1.25)' : 'scale(1)',
                transition: 'transform 0.1s',
              }}
            />
          ))}
        </div>
        {/* Brush sizes */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {BRUSH_SIZES.map(s => (
            <button key={s} onClick={() => setBrushSize(s)}
              style={{
                width: Math.max(s + 8, 16), height: Math.max(s + 8, 16),
                borderRadius: '50%', flexShrink: 0,
                background: brushSize === s ? '#ff3131' : 'rgba(255,255,255,0.2)',
                border: 'none', cursor: 'pointer',
              }}
            />
          ))}
        </div>
        {/* Eraser + Clear */}
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          <button onClick={() => setTool(t => t === 'eraser' ? 'pen' : 'eraser')}
            style={{
              padding: '4px 10px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.12)',
              background: isEraser ? '#ff3131' : 'rgba(255,255,255,0.1)',
              color: '#f3f4f6', fontSize: 12, cursor: 'pointer',
            }}>
            Eraser
          </button>
          <button onClick={clearCanvas}
            style={{
              padding: '4px 10px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer',
            }}>
            Clear
          </button>
        </div>
      </div>

      {/* Caption */}
      <input
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '9px 14px',
          color: 'rgba(255,255,255,0.9)', fontSize: 14,
          width: '100%', boxSizing: 'border-box',
          fontFamily: "'Caveat', cursive",
          outline: 'none',
        }}
        placeholder="Add a caption (optional)…"
        value={caption}
        onChange={e => setCaption(e.target.value)}
      />

      {/* Save */}
      <button onClick={handleSave} disabled={uploading}
        style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none',
          fontWeight: 700, fontSize: 15,
          background: uploading ? 'rgba(255,255,255,0.12)' : 'linear-gradient(135deg, #e53e3e, #c0392b)',
          color: uploading ? 'rgba(255,255,255,0.45)' : '#fff',
          cursor: uploading ? 'not-allowed' : 'pointer',
          boxShadow: uploading ? 'none' : '0 4px 16px rgba(192,57,43,0.45)',
          transition: 'background 0.2s',
          fontFamily: "'Caveat', cursive",
        }}>
        {uploading ? 'Uploading…' : '📌 Pin to board'}
      </button>
    </div>
  )
}

// ── Gallery modal ─────────────────────────────────────────────────────────────
function GalleryModal({ drawings, boardTitle, isEditing, onClose, onAdd, onRemove, uploading, uploadError }) {
  const isEmpty = drawings.length === 0
  // Skip straight to draw if the board is empty and visitor can draw
  const [view, setView] = useState(isEmpty && onAdd ? 'draw' : 'gallery')
  const [lightboxIdx, setLightboxIdx] = useState(null)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(8,6,16,0.9)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget && !uploading) onClose() }}
    >
      {/* Floating close — always visible */}
      <button
        onClick={() => { if (!uploading) onClose() }}
        style={{
          position: 'fixed', top: 18, right: 18, zIndex: 10002,
          width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <X size={17} />
      </button>

      {view === 'gallery' ? (
        <>
          {/* Floating title */}
          <div style={{
            position: 'fixed', top: 22, left: '50%', transform: 'translateX(-50%)',
            zIndex: 10001, pointerEvents: 'none',
            fontFamily: "'Caveat', cursive", fontSize: 24, fontWeight: 700,
            color: 'rgba(255,255,255,0.88)',
            textShadow: '0 2px 18px rgba(0,0,0,0.7)',
            whiteSpace: 'nowrap',
          }}>
            {boardTitle || 'Drawing board'}
          </div>

          {/* Floating "Add yours" at top-left — always visible when drawing is allowed */}
          {onAdd && (
            <button
              onClick={() => setView('draw')}
              style={{
                position: 'fixed', top: 18, left: 18, zIndex: 10002,
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(229,62,62,0.92)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                color: '#fff', border: 'none', borderRadius: 20,
                padding: '8px 16px', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Caveat', cursive",
                boxShadow: '0 4px 16px rgba(192,57,43,0.5)',
              }}
            >
              <Plus size={14} /> Draw yours
            </button>
          )}

          {/* Papers — float directly on the backdrop */}
          <div
            onMouseDown={e => { if (e.target === e.currentTarget && !uploading) onClose() }}
            style={{
              position: 'absolute', inset: 0,
              overflowY: 'auto',
              display: 'flex', flexWrap: 'wrap',
              gap: '40px 44px', justifyContent: 'center', alignContent: 'flex-start',
              padding: '70px 48px 120px',
            }}
          >
            {isEmpty ? (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                minHeight: '55vh', gap: 18,
              }}>
                <p style={{
                  fontFamily: "'Caveat', cursive", fontSize: 22,
                  color: 'rgba(255,255,255,0.38)', margin: 0,
                }}>
                  No drawings yet
                </p>
                {onAdd && (
                  <button onClick={() => setView('draw')}
                    style={{
                      background: 'linear-gradient(135deg, #e53e3e, #c0392b)',
                      color: '#fff', border: 'none', borderRadius: 12,
                      padding: '11px 28px', fontSize: 16, fontWeight: 700,
                      cursor: 'pointer', fontFamily: "'Caveat', cursive",
                      boxShadow: '0 6px 20px rgba(192,57,43,0.45)',
                    }}>
                    ✏️ Be the first to draw!
                  </button>
                )}
              </div>
            ) : (
              drawings.map((d, i) => (
                <GalleryPaper key={d.id} drawing={d} showRemove={isEditing} onRemove={onRemove} onClick={() => setLightboxIdx(i)} />
              ))
            )}
          </div>

          {lightboxIdx !== null && (
            <Lightbox drawings={drawings} index={lightboxIdx} onClose={() => setLightboxIdx(null)} onNav={setLightboxIdx} />
          )}
        </>
      ) : (
        <>
          {/* Floating back button */}
          <button
            onClick={() => setView('gallery')}
            style={{
              position: 'fixed', top: 18, left: 18, zIndex: 10002,
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 20, padding: '8px 16px',
              color: 'rgba(255,255,255,0.8)', fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>

          {/* Floating title */}
          <div style={{
            position: 'fixed', top: 22, left: '50%', transform: 'translateX(-50%)',
            zIndex: 10001, pointerEvents: 'none',
            fontFamily: "'Caveat', cursive", fontSize: 22, fontWeight: 700,
            color: 'rgba(255,255,255,0.85)',
            textShadow: '0 2px 16px rgba(0,0,0,0.6)',
            whiteSpace: 'nowrap',
          }}>
            Draw yours
          </div>

          {/* Canvas — centered and floating */}
          <div style={{
            position: 'absolute', inset: 0, overflowY: 'auto',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '70px 20px 48px',
          }}>
            <div style={{ width: '100%', maxWidth: 520 }}>
              <DrawingCanvas onSave={onAdd} uploading={uploading} />
              {uploadError && (
                <p style={{ color: '#fc8181', fontSize: 12, margin: '10px 0 0', textAlign: 'center' }}>
                  {uploadError}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Windows XP / MS Paint variant ────────────────────────────────────────────
const XPC = '#ece9d8'
const XP_TITLE_GRAD = 'linear-gradient(to bottom, #4b9ee6 0%, #2e82d2 12%, #1e6ec4 50%, #165ab0 100%)'
const XP_WIN_OUTER = '#0c327a'
const XP_WIN_INNER = '#89b4f3'

function XPTitleBar({ title, onClose }) {
  return (
    <div style={{
      background: XP_TITLE_GRAD, height: 24,
      display: 'flex', alignItems: 'center', gap: 3, padding: '0 3px 0 5px',
      userSelect: 'none', flexShrink: 0,
    }}>
      <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>🎨</span>
      <span style={{
        flex: 1, color: '#fff', fontSize: 11, fontWeight: 700,
        fontFamily: 'Tahoma, "Segoe UI", Arial, sans-serif',
        textShadow: '0 1px 2px rgba(0,0,0,0.45)',
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
      }}>
        {title} - Paint
      </span>
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        {['—', '❐'].map(s => (
          <button key={s} style={{
            width: 21, height: 19, padding: 0, cursor: 'default',
            background: 'linear-gradient(to bottom, #d4ccbe, #b0a898)',
            border: '1px solid', borderColor: '#d0c8bc #5c5450 #5c5450 #d0c8bc',
            color: '#000', fontSize: 9, fontFamily: 'Tahoma, sans-serif', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{s}</button>
        ))}
        <button onClick={onClose} style={{
          width: 21, height: 19, padding: 0, cursor: 'pointer',
          background: 'linear-gradient(to bottom, #e88, #c03)',
          border: '1px solid', borderColor: '#faa #801010 #801010 #faa',
          color: '#fff', fontSize: 10, fontWeight: 900,
          fontFamily: 'Tahoma, sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      </div>
    </div>
  )
}

function XPMenuBar({ onAddYours, showAdd }) {
  return (
    <div style={{
      background: XPC, height: 20,
      display: 'flex', alignItems: 'center',
      borderBottom: '1px solid #b4ada4',
      fontFamily: 'Tahoma, "Segoe UI", Arial, sans-serif', fontSize: 11,
      userSelect: 'none', flexShrink: 0,
    }}>
      {['File', 'Edit', 'View', 'Image', 'Colors', 'Help'].map(m => (
        <span key={m} style={{ padding: '1px 7px', cursor: 'default' }}>{m}</span>
      ))}
      {showAdd && (
        <button onClick={onAddYours} style={{
          marginLeft: 'auto', marginRight: 4,
          background: XPC,
          border: '1px solid', borderColor: '#fff #808080 #808080 #fff',
          fontFamily: 'Tahoma, sans-serif', fontSize: 11,
          padding: '0 8px', height: 17, cursor: 'pointer', color: '#000',
        }}>
          Add yours…
        </button>
      )}
    </div>
  )
}

const XP_TOOL_IDS = ['freesel','select','eraser','fill','eyedrop','zoom','pencil','brush','airbrush','text','line','curve','rect','poly','ellipse','rrect']
const XP_TOOL_LABELS = { freesel:'Free Select',select:'Rectangle Select',eraser:'Eraser',fill:'Fill',eyedrop:'Pick Color',zoom:'Zoom',pencil:'Pencil',brush:'Brush',airbrush:'Airbrush',text:'Text',line:'Line',curve:'Curve',rect:'Rectangle',poly:'Polygon',ellipse:'Ellipse',rrect:'Rounded Rect' }

function XPToolIcon({ id }) {
  const p = { width: 14, height: 14, viewBox: '0 0 14 14' }
  switch (id) {
    case 'freesel':  return <svg {...p}><path d="M2,8 Q2,2 7,2 Q12,2 12,7 Q12,12 7,12 Q2,12 2,8Z" fill="none" stroke="#000" strokeWidth="1" strokeDasharray="2,1.5"/></svg>
    case 'select':   return <svg {...p}><rect x="1" y="1" width="12" height="12" fill="none" stroke="#000" strokeWidth="1" strokeDasharray="2,1.5"/></svg>
    case 'eraser':   return <svg {...p}><rect x="2" y="5" width="8" height="6" rx="1" fill="#f88" stroke="#000" strokeWidth="0.7"/><rect x="10" y="5" width="2" height="6" rx="0.5" fill="#faa"/><line x1="1" y1="11" x2="13" y2="11" stroke="#000" strokeWidth="0.8"/></svg>
    case 'fill':     return <svg {...p}><path d="M3,10 L3,4 L8,4 L8,7 L5,7 L5,10Z" fill="#ffd700" stroke="#000" strokeWidth="0.7"/><path d="M9,9 Q11,8 12,10 Q13,12 11,12.5 Q9,13 9,11Z" fill="#333" stroke="#000" strokeWidth="0.5"/><line x1="8.5" y1="8.5" x2="10.5" y2="6.5" stroke="#333" strokeWidth="1"/></svg>
    case 'eyedrop':  return <svg {...p}><path d="M10,1 L12,3 L6,9 L4,11 L2,12 L3,10 L5,8Z" fill="#9966ff" stroke="#000" strokeWidth="0.6"/><circle cx="3" cy="11" r="1.5" fill="#9966ff"/></svg>
    case 'zoom':     return <svg {...p}><circle cx="6" cy="5.5" r="3.5" fill="none" stroke="#000" strokeWidth="1.2"/><line x1="8.5" y1="8.5" x2="12.5" y2="12.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/><line x1="4" y1="5.5" x2="8" y2="5.5" stroke="#000" strokeWidth="1"/><line x1="6" y1="3.5" x2="6" y2="7.5" stroke="#000" strokeWidth="1"/></svg>
    case 'pencil':   return <svg {...p}><path d="M10,1 L13,4 L5,12 L2,13 L3,10Z" fill="#ffee00" stroke="#000" strokeWidth="0.7"/><path d="M10,1 L13,4 L12.5,4.5 L9.5,1.5Z" fill="#c0c0c0"/><path d="M3,10 L4,11 L2,13Z" fill="#333"/></svg>
    case 'brush':    return <svg {...p}><path d="M9,1 L12,4 L7,9 L5,8Z" fill="none" stroke="#000" strokeWidth="1.2"/><ellipse cx="4.5" cy="10.5" rx="2.2" ry="2.8" fill="#8844cc" transform="rotate(-20,4.5,10.5)" stroke="#000" strokeWidth="0.5"/></svg>
    case 'airbrush': return <svg {...p}><ellipse cx="5" cy="7.5" rx="2.5" ry="3" fill="#ddd" stroke="#000" strokeWidth="0.8"/><line x1="7.5" y1="7.5" x2="12" y2="7.5" stroke="#000" strokeWidth="1.2"/><circle cx="4" cy="3" r="0.7" fill="#000"/><circle cx="7" cy="2" r="0.7" fill="#000"/><circle cx="9" cy="4.5" r="0.7" fill="#000"/><circle cx="3" cy="11.5" r="0.7" fill="#000"/><circle cx="9" cy="11" r="0.7" fill="#000"/></svg>
    case 'text':     return <svg {...p}><text x="1" y="12" fontFamily="serif" fontSize="13" fontWeight="bold" fill="#000">A</text></svg>
    case 'line':     return <svg {...p}><line x1="2" y1="12" x2="12" y2="2" stroke="#000" strokeWidth="1.5"/></svg>
    case 'curve':    return <svg {...p}><path d="M2,12 Q7,-2 12,12" fill="none" stroke="#000" strokeWidth="1.5"/></svg>
    case 'rect':     return <svg {...p}><rect x="2" y="3" width="10" height="8" fill="none" stroke="#000" strokeWidth="1.3"/></svg>
    case 'poly':     return <svg {...p}><polygon points="7,1 13,6 11,13 3,13 1,6" fill="none" stroke="#000" strokeWidth="1.3"/></svg>
    case 'ellipse':  return <svg {...p}><ellipse cx="7" cy="7" rx="5.5" ry="4" fill="none" stroke="#000" strokeWidth="1.3"/></svg>
    case 'rrect':    return <svg {...p}><rect x="2" y="3" width="10" height="8" rx="2.5" fill="none" stroke="#000" strokeWidth="1.3"/></svg>
    default: return null
  }
}

function XPToolbox({ activeTool, onTool }) {
  return (
    <div style={{
      width: 50, background: XPC,
      borderRight: '1px solid #b4ada4',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '4px 2px',
      flexShrink: 0,
    }}>
      <div style={{ border: '1px solid', borderColor: '#808080 #fff #fff #808080', padding: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          {XP_TOOL_IDS.map(id => (
            <button key={id} onClick={() => onTool(id)} title={XP_TOOL_LABELS[id]} style={{
              width: 20, height: 20, padding: 0, cursor: 'default',
              background: activeTool === id ? 'linear-gradient(to br, #aab8d0, #8898b8)' : XPC,
              border: '1px solid',
              borderColor: activeTool === id ? '#808080 #fff #fff #808080' : '#fff #808080 #808080 #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxSizing: 'border-box',
            }}>
              <XPToolIcon id={id} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const XP_PALETTE_COLORS = [
  '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080',
  '#c0c0c0','#ffffff','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff',
  '#ff8040','#804000','#ff8080','#ffff80','#80ff80','#80ffff','#8080ff','#ff80ff',
  '#ff6600','#666600','#663300','#003300','#003366','#0066ff','#660099','#993366',
]

function XPColorPalette({ activeColor, onColor }) {
  return (
    <div style={{
      background: XPC, borderTop: '1px solid #b4ada4',
      padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
    }}>
      <div style={{ border: '1px solid', borderColor: '#808080 #fff #fff #808080', padding: 2, background: XPC, flexShrink: 0 }}>
        <div style={{ width: 16, height: 16, background: activeColor, border: '1px solid #000' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 13px)', gap: '1px' }}>
        {XP_PALETTE_COLORS.map(c => (
          <button key={c} onClick={() => onColor(c)} title={c} style={{
            width: 13, height: 13, padding: 0, background: c, flexShrink: 0,
            border: '1px solid', borderColor: '#808080 #fff #fff #808080',
            cursor: 'default', boxSizing: 'border-box',
            outline: activeColor === c ? '1px solid #000' : 'none', outlineOffset: -1,
          }} />
        ))}
      </div>
    </div>
  )
}

function XPStatusBar({ children }) {
  return (
    <div style={{
      background: XPC, borderTop: '1px solid #b4ada4',
      padding: '1px 6px', display: 'flex', alignItems: 'center',
      fontFamily: 'Tahoma, "Segoe UI", Arial, sans-serif', fontSize: 11,
      color: '#000', minHeight: 20, flexShrink: 0,
    }}>
      <span style={{
        borderRight: '1px solid #808080', paddingRight: 8, marginRight: 4,
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: 1,
      }}>
        {children}
      </span>
    </div>
  )
}

function XPThumb({ drawing, onRemove, showRemove, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: 90 }}>
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border: hovered ? '2px solid #0a246a' : '1px solid #a0a0a0',
          padding: hovered ? 1 : 2,
          background: '#fff', position: 'relative', cursor: 'zoom-in',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1), border 0.1s, padding 0.1s',
          boxShadow: hovered ? '0 4px 14px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        <img src={drawing.src} alt={drawing.caption || ''} style={{ width: 82, height: 60, objectFit: 'cover', display: 'block' }} />
        {showRemove && (
          <button onClick={e => { e.stopPropagation(); onRemove(drawing.id) }} style={{
            position: 'absolute', top: -5, right: -5, width: 14, height: 14, borderRadius: '50%',
            background: '#cc0000', border: '1px solid #800000', cursor: 'pointer',
            color: '#fff', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
          }}>
            <X size={7} />
          </button>
        )}
      </div>
      {drawing.caption && (
        <span style={{
          fontFamily: 'Tahoma, sans-serif', fontSize: 10, color: '#000',
          textAlign: 'center', width: '100%',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {drawing.caption}
        </span>
      )}
    </div>
  )
}

function PreviewViewXP({ drawings, boardTitle, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `2px solid ${XP_WIN_OUTER}`,
        outline: `1px solid ${XP_WIN_INNER}`, outlineOffset: -3,
        display: 'flex', flexDirection: 'column',
        boxShadow: '3px 3px 14px rgba(0,0,0,0.55)',
        cursor: 'pointer', userSelect: 'none',
      }}
    >
      <XPTitleBar title={boardTitle || 'untitled'} onClose={() => {}} />
      <XPMenuBar showAdd={false} />
      <div style={{ display: 'flex', background: XPC, height: 156 }}>
        <XPToolbox activeTool="pencil" onTool={() => {}} />
        <div style={{ flex: 1, background: '#808080', padding: 4, overflow: 'hidden' }}>
          <div style={{ background: '#fff', width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            {drawings.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: 5 }}>
                {drawings.slice(0, 8).map(d => {
                  const seed = (d.id ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
                  const rot = ((seed % 7) - 3) * 1.2
                  return (
                    <div key={d.id} style={{ transform: `rotate(${rot}deg)`, boxShadow: '1px 2px 5px rgba(0,0,0,0.2)', flexShrink: 0 }}>
                      <img src={d.src} alt="" style={{ width: 56, height: 40, objectFit: 'cover', display: 'block' }} />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 22, opacity: 0.12 }}>🎨</span>
                <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 10, color: '#808080' }}>Click to start</span>
              </div>
            )}
            {hovered && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,68,148,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  background: 'rgba(14,68,148,0.92)', color: '#fff',
                  padding: '3px 14px', fontFamily: 'Tahoma, sans-serif', fontSize: 11,
                  border: '1px solid #adc8ff',
                }}>
                  {drawings.length > 0 ? `View ${drawings.length} drawing${drawings.length === 1 ? '' : 's'}` : 'Open Paint'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <XPColorPalette activeColor="#000000" onColor={() => {}} />
      <XPStatusBar>
        {drawings.length > 0 ? `${drawings.length} drawing${drawings.length === 1 ? '' : 's'}` : 'For Help, click Help Topics on the Help Menu.'}
      </XPStatusBar>
    </div>
  )
}

function GalleryModalXP({ drawings, boardTitle, isEditing, onClose, onAdd, onRemove, uploading, uploadError }) {
  const isEmpty = drawings.length === 0
  const [view, setView] = useState(isEmpty && onAdd ? 'draw' : 'gallery')
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [activeTool, setActiveTool] = useState('pencil')
  const [activeColor, setActiveColor] = useState('#000000')
  const [isDrawing, setIsDrawing] = useState(false)
  const [caption, setCaption] = useState('')
  const canvasRef = useRef(null)
  const lastPos = useRef(null)

  useEffect(() => {
    if (view !== 'draw' || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    setCaption('')
  }, [view])

  function getPos(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches?.[0] ?? e
    return {
      x: (touch.clientX - rect.left) * (CANVAS_W / rect.width),
      y: (touch.clientY - rect.top) * (CANVAS_H / rect.height),
    }
  }

  const drawSize = activeTool === 'brush' ? 9 : activeTool === 'eraser' ? 16 : 3

  function startDraw(e) {
    e.preventDefault()
    if (!['pencil','brush','eraser'].includes(activeTool)) return
    const pos = getPos(e)
    lastPos.current = pos
    setIsDrawing(true)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, drawSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = activeTool === 'eraser' ? '#ffffff' : activeColor
    ctx.fill()
  }

  function onDrawMove(e) {
    if (!isDrawing) return
    e.preventDefault()
    const pos = getPos(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = activeTool === 'eraser' ? '#ffffff' : activeColor
    ctx.lineWidth = drawSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
  }

  function stopDraw() { setIsDrawing(false); lastPos.current = null }

  function clearCanvas() {
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  }

  function handleSave() {
    canvasRef.current.toBlob(blob => onAdd(blob, caption.trim()), 'image/png')
  }

  const cursorForTool = activeTool === 'eraser' ? 'cell' : ['pencil','brush'].includes(activeTool) ? 'crosshair' : 'default'

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,14,50,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onMouseDown={e => { if (e.target === e.currentTarget && !uploading) onClose() }}
    >
      <div style={{
        border: `2px solid ${XP_WIN_OUTER}`,
        outline: `1px solid ${XP_WIN_INNER}`, outlineOffset: -3,
        display: 'flex', flexDirection: 'column',
        width: '100%', maxWidth: 780,
        maxHeight: '90vh',
        boxShadow: '5px 5px 28px rgba(0,0,0,0.75)',
      }}>
        <XPTitleBar
          title={view === 'draw' ? 'New Drawing' : (boardTitle || 'untitled')}
          onClose={() => { if (!uploading) onClose() }}
        />
        <XPMenuBar showAdd={!!onAdd && view === 'gallery'} onAddYours={() => setView('draw')} />

        {/* Main area */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          <XPToolbox activeTool={activeTool} onTool={setActiveTool} />
          <div style={{ flex: 1, background: '#808080', padding: 6, overflow: 'hidden', display: 'flex' }}>
            {view === 'gallery' ? (
              <div style={{
                background: '#fff', flex: 1, overflowY: 'auto', padding: 16,
                display: 'flex', flexWrap: 'wrap', gap: '24px 20px',
                justifyContent: 'flex-start', alignContent: 'flex-start',
              }}>
                {isEmpty ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, gap: 10, width: '100%' }}>
                    <span style={{ fontSize: 36, opacity: 0.15 }}>🎨</span>
                    <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, color: '#808080' }}>Canvas is empty</span>
                    {isEditing && (
                      <button onClick={() => setView('draw')} style={{
                        background: XPC, border: '1px solid', borderColor: '#fff #808080 #808080 #fff',
                        fontFamily: 'Tahoma, sans-serif', fontSize: 11, padding: '4px 14px', cursor: 'pointer', color: '#000',
                      }}>
                        ✏️ New Drawing…
                      </button>
                    )}
                  </div>
                ) : (
                  drawings.map((d, i) => (
                    <XPThumb key={d.id} drawing={d} showRemove={isEditing} onRemove={onRemove} onClick={() => setLightboxIdx(i)} />
                  ))
                )}
              </div>
            ) : (
              <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                <div style={{ padding: 4, flexShrink: 0 }}>
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_W} height={CANVAS_H}
                    style={{ display: 'block', width: '100%', cursor: cursorForTool, touchAction: 'none', userSelect: 'none' }}
                    onMouseDown={startDraw} onMouseMove={onDrawMove} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                    onTouchStart={startDraw} onTouchMove={onDrawMove} onTouchEnd={stopDraw}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Draw controls strip */}
        {view === 'draw' && (
          <div style={{
            background: XPC, borderTop: '1px solid #b4ada4', borderBottom: '1px solid #b4ada4',
            padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
          }}>
            <button onClick={() => setView('gallery')} style={{
              background: XPC, border: '1px solid', borderColor: '#fff #808080 #808080 #fff',
              fontFamily: 'Tahoma, sans-serif', fontSize: 11, padding: '2px 10px', cursor: 'pointer', color: '#000',
            }}>← Gallery</button>
            <button onClick={clearCanvas} style={{
              background: XPC, border: '1px solid', borderColor: '#fff #808080 #808080 #fff',
              fontFamily: 'Tahoma, sans-serif', fontSize: 11, padding: '2px 10px', cursor: 'pointer', color: '#000',
            }}>Clear</button>
            <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, marginLeft: 4 }}>Caption:</span>
            <input
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="(optional)"
              style={{
                flex: 1, border: '1px solid', borderColor: '#808080 #fff #fff #808080',
                background: '#fff', fontFamily: 'Tahoma, sans-serif', fontSize: 11,
                padding: '1px 4px', outline: 'none', color: '#000',
              }}
            />
            <button onClick={handleSave} disabled={uploading} style={{
              background: uploading ? '#c0bdb4' : XPC,
              border: '1px solid', borderColor: '#fff #808080 #808080 #fff',
              fontFamily: 'Tahoma, sans-serif', fontSize: 11, padding: '2px 12px',
              cursor: uploading ? 'default' : 'pointer', color: '#000', fontWeight: 700,
            }}>
              {uploading ? 'Saving…' : '📌 Save'}
            </button>
          </div>
        )}

        <XPColorPalette activeColor={activeColor} onColor={c => { setActiveColor(c); setActiveTool('pencil') }} />
        <XPStatusBar>
          {view === 'gallery'
            ? (isEmpty ? 'For Help, click Help Topics on the Help Menu.' : `${drawings.length} drawing${drawings.length === 1 ? '' : 's'}`)
            : (uploading ? 'Saving drawing…' : `${CANVAS_W} × ${CANVAS_H} pixels`)}
        </XPStatusBar>
        {uploadError && view === 'draw' && (
          <div style={{
            background: '#ffffc0', border: '1px solid #808080', padding: '3px 10px',
            fontFamily: 'Tahoma, sans-serif', fontSize: 11, color: '#c00', flexShrink: 0,
          }}>
            ⚠️ {uploadError}
          </div>
        )}
      </div>
      {lightboxIdx !== null && (
        <Lightbox drawings={drawings} index={lightboxIdx} onClose={() => setLightboxIdx(null)} onNav={setLightboxIdx} />
      )}
    </div>
  )
}

// ── Main block component ──────────────────────────────────────────────────────
const PIN_COLORS = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#e67e22', '#16a085', '#e91e8c', '#f39c12']

export default function DrawingBlock({ block, isEditing, onChange }) {
  const { boardTitle = '', variant = 'default' } = block

  // Own local drawing state so public visitors see their drawing immediately
  // and the draw button is always available regardless of onChange availability
  const [drawings, setDrawings] = useState(block.drawings || [])
  useEffect(() => { setDrawings(block.drawings || []) }, [block.drawings])

  const [galleryOpen, setGalleryOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  async function addDrawing(blob, caption) {
    setUploading(true)
    setUploadError(null)
    try {
      const path = `images/drawing-${Date.now()}.png`
      const { error } = await supabase.storage.from('lovepages').upload(path, blob, { contentType: 'image/png' })
      if (error) throw error
      const { data } = supabase.storage.from('lovepages').getPublicUrl(path)
      const id = nanoid()
      const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
      const newDrawing = { id, src: data.publicUrl, caption, pinColor: PIN_COLORS[seed % PIN_COLORS.length] }
      const next = [...drawings, newDrawing]
      setDrawings(next)                    // always update local state
      onChange?.({ drawings: next })        // persist if editor; RPC if public (PublicPage provides onChange)
    } catch (err) {
      console.error('Drawing upload failed:', err.message)
      setUploadError('Upload failed — please try again.')
    } finally {
      setUploading(false)
    }
  }

  function removeDrawing(id) {
    const next = drawings.filter(d => d.id !== id)
    setDrawings(next)
    onChange?.({ drawings: next })
  }

  const sharedModalProps = {
    drawings, boardTitle,
    onClose: () => setGalleryOpen(false),
    onAdd: addDrawing,
    uploading, uploadError,
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <input
          className={inputClass}
          placeholder="Board title (optional)…"
          value={boardTitle}
          onChange={e => onChange({ boardTitle: e.target.value })}
        />

        {/* Variant picker */}
        <div className="grid grid-cols-2 gap-2">
          {[{ v: 'default', label: 'Default' }, { v: 'xp', label: '🖥 MS Paint' }].map(({ v, label }) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ variant: v })}
              className={`py-1.5 rounded-lg border-2 text-sm transition ${
                variant === v
                  ? 'border-primary bg-primary/10 text-primary-dim font-medium'
                  : 'border-overlay bg-surface text-fg-muted hover:border-subtle'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {variant === 'xp' ? (
          <PreviewViewXP drawings={drawings} boardTitle={boardTitle} onClick={() => setGalleryOpen(true)} />
        ) : (
          <PreviewView drawings={drawings} boardTitle={boardTitle} onClick={() => setGalleryOpen(true)} />
        )}

        {galleryOpen && (variant === 'xp'
          ? <GalleryModalXP {...sharedModalProps} isEditing onRemove={removeDrawing} />
          : <GalleryModal {...sharedModalProps} isEditing onRemove={removeDrawing} />
        )}
      </div>
    )
  }

  // Public view — onAdd is always provided; visitors can always draw
  return (
    <>
      {variant === 'xp' ? (
        <PreviewViewXP drawings={drawings} boardTitle={boardTitle} onClick={() => setGalleryOpen(true)} />
      ) : (
        <PreviewView drawings={drawings} boardTitle={boardTitle} onClick={() => setGalleryOpen(true)} />
      )}
      {galleryOpen && (variant === 'xp'
        ? <GalleryModalXP {...sharedModalProps} isEditing={false} onRemove={null} />
        : <GalleryModal {...sharedModalProps} isEditing={false} onRemove={null} />
      )}
    </>
  )
}
