import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function HtmlFrame({ html, className }) {
  const ref = useRef(null)

  // Auto-size the iframe to its content height
  useEffect(() => {
    const frame = ref.current
    if (!frame) return
    function resize() {
      try {
        frame.style.height = frame.contentDocument.body.scrollHeight + 'px'
      } catch {}
    }
    frame.addEventListener('load', resize)
    return () => frame.removeEventListener('load', resize)
  }, [])

  return (
    <iframe
      ref={ref}
      srcDoc={html}
      className={className}
      style={{ width: '100%', border: 'none', display: 'block' }}
      scrolling="no"
    />
  )
}

export default function CustomBlock({ block, isEditing, onChange }) {
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiOpen, setAiOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isEditing) {
    if (!block.html?.trim()) return null
    return <HtmlFrame html={block.html} />
  }

  async function handleGenerate() {
    if (!aiPrompt.trim()) return
    setLoading(true)
    setError('')
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('generate-html', {
        body: { prompt: aiPrompt },
      })
      if (fnErr) throw fnErr
      if (data?.error) throw new Error(data.error)
      onChange({ html: data.html })
      setAiOpen(false)
      setAiPrompt('')
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {aiOpen ? (
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 space-y-2">
          <p className="text-xs text-fg-muted">Describe what you want — e.g. "a Google Maps embed for Eiffel Tower" or "a confetti animation"</p>
          <textarea
            className="w-full bg-overlay border border-subtle text-fg placeholder-fg-faint rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary"
            rows={2}
            placeholder="Describe your HTML..."
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate() }}
            autoFocus
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={loading || !aiPrompt.trim()}
              className="flex-1 bg-primary text-white text-sm rounded py-1.5 font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {loading ? 'Generating…' : 'Generate ✨'}
            </button>
            <button
              onClick={() => { setAiOpen(false); setError('') }}
              className="px-3 text-sm text-fg-muted hover:text-fg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAiOpen(true)}
          className="w-full text-sm rounded border border-dashed border-primary/50 text-primary py-2 hover:bg-primary/10 transition-colors"
        >
          ✨ Generate with AI
        </button>
      )}

      <textarea
        className="w-full bg-overlay border border-subtle text-fg-secondary placeholder-fg-faint rounded px-3 py-2 text-xs font-mono resize-y min-h-32 focus:outline-none focus:border-primary"
        placeholder={'<div style="...">\n  Paste any HTML here\n</div>'}
        value={block.html || ''}
        onChange={e => onChange({ html: e.target.value })}
        spellCheck={false}
      />
    </div>
  )
}
