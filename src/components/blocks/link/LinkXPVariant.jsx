// ── Color helpers ─────────────────────────────────────────────────────────────
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) { h = s = 0 } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      default: h = ((r - g) / d + 4) / 6
    }
  }
  return [h * 360, s * 100, l * 100]
}

function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  let r, g, b
  if (s === 0) { r = g = b = l } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  return '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
}

function shift(hex, dL) {
  const [h, s, l] = hexToHsl(hex)
  return hslToHex(h, s, Math.max(5, Math.min(95, l + dL)))
}

function buildGradient(base) {
  return [
    `${shift(base, +15)} 0%`,
    `${shift(base,  +3)} 30%`,
    `${shift(base, -14)} 55%`,
    `${shift(base,  -5)} 85%`,
    `${shift(base, -18)} 100%`,
  ].join(', ')
}

function WindowsFlag({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size * (150 / 170)}
      viewBox="0 0 170 150"
      style={{
        flexShrink: 0,
        filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))",
      }}
    >
      <path d="M170 20.7c-33 13.7-49 6-63.2-3.6L90.8 73.5c14.3 9.7 31.5 17.7 63.2 3.5l16.3-56.3z" fill="#91c300"/>
      <path d="M63 134.2c-14.3-9.6-30-17.6-63-3.9l16.2-56.6c33-13.6 49-5.9 63.3 3.8L63 134.2z" fill="#00b4f1"/>
      <path d="M82.2 67.3a53.9 53.9 0 0 0-31-11.3c-8.7-.1-19.1 2.4-32.2 7.8L35.2 7.4c33.1-13.7 49-6 63.3 3.7L82.2 67.3z" fill="#f8682c"/>
      <path d="M88 83c14.4 9.6 30.3 17.3 63.3 3.6L135 142.8c-33 13.7-48.9 6-63.2-3.7L88.1 83z" fill="#ffc300"/>
    </svg>
  )
}
const DEFAULT_COLOR = '#5DB52A'

export default function LinkXPVariant({ href, label, showFlag = true, baseColor }) {
  const base = baseColor || DEFAULT_COLOR
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <a
        href={href || '#'}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '7px 22px 7px 12px',
          borderRadius: 999,
          background: `linear-gradient(180deg, ${buildGradient(base)})`,
          border: `2px solid ${shift(base, -20)}`,
          outline: '1px solid rgba(255,255,255,0.18)',
          boxShadow: [
            '0 3px 8px rgba(0,0,0,0.55)',
            '0 1px 2px rgba(0,0,0,0.3)',
            'inset 0 1px 0 rgba(255,255,255,0.22)',
            'inset 0 -1px 0 rgba(0,0,0,0.2)',
          ].join(', '),
          fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
          fontSize: 16,
          fontWeight: 'bold',
          color: '#ffffff',
          textShadow: '0 1px 3px rgba(0,0,0,0.65)',
          textDecoration: 'none',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          userSelect: 'none',
          letterSpacing: 0.3,
        }}
      >
        {/* Gloss highlight — upper half */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '48%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.06) 100%)',
          borderRadius: '999px 999px 60% 60%',
          pointerEvents: 'none',
        }} />

        {/* Windows flag */}
        {showFlag && <WindowsFlag size={20} />}

        {/* Label */}
        <span style={{ position: 'relative' }}>{label || 'start'}</span>
      </a>
    </div>
  )
}
