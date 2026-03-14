import { createContext, useContext, useState } from 'react'
import { translations } from './translations'

function detectLang() {
  const stored = localStorage.getItem('lang')
  if (stored === 'en' || stored === 'pt') return stored
  const browser = navigator.language || ''
  return browser.startsWith('pt') ? 'pt' : 'en'
}

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(detectLang)

  function setLang(l) {
    localStorage.setItem('lang', l)
    setLangState(l)
  }

  function t(key) {
    return translations[lang][key] ?? translations['en'][key] ?? key
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useT() {
  return useContext(LangContext)
}
