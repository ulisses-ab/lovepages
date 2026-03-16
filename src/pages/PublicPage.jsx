import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BlockRenderer from '../components/blocks/BlockRenderer'
import { getPageBgStyle } from '../lib/pageUtils'

export default function PublicPage({ slug: slugProp }) {
  const { slug: slugParam } = useParams()
  const slug = slugProp || slugParam

  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return }

    supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true)
        else setPage(data)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return <div className="min-h-screen bg-base" />
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">💌</p>
          <h1 className="text-fg text-xl font-semibold mb-2">Page not found</h1>
          <p className="text-fg-muted text-sm">This page doesn't exist or isn't published yet.</p>
        </div>
      </div>
    )
  }

  // Group consecutive non-fullBleed blocks together so fullBleed blocks can
  // escape the max-width container and stretch edge-to-edge.
  const segments = []
  let group = []
  for (const block of (page.blocks || [])) {
    if (block.fullBleed) {
      if (group.length) { segments.push({ fullBleed: false, blocks: group }); group = [] }
      segments.push({ fullBleed: true, block })
    } else {
      group.push(block)
    }
  }
  if (group.length) segments.push({ fullBleed: false, blocks: group })

  return (
    <div className="min-h-screen" style={{ ...getPageBgStyle(page.settings), overflowX: 'hidden' }}>
      {segments.map((seg, i) =>
        seg.fullBleed ? (
          <BlockRenderer key={seg.block.id} block={seg.block} />
        ) : (
          <div key={i} className="flex flex-wrap gap-4 p-3 sm:p-6 max-w-3xl mx-auto">
            {seg.blocks.map(block => (
              <BlockRenderer key={block.id} block={block} />
            ))}
          </div>
        )
      )}
      <footer className="text-center py-8">
        <a
          href={window.location.origin}
          className="text-fg-faint text-xs hover:text-fg-muted transition-colors"
        >
          Made with 💌 lovepages
        </a>
      </footer>
    </div>
  )
}
