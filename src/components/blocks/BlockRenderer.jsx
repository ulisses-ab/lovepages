import TextBlock from './TextBlock'
import ImageBlock from './ImageBlock'
import SongBlock from './SongBlock'
import LinkBlock from './LinkBlock'
import CountdownBlock from './CountdownBlock'
import CarouselBlock from './CarouselBlock'

export default function BlockRenderer({ block, isEditing = false, onChange }) {
  const wrapperStyle = {
    backgroundColor: block.bgColor || undefined,
    backgroundImage: block.bgImage ? `url(${block.bgImage})` : undefined,
    backgroundSize: block.bgImage ? 'cover' : undefined,
    backgroundPosition: block.bgImage ? 'center' : undefined,
  }

  const wrapperClass = [
    'w-full min-w-0',
    block.fullBleed ? '' : 'p-4 rounded-lg',
    block.border ? 'border border-subtle' : '',
    block.shadow ? 'shadow-md' : '',
  ]
    .filter(Boolean)
    .join(' ')

  function renderBlock() {
    const props = { block, isEditing, onChange }
    switch (block.type) {
      case 'text':  return <TextBlock {...props} />
      case 'image': return <ImageBlock {...props} />
      case 'song':  return <SongBlock {...props} />
      case 'link':      return <LinkBlock {...props} />
      case 'countdown': return <CountdownBlock {...props} />
      case 'carousel':  return <CarouselBlock {...props} />
      default:          return <p className="text-fg-muted text-sm">Unknown block</p>
    }
  }

  if (block.fullBleed) {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <div className="max-w-3xl mx-auto p-4">
          {renderBlock()}
        </div>
      </div>
    )
  }

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      {renderBlock()}
    </div>
  )
}
