import { useState, useEffect, useRef } from 'react'
import TextBlock from './TextBlock'
import ImageBlock from './ImageBlock'
import SongBlock from './SongBlock'
import LinkBlock from './LinkBlock'
import CountdownBlock from './CountdownBlock'
import CarouselBlock from './CarouselBlock'
import ContainerBlock from './ContainerBlock'
import CustomBlock from './CustomBlock'

function BlockTransformWrapper({ block, children }) {
  const rotate       = block.rotate       ?? 0
  const scaleDesktop = block.scaleDesktop ?? 1
  const scaleMobile  = block.scaleMobile  ?? 1

  const hasTransform = rotate !== 0 || scaleDesktop !== 1 || scaleMobile !== 1
  if (!hasTransform) return children

  // Measure container width so narrow context works in any container
  // (editor preview panel, mobile preview frame, or real viewport).
  const wrapperRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  useEffect(() => {
    if (!wrapperRef.current) return
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })
    ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [])

  // Fall back to window.innerWidth on first render before ResizeObserver fires
  const isNarrow = (containerWidth || window.innerWidth) < 768

  const scale = isNarrow ? scaleMobile : scaleDesktop
  const parts = []
  if (rotate !== 0) parts.push(`rotate(${rotate}deg)`)
  if (scale !== 1)  parts.push(`scale(${scale})`)
  const transform = parts.join(' ') || 'none'

  return (
    <div ref={wrapperRef} style={{ transform, transformOrigin: 'center center' }}>
      {children}
    </div>
  )
}

export default function BlockRenderer({ block, isEditing = false, onChange, isHighlighted = false, noSizeWrapper = false }) {
  function renderBlock() {
    const props = { block, isEditing, onChange }
    switch (block.type) {
      case 'text':      return <TextBlock {...props} />
      case 'image':     return <ImageBlock {...props} />
      case 'song':      return <SongBlock {...props} />
      case 'link':      return <LinkBlock {...props} />
      case 'countdown': return <CountdownBlock {...props} />
      case 'carousel':  return <CarouselBlock {...props} />
      case 'container': return <ContainerBlock {...props} />
      case 'custom':    return <CustomBlock {...props} />
      default:          return <p className="text-fg-muted text-sm">Unknown block</p>
    }
  }

  if (isEditing) {
    return <div className="w-full min-w-0">{renderBlock()}</div>
  }

  if (noSizeWrapper) {
    return <BlockTransformWrapper block={block}>{renderBlock()}</BlockTransformWrapper>
  }

  return (
    <BlockTransformWrapper block={block}>
      <div style={{ position: 'relative' }}>
        {/* Hover highlight overlay — fades in when this block is hovered in the editor */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none z-10 transition-opacity duration-150"
          style={{
            opacity: isHighlighted ? 1 : 0,
            background: 'rgba(255, 80, 80, 0.35)',
          }}
        />
        {renderBlock()}
      </div>
    </BlockTransformWrapper>
  )
}
