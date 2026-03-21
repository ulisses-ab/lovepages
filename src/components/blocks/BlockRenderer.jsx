import TextBlock from './TextBlock'
import ImageBlock from './ImageBlock'
import SongBlock from './SongBlock'
import LinkBlock from './LinkBlock'
import CountdownBlock from './CountdownBlock'
import CarouselBlock from './CarouselBlock'
import ContainerBlock from './ContainerBlock'
import CustomBlock from './CustomBlock'

function BlockTransformWrapper({ block, children }) {
  const rotate = block.rotate ?? 0
  // Support legacy scaleDesktop/scaleMobile by falling back to them
  const scale  = block.scale ?? block.scaleDesktop ?? 1

  const hasTransform = rotate !== 0 || scale !== 1
  if (!hasTransform) return children

  const parts = []
  if (rotate !== 0) parts.push(`rotate(${rotate}deg)`)
  if (scale !== 1)  parts.push(`scale(${scale})`)
  const transform = parts.join(' ') || 'none'

  return (
    <div style={{ transform, transformOrigin: 'center center' }}>
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
