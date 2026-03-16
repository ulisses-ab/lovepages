import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { usePage } from '../hooks/usePage'
import { useAuth } from '../hooks/useAuth'
import EditorTopBar from '../components/editor/EditorTopBar'
import BlockPanel from '../components/editor/BlockPanel'
import Canvas from '../components/editor/Canvas'
import { useT } from '../lib/i18n'
import { getPageBgStyle } from '../lib/pageUtils'
import { supabase } from '../lib/supabase'
import { BLOCK_ICONS, createBlock } from '../lib/blockDefaults'

export default function EditorPage() {
  const { pageId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [previewMode, setPreviewMode] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [overId, setOverId] = useState(null)
  const loaded = useRef(false)
  const autoSaveTimer = useRef(null)
  const savePageRef = useRef(null)

  const { t } = useT()

  const {
    blocks,
    setBlocks,
    pageTitle,
    setPageTitle,
    pageSettings,
    setPageSettings,
    pageSlug,
    pagePublished,
    pageExpiresAt,
    saving,
    saveError,
    loadPage,
    savePage,
    publishPage,
    unpublishPage,
    checkSlugAvailable,
  } = usePage(pageId)

  // Keep a ref to the latest savePage so the debounce timer always calls current version
  useEffect(() => { savePageRef.current = savePage }, [savePage])

  useEffect(() => {
    loaded.current = false
    async function init() {
      await loadPage()
      requestAnimationFrame(() => { loaded.current = true })
    }
    init()
  }, [loadPage])

  // Autosave 1.5s after last change
  useEffect(() => {
    if (!loaded.current) return
    clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      const savedId = await savePageRef.current()
      if (savedId && !pageId) {
        navigate(`/editor/${savedId}`, { replace: true })
      }
    }, 1500)
    return () => clearTimeout(autoSaveTimer.current)
  }, [blocks, pageTitle, pageSettings, pageId, navigate])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  const isDraggingFromPanel = typeof activeId === 'string' && activeId.startsWith('panel::')
  const activeDragType = isDraggingFromPanel ? activeId.replace('panel::', '') : null
  const activeBlock = blocks.find(b => b.id === activeId)

  function handleDragStart(event) {
    setActiveId(event.active.id)
    setOverId(null)
  }

  function handleDragOver(event) {
    setOverId(event.over?.id ?? null)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)

    if (active.data.current?.fromPanel) {
      // Dropping from the block panel — insert at position
      const newBlock = createBlock(active.data.current.blockType)
      setBlocks(prev => {
        // Enforce autoplay exclusivity for song blocks
        const base = newBlock.type === 'song' && newBlock.autoplay
          ? prev.map(b => b.type === 'song' ? { ...b, autoplay: false } : b)
          : prev
        const idx = over ? base.findIndex(b => b.id === over.id) : -1
        const insertAt = idx === -1 ? base.length : idx
        const result = [...base]
        result.splice(insertAt, 0, newBlock)
        return result
      })
      return
    }

    // Reordering existing blocks
    if (!over || active.id === over.id) return
    setBlocks(prev => {
      const oldIndex = prev.findIndex(b => b.id === active.id)
      const newIndex = prev.findIndex(b => b.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function handleDragCancel() {
    setActiveId(null)
    setOverId(null)
  }

  function handleAddBlock(block) {
    setBlocks(prev => {
      const updated = block.type === 'song' && block.autoplay
        ? prev.map(b => b.type === 'song' ? { ...b, autoplay: false } : b)
        : prev
      return [...updated, block]
    })
  }

  async function handlePublish(slug) {
    const savedId = await publishPage(slug)
    if (savedId && !pageId) {
      navigate(`/editor/${savedId}`, { replace: true })
    }
  }

  async function handleStartPayment(slug) {
    // Save current content first so the page exists in DB
    const savedId = await savePage()
    const id = savedId || pageId
    if (!id) return

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ pageId: id, slug }),
      }
    )
    const json = await res.json()
    if (json.url) {
      window.location.href = json.url
    }
  }

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-base">
      <EditorTopBar
        pageTitle={pageTitle}
        setPageTitle={setPageTitle}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        saving={saving}
        onBack={() => navigate('/dashboard')}
        user={user}
        pageId={pageId}
        pageSlug={pageSlug}
        pagePublished={pagePublished}
        pageExpiresAt={pageExpiresAt}
        onPublish={handlePublish}
        onStartPayment={handleStartPayment}
        onUnpublish={unpublishPage}
        checkSlugAvailable={checkSlugAvailable}
      />

      {saveError && (
        <div className="bg-red-900/40 border-b border-red-700 text-red-300 text-xs px-4 py-1">
          {saveError}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {previewMode ? (
          /* Full preview */
          <main
            className="flex-1 overflow-y-auto"
            style={getPageBgStyle(pageSettings)}
          >
            <Canvas blocks={blocks} setBlocks={setBlocks} previewMode={true} />
          </main>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToWindowEdges]}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            {/* Desktop sidebar — hidden on mobile */}
            <aside className="hidden md:flex flex-col w-56 bg-surface border-r border-overlay overflow-y-auto shrink-0">
              <BlockPanel onAddBlock={handleAddBlock} />
            </aside>

            {/* Editor canvas */}
            <main className="flex-1 overflow-y-auto border-r border-overlay flex flex-col">
              <Canvas
                blocks={blocks}
                setBlocks={setBlocks}
                previewMode={false}
                pageSettings={pageSettings}
                onChangeSettings={patch => setPageSettings(prev => ({ ...prev, ...patch }))}
                onAddBlock={handleAddBlock}
                panelDragOverId={isDraggingFromPanel ? overId : null}
                isDraggingFromPanel={isDraggingFromPanel}
              />
            </main>

            {/* Live preview — desktop only */}
            <div className="flex-1 overflow-hidden hidden md:flex md:flex-col">
              <div className="text-xs text-fg-faint text-center bg-base py-2 border-b border-overlay tracking-wide uppercase shrink-0">
                {t('editor.previewLabel')}
              </div>
              <div className="flex-1 overflow-y-auto" style={getPageBgStyle(pageSettings)}>
                <Canvas blocks={blocks} setBlocks={setBlocks} previewMode={true} />
              </div>
            </div>

            {/* Ghost overlay that follows the cursor while dragging */}
            <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
              {isDraggingFromPanel && activeDragType ? (
                <div className="bg-surface rounded-xl border border-primary shadow-xl px-3 py-2 flex items-center gap-2 opacity-95 h-10">
                  {(() => { const Icon = BLOCK_ICONS[activeDragType]; return <Icon size={15} className="text-fg-secondary shrink-0" /> })()}
                  <span className="text-sm font-medium text-fg-secondary">{t(`block.${activeDragType}`)}</span>
                </div>
              ) : activeBlock ? (
                <div className="bg-surface rounded-xl border h-12 border-primary shadow-xl px-3 py-2 flex items-center gap-2 opacity-95">
                  <span className="text-fg-ghost">⠿</span>
                  {(() => { const Icon = BLOCK_ICONS[activeBlock.type]; return <Icon size={15} className="text-fg-secondary shrink-0" /> })()}
                  <span className="text-sm font-medium text-fg-secondary">{t(`block.${activeBlock.type}`)}</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

    </div>
  )
}
