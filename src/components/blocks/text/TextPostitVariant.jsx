export default function TextPostitVariant({ content, sizePx, textAlign, noteColor }) {
  const base = noteColor || '#fde047'
  const hexToRgb = h => {
    const n = parseInt(h.replace('#', ''), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const toHex = ([r, g, b]) =>
    '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
  const [r, g, b] = hexToRgb(base)
  const light    = toHex([r * 1.08, g * 1.08, b * 1.08])
  const dark     = toHex([r * 0.88, g * 0.88, b * 0.88])
  const gradient = `linear-gradient(175deg, ${light} 0%, ${base} 60%, ${dark} 100%)`
  return (
    <div style={{ position: 'relative', paddingTop: 14, maxWidth: 220, margin: '0 auto' }}>
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%) rotate(-1.5deg)',
        width: 60, height: 22, zIndex: 2, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.75) 20%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.75) 80%, transparent)' }} />
        <div style={{ position: 'absolute', top: 1.5, left: 0, right: 0, bottom: 1.5, background: 'rgba(248,242,218,0.13)' }} />
        <div style={{ position: 'absolute', top: 2, left: '-10%', right: '-10%', bottom: 2, background: 'linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0.32) 52%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(210,200,170,0.5) 20%, rgba(210,200,170,0.6) 50%, rgba(210,200,170,0.5) 80%, transparent)' }} />
      </div>
      <div style={{
        position: 'relative', aspectRatio: '1 / 1', background: gradient, overflow: 'hidden',
        transform: 'rotate(-2deg)',
        boxShadow: '0 4px 18px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.3), 4px 5px 0 rgba(0,0,0,0.1)',
        zIndex: 1, display: 'flex', alignItems: 'flex-start', padding: '16px',
      }}>
        <p style={{
          fontFamily: "'Caveat', cursive",
          fontSize: sizePx,
          fontWeight: 700,
          lineHeight: 1.4,
          color: '#1c1400',
          whiteSpace: 'pre-wrap',
          textAlign,
          margin: 0,
          width: '100%',
        }}>
          {content}
        </p>
      </div>
    </div>
  )
}
