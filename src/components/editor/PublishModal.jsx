import { useState, useEffect, useCallback } from 'react'
import { X, Globe, Check, AlertCircle, Loader, CreditCard, Clock } from 'lucide-react'
import { useT } from '../../lib/i18n'

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function isValidSlug(value) {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(value)
}

function isActiveExpiry(expiresAt) {
  if (!expiresAt) return false
  return new Date(expiresAt) > new Date()
}

function formatExpiry(expiresAt) {
  if (!expiresAt) return null
  return new Date(expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function PublishModal({
  pageTitle,
  currentSlug,
  published,
  pageExpiresAt,
  onPublish,
  onStartPayment,
  onUnpublish,
  onClose,
  saving,
  checkSlugAvailable,
}) {
  const { t } = useT()
  const [slug, setSlug] = useState(currentSlug || slugify(pageTitle))
  const [slugStatus, setSlugStatus] = useState(null) // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [redirecting, setRedirecting] = useState(false)

  const baseDomain = import.meta.env.VITE_BASE_DOMAIN
  const publicUrl = baseDomain
    ? `https://${slug}.${baseDomain}`
    : `${window.location.origin}/p/${slug}`
  const liveUrl = baseDomain
    ? `https://${currentSlug}.${baseDomain}`
    : `${window.location.origin}/p/${currentSlug}`

  // Detect likely region from browser locale for price display only
  const isBrazil = navigator.language === 'pt-BR' || navigator.language?.startsWith('pt-BR')
  const priceLabel = isBrazil ? 'R$ 20' : 'USD 10'

  const alreadyPaid = isActiveExpiry(pageExpiresAt)

  const checkSlug = useCallback(async (value) => {
    if (!value) { setSlugStatus(null); return }
    if (!isValidSlug(value)) { setSlugStatus('invalid'); return }
    if (value === currentSlug) { setSlugStatus('available'); return }
    setSlugStatus('checking')
    const available = await checkSlugAvailable(value)
    setSlugStatus(available ? 'available' : 'taken')
  }, [currentSlug, checkSlugAvailable])

  useEffect(() => {
    checkSlug(slug)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => checkSlug(slug), 400)
    return () => clearTimeout(timer)
  }, [slug, checkSlug])

  function handleSlugInput(e) {
    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlug(sanitized)
  }

  async function handlePublishClick() {
    if (alreadyPaid) {
      // Already paid — just update slug/content without new payment
      await onPublish(slug)
    } else {
      // Needs payment — redirect to Stripe Checkout
      setRedirecting(true)
      await onStartPayment(slug)
      // If redirect fails, reset state
      setRedirecting(false)
    }
  }

  const canPublish = slugStatus === 'available' && slug.length > 0
  const busy = saving || redirecting

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border border-overlay rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-overlay">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-primary" />
            <h2 className="text-fg font-semibold text-base">{t('publish.title')}</h2>
          </div>
          <button onClick={onClose} className="text-fg-faint hover:text-fg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Slug input */}
          <div>
            <label className="block text-xs text-fg-muted mb-1.5 font-medium">
              {t('publish.chooseAddress')}
            </label>
            <div className="flex items-center gap-1 bg-overlay rounded-xl px-3 py-2.5 border border-overlay focus-within:border-primary transition-colors">
              {baseDomain
                ? <span className="text-fg-faint text-sm shrink-0 select-none">https://</span>
                : <span className="text-fg-faint text-sm shrink-0 select-none">/p/</span>
              }
              <input
                type="text"
                value={slug}
                onChange={handleSlugInput}
                placeholder="your-page-name"
                className="flex-1 bg-transparent text-fg text-sm outline-none placeholder-fg-faint min-w-0"
              />
              {baseDomain && (
                <span className="text-fg-faint text-sm shrink-0 select-none">.{baseDomain}</span>
              )}
            </div>
            {/* Slug status */}
            <div className="mt-1.5 h-4 flex items-center gap-1.5">
              {slugStatus === 'checking' && (
                <>
                  <Loader size={12} className="text-fg-muted animate-spin" />
                  <span className="text-xs text-fg-muted">{t('publish.checking')}</span>
                </>
              )}
              {slugStatus === 'available' && (
                <>
                  <Check size={12} className="text-green-400" />
                  <span className="text-xs text-green-400">{t('publish.available')}</span>
                </>
              )}
              {slugStatus === 'taken' && (
                <>
                  <AlertCircle size={12} className="text-red-400" />
                  <span className="text-xs text-red-400">{t('publish.taken')}</span>
                </>
              )}
              {slugStatus === 'invalid' && slug.length > 0 && (
                <>
                  <AlertCircle size={12} className="text-fg-muted" />
                  <span className="text-xs text-fg-muted">{t('publish.invalid')}</span>
                </>
              )}
            </div>
          </div>

          {/* Preview URL */}
          {canPublish && (
            <div className="bg-overlay rounded-xl px-3 py-2.5">
              <p className="text-xs text-fg-muted mb-0.5">{t('publish.liveAt')}</p>
              <p className="text-sm text-primary font-medium break-all">{publicUrl}</p>
            </div>
          )}

          {/* Payment info — only shown when not already paid */}
          {!alreadyPaid && (
            <div className="bg-overlay rounded-xl px-3 py-3 flex items-start gap-3">
              <CreditCard size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-fg font-medium">{t('publish.oneTimePayment').replace('{price}', priceLabel)}</p>
                <p className="text-xs text-fg-muted mt-0.5">{t('publish.paymentNote')}</p>
              </div>
            </div>
          )}

          {/* Active subscription banner */}
          {alreadyPaid && (
            <div className="bg-green-900/20 border border-green-800/40 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <Clock size={14} className="text-green-400 shrink-0" />
              <p className="text-xs text-green-300">
                {t('publish.activeUntil').replace('{date}', formatExpiry(pageExpiresAt))}
              </p>
            </div>
          )}

          {/* Currently live banner */}
          {published && currentSlug && (
            <div className="bg-green-900/20 border border-green-800/40 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-green-400 font-medium mb-0.5">{t('publish.currentlyLive')}</p>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-300 underline break-all"
                >
                  {liveUrl}
                </a>
              </div>
              <button
                onClick={onUnpublish}
                disabled={busy}
                className="text-xs text-red-400 hover:text-red-300 transition-colors shrink-0 disabled:opacity-50"
              >
                {t('publish.unpublish')}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-overlay text-fg-secondary text-sm font-medium hover:bg-subtle transition-colors"
          >
            {t('publish.cancel')}
          </button>
          <button
            onClick={handlePublishClick}
            disabled={!canPublish || busy}
            className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {redirecting && <Loader size={14} className="animate-spin" />}
            {busy && !redirecting
              ? t('publish.publishing')
              : redirecting
                ? t('publish.redirecting')
                : alreadyPaid
                  ? (published ? t('publish.updateLink') : t('publish.publish'))
                  : t('publish.payAndPublish').replace('{price}', priceLabel)
            }
          </button>
        </div>
      </div>
    </div>
  )
}
