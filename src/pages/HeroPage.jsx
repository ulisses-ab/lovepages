import { useState, useEffect } from 'react'
import AuthModal from '../components/auth/AuthModal'
import { useT } from '../lib/i18n'
import LangToggle from '../components/LangToggle'

function OvO() {
  const [blinking, setBlinking] = useState(false)
  const [bouncing, setBouncing] = useState(false)

  useEffect(() => {
    function scheduleBlink() {
      const delay = 3000 + Math.random() * 5000
      return setTimeout(() => {
        setBlinking(true)
        setTimeout(() => { setBlinking(false); scheduleBlink() }, 200)
      }, delay)
    }
    const id = scheduleBlink()
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    function scheduleBounce() {
      const delay = 2000 + Math.random() * 4000
      return setTimeout(() => {
        setBouncing(true)
        setTimeout(() => { setBouncing(false); scheduleBounce() }, 800)
      }, delay)
    }
    const id = scheduleBounce()
    return () => clearTimeout(id)
  }, [])

  return (
    <div style={{ animation: 'ovo-sway 3s ease-in-out infinite', display: 'inline-block', transformOrigin: 'bottom center' }}>
      <img
        src={blinking ? '/ovo-blink.png' : '/ovo.png'}
        alt="OvO"
        draggable={false}
        style={{
          animation: bouncing ? 'ovo-bounce 0.8s cubic-bezier(0.36,0.07,0.19,0.97) forwards' : 'none',
          transformOrigin: 'bottom center',
          display: 'block',
        }}
        className="w-40 h-40 object-contain select-none"
      />
    </div>
  )
}

const PAGE_PREVIEWS = [
  { src: '/preview1.jpg',  label: 'Creative Portfolio' },
  { src: '/preview2.webp', label: 'Event Landing Page' },
  { src: '/preview3.jpg',  label: 'Product Showcase' },
  { src: '/preview4.jpg',  label: 'Personal Site' },
]

const n = PAGE_PREVIEWS.length

function BrowserCard({ preview, style }) {
  return (
    <div style={{
      position: 'absolute',
      width: 340,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
      ...style,
    }}>
      {/* Browser chrome */}
      <div style={{
        background: '#2a2f3a',
        padding: '7px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
        <div style={{
          flex: 1, marginLeft: 8, background: '#1a1f2a', borderRadius: 4, height: 14,
          display: 'flex', alignItems: 'center', paddingLeft: 6,
          fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace',
          overflow: 'hidden', whiteSpace: 'nowrap',
        }}>
          lovepages.com/{preview.label.toLowerCase().replace(/ /g, '-')}
        </div>
      </div>
      <img
        src={preview.src}
        alt={preview.label}
        draggable={false}
        style={{ display: 'block', width: '100%', height: 230, objectFit: 'cover', objectPosition: 'top' }}
      />
    </div>
  )
}

function PagePreviewSide({ initialIndex = 0, isRight = false }) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFadingOut(true)
      setTimeout(() => { setActiveIndex(i => (i + 1) % n); setFadingOut(false) }, 500)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const s = isRight ? 1 : -1  // sign for mirroring offsets

  const cards = [
    {
      preview: PAGE_PREVIEWS[(activeIndex + n - 1) % n],
      zIndex: 1, scale: 0.82,
      y: -60 * s, x: 24 * s, rotate: -6 * s, opacity: 0.35,
    },
    {
      preview: PAGE_PREVIEWS[activeIndex],
      zIndex: 3, scale: 1,
      y: 0, x: 0, rotate: -2 * s, opacity: fadingOut ? 0 : 1,
    },
    {
      preview: PAGE_PREVIEWS[(activeIndex + 1) % n],
      zIndex: 2, scale: 0.88,
      y: 60 * s, x: 12 * s, rotate: 2 * s, opacity: 0.5,
    },
  ]

  return (
    <div className="relative hidden lg:flex items-center justify-center" style={{ width: 380, height: 520, flexShrink: 0 }}>
      {cards.map(({ preview, zIndex, scale, y, x, rotate, opacity }, i) => (
        <BrowserCard
          key={i}
          preview={preview}
          style={{ zIndex, opacity, transform: `translateY(${y}px) translateX(${x}px) scale(${scale}) rotate(${rotate}deg)` }}
        />
      ))}
    </div>
  )
}

export default function HeroPage() {
  const [showAuth, setShowAuth] = useState(false)
  const { t } = useT()

  const [titleLine1, titleLine2] = t('hero.title').split('\n')

  return (
    <div className="min-h-screen bg-base flex flex-col overflow-hidden">
      {/* Nav */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-5 relative z-10">
        <img src="/logo.png" alt="Lovio" className="h-10 w-auto" />
        <div className="flex items-center gap-3">
          <LangToggle />
          <button
            onClick={() => setShowAuth(true)}
            className="text-sm text-fg-muted hover:text-fg transition-colors"
          >
            {t('nav.signIn')}
          </button>
        </div>
      </header>

      {/* Hero — 3-column layout */}
      <main className="flex-1 flex items-center justify-center px-4 gap-32 -mt-10">
        <PagePreviewSide initialIndex={0} isRight={false} />

        <div className="flex flex-col items-center text-center flex-shrink-0" style={{ maxWidth: 700 }}>
          <OvO />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-fg leading-tight mb-4">
            {titleLine1}<br />
            <span className="text-primary">{titleLine2}</span>
          </h1>

          <p className="text-fg-muted text-lg max-w-md mb-10">
            {t('hero.subtitle')}
          </p>

          <button
            onClick={() => setShowAuth(true)}
            className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-semibold text-lg px-10 py-4 rounded-2xl transition-colors shadow-lg"
          >
            {t('hero.cta')}
          </button>

          <p className="mt-4 text-fg-faint text-sm">{t('hero.free')}</p>
        </div>

        {/* Right side starts at index 2 to be out of phase with left */}
        <PagePreviewSide initialIndex={2} isRight={true} />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-fg-ghost text-xs">
        lovepages &copy; {new Date().getFullYear()}
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
