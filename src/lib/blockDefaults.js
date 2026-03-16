import { nanoid } from 'nanoid'
import { colors } from './theme'
import { Type, ImageIcon, Music, Video, Link, Timer, Images } from 'lucide-react'

export const BLOCK_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  SONG: 'song',
  VIDEO: 'video',
  LINK: 'link',
  COUNTDOWN: 'countdown',
  CAROUSEL: 'carousel',
}

export const ALIGN_OPTIONS = ['left', 'center', 'right']
export const TEXT_VARIANTS = ['heading', 'paragraph', 'quote']

export function createBlock(type) {
  const base = {
    id: nanoid(),
    type,
    align: 'center',
    bgColor: '',
    border: false,
    shadow: false,
  }

  switch (type) {
    case BLOCK_TYPES.TEXT:
      return { ...base, variant: 'paragraph', content: 'Write something...', fontFamily: 'sans', fontSize: 'base', color: '' }
    case BLOCK_TYPES.IMAGE:
      return { ...base, src: '', alt: '', caption: '' }
    case BLOCK_TYPES.SONG:
      return { ...base, embedUrl: '', title: '', artist: '', autoplay: true, variant: 'default', coverUrl: '', accentColor: '', textColor: '', vinylBase: 'wood' }
    case BLOCK_TYPES.VIDEO:
      return { ...base, src: '', embedUrl: '', title: '' }
    case BLOCK_TYPES.LINK:
      return { ...base, href: '', label: 'Click here', color: colors.primary }
    case BLOCK_TYPES.COUNTDOWN:
      return { ...base, targetDate: '', label: '', expiredMessage: '' }
    case BLOCK_TYPES.CAROUSEL:
      return { ...base, images: [], mode: 'slider', albumTitle: '', coverColor: '', coverTitleStyle: 'sticker' }
    default:
      return base
  }
}

/** Extracts the YouTube video ID from a watch or short URL. Returns null if not matched. */
export function getYouTubeId(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  return match ? match[1] : null
}

export const BLOCK_LABELS = {
  text: 'Text',
  image: 'Image',
  song: 'Song',
  video: 'Video',
  link: 'Link',
  countdown: 'Countdown',
  carousel: 'Photos',
}

export const BLOCK_ICONS = {
  text: Type,
  image: ImageIcon,
  song: Music,
  video: Video,
  link: Link,
  countdown: Timer,
  carousel: Images,
}
