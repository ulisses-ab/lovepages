import { useT } from '../lib/i18n'

export default function LangToggle() {
  const { lang, setLang } = useT()

  return (
    <div className="hidden sm:flex items-center gap-0.5 bg-overlay rounded-lg p-0.5 text-xs font-medium">
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-0.5 rounded transition-colors ${
          lang === 'en' ? 'bg-primary text-white' : 'text-fg-muted hover:text-fg'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('pt')}
        className={`px-2 py-0.5 rounded transition-colors ${
          lang === 'pt' ? 'bg-primary text-white' : 'text-fg-muted hover:text-fg'
        }`}
      >
        PT
      </button>
    </div>
  )
}
