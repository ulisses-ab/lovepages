import { useState, useRef, useEffect } from 'react'
import { RgbaColorPicker, RgbColorPicker } from 'react-colorful'
import { colors } from '../../lib/theme'

// ── Colour conversion helpers ─────────────────────────────────────────────────

/** Parse any CSS colour string → {r,g,b,a}. Falls back to black/opaque. */
function parseColor(str) {
  if (!str) return { r: 0, g: 0, b: 0, a: 1 }

  // rgba(r, g, b, a) or rgb(r, g, b)
  const m = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/)
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 }

  // #rrggbbaa / #rrggbb / #rgb
  const hex = str.replace('#', '')
  if (hex.length === 3) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
      a: 1,
    }
  }
  if (hex.length === 6) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: 1,
    }
  }
  if (hex.length === 8) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: +(parseInt(hex.slice(6, 8), 16) / 255).toFixed(2),
    }
  }
  return { r: 0, g: 0, b: 0, a: 1 }
}

/** Serialise {r,g,b,a} → hex string (#rrggbb when a=1, else rgba(...)) */
function serializeColor({ r, g, b, a }) {
  const ri = Math.round(r)
  const gi = Math.round(g)
  const bi = Math.round(b)
  const ai = Math.round(a * 100) / 100
  if (ai >= 1) return `#${[ri, gi, bi].map(v => v.toString(16).padStart(2, '0')).join('')}`
  return `rgba(${ri}, ${gi}, ${bi}, ${ai})`
}

/** Rgba object → CSS rgba string (for live preview). */
function toCssRgba({ r, g, b, a }) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`
}

// ── ColorPicker component ─────────────────────────────────────────────────────

/**
 * Drop-in replacement for <input type="color"> with alpha support.
 *
 * Props:
 *   value     — CSS color string (hex or rgba)
 *   onChange  — called with new CSS color string
 *   label     — optional text shown next to the swatch
 */
export default function ColorPicker({ value, onChange, label, clearable = false, onClear, alpha = false }) {
  const [open, setOpen] = useState(false)
  const [rgba, setRgba] = useState(() => parseColor(value))
  const popoverRef = useRef(null)
  const swatchRef  = useRef(null)

  // Sync external value changes (e.g. when variant switches reset the color)
  useEffect(() => {
    setRgba(parseColor(value))
  }, [value])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (!popoverRef.current?.contains(e.target) && !swatchRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function handleChange(newRgba) {
    // When alpha is disabled, force a=1 so serialization always outputs hex
    const safe = alpha ? newRgba : { ...newRgba, a: 1 }
    setRgba(safe)
    onChange(serializeColor(safe))
  }

  const cssColor = toCssRgba(rgba)

  // Checkerboard inlined as a data-uri–like CSS — shows through transparent areas
  const checkerStyle = {
    backgroundImage: [
      'linear-gradient(45deg, #666 25%, transparent 25%)',
      'linear-gradient(-45deg, #666 25%, transparent 25%)',
      'linear-gradient(45deg, transparent 75%, #666 75%)',
      'linear-gradient(-45deg, transparent 75%, #666 75%)',
    ].join(', '),
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {/* Swatch button */}
      <button
        ref={swatchRef}
        onClick={() => setOpen(v => !v)}
        style={{
          width: 32, height: 32, borderRadius: 8, padding: 0, border: 'none',
          cursor: 'pointer', position: 'relative', overflow: 'hidden',
          boxShadow: open
            ? `0 0 0 2px ${colors.primary}`
            : `0 0 0 1.5px ${colors.overlay}, inset 0 0 0 1px rgba(255,255,255,0.07)`,
          flexShrink: 0,
          ...checkerStyle,
        }}
        title={value || 'Pick a color'}
      >
        {/* Actual color layer on top of checkerboard */}
        <span style={{
          position: 'absolute', inset: 0,
          background: cssColor,
        }} />
      </button>

      {label && <span style={{ fontSize: 12, color: colors.fgFaint }}>{label}</span>}

      {clearable && value && (
        <button
          onClick={onClear}
          style={{
            marginLeft: 'auto', fontSize: 14, lineHeight: 1,
            color: colors.fgGhost, background: 'none', border: 'none',
            cursor: 'pointer', padding: '0 2px',
          }}
        >×</button>
      )}

      {/* Popover */}
      {open && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: 40, left: 0,
            zIndex: 1000,
            background: colors.surface,
            border: `1px solid ${colors.overlay}`,
            borderRadius: 12,
            padding: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3)',
            width: 220,
          }}
        >
          {alpha
            ? <RgbaColorPicker color={rgba} onChange={handleChange} style={{ width: '100%', height: 160 }} />
            : <RgbColorPicker  color={rgba} onChange={handleChange} style={{ width: '100%', height: 160 }} />
          }

          {/* Hex input */}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 20, height: 20, borderRadius: 4, flexShrink: 0,
              position: 'relative', overflow: 'hidden',
              ...checkerStyle,
            }}>
              <span style={{ position: 'absolute', inset: 0, background: cssColor }} />
            </div>
            <input
              value={serializeColor(rgba)}
              onChange={e => {
                const parsed = parseColor(e.target.value)
                if (e.target.value === '' || e.target.value.match(/^#[0-9a-fA-F]{3,8}$/) || e.target.value.match(/^rgba?\(/)) {
                  handleChange(parsed)
                }
              }}
              spellCheck={false}
              style={{
                flex: 1, background: colors.overlay, border: `1px solid ${colors.subtle}`,
                borderRadius: 6, padding: '4px 8px', fontSize: 11,
                color: colors.fgSecondary, fontFamily: 'monospace', outline: 'none',
              }}
            />
          </div>

          {/* Opacity readout — only when alpha is enabled */}
          {alpha && (
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: colors.fgFaint, letterSpacing: '0.08em' }}>OPACITY</span>
              <span style={{ fontSize: 11, color: colors.fgMuted, fontFamily: 'monospace' }}>
                {Math.round(rgba.a * 100)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
