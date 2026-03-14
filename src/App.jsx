import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { LangProvider } from './lib/i18n'
import HeroPage from './pages/HeroPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import PublicPage from './pages/PublicPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'

/**
 * Returns the subdomain slug if the app is running on a custom subdomain.
 * Requires VITE_BASE_DOMAIN to be set (e.g. "lovepages.com").
 * e.g. "mypage.lovepages.com" → "mypage"
 *      "lovepages.com"       → null
 *      "localhost"           → null (dev: use /p/:slug path instead)
 */
function getSubdomainSlug() {
  const base = import.meta.env.VITE_BASE_DOMAIN
  if (!base) return null
  const host = window.location.hostname
  const suffix = '.' + base
  if (host.endsWith(suffix)) {
    return host.slice(0, host.length - suffix.length) || null
  }
  return null
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-base" />
  }

  // If we're on a subdomain (e.g. mypage.lovepages.com), render the public page directly
  const subdomainSlug = getSubdomainSlug()
  if (subdomainSlug) {
    return (
      <LangProvider>
        <PublicPage slug={subdomainSlug} />
      </LangProvider>
    )
  }

  return (
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<HeroPage />}
          />
          <Route
            path="/dashboard"
            element={user ? <DashboardPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/editor"
            element={user ? <EditorPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/editor/:pageId"
            element={user ? <EditorPage /> : <Navigate to="/" replace />}
          />
          {/* Public page viewer — used in dev or when subdomain routing isn't configured */}
          <Route
            path="/p/:slug"
            element={<PublicPage />}
          />
          <Route
            path="/payment-success"
            element={<PaymentSuccessPage />}
          />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  )
}
