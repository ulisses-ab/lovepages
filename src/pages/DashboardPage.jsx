import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePages } from '../hooks/usePages'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n'
import LangToggle from '../components/LangToggle'

function isActivePage(page) {
  return page.expires_at && new Date(page.expires_at) > new Date()
}

function PageRow({ page, showStatus, confirmId, deletingId, onOpen, onDelete, onConfirm, onCancelConfirm, formatDate, t }) {
  return (
    <li className="bg-surface border border-overlay rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-fg font-semibold truncate">
            {page.title || t('dashboard.untitled')}
          </p>
          {showStatus && (
            page.published
              ? <span className="flex items-center gap-1 text-green-400 text-xs font-medium shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  {t('dashboard.live')}
                </span>
              : <span className="flex items-center gap-1 text-fg-faint text-xs font-medium shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-fg-faint inline-block" />
                  {t('dashboard.notLive')}
                </span>
          )}
        </div>
        <p className="text-fg-muted text-xs mt-0.5">
          {t('dashboard.edited')} {formatDate(page.updated_at)}
        </p>
      </div>

      {/* Actions */}
      {confirmId === page.id ? (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-fg-muted text-xs">{t('dashboard.deleteConfirm')}</span>
          <button
            onClick={onDelete}
            disabled={deletingId === page.id}
            className="text-red-400 hover:text-red-300 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {deletingId === page.id ? t('dashboard.deleting') : t('dashboard.yes')}
          </button>
          <button
            onClick={onCancelConfirm}
            className="text-fg-muted hover:text-fg text-xs transition-colors"
          >
            {t('dashboard.cancel')}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpen}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            {t('dashboard.open')}
          </button>
          <button
            onClick={onConfirm}
            className="text-fg-muted hover:text-red-400 text-xs transition-colors px-2 py-1.5"
          >
            {t('dashboard.delete')}
          </button>
        </div>
      )}
    </li>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pages, loading, error, loadPages, deletePage } = usePages(user?.id)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const { t, lang } = useT()

  useEffect(() => {
    loadPages()
  }, [loadPages])

  async function handleDelete(pageId) {
    setDeletingId(pageId)
    try {
      await deletePage(pageId)
    } catch (err) {
      console.error('Delete failed:', err.message)
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-base flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-overlay">
        <img src="/logo.png" alt="Lovio" className="h-10 w-auto" />
        <div className="flex items-center gap-3">
          <LangToggle />
          <button
            onClick={handleSignOut}
            className="text-sm text-fg-muted hover:text-fg transition-colors"
          >
            {t('nav.signOut')}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-fg">{t('dashboard.myPages')}</h1>
          <button
            onClick={() => navigate('/editor')}
            className="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2 rounded-xl transition-colors text-sm"
          >
            {t('dashboard.newPage')}
          </button>
        </div>

        {loading && (
          <p className="text-fg-muted text-sm">{t('dashboard.loading')}</p>
        )}

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {!loading && !error && pages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-fg-muted text-lg mb-4">{t('dashboard.noPages')}</p>
            <button
              onClick={() => navigate('/editor')}
              className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {t('dashboard.createFirst')}
            </button>
          </div>
        )}

        {!loading && !error && pages.length > 0 && (() => {
          console.log(pages);
          const paidPages = pages.filter(isActivePage)
          const draftPages = pages.filter(p => !isActivePage(p))
          return (
            <div className="space-y-10">
              {paidPages.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold text-fg-muted uppercase tracking-widest mb-3">
                    {t('dashboard.paidPages')}
                  </h2>
                  <ul className="space-y-3">
                    {paidPages.map(page => (
                      <PageRow
                        key={page.id}
                        page={page}
                        showStatus
                        confirmId={confirmId}
                        deletingId={deletingId}
                        onOpen={() => navigate(`/editor/${page.id}`)}
                        onDelete={() => handleDelete(page.id)}
                        onConfirm={() => setConfirmId(page.id)}
                        onCancelConfirm={() => setConfirmId(null)}
                        formatDate={formatDate}
                        t={t}
                      />
                    ))}
                  </ul>
                </section>
              )}
              {draftPages.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold text-fg-muted uppercase tracking-widest mb-3">
                    {t('dashboard.draftPages')}
                  </h2>
                  <ul className="space-y-3">
                    {draftPages.map(page => (
                      <PageRow
                        key={page.id}
                        page={page}
                        showStatus={false}
                        confirmId={confirmId}
                        deletingId={deletingId}
                        onOpen={() => navigate(`/editor/${page.id}`)}
                        onDelete={() => handleDelete(page.id)}
                        onConfirm={() => setConfirmId(page.id)}
                        onCancelConfirm={() => setConfirmId(null)}
                        formatDate={formatDate}
                        t={t}
                      />
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )
        })()}
      </main>
    </div>
  )
}
