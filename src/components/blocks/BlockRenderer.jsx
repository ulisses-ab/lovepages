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

  // In the editor, never apply block backgrounds — they're preview-only.
  if (isEditing) {
    return (
      <div className={`w-full min-w-0 p-4 rounded-lg ${decorationClass}`}>
        {renderBlock()}
      </div>
    )
  }

  // Fade: two stacked absolute layers (bg2 below, bg1 above with a downward mask),
  // content sits above both as position:relative.
  if (block.bgFade) {
    const outerClass = [
      'w-full min-w-0 relative overflow-hidden',
      block.fullBleed ? '' : 'rounded-lg',
      decorationClass,
    ].filter(Boolean).join(' ')

    const fit1 = block.bgImageFit  || 'cover'
    const fit2 = block.bgImageFit2 || 'cover'

    const layer2 = {
      position: 'absolute', inset: 0,
      backgroundColor: block.bgColor2 || undefined,
      backgroundImage: block.bgImage2 ? `url(${block.bgImage2})` : undefined,
      backgroundSize: block.bgImage2 ? (fit2 === 'tile' ? 'var(--bg-tile-size)' : fit2) : undefined,
      backgroundRepeat: block.bgImage2 ? (fit2 === 'tile' ? 'repeat' : 'no-repeat') : undefined,
      backgroundPosition: block.bgImage2 ? 'center' : undefined,
    }

    const layer1 = {
      position: 'absolute', inset: 0,
      backgroundColor: block.bgColor || undefined,
      backgroundImage: block.bgImage ? `url(${block.bgImage})` : undefined,
      backgroundSize: block.bgImage ? (fit1 === 'tile' ? 'var(--bg-tile-size)' : fit1) : undefined,
      backgroundRepeat: block.bgImage ? (fit1 === 'tile' ? 'repeat' : 'no-repeat') : undefined,
      backgroundPosition: block.bgImage ? 'center' : undefined,
      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
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
  const fit = block.bgImageFit || 'cover'
  const wrapperStyle = {
    backgroundColor: block.bgColor || undefined,
    backgroundImage: block.bgImage ? `url(${block.bgImage})` : undefined,
    backgroundSize: block.bgImage ? (fit === 'tile' ? 'var(--bg-tile-size)' : fit) : undefined,
    backgroundRepeat: block.bgImage ? (fit === 'tile' ? 'repeat' : 'no-repeat') : undefined,
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
