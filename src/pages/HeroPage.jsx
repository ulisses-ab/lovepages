import { useState } from 'react'
import AuthModal from '../components/auth/AuthModal'
import { useT } from '../lib/i18n'
import LangToggle from '../components/LangToggle'

export default function HeroPage() {
  const [showAuth, setShowAuth] = useState(false)
  const { t } = useT()

  const [titleLine1, titleLine2] = t('hero.title').split('\n')

  return (
    <div className="min-h-screen bg-base flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-5 relative z-10">
        <span className="text-fg font-bold text-lg tracking-tight">
          love<span className="text-primary">pages</span>
        </span>
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

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 -mt-16">
        {/* Decorative hearts */}
        <div className="flex gap-3 text-4xl mb-8 select-none" aria-hidden="true">
          <span className="opacity-30 animate-[pulse_3s_ease-in-out_infinite]">💜</span>
          <span className="opacity-60 animate-[pulse_2s_ease-in-out_infinite_0.5s]">💜</span>
          <span className="opacity-30 animate-[pulse_3.5s_ease-in-out_infinite_1s]">💜</span>
        </div>

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
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-fg-ghost text-xs">
        lovepages &copy; {new Date().getFullYear()}
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
