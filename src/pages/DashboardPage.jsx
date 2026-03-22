import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePages } from '../hooks/usePages'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n'
import LangToggle from '../components/LangToggle'
// ── Mini page preview ─────────────────────────────────────────────────────────
// Renders a scaled-down static version of the page (no WebGL, no iframes).
// RENDER_W × RENDER_H is the simulated mobile viewport, then CSS-scaled to
// THUMB_W × THUMB_H for the dashboard thumbnail.

const RENDER_W = 390
const THUMB_W  = 88
const THUMB_H  = 148
const SCALE    = THUMB_W / RENDER_W
const RENDER_H = Math.round(THUMB_H / SCALE)

const FONT_SIZES = { sm: 13, base: 16, lg: 20, xl: 24, '2xl': 30, '3xl': 38, '4xl': 48 }
const FONT_FAMILIES = { sans: 'sans-serif', serif: 'Georgia,serif', mono: 'monospace', cursive: 'cursive' }

function MiniBlock({ block, gap = 16 }) {
  const bg = block.bgColor ? { backgroundColor: block.bgColor } : {}
  const imgStyle = block.bgImage
    ? { backgroundImage: `url(${block.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  if (block.type === 'image') {
    if (!block.src) return null
    return (
      <div style={{ width: '100%', borderRadius: 6, overflow: 'hidden', ...bg, ...imgStyle }}>
        <img src={block.src} alt="" draggable={false}
          style={{ display: 'block', width: '100%', objectFit: 'cover', maxHeight: 260 }} />
      </div>
    )
  }

  if (block.type === 'carousel') {
    const src = block.images?.[0]?.src
    if (!src) return null
    return (
      <div style={{ width: '100%', borderRadius: 6, overflow: 'hidden' }}>
        <img src={src} alt="" draggable={false}
          style={{ display: 'block', width: '100%', height: 200, objectFit: 'cover' }} />
      </div>
    )
  }

  if (block.type === 'text') {
    const fontSize   = FONT_SIZES[block.fontSize] || (block.variant === 'heading' ? 32 : 16)
    const fontFamily = FONT_FAMILIES[block.fontFamily] || 'sans-serif'
    const color      = block.color || '#fff'
    const textAlign  = block.align || 'left'
    return (
      <div style={{ width: '100%', padding: '2px 0', ...bg, ...imgStyle }}>
        <p style={{ margin: 0, fontSize, fontFamily, color, textAlign, lineHeight: 1.35, wordBreak: 'break-word' }}>
          {block.content || ''}
        </p>
      </div>
    )
  }

  if (block.type === 'link') {
    return (
      <div style={{ display: 'flex', justifyContent: block.align === 'right' ? 'flex-end' : block.align === 'center' ? 'center' : 'flex-start' }}>
        <div style={{
          display: 'inline-block', padding: '12px 28px', borderRadius: 9999,
          background: block.color || '#6d4aff', color: '#fff', fontSize: 18, fontWeight: 600,
        }}>
          {block.label || 'Link'}
        </div>
      </div>
    )
  }

  if (block.type === 'song') {
    return (
      <div style={{
        width: '100%', height: 72, borderRadius: 10,
        background: block.bgColor || 'rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px',
        ...imgStyle,
      }}>
        {block.coverUrl
          ? <img src={block.coverUrl} alt="" draggable={false} style={{ width: 46, height: 46, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
          : <div style={{ width: 46, height: 46, borderRadius: 6, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
        }
        <div style={{ flex: 1 }}>
          <div style={{ height: 11, borderRadius: 4, background: 'rgba(255,255,255,0.35)', width: '65%', marginBottom: 8 }} />
          <div style={{ height: 9,  borderRadius: 4, background: 'rgba(255,255,255,0.2)',  width: '40%' }} />
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: block.accentColor || 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
      </div>
    )
  }

  if (block.type === 'countdown') {
    return (
      <div style={{ width: '100%', padding: '18px 0', textAlign: 'center', ...bg, ...imgStyle }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums' }}>
          00:00:00:00
        </div>
        {block.label && (
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>{block.label}</div>
        )}
      </div>
    )
  }

  if (block.type === 'drawing') {
    const src = block.drawings?.[0]?.src
    return src
      ? <img src={src} alt="" draggable={false} style={{ width: '100%', borderRadius: 6 }} />
      : <div style={{ width: '100%', height: 60, borderRadius: 6, background: 'rgba(255,255,255,0.07)' }} />
  }

  if (block.type === 'container') {
    return (
      <div style={{
        width: '100%', borderRadius: 8, padding: 20,
        display: 'flex', flexDirection: 'column', gap,
        ...bg, ...imgStyle,
      }}>
        {(block.children || []).map((child, i) => (
          <MiniBlock key={child.id || i} block={child} gap={gap} />
        ))}
      </div>
    )
  }

  // Fallback for unknown types
  return <div style={{ width: '100%', height: 44, borderRadius: 6, background: 'rgba(255,255,255,0.07)' }} />
}

function MiniPagePreview({ page }) {
  const settings = page.settings || {}
  const blocks   = page.blocks   || []
  const gap      = settings.columnGap     ?? 16
  const padding  = settings.columnPadding ?? 24

  // Background — no WebGL/shader; fall back to colour or gradient placeholder
  let bgStyle = { backgroundColor: '#1a0f2e' }
  if (settings.bgImage) {
    bgStyle = { backgroundImage: `url(${settings.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  } else if (settings.bgColor) {
    bgStyle = { backgroundColor: settings.bgColor }
  } else if (settings.bgShader) {
    bgStyle = { background: 'linear-gradient(135deg, #7c3aed 0%, #3b1f7a 50%, #1a0f3a 100%)' }
  }

  return (
    <div style={{
      width: THUMB_W, height: THUMB_H, flexShrink: 0,
      borderRadius: 10, overflow: 'hidden', position: 'relative',
      boxShadow: '0 4px 20px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.09)',
    }}>
      <div style={{
        width: RENDER_W, height: RENDER_H,
        transform: `scale(${SCALE})`,
        transformOrigin: 'top left',
        position: 'absolute', top: 0, left: 0,
        pointerEvents: 'none', userSelect: 'none',
        padding, display: 'flex', flexDirection: 'column', gap,
        ...bgStyle,
      }}>
        {blocks.slice(0, 14).map((block, i) => (
          <MiniBlock key={block.id || i} block={block} gap={gap} />
        ))}
      </div>
    </div>
  )
}

function isActivePage(page) {
  return page.expires_at && new Date(page.expires_at) > new Date()
}

function PageRow({ page, showStatus, confirmId, deletingId, onOpen, onDelete, onConfirm, onCancelConfirm, formatDate, t }) {
  return (
    <li className="bg-surface border border-overlay rounded-2xl px-4 py-3 flex flex-row items-start gap-4">
      {/* Mini page preview */}
      <button onClick={onOpen} className="shrink-0 transition-opacity hover:opacity-80 mt-0.5" tabIndex={-1} aria-hidden>
        <MiniPagePreview page={page} />
      </button>

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
        <div className="flex items-center gap-2 shrink-0 ml-auto self-start mt-1">
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
        <div className="flex items-center gap-2 shrink-0 ml-auto self-start mt-1">
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
