import { useRef, useState, useEffect } from 'react'
import TextBlock from './TextBlock'
import ImageBlock from './ImageBlock'
import SongBlock from './SongBlock'
import LinkBlock from './LinkBlock'
import CountdownBlock from './CountdownBlock'
import CarouselBlock from './CarouselBlock'
import ContainerBlock from './ContainerBlock'
import CustomBlock from './CustomBlock'

function BlockTransformWrapper({ block, children }) {
  const wrapperRef = useRef(null)
  const [containerW, setContainerW] = useState(0)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const update = () => { if (el.offsetWidth > 0) setContainerW(el.offsetWidth) }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const rotate = block.rotate ?? 0
  // Legacy: `scale` was a single field; now we have separate desktop/mobile values
  const legacy       = block.scale ?? 1
  const scaleDesktop = block.scaleDesktop ?? legacy
  const scaleMobile  = block.scaleMobile  ?? legacy
  const scale        = containerW < 500 ? scaleMobile : scaleDesktop

  const marginTop    = block.marginTop    ?? 0
  const marginBottom = block.marginBottom ?? 0

  const hasTransform = rotate !== 0 || scale !== 1
  const hasMargin    = marginTop !== 0 || marginBottom !== 0

  const parts = []
  if (rotate !== 0) parts.push(`rotate(${rotate}deg)`)
  if (scale !== 1)  parts.push(`scale(${scale})`)

  const wrapperStyle = {}
  if (hasTransform) { wrapperStyle.transform = parts.join(' '); wrapperStyle.transformOrigin = 'center center' }
  if (hasMargin)    { wrapperStyle.marginTop = marginTop; wrapperStyle.marginBottom = marginBottom }

  return (
    <div ref={wrapperRef} style={Object.keys(wrapperStyle).length ? wrapperStyle : undefined}>
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
