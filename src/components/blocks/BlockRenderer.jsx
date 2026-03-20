import TextBlock from './TextBlock'
import ImageBlock from './ImageBlock'
import SongBlock from './SongBlock'
import LinkBlock from './LinkBlock'
import CountdownBlock from './CountdownBlock'
import CarouselBlock from './CarouselBlock'
import ContainerBlock from './ContainerBlock'
import CustomBlock from './CustomBlock'

// Maps block.size → flex child style.
// The parent container (page column or ContainerBlock) uses display:flex + flex-wrap:wrap.
// Each block's size determines how much of that row it claims.
function getSizeStyle(size) {
  switch (size) {
    case 'half':  return { flex: '1 1 calc(50% - 8px)', minWidth: '200px', maxWidth: '100%' }
    case 'third': return { flex: '1 1 calc(33.33% - 11px)', minWidth: '150px', maxWidth: '100%' }
    case 'auto':  return { flexShrink: 0 }
    default:      return { width: '100%' }  // 'full'
  }
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
    return <>{renderBlock()}</>
  }

  return (
    <div style={{ ...getSizeStyle(block.size ?? 'full'), position: 'relative' }} className="rounded-lg">
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
  )
}
