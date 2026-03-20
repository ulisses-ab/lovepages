import { useState } from 'react'
import { X, Sparkles, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { inputClass } from '../../lib/theme'

const EXAMPLES = [
  'A birthday page for my best friend Ana, who loves cats and coffee',
  'An anniversary page for my partner — we met 3 years ago and our anniversary is June 12',
  'A thank-you page for my mom for everything she did for me this year',
  'A love letter page for my girlfriend, super romantic and heartfelt',
]

export default function AiGenerateModal({ onApply, onClose, hasBlocks }) {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    if (!description.trim()) return
    setLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-page`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ description }),
        }
      )
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Generation failed')
      onApply(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-base border border-overlay rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-fg-faint hover:text-fg transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-primary" />
          <h2 className="text-lg font-semibold text-fg">Build with AI</h2>
        </div>
        <p className="text-fg-muted text-sm mb-5">
          Describe the page you want — who it's for, the occasion, the vibe — and AI will create it for you.
        </p>

        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. A birthday page for my best friend Ana, who loves cats and sunsets…"
          rows={4}
          className={`${inputClass} resize-none mb-3`}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate() }}
        />

        {/* Example prompts */}
        <div className="flex flex-wrap gap-2 mb-5">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setDescription(ex)}
              className="text-xs text-fg-faint border border-overlay rounded-full px-3 py-1 hover:border-primary/50 hover:text-fg-muted transition-colors text-left"
            >
              {ex.length > 40 ? ex.slice(0, 40) + '…' : ex}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}

        {hasBlocks && (
          <p className="text-fg-faint text-xs mb-3">
            ⚠️ This will replace your current blocks.
          </p>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !description.trim()}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate page
            </>
          )}
        </button>

        <p className="mt-3 text-center text-xs text-fg-ghost">
          Tip: You can edit or rearrange any block after generating.
        </p>
      </div>
    </div>
  )
}
