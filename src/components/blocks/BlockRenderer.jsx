import TextBlock from './TextBlock'
import ImageBlock from './ImageBlock'
import SongBlock from './SongBlock'
import VideoBlock from './VideoBlock'
import LinkBlock from './LinkBlock'
import CountdownBlock from './CountdownBlock'

export default function BlockRenderer({ block, isEditing = false, onChange }) {
  const wrapperStyle = {
    backgroundColor: block.bgColor || undefined,
  }

  const wrapperClass = [
    'w-full',
    'p-4 rounded-lg',
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
      case 'video': return <VideoBlock {...props} />
      case 'link':      return <LinkBlock {...props} />
      case 'countdown': return <CountdownBlock {...props} />
      default:          return <p className="text-fg-muted text-sm">Unknown block</p>
    }
  }

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      {renderBlock()}
    </div>
  )
}
