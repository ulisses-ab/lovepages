import confetti from 'canvas-confetti'
import { colors } from '../../../lib/theme'

export function getTimeLeft(targetDate) {
  const now = Date.now()
  const target = new Date(targetDate).getTime()
  const diff = target - now

  if (isNaN(target) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: diff <= 0 && !isNaN(target) }
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  }
}

export function pad(n) {
  return String(n).padStart(2, '0')
}

export function fireConfetti(el) {
  const rect = el.getBoundingClientRect()
  const x = (rect.left + rect.width / 2) / window.innerWidth
  const y = (rect.top + rect.height / 2) / window.innerHeight

  confetti({
    particleCount: 120,
    spread: 100,
    startVelocity: 25,
    decay: 0.92,
    origin: { x, y },
    colors: [colors.primary, colors.primaryDim, colors.confettiPink, colors.confettiYellow, colors.confettiGreen],
  })
}

// ── Post-it label ─────────────────────────────────────────────────────────────
export function LabelTag({ text }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
      <div style={{
        position: 'relative',
        display: 'inline-block',
        transform: 'rotate(-2deg)',
      }}>
        {/* Post-it body */}
        <div style={{
          position: 'relative',
          padding: '14px 22px 13px',
          background: 'linear-gradient(175deg, #fef08a 0%, #fde047 60%, #facc15 100%)',
          boxShadow: [
            '0 4px 18px rgba(0,0,0,0.55)',
            '0 1px 4px rgba(0,0,0,0.3)',
            '4px 5px 0 rgba(0,0,0,0.1)',
          ].join(', '),
          minWidth: 52,
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 28,
            fontWeight: 700,
            color: '#1c1400',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            position: 'relative',
          }}>
            {text}
          </span>
        </div>

        {/* Clear tape strip */}
        <div style={{
          position: 'absolute',
          top: -11, left: '50%', transform: 'translateX(-50%)',
          width: 60, height: 22,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}>
          {/* Top edge — brightest part, where tape catches light */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1.5,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.75) 20%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.75) 80%, transparent)',
          }} />
          {/* Tape body — nearly invisible warm film */}
          <div style={{
            position: 'absolute', top: 1.5, left: 0, right: 0, bottom: 1.5,
            background: 'rgba(248,242,218,0.13)',
          }} />
          {/* Diagonal glint across the body */}
          <div style={{
            position: 'absolute', top: 2, left: '-10%', right: '-10%', bottom: 2,
            background: 'linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0.32) 52%, transparent 70%)',
          }} />
          {/* Bottom edge — dimmer than top */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(210,200,170,0.5) 20%, rgba(210,200,170,0.6) 50%, rgba(210,200,170,0.5) 80%, transparent)',
          }} />
        </div>
      </div>
    </div>
  )
}
