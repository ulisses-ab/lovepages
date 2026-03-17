import { nanoid } from 'nanoid'
import { colors } from './theme'
import { Type, ImageIcon, Music, Link, Timer, Images } from 'lucide-react'

export const BLOCK_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  SONG: 'song',
  LINK: 'link',
  COUNTDOWN: 'countdown',
  CAROUSEL: 'carousel',
}

export const ALIGN_OPTIONS = ['left', 'center', 'right']
export const TEXT_VARIANTS = ['plain', 'typewriter', 'postit', 'ransom']

export function createBlock(type) {
  const base = {
    id: nanoid(),
    type,
    align: 'center',
    bgColor: '',
    bgImage: '',
    bgImageFit: '',
    bgFade: false,
    bgColor2: '',
    bgImage2: '',
    bgImageFit2: '',
    border: false,
    shadow: false,
    fullBleed: false,
    bold: false,
    italic: false,
    outline: false,
  }

  switch (type) {
    case BLOCK_TYPES.TEXT:
      return { ...base, variant: 'plain', content: 'Write something...', fontFamily: 'inter', fontSize: 'base', color: '', noteColor: '' }
    case BLOCK_TYPES.IMAGE:
      return { ...base, src: '', alt: '', caption: '' }
    case BLOCK_TYPES.SONG:
      return { ...base, embedUrl: '', title: '', artist: '', autoplay: true, variant: 'default', coverUrl: '', accentColor: '', textColor: '', vinylBase: 'wood' }
    case BLOCK_TYPES.LINK:
      return { ...base, href: '', label: 'Click here', color: colors.primary }
    case BLOCK_TYPES.COUNTDOWN:
      return { ...base, targetDate: '', label: '', expiredMessage: '', variant: 'flip', clockColor: 'dark' }
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
  link: 'Link',
  countdown: 'Countdown',
  carousel: 'Photos',
}

export const BLOCK_ICONS = {
  text: Type,
  image: ImageIcon,
  song: Music,
  link: Link,
  countdown: Timer,
  carousel: Images,
}
