import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BlockRenderer from '../components/blocks/BlockRenderer'
import PageBgWrapper from '../components/ui/PageBgWrapper'

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

  const colGap     = page.settings?.columnGap     ?? 16
  const colPadding = page.settings?.columnPadding ?? 24

  // Drawing blocks: public visitors can append their own drawings via a
  // security-definer RPC function that bypasses normal RLS.
  function makeDrawingChange(block) {
    return function(patch) {
      if (!patch.drawings) return
      // Find drawings that are new (not already in the block)
      const existingIds = new Set((block.drawings || []).map(d => d.id))
      const newDrawings = patch.drawings.filter(d => !existingIds.has(d.id))
      // Update local UI immediately
      setPage(p => ({
        ...p,
        blocks: (p.blocks || []).map(b => b.id === block.id ? { ...b, ...patch } : b),
      }))
      // Persist each new drawing via RPC
      newDrawings.forEach(drawing => {
        supabase.rpc('append_drawing', {
          p_page_id: page.id,
          p_block_id: block.id,
          p_drawing: drawing,
        }).then(({ error }) => {
          if (error) console.error('drawing save failed:', error.message)
        })
      })
    }
  }

  function blockProps(block) {
    return block.type === 'drawing' ? { block, onChange: makeDrawingChange(block) } : { block }
  }

  return (
    <PageBgWrapper settings={page.settings} className="min-h-[100dvh]" style={{ overflowX: 'clip' }} viewportFixed>
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1
        return seg.fullBleed ? (
          <BlockRenderer key={seg.block.id} {...blockProps(seg.block)} />
        ) : (
          <div
            key={i}
            className="flex flex-col max-w-3xl mx-auto"
            style={{
              gap: colGap,
              paddingTop: colPadding,
              paddingLeft: colPadding,
              paddingRight: colPadding,
              paddingBottom: isLast ? 0 : colPadding,
            }}
          >
            {seg.blocks.map(block => (
              <BlockRenderer key={block.id} {...blockProps(block)} />
            ))}
          </div>
        )
      })}
      {/* Fixed watermark — not in scroll flow so the page ends at the last block */}
      <a
        href={window.location.origin}
        style={{ position: 'fixed', bottom: 10, right: 14, zIndex: 50 }}
        className="text-fg-faint/60 text-[10px] hover:text-fg-muted transition-colors pointer-events-auto"
      >
        made with lovepages
      </a>
    </PageBgWrapper>
  )
}
