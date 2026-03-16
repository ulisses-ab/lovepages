import TextBlock from './TextBlock'
import ImageBlock from './ImageBlock'
import SongBlock from './SongBlock'
import LinkBlock from './LinkBlock'
import CountdownBlock from './CountdownBlock'
import CarouselBlock from './CarouselBlock'

export default function BlockRenderer({ block, isEditing = false, onChange }) {
  function renderBlock() {
    const props = { block, isEditing, onChange }
    switch (block.type) {
      case 'text':      return <TextBlock {...props} />
      case 'image':     return <ImageBlock {...props} />
      case 'song':      return <SongBlock {...props} />
      case 'link':      return <LinkBlock {...props} />
      case 'countdown': return <CountdownBlock {...props} />
      case 'carousel':  return <CarouselBlock {...props} />
      default:          return <p className="text-fg-muted text-sm">Unknown block</p>
    }
  }

  const decorationClass = [
    block.border ? 'border border-subtle' : '',
    block.shadow ? 'shadow-md' : '',
  ].filter(Boolean).join(' ')

  // Fade: two stacked absolute layers (bg2 below, bg1 above with a downward mask),
  // content sits above both as position:relative.
  if (block.bgFade) {
    const outerClass = [
      'w-full min-w-0 relative overflow-hidden',
      block.fullBleed ? '' : 'rounded-lg',
      decorationClass,
    ].filter(Boolean).join(' ')

    const layer2 = {
      position: 'absolute', inset: 0,
      backgroundColor: block.bgColor2 || undefined,
      backgroundImage: block.bgImage2 ? `url(${block.bgImage2})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }

    const layer1 = {
      position: 'absolute', inset: 0,
      backgroundColor: block.bgColor || undefined,
      backgroundImage: block.bgImage ? `url(${block.bgImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
    }

    return (
      <div className={outerClass}>
        <div style={layer2} />
        <div style={layer1} />
        <div className="relative">
          {block.fullBleed
            ? <div className="max-w-3xl mx-auto p-4">{renderBlock()}</div>
            : <div className="p-4">{renderBlock()}</div>
          }
        </div>
      </div>
    )
  }

  // Normal (no fade)
  const wrapperStyle = {
    backgroundColor: block.bgColor || undefined,
    backgroundImage: block.bgImage ? `url(${block.bgImage})` : undefined,
    backgroundSize: block.bgImage ? 'cover' : undefined,
    backgroundPosition: block.bgImage ? 'center' : undefined,
  }

  const wrapperClass = [
    'w-full min-w-0',
    block.fullBleed ? '' : 'p-4 rounded-lg',
    decorationClass,
  ].filter(Boolean).join(' ')

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
