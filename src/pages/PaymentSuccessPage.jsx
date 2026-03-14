import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CheckCircle, Loader } from 'lucide-react'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const pageId = searchParams.get('page_id')
  const [slug, setSlug] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pageId) { setLoading(false); return }

    let attempts = 0
    const maxAttempts = 20 // poll up to 30s waiting for webhook

    async function poll() {
      const { data } = await supabase
        .from('pages')
        .select('slug, published, expires_at')
        .eq('id', pageId)
        .single()

      if (data?.published && data?.slug) {
        setSlug(data.slug)
        setLoading(false)
        return
      }

      attempts++
      if (attempts < maxAttempts) {
        setTimeout(poll, 1500)
      } else {
        setLoading(false)
      }
    }

    poll()
  }, [pageId])

  const baseDomain = import.meta.env.VITE_BASE_DOMAIN
  const publicUrl = slug
    ? baseDomain
      ? `https://${slug}.${baseDomain}`
      : `${window.location.origin}/p/${slug}`
    : null

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="bg-surface border border-overlay rounded-2xl p-8 max-w-md w-full text-center space-y-5">
        <CheckCircle size={52} className="text-green-400 mx-auto" />
        <div>
          <h1 className="text-fg text-2xl font-bold mb-1">Payment successful!</h1>
          <p className="text-fg-muted text-sm">Your page is now live for 1 year.</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-fg-faint text-sm">
            <Loader size={14} className="animate-spin" />
            Activating your page…
          </div>
        )}

        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-overlay rounded-xl px-4 py-3 text-primary text-sm font-medium break-all hover:bg-subtle transition-colors"
          >
            {publicUrl}
          </a>
        )}

        <Link
          to={pageId ? `/editor/${pageId}` : '/dashboard'}
          className="block py-3 px-6 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Back to editor
        </Link>
      </div>
    </div>
  )
}
