// Ransom note: pool of distinct font stacks for per-letter randomisation
const RANSOM_FONTS = [
  "'Playfair Display', serif",
  "'Cormorant Garamond', serif",
  "'Abril Fatface', serif",
  "'Bebas Neue', sans-serif",
  "'Special Elite', monospace",
  "'Space Mono', monospace",
  "'Dancing Script', cursive",
  "'Fredoka', sans-serif",
  "Impact, 'Arial Black', sans-serif",
  "Georgia, serif",
  "'Times New Roman', serif",
  "Arial, Helvetica, sans-serif",
]

// Paired fg/bg themes — always readable, deliberately mismatched
const RANSOM_THEMES = [
  { bg: 'transparent', color: '#111111' },
  { bg: 'transparent', color: '#111111' },
  { bg: 'transparent', color: '#111111' },
  { bg: 'transparent', color: '#1a1a1a' },
  { bg: '#000000',     color: '#f0f0f0' },
  { bg: '#f5f0e1',     color: '#111111' },
  { bg: '#fffde7',     color: '#8b0000' },
  { bg: '#fce4ec',     color: '#880e4f' },
  { bg: '#e8f5e9',     color: '#1b5e20' },
  { bg: '#fff8e1',     color: '#e65100' },
  { bg: 'transparent', color: '#00008b' },
  { bg: 'transparent', color: '#8b0000' },
  { bg: '#ffffff',     color: '#000000' },
]

// Fast seeded pseudo-random: deterministic per (index, seed) pair
function ransomRand(i, offset, seed) {
  const x = ((i * 7 + offset + 1) * 2654435761 + seed * 6271) >>> 0
  return x / 0xffffffff
}

export default function TextRansomVariant({ content, sizePx, textAlign }) {
  // Seed from the content so the same text always renders identically
  const seed = content.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0) & 0x7fffffff
  const chars = content.split('')
  return (
    <p style={{ textAlign, margin: 0, lineHeight: 2, wordBreak: 'break-word' }}>
      {chars.map((char, i) => {
        if (char === '\n') return <br key={i} />
        if (char === ' ')  return <span key={i} style={{ display: 'inline-block', width: sizePx * 0.4 }} />

        const r = (offset) => ransomRand(i, offset, seed)
        const theme    = RANSOM_THEMES[Math.floor(r(0) * RANSOM_THEMES.length)]
        const font     = RANSOM_FONTS[Math.floor(r(1) * RANSOM_FONTS.length)]
        const weight   = r(2) > 0.45 ? 700 : 400
        const isItalic = r(3) > 0.72
        const isUpper  = r(4) > 0.55
        const scale    = 0.72 + r(5) * 0.72  // 0.72× – 1.44×
        const rotate   = (r(6) - 0.5) * 18   // –9° to +9°
        const hasBg    = theme.bg !== 'transparent'
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              fontFamily: font,
              fontWeight: weight,
              fontStyle: isItalic ? 'italic' : 'normal',
              fontSize: sizePx * scale,
              textTransform: isUpper ? 'uppercase' : 'none',
              transform: `rotate(${rotate}deg)`,
              transformOrigin: 'center 85%',
              color: theme.color,
              backgroundColor: theme.bg,
              padding: hasBg ? '1px 3px' : '0 1px',
              margin: `0 ${Math.round(r(7) * 1.5)}px`,
              lineHeight: 1.05,
              verticalAlign: 'bottom',
            }}
          >
            {char}
          </span>
        )
      })}
    </p>
  )
}
