import { useMemo } from 'react'

// Deterministic pseudo-random — same seed always gives the same layout
function sr(n) {
  const x = Math.sin(n + 1) * 10000
  return x - Math.floor(x)
}

const COUNT = 24

function Bubbles({ pos = 'fixed' }) {
  const items = useMemo(() => (
    Array.from({ length: COUNT }, (_, i) => ({
      id:      i,
      size:    16 + sr(i * 3)      * 54,         // 16–70 px
      left:    sr(i * 3 + 1) * 94 + 3,           // 3–97 %
      delay:  -(sr(i * 3 + 2) * 14),             // stagger: start mid-cycle
      dur:     7  + sr(i * 7)      * 10,          // 7–17 s
      drift:   (sr(i * 5) - 0.5)   * 110,        // ±55 px horizontal sway
      opacity: 0.28 + sr(i * 11)   * 0.42,       // 0.28–0.70
    }))
  ), [])

  return (
    <div style={{ position: pos, inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {items.map(b => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.left}%`,
            bottom: -(b.size + 12),
            width: b.size, height: b.size,
            borderRadius: '50%',
            opacity: b.opacity,
            animation: `float-bubble ${b.dur}s ${b.delay}s linear infinite`,
            '--b-drift': `${b.drift}px`,
            background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.55) 0%, rgba(200,240,255,0.22) 35%, rgba(100,200,255,0.08) 65%, transparent 100%)',
            border: '1px solid rgba(255,255,255,0.26)',
            overflow: 'hidden',
          }}
        >
          {/* Aqua gloss cap */}
          <div style={{
            position: 'absolute', top: '4%', left: '12%', right: '12%', height: '42%',
            borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.62), rgba(255,255,255,0.05))',
            pointerEvents: 'none',
          }} />
        </div>
      ))}
    </div>
  )
}

export default function BgEffect({ effect, pos = 'fixed' }) {
  if (effect === 'bubbles') return <Bubbles pos={pos} />
  return null
}
