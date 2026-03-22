import { useRef, useState, useEffect } from 'react'
import { X, Plus, Trash2, Pencil } from 'lucide-react'
import { nanoid } from 'nanoid'
import { inputClass } from '../../lib/theme'
import { supabase } from '../../lib/supabase'

// ── Art material SVGs ─────────────────────────────────────────────────────────
function PencilSVG({ style }) {
  return (
    <svg width="140" height="22" viewBox="0 0 140 22" fill="none" style={style}>
      {/* Body */}
      <rect x="14" y="6" width="108" height="10" fill="#f5c518" />
      <rect x="14" y="6" width="108" height="3.5" fill="#f7d645" opacity="0.5" />
      {/* Side facet lines */}
      <line x1="14" y1="11" x2="122" y2="11" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
      {/* Tip wood */}
      <polygon points="14,6 14,16 4,11" fill="#e8d098" />
      <polygon points="14,6 14,16 4,11" fill="url(#woodGrad)" />
      {/* Graphite */}
      <polygon points="4,11 8,9 8,13" fill="#444" />
      <polygon points="4,11 7,10 7,12" fill="#222" />
      {/* Ferrule */}
      <rect x="122" y="6" width="7" height="10" fill="#c0c0c0" />
      <rect x="122" y="6" width="7" height="3" fill="#d8d8d8" />
      {/* Eraser */}
      <rect x="129" y="6.5" width="11" height="9" rx="2" fill="#f0a0a0" />
      <rect x="129" y="6.5" width="11" height="3.5" rx="1" fill="#f5bcbc" />
      <defs>
        <linearGradient id="woodGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d4a855" />
          <stop offset="1" stopColor="#e8d098" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function BrushSVG({ style }) {
  return (
    <svg width="120" height="20" viewBox="0 0 120 20" fill="none" style={style}>
      {/* Handle */}
      <rect x="22" y="7" width="90" height="6" rx="3" fill="#c4956a" />
      <rect x="22" y="7" width="90" height="2" rx="1" fill="rgba(255,255,255,0.28)" />
      {/* End cap */}
      <circle cx="113" cy="10" r="4" fill="#a07040" />
      <circle cx="113" cy="9" r="2" fill="rgba(255,255,255,0.18)" />
      {/* Ferrule */}
      <rect x="18" y="5.5" width="16" height="9" rx="1.5" fill="#9a9a9a" />
      <rect x="18" y="5.5" width="16" height="3" rx="1" fill="#bbb" />
      {/* Bristles */}
      <ellipse cx="10" cy="10" rx="13" ry="7" fill="#2a2218" />
      <ellipse cx="10" cy="9" rx="10" ry="4.5" fill="#3a3020" />
      {/* Bristle highlight */}
      <ellipse cx="8" cy="8" rx="5" ry="2" fill="rgba(255,255,255,0.07)" />
    </svg>
  )
}

function PaintBlobs({ style }) {
  return (
    <svg width="70" height="60" viewBox="0 0 70 60" fill="none" style={style}>
      <ellipse cx="15" cy="14" rx="12" ry="9" fill="#e53e3e" opacity="0.85" />
      <ellipse cx="15" cy="13" rx="7" ry="4" fill="rgba(255,255,255,0.18)" />
      <ellipse cx="46" cy="10" rx="10" ry="8" fill="#3182ce" opacity="0.85" />
      <ellipse cx="46" cy="9" rx="6" ry="3.5" fill="rgba(255,255,255,0.18)" />
      <ellipse cx="32" cy="34" rx="11" ry="8" fill="#38a169" opacity="0.85" />
      <ellipse cx="32" cy="33" rx="6.5" ry="3.5" fill="rgba(255,255,255,0.18)" />
      <ellipse cx="10" cy="46" rx="8" ry="7" fill="#d69e2e" opacity="0.85" />
      <ellipse cx="10" cy="45" rx="5" ry="3" fill="rgba(255,255,255,0.18)" />
      <ellipse cx="55" cy="44" rx="9" ry="7" fill="#805ad5" opacity="0.85" />
      <ellipse cx="55" cy="43" rx="5.5" ry="3" fill="rgba(255,255,255,0.18)" />
    </svg>
  )
}

// ── Realistic wood grain canvas ───────────────────────────────────────────────
function WoodCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const W = canvas.width
    const H = canvas.height
    const ctx = canvas.getContext('2d')

    // 1. Base warm gradient — light at top, darker mid, warm bottom
    const base = ctx.createLinearGradient(0, 0, 0, H)
    base.addColorStop(0,    '#d4a870')
    base.addColorStop(0.18, '#b07840')
    base.addColorStop(0.42, '#c49058')
    base.addColorStop(0.62, '#9a6030')
    base.addColorStop(0.80, '#b08048')
    base.addColorStop(1,    '#c89860')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, W, H)

    // 2. Grain lines — wavy, varied darkness
    for (let i = 0; i < 110; i++) {
      const t = i / 110
      const baseY = t * H

      // Growth ring pattern: every ~10 lines a pair of darker lines
      const ring = Math.abs(Math.sin(i / 9.8 * Math.PI))
      const isDark = ring > 0.75
      const isLight = Math.sin(i * 2.7 + 0.9) > 0.72

      let strokeColor
      if (isLight) {
        strokeColor = `rgba(255, 215, 130, ${0.06 + ring * 0.04})`
      } else if (isDark) {
        strokeColor = `rgba(35, 12, 0, ${0.08 + ring * 0.10})`
      } else {
        strokeColor = `rgba(25, 8, 0, ${0.02 + Math.abs(Math.sin(i * 1.4)) * 0.04})`
      }

      ctx.strokeStyle = strokeColor
      ctx.lineWidth = isDark ? 1.0 + Math.abs(Math.sin(i * 0.8)) * 0.8 : 0.5

      ctx.beginPath()
      ctx.moveTo(0, baseY)
      for (let x = 0; x <= W; x += 5) {
        // Three overlapping sine waves for natural organic shape
        const y = baseY
          + Math.sin(x * 0.005  + i * 2.1) * 4.5
          + Math.sin(x * 0.0018 + i * 0.75) * 9
          + Math.sin(x * 0.016  + i * 4.3) * 1.2
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    // 3. A subtle knot ~1/5 from left, ~55% down
    const kx = W * 0.20, ky = H * 0.55
    for (let r = 22; r >= 1; r--) {
      ctx.beginPath()
      ctx.ellipse(kx, ky, r * 1.4, r * 0.75, 0.1, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(40, 12, 0, ${0.035 * (1 - r / 22)})`
      ctx.lineWidth = 0.8
      ctx.stroke()
    }
    // Knot centre fill
    ctx.beginPath()
    ctx.ellipse(kx, ky, 5, 3, 0.1, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(40, 12, 0, 0.25)'
    ctx.fill()

    // 4. Varnish sheen — elliptical highlight slightly off-centre
    const sheen = ctx.createRadialGradient(W * 0.38, H * 0.28, 0, W * 0.52, H * 0.52, W * 0.88)
    sheen.addColorStop(0,    'rgba(255, 235, 170, 0.16)')
    sheen.addColorStop(0.40, 'rgba(255, 210, 110, 0.06)')
    sheen.addColorStop(1,    'rgba(0, 0, 0, 0)')
    ctx.fillStyle = sheen
    ctx.fillRect(0, 0, W, H)

    // 5. Slight dark vignette at edges for depth
    const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.85)
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(0,0,0,0.22)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, W, H)

    // 6. Bottom edge shadow (table thickness illusion)
    const edgeShadow = ctx.createLinearGradient(0, H - 14, 0, H)
    edgeShadow.addColorStop(0, 'rgba(0,0,0,0)')
    edgeShadow.addColorStop(1, 'rgba(0,0,0,0.30)')
    ctx.fillStyle = edgeShadow
    ctx.fillRect(0, 0, W, H)
  }, [])

  return (
    <canvas
      ref={ref}
      width={900}
      height={300}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  )
}

// ── Scattered paper (table preview) ──────────────────────────────────────────
// Papers rotate around their center so corners extend equally in all directions.
// Positions keep each paper's bounding box well within the container.
const PAPER_POSITIONS = [
  { left: '6%',  top: '16%', rot: -7, zIndex: 2, width: '33%' },
  { left: '31%', top:  '9%', rot:  5, zIndex: 3, width: '35%' },
  { left: '57%', top: '18%', rot: -4, zIndex: 2, width: '33%' },
]

function TablePaper({ pos, drawing }) {
  const shadow = pos.rot > 0
    ? '5px 7px 20px rgba(0,0,0,0.38)'
    : '-5px 7px 20px rgba(0,0,0,0.38)'
  return (
    <div style={{
      position: 'absolute',
      left: pos.left, top: pos.top, width: pos.width,
      zIndex: pos.zIndex,
      transform: `rotate(${pos.rot}deg)`,
      transformOrigin: 'center center', // symmetric — corners extend equally
    }}>
      <div style={{
        background: 'linear-gradient(160deg, #fefdf9 0%, #f7f3ec 100%)',
        boxShadow: `${shadow}, inset 0 0 0 1px rgba(0,0,0,0.04)`,
        padding: '8px 8px 22px',
        position: 'relative',
      }}>
        {/* Ruled lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 17px, rgba(180,190,220,0.22) 17px, rgba(180,190,220,0.22) 18px)',
          backgroundPosition: '0 22px',
          pointerEvents: 'none',
        }} />
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

// ── Table preview (block's closed state) ─────────────────────────────────────
// Two-layer structure:
//   outer div  → overflow: visible  → papers can extend past the wood edge
//   inner div  → overflow: hidden   → clips the canvas + art materials to rounded corners
function TablePreview({ drawings, boardTitle, onClick }) {
  const [hovered, setHovered] = useState(false)
  const count = drawings.length

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: 260,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* ── Wood surface layer (clipped) ─────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 6px 30px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.25)',
      }}>
        <WoodCanvas />

        {/* Paint blobs — bottom-right */}
        <div style={{ position: 'absolute', right: '3%', bottom: '6%', opacity: 0.92, pointerEvents: 'none', zIndex: 2 }}>
          <PaintBlobs />
        </div>

        {/* Pencil — bottom-left, diagonal */}
        <div style={{
          position: 'absolute', left: 6, bottom: '12%',
          transform: 'rotate(-13deg)',
          pointerEvents: 'none', zIndex: 2,
        }}>
          <PencilSVG />
        </div>

        {/* Paintbrush — top-right, diagonal */}
        <div style={{
          position: 'absolute', right: 8, top: '8%',
          transform: 'rotate(16deg)',
          pointerEvents: 'none', zIndex: 2,
        }}>
          <BrushSVG />
        </div>

        {/* Hover dim overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 8,
          background: hovered ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)',
          transition: 'background 0.2s',
          pointerEvents: 'none',
        }} />

        {/* Board title badge */}
        {boardTitle && (
          <div style={{
            position: 'absolute', top: 10, left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(253,245,210,0.92)',
            border: '1.5px solid rgba(160,120,60,0.35)',
            borderRadius: 6, padding: '3px 12px',
            fontFamily: "'Caveat', cursive",
            fontSize: 16, fontWeight: 700,
            color: '#4a2a0a',
            whiteSpace: 'nowrap',
            zIndex: 9,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            pointerEvents: 'none',
          }}>
            {boardTitle}
          </div>
        )}

        {/* Drawing count badge */}
        {count > 0 && (
          <div style={{
            position: 'absolute', bottom: 10, right: 12,
            background: 'rgba(250,240,210,0.88)',
            borderRadius: 10, padding: '2px 9px',
            fontFamily: "'Caveat', cursive",
            fontSize: 13, color: '#6a4520',
            zIndex: 9, pointerEvents: 'none',
            border: '1px solid rgba(160,120,60,0.25)',
          }}>
            {count} drawing{count === 1 ? '' : 's'}
          </div>
        )}
      </div>

      {/* ── Papers (outside overflow:hidden, free to overlap edges) ──────── */}
      {PAPER_POSITIONS.map((pos, i) => (
        <TablePaper key={i} pos={pos} drawing={drawings[i] ?? null} />
      ))}

      {/* Hover call-to-action — centred over the wood surface */}
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 20, pointerEvents: 'none',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 24, padding: '8px 22px',
            fontFamily: "'Caveat', cursive",
            fontSize: 18, fontWeight: 700,
            color: '#4a2a0a',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}>
            {count > 0 ? `See ${count} drawing${count === 1 ? '' : 's'}` : 'Start drawing'}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Gallery paper card ────────────────────────────────────────────────────────
function GalleryPaper({ drawing, onRemove, showRemove }) {
  const seed = (drawing.id ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rot = ((seed % 11) - 5) * 0.7

  return (
    <div style={{
      position: 'relative',
      transform: `rotate(${rot}deg)`,
      transformOrigin: 'center center',
      flexShrink: 0,
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

      <div style={{
        background: 'linear-gradient(160deg, #fdfcf8 0%, #f5f1e8 100%)',
        padding: '10px 10px 28px',
        boxShadow: [
          `${rot > 0 ? 5 : -5}px 8px 20px rgba(0,0,0,0.28)`,
          '0 2px 4px rgba(0,0,0,0.14)',
          'inset 0 0 0 1px rgba(0,0,0,0.04)',
        ].join(', '),
        width: 160,
        position: 'relative',
      }}>
        {/* Ruled lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 19px, rgba(170,185,215,0.2) 19px, rgba(170,185,215,0.2) 20px)',
          backgroundPosition: '0 30px',
          pointerEvents: 'none',
        }} />
        <img
          src={drawing.src}
          alt={drawing.caption || 'drawing'}
          style={{
            display: 'block', width: '100%',
            aspectRatio: '23/16', objectFit: 'cover',
            borderRadius: 2, position: 'relative', zIndex: 1,
          }}
        />
        {drawing.caption && (
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 13, color: '#4a3a28',
            margin: '6px 0 0', textAlign: 'center',
            lineHeight: 1.3,
            position: 'relative', zIndex: 1,
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

function DrawingCanvas({ onSave, onCancel, uploading }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Canvas on paper */}
      <div style={{
        background: PAPER_BG,
        border: '1px solid rgba(180,165,130,0.4)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        borderRadius: 2,
        padding: 2,
        position: 'relative',
      }}>
        {/* Ruled lines on the paper */}
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

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
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
                background: brushSize === s ? '#ff3131' : '#3a4453',
                border: 'none', cursor: 'pointer',
              }}
            />
          ))}
        </div>
        {/* Eraser + Clear */}
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          <button onClick={() => setTool(t => t === 'eraser' ? 'pen' : 'eraser')}
            style={{
              padding: '4px 10px', borderRadius: 6, border: 'none',
              background: isEraser ? '#ff3131' : '#3a4453',
              color: '#f3f4f6', fontSize: 12, cursor: 'pointer',
            }}>
            Eraser
          </button>
          <button onClick={clearCanvas}
            style={{
              padding: '4px 10px', borderRadius: 6, border: 'none',
              background: '#3a4453', color: '#9ca3af', fontSize: 12, cursor: 'pointer',
            }}>
            Clear
          </button>
        </div>
      </div>

      {/* Caption */}
      <input
        style={{
          background: '#242d3a', border: '1px solid #3a4453', borderRadius: 6,
          padding: '7px 10px', color: '#f3f4f6', fontSize: 13,
          width: '100%', boxSizing: 'border-box',
          fontFamily: "'Caveat', cursive",
        }}
        placeholder="Add a caption (optional)…"
        value={caption}
        onChange={e => setCaption(e.target.value)}
      />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel}
          style={{
            flex: 1, padding: '10px', borderRadius: 8, border: '1.5px solid #3a4453',
            background: 'transparent', color: '#9ca3af', fontSize: 14, cursor: 'pointer',
          }}>
          ← Back
        </button>
        <button onClick={handleSave} disabled={uploading}
          style={{
            flex: 3, padding: '10px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14,
            background: uploading ? '#555' : 'linear-gradient(135deg, #e53e3e, #c0392b)',
            color: '#fff', cursor: uploading ? 'not-allowed' : 'pointer',
            boxShadow: uploading ? 'none' : '0 4px 12px rgba(192,57,43,0.4)',
            transition: 'background 0.2s',
          }}>
          {uploading ? 'Uploading…' : '📌 Pin to board'}
        </button>
      </div>
    </div>
  )
}

// ── Gallery modal ─────────────────────────────────────────────────────────────
function GalleryModal({ drawings, boardTitle, isEditing, onClose, onAdd, onRemove, uploading, uploadError }) {
  const [view, setView] = useState('gallery') // 'gallery' | 'draw'
  const isEmpty = drawings.length === 0

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onMouseDown={e => { if (e.target === e.currentTarget && !uploading) onClose() }}
    >
      <div style={{
        background: '#1a202a',
        borderRadius: 18,
        width: '100%', maxWidth: 580,
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 28px 72px rgba(0,0,0,0.65)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 14px',
          borderBottom: '1px solid #242d3a',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {view === 'draw' && (
              <button onClick={() => setView('gallery')}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px 4px', fontSize: 13 }}>
                ←
              </button>
            )}
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: 22, fontWeight: 700, color: '#f3f4f6' }}>
              {view === 'draw' ? 'Draw yours' : (boardTitle || 'Drawing board')}
            </span>
            {view === 'gallery' && drawings.length > 0 && (
              <span style={{
                background: '#3a4453', color: '#9ca3af',
                borderRadius: 10, padding: '2px 8px', fontSize: 12,
              }}>
                {drawings.length}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {view === 'gallery' && isEditing && (
              <button onClick={() => setView('draw')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#ff3131', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '6px 14px', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer',
                }}>
                <Plus size={14} /> Add yours
              </button>
            )}
            <button onClick={() => { if (!uploading) onClose() }}
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {view === 'gallery' ? (
            isEmpty ? (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                minHeight: 200, gap: 14, textAlign: 'center',
              }}>
                {/* Mini table scene */}
                <div style={{ position: 'relative', width: 180, height: 100, opacity: 0.7 }}>
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 8,
                    background: 'linear-gradient(160deg, #c4956a, #a87248)',
                    backgroundImage: 'repeating-linear-gradient(88deg, transparent, transparent 18px, rgba(0,0,0,0.025) 18px, rgba(0,0,0,0.025) 20px)',
                  }} />
                  <div style={{
                    position: 'absolute', left: '15%', top: '10%', width: '35%',
                    transform: 'rotate(-8deg)', background: '#fdfcf8',
                    padding: '5px 5px 14px',
                    boxShadow: '-3px 5px 10px rgba(0,0,0,0.25)',
                  }}>
                    <div style={{ width: '100%', aspectRatio: '23/16', border: '1px dashed rgba(180,165,130,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Pencil size={10} color="rgba(160,145,120,0.5)" />
                    </div>
                  </div>
                </div>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: '#9ca3af', margin: 0 }}>
                  No drawings yet
                </p>
                {isEditing && (
                  <button onClick={() => setView('draw')}
                    style={{
                      background: 'linear-gradient(135deg, #e53e3e, #c0392b)',
                      color: '#fff', border: 'none', borderRadius: 10,
                      padding: '10px 24px', fontSize: 15, fontWeight: 700,
                      cursor: 'pointer', fontFamily: "'Caveat', cursive",
                    }}>
                    ✏️ Be the first to draw!
                  </button>
                )}
              </div>
            ) : (
              <div style={{
                display: 'flex', flexWrap: 'wrap',
                gap: '28px 32px', justifyContent: 'center',
                paddingTop: 12, paddingBottom: 8,
              }}>
                {drawings.map(d => (
                  <GalleryPaper
                    key={d.id}
                    drawing={d}
                    showRemove={isEditing}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            )
          ) : (
            <DrawingCanvas
              onSave={onAdd}
              onCancel={() => setView('gallery')}
              uploading={uploading}
            />
          )}

          {uploadError && view === 'draw' && (
            <p style={{ color: '#fc8181', fontSize: 12, margin: '8px 0 0', textAlign: 'center' }}>
              {uploadError}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main block component ──────────────────────────────────────────────────────
const PIN_COLORS = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#e67e22', '#16a085', '#e91e8c', '#f39c12']

export default function DrawingBlock({ block, isEditing, onChange }) {
  const { drawings = [], boardTitle = '' } = block
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
      onChange({
        drawings: [
          ...drawings,
          { id, src: data.publicUrl, caption, pinColor: PIN_COLORS[seed % PIN_COLORS.length] },
        ],
      })
      // Stay in gallery view after save — user will see their new drawing
    } catch (err) {
      console.error('Drawing upload failed:', err.message)
      setUploadError('Upload failed — please try again.')
    } finally {
      setUploading(false)
    }
  }

  function removeDrawing(id) {
    onChange({ drawings: drawings.filter(d => d.id !== id) })
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

        <TablePreview
          drawings={drawings}
          boardTitle={boardTitle}
          onClick={() => setGalleryOpen(true)}
        />

        {galleryOpen && (
          <GalleryModal
            drawings={drawings}
            boardTitle={boardTitle}
            isEditing
            onClose={() => setGalleryOpen(false)}
            onAdd={addDrawing}
            onRemove={removeDrawing}
            uploading={uploading}
            uploadError={uploadError}
          />
        )}
      </div>
    )
  }

  // Public view
  return (
    <>
      <TablePreview
        drawings={drawings}
        boardTitle={boardTitle}
        onClick={() => setGalleryOpen(true)}
      />
      {galleryOpen && (
        <GalleryModal
          drawings={drawings}
          boardTitle={boardTitle}
          isEditing={false}
          onClose={() => setGalleryOpen(false)}
          onAdd={null}
          onRemove={null}
          uploading={false}
          uploadError={null}
        />
      )}
    </>
  )
}
