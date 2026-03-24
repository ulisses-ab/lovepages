import { useState, useEffect } from 'react'
import AuthModal from '../components/auth/AuthModal'
import { useT } from '../lib/i18n'
import LangToggle from '../components/LangToggle'
import HeroRing from '../components/ui/HeroRing'

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

const RING_IMAGES = [
  '/preview1.jpg',
  '/preview2.webp',
  '/preview3.jpg',
  '/preview4.jpg',
  '/preview1.jpg',
  '/preview2.webp',
  '/preview3.jpg',
  '/preview4.jpg',
]

export default function HeroPage() {
  const [showAuth, setShowAuth] = useState(false)
  const { t } = useT()

  const [titleLine1, titleLine2] = t('hero.title').split('\n')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0b10', position: 'relative', overflow: 'hidden' }}>

      {/* Moving glows */}
      <div style={{
        position: 'absolute',
        width: '70vw', height: '70vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(100,180,255,0.15) 0%, transparent 65%)',
        top: '10%', left: '15%',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'glow-move-1 36s ease-in-out infinite',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute',
        width: '65vw', height: '65vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(80,220,140,0.13) 0%, transparent 65%)',
        top: '25%', left: '40%',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'glow-move-2 44s ease-in-out infinite',
        filter: 'blur(44px)',
      }} />
      <div style={{
        position: 'absolute',
        width: '60vw', height: '60vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,160,60,0.12) 0%, transparent 65%)',
        top: '35%', left: '5%',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'glow-move-3 40s ease-in-out infinite',
        filter: 'blur(42px)',
      }} />
      <div style={{
        position: 'absolute',
        width: '55vw', height: '55vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(180,100,255,0.11) 0%, transparent 65%)',
        top: '50%', left: '50%',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'glow-move-4 50s ease-in-out infinite',
        filter: 'blur(46px)',
      }} />
      <div style={{
        position: 'absolute',
        width: '50vw', height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,80,120,0.10) 0%, transparent 65%)',
        top: '5%', left: '60%',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'glow-move-5 46s ease-in-out infinite',
        filter: 'blur(44px)',
      }} />


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

      {/* Above-fold: text centered in remaining viewport */}
      <main className="flex flex-col items-center justify-center flex-1 px-4 text-center relative z-10" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <div className="flex flex-col items-center w-full min-w-0" style={{ maxWidth: 640 }}>
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
      </main>

      {/* Below-fold: full-width ring */}
      <div style={{ width: '100vw', height: 500, position: 'relative', zIndex: 1 }}>
        <HeroRing images={RING_IMAGES} width={600} imageDistance={1200} />
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-fg-ghost text-xs relative z-10">
        lovepages &copy; {new Date().getFullYear()}
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
