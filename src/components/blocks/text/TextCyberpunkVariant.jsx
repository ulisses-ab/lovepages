// Cyberpunk: neon glow on dark, scanlines, monospace, RGB chromatic-aberration glitch
export default function TextCyberpunkVariant({ content, sizePx, textAlign }) {
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(160deg, #06060f 0%, #0a0018 100%)',
      border: '1px solid #00ffff',
      borderRadius: 2,
      padding: '22px 24px',
      boxShadow: [
        '0 0 0 1px rgba(0,255,255,0.15)',
        '0 0 12px rgba(0,255,255,0.35)',
        '0 0 32px rgba(0,255,255,0.12)',
        'inset 0 0 40px rgba(0,0,0,0.6)',
      ].join(', '),
      overflow: 'hidden',
    }}>
      {/* Scanlines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)',
        zIndex: 3,
      }} />

      {/* Subtle vertical noise bars */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,0,255,0.03) 39px, rgba(255,0,255,0.03) 40px)',
        zIndex: 2,
      }} />

      {/* Corner brackets — magenta */}
      {[
        { top: 5, left: 5, borderTop: '2px solid #ff00ff', borderLeft: '2px solid #ff00ff' },
        { top: 5, right: 5, borderTop: '2px solid #ff00ff', borderRight: '2px solid #ff00ff' },
        { bottom: 5, left: 5, borderBottom: '2px solid #ff00ff', borderLeft: '2px solid #ff00ff' },
        { bottom: 5, right: 5, borderBottom: '2px solid #ff00ff', borderRight: '2px solid #ff00ff' },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 14, height: 14, ...s }} />
      ))}

      {/* Text stack: glitch copies + main */}
      <div style={{ position: 'relative', zIndex: 4 }}>
        {/* Cyan ghost — offset left */}
        <p style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          fontFamily: "'Space Mono', 'Courier New', monospace",
          fontSize: sizePx,
          lineHeight: 1.65,
          color: '#00ffff',
          whiteSpace: 'pre-wrap',
          textAlign,
          margin: 0,
          opacity: 0.45,
          transform: 'translate(-2px, 0)',
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '0.03em',
        }}>
          {content}
        </p>

        {/* Magenta ghost — offset right */}
        <p style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          fontFamily: "'Space Mono', 'Courier New', monospace",
          fontSize: sizePx,
          lineHeight: 1.65,
          color: '#ff00ff',
          whiteSpace: 'pre-wrap',
          textAlign,
          margin: 0,
          opacity: 0.4,
          transform: 'translate(2px, 0)',
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '0.03em',
        }}>
          {content}
        </p>

        {/* Main — bright white with neon glow */}
        <p style={{
          position: 'relative',
          fontFamily: "'Space Mono', 'Courier New', monospace",
          fontSize: sizePx,
          lineHeight: 1.65,
          color: '#f0f8ff',
          whiteSpace: 'pre-wrap',
          textAlign,
          margin: 0,
          letterSpacing: '0.03em',
          textShadow: [
            '0 0 4px rgba(255,255,255,0.9)',
            '0 0 12px rgba(0,255,255,0.7)',
            '0 0 28px rgba(0,255,255,0.35)',
          ].join(', '),
        }}>
          {content}
        </p>
      </div>
    </div>
  )
}
