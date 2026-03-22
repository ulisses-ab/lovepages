import { useRef, useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { inputClass } from '../../lib/theme'
import { supabase } from '../../lib/supabase'

// ── Push pin ─────────────────────────────────────────────────────────────────
const PIN_COLORS = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#e67e22', '#16a085', '#e91e8c', '#f39c12']

function PushPin({ color }) {
  return (
    <div style={{
      position: 'absolute', top: -12, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 3, pointerEvents: 'none',
    }}>
      <svg width="18" height="26" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shaft */}
        <rect x="8" y="13" width="2" height="13" rx="1" fill="#a0a0a0" />
        <rect x="8.5" y="13" width="1" height="13" rx="0.5" fill="rgba(255,255,255,0.4)" />
        {/* Head shadow */}
        <circle cx="9" cy="9" r="8" fill="rgba(0,0,0,0.2)" style={{ transform: 'translateY(1px)' }} />
        {/* Head */}
        <circle cx="9" cy="9" r="7.5" fill={color} />
        {/* Gloss */}
        <ellipse cx="7" cy="6.5" rx="2.5" ry="2" fill="rgba(255,255,255,0.45)" />
      </svg>
    </div>
  )
}

// ── Single pinned paper ───────────────────────────────────────────────────────
function PinnedPaper({ drawing, onRemove, showRemove }) {
  const seed = (drawing.id ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rot = ((seed % 17) - 8) * 0.85        // –6.8° to +6.8°
  const pinColor = PIN_COLORS[seed % PIN_COLORS.length]

  return (
    <div style={{
      position: 'relative',
      display: 'inline-block',
      transform: `rotate(${rot}deg)`,
      transformOrigin: 'top center',
      marginTop: 18,
      flexShrink: 0,
      cursor: 'default',
    }}>
      <PushPin color={pinColor} />

      {/* Paper */}
      <div style={{
        background: 'linear-gradient(160deg, #fdfcf9 0%, #f8f5ef 100%)',
        padding: '12px 12px 10px',
        boxShadow: [
          `${rot > 0 ? 4 : -4}px 6px 16px rgba(0,0,0,0.30)`,
          '0 2px 4px rgba(0,0,0,0.18)',
          'inset 0 0 0 1px rgba(0,0,0,0.04)',
        ].join(', '),
        width: 160,
        position: 'relative',
      }}>
        {/* Subtle ruled lines on paper */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 19px, rgba(180,190,210,0.25) 19px, rgba(180,190,210,0.25) 20px)',
          backgroundPosition: '0 28px',
          pointerEvents: 'none',
        }} />

        {/* Drawing */}
        <img
          src={drawing.src}
          alt={drawing.caption || 'drawing'}
          style={{
            display: 'block',
            width: '100%',
            aspectRatio: '23/16',
            objectFit: 'cover',
            borderRadius: 2,
            position: 'relative',
            zIndex: 1,
          }}
        />

        {/* Caption */}
        {drawing.caption && (
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 13,
            color: '#4a3a28',
            margin: '6px 0 0',
            textAlign: 'center',
            lineHeight: 1.3,
            position: 'relative',
            zIndex: 1,
          }}>
            {drawing.caption}
          </p>
        )}

        {/* Delete button (edit mode only) */}
        {showRemove && (
          <button
            onClick={onRemove}
            style={{
              position: 'absolute', top: -8, right: -8,
              width: 20, height: 20,
              borderRadius: '50%',
              background: '#e53e3e',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
              color: '#fff',
            }}
          >
            <X size={11} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Corkboard view ────────────────────────────────────────────────────────────
function Corkboard({ drawings, boardTitle, onRemove, showRemove, onAdd }) {
  const isEmpty = drawings.length === 0

  return (
    <div style={{
      // Wooden outer frame
      background: 'linear-gradient(160deg, #8b5e3c 0%, #6b4423 60%, #7d5030 100%)',
      borderRadius: 8,
      padding: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
    }}>
      {/* Cork inner surface */}
      <div style={{
        background: '#c9996a',
        backgroundImage: [
          'radial-gradient(ellipse at 15% 20%, rgba(255,220,160,0.35) 0%, transparent 55%)',
          'radial-gradient(ellipse at 85% 80%, rgba(110,60,15,0.25) 0%, transparent 50%)',
          'radial-gradient(ellipse at 50% 50%, rgba(200,155,90,0.1) 0%, transparent 70%)',
          // fine grain texture
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='none'/%3E%3Ccircle cx='1' cy='1' r='0.4' fill='rgba(80,40,10,0.06)'/%3E%3Ccircle cx='3' cy='3' r='0.3' fill='rgba(80,40,10,0.05)'/%3E%3Ccircle cx='3' cy='1' r='0.2' fill='rgba(200,150,80,0.08)'/%3E%3C/svg%3E\")",
        ].join(', '),
        borderRadius: 4,
        minHeight: 220,
        padding: '16px 20px 24px',
        position: 'relative',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)',
      }}>
        {/* Board title */}
        {boardTitle && (
          <div style={{
            textAlign: 'center',
            marginBottom: 8,
            fontFamily: "'Caveat', cursive",
            fontSize: 22,
            fontWeight: 700,
            color: '#3d2008',
            textShadow: '0 1px 2px rgba(255,200,120,0.3)',
            letterSpacing: '0.02em',
          }}>
            {boardTitle}
          </div>
        )}

        {/* Papers grid */}
        {isEmpty ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: 160, gap: 10,
          }}>
            <span style={{ fontSize: 36 }}>📌</span>
            <p style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 16, color: '#7a5030',
              margin: 0, textAlign: 'center',
            }}>
              No drawings yet — pin the first one!
            </p>
            {onAdd && (
              <button
                onClick={onAdd}
                style={{
                  marginTop: 6,
                  background: 'rgba(255,255,255,0.25)',
                  border: '2px dashed rgba(80,40,10,0.35)',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontFamily: "'Caveat', cursive",
                  fontSize: 15,
                  color: '#4a2a0a',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Plus size={15} /> Draw something
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px 24px',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: 8,
          }}>
            {drawings.map(d => (
              <PinnedPaper
                key={d.id}
                drawing={d}
                showRemove={showRemove}
                onRemove={() => onRemove?.(d.id)}
              />
            ))}
            {/* Add-more button pinned as a blank paper */}
            {onAdd && (
              <div style={{
                position: 'relative',
                display: 'inline-block',
                marginTop: 18,
                flexShrink: 0,
              }}>
                <PushPin color="#555" />
                <button
                  onClick={onAdd}
                  style={{
                    background: 'rgba(255,255,255,0.55)',
                    border: '2px dashed rgba(80,40,10,0.3)',
                    borderRadius: 0,
                    width: 160,
                    aspectRatio: '23/16',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 6,
                    color: '#7a5030',
                    transition: 'background 0.15s',
                    padding: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.75)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.55)'}
                >
                  <Plus size={24} />
                  <span style={{ fontFamily: "'Caveat', cursive", fontSize: 14 }}>Add drawing</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Drawing canvas modal ──────────────────────────────────────────────────────
const PALETTE = ['#1c1c1c', '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce', '#805ad5', '#d53f8c', '#ffffff']
const BRUSH_SIZES = [2, 4, 8, 14]
const CANVAS_W = 460
const CANVAS_H = 320
const PAPER_BG = '#faf5e4'

function DrawingModal({ onSave, onClose, uploading }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#1c1c1c')
  const [brushSize, setBrushSize] = useState(4)
  const [tool, setTool] = useState('pen')
  const [caption, setCaption] = useState('')
  const lastPos = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = PAPER_BG
    ctx.fillRect(0, 0, canvas.width, canvas.height)
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
    hasStrokes.current = true

    // dot on click
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

  const activeErase = tool === 'eraser'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#1a202a',
        borderRadius: 16,
        padding: 20,
        maxWidth: 520,
        width: '100%',
        display: 'flex', flexDirection: 'column', gap: 14,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#f3f4f6', fontWeight: 600, fontSize: 20, fontFamily: "'Caveat', cursive" }}>
            ✏️ Draw something
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{
            width: '100%',
            borderRadius: 4,
            border: '2px solid #3a4453',
            cursor: activeErase ? 'cell' : 'crosshair',
            touchAction: 'none',
            userSelect: 'none',
            display: 'block',
          }}
          onMouseDown={startDraw}
          onMouseMove={onDraw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={onDraw}
          onTouchEnd={stopDraw}
        />

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Color palette */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {PALETTE.map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool('pen') }}
                title={c}
                style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: c,
                  border: color === c && !activeErase
                    ? '3px solid #ff3131'
                    : c === '#ffffff'
                      ? '2px solid rgba(255,255,255,0.4)'
                      : '2px solid transparent',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transform: color === c && !activeErase ? 'scale(1.25)' : 'scale(1)',
                  transition: 'transform 0.1s',
                }}
              />
            ))}
          </div>

          {/* Brush size */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {BRUSH_SIZES.map(s => (
              <button
                key={s}
                onClick={() => setBrushSize(s)}
                style={{
                  width: Math.max(s + 8, 16), height: Math.max(s + 8, 16),
                  borderRadius: '50%', flexShrink: 0,
                  background: brushSize === s ? '#ff3131' : '#3a4453',
                  border: 'none', cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {/* Eraser / Clear */}
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            <button
              onClick={() => setTool(t => t === 'eraser' ? 'pen' : 'eraser')}
              style={{
                padding: '4px 10px', borderRadius: 6, border: 'none',
                background: activeErase ? '#ff3131' : '#3a4453',
                color: '#f3f4f6', fontSize: 12, cursor: 'pointer',
              }}
            >
              Eraser
            </button>
            <button
              onClick={clearCanvas}
              style={{
                padding: '4px 10px', borderRadius: 6, border: 'none',
                background: '#3a4453',
                color: '#9ca3af', fontSize: 12, cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Caption */}
        <input
          style={{
            background: '#242d3a', border: '1px solid #3a4453',
            borderRadius: 6, padding: '7px 10px',
            color: '#f3f4f6', fontSize: 13,
            width: '100%', boxSizing: 'border-box',
            fontFamily: "'Caveat', cursive",
          }}
          placeholder="Caption (optional)…"
          value={caption}
          onChange={e => setCaption(e.target.value)}
        />

        {/* Pin button */}
        <button
          onClick={handleSave}
          disabled={uploading}
          style={{
            background: uploading ? '#555' : 'linear-gradient(135deg, #e53e3e, #c0392b)',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '11px 20px', fontWeight: 700, fontSize: 15,
            cursor: uploading ? 'not-allowed' : 'pointer', letterSpacing: '0.02em',
            boxShadow: uploading ? 'none' : '0 4px 12px rgba(192,57,43,0.4)',
            transition: 'background 0.2s',
          }}
        >
          {uploading ? 'Uploading…' : '📌 Pin to board'}
        </button>
      </div>
    </div>
  )
}

// ── Main block component ──────────────────────────────────────────────────────
export default function DrawingBlock({ block, isEditing, onChange }) {
  const { drawings = [], boardTitle = '' } = block
  const [showModal, setShowModal] = useState(false)
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
      setShowModal(false)
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

  function updateCaption(id, caption) {
    onChange({ drawings: drawings.map(d => d.id === id ? { ...d, caption } : d) })
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

        <Corkboard
          drawings={drawings}
          boardTitle={boardTitle}
          onRemove={removeDrawing}
          showRemove
          onAdd={() => setShowModal(true)}
        />

        {/* Caption editor for each drawing */}
        {drawings.length > 0 && (
          <div className="space-y-2 mt-1">
            {drawings.map((d, i) => (
              <div key={d.id} className="flex items-center gap-2 bg-overlay rounded-lg p-2">
                <img
                  src={d.src} alt=""
                  style={{ width: 52, height: 36, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }}
                />
                <input
                  className={inputClass + ' flex-1 min-w-0'}
                  placeholder="Caption…"
                  value={d.caption}
                  onChange={e => updateCaption(d.id, e.target.value)}
                />
                <button
                  onClick={() => removeDrawing(d.id)}
                  className="text-fg-faint hover:text-primary-dim transition p-1 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadError && (
          <p className="text-xs text-primary-dim">{uploadError}</p>
        )}

        {showModal && (
          <DrawingModal
            onSave={addDrawing}
            onClose={() => { if (!uploading) setShowModal(false) }}
            uploading={uploading}
          />
        )}
      </div>
    )
  }

  return (
    <Corkboard
      drawings={drawings}
      boardTitle={boardTitle}
      showRemove={false}
    />
  )
}
