// Windows XP "Start" button — green glossy pill with Windows flag logo

function WindowsFlag({ size = 20 }) {
  // Classic XP waving-flag: four parallelogram quadrants with perspective skew
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ flexShrink: 0, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }}>
      {/* Top-left: red */}
      <path d="M0.5 1.5 L8.5 2.5 L8.5 9.5 L0.5 8.5 Z" fill="#F25022" />
      {/* Top-right: green */}
      <path d="M10 2 L19 0.5 L19 8 L10 9.5 Z" fill="#7FBA00" />
      {/* Bottom-left: blue */}
      <path d="M0.5 10.5 L8.5 11.5 L8.5 18.5 L0.5 17.5 Z" fill="#00A4EF" />
      {/* Bottom-right: yellow */}
      <path d="M10 10.5 L19 9 L19 16.5 L10 18 Z" fill="#FFB900" />
    </svg>
  )
}

export default function LinkXPVariant({ href, label }) {
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
          background: 'linear-gradient(180deg, #82CE4A 0%, #5DB52A 30%, #3D9610 55%, #4CAF18 85%, #3A8C0C 100%)',
          border: '2px solid #1E5C04',
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
        <WindowsFlag size={20} />

        {/* Label */}
        <span style={{ position: 'relative' }}>{label || 'start'}</span>
      </a>
    </div>
  )
}
