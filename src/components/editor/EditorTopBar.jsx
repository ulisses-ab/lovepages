import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, LogOut, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useT } from '../../lib/i18n'
import LangToggle from '../LangToggle'
import PublishModal from './PublishModal'

export default function EditorTopBar({
  pageTitle, setPageTitle,
  previewMode, setPreviewMode,
  saving,
  onBack, user,
  pageId, pageSlug, pagePublished, pageExpiresAt,
  onPublish, onStartPayment, onUnpublish,
  checkSlugAvailable,
}) {
  const navigate = useNavigate()
  const { t } = useT()
  const [menuOpen, setMenuOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const menuRef = useRef(null)

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const avatarUrl = user?.user_metadata?.picture
  const displayName = user?.user_metadata?.name || user?.email || ''
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  async function handlePublish(slug) {
    await onPublish(slug)
    setPublishOpen(false)
  }

  async function handleUnpublish() {
    await onUnpublish()
    setPublishOpen(false)
  }

  return (
    <>
      <header className="h-14 bg-surface border-b border-overlay flex items-center gap-3 px-4 shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            title={t('editor.myPagesTitle')}
            className="p-2 text-fg-faint hover:text-fg transition-colors shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <span className="text-primary-dim font-bold text-lg shrink-0">💌 lovepages</span>

        <input
          type="text"
          value={pageTitle}
          onChange={e => setPageTitle(e.target.value)}
          placeholder={t('editor.titlePlaceholder')}
          className="flex-1 min-w-0 text-sm font-medium text-fg-secondary bg-transparent border-none outline-none placeholder-fg-faint"
        />

        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          {saving && (
            <span className="text-xs text-fg-faint hidden sm:inline">{t('editor.saving')}</span>
          )}
          <LangToggle />
          <button
            onClick={() => setPreviewMode(v => !v)}
            className={`p-2 rounded-lg text-sm font-medium transition ${
              previewMode
                ? 'bg-primary text-white'
                : 'bg-overlay text-fg-tertiary hover:bg-subtle'
            }`}
          >
            <span className="hidden sm:inline">{previewMode ? t('editor.edit') : t('editor.fullPreview')}</span>
            <span className="sm:hidden">{previewMode ? '✏️' : '👁'}</span>
          </button>

          {/* Publish button */}
          <button
            onClick={() => setPublishOpen(true)}
            className={`flex items-center gap-1.5 p-2 rounded-lg text-sm font-medium transition ${
              pagePublished
                ? 'bg-green-700/30 text-green-300 hover:bg-green-700/40'
                : 'bg-overlay text-fg-tertiary hover:bg-subtle'
            }`}
            title={pagePublished ? 'Published — click to manage' : 'Publish page'}
          >
            <Globe size={14} />
            <span className="hidden sm:inline">{pagePublished ? 'Published' : 'Publish'}</span>
          </button>

          {/* Profile avatar + dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-overlay hover:border-primary transition-colors flex items-center justify-center bg-overlay shrink-0"
              title={displayName}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-semibold text-fg-secondary">{initials}</span>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 w-44 bg-surface border border-overlay rounded-xl shadow-lg z-50 overflow-hidden">
                {displayName && (
                  <div className="px-3 py-2 border-b border-overlay">
                    <p className="text-xs text-fg-muted truncate">{displayName}</p>
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-fg-secondary hover:bg-overlay transition-colors"
                >
                  <LogOut size={14} />
                  {t('editor.signOutTitle')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {publishOpen && (
        <PublishModal
          pageTitle={pageTitle}
          currentSlug={pageSlug}
          published={pagePublished}
          pageExpiresAt={pageExpiresAt}
          onPublish={handlePublish}
          onStartPayment={onStartPayment}
          onUnpublish={handleUnpublish}
          onClose={() => setPublishOpen(false)}
          saving={saving}
          checkSlugAvailable={checkSlugAvailable}
        />
      )}
    </>
  )
}
