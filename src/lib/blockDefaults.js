import { nanoid } from 'nanoid'
import { colors } from './theme'
import { Type, ImageIcon, Music, Link, Timer, Images, Box, Code } from 'lucide-react'

export const BLOCK_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  SONG: 'song',
  LINK: 'link',
  COUNTDOWN: 'countdown',
  CAROUSEL: 'carousel',
  CONTAINER: 'container',
  CUSTOM: 'custom',
}

export const TEXT_VARIANTS = ['plain', 'typewriter', 'postit', 'ransom']

// size: how the block participates in its parent container's flex layout
// 'full'  → flex: 0 0 100% (takes the whole row)
// 'half'  → flex: 1 1 calc(50% - gap/2) (two per row)
// 'third' → flex: 1 1 calc(33% - gap)   (three per row)
// 'auto'  → flex: 0 0 auto              (shrinks to content width)
export const SIZE_OPTIONS = ['full', 'half', 'third', 'auto']

export function createBlock(type) {
  const base = {
    id: nanoid(),
    type,
    size: 'full',
    align: 'center',
  }

  switch (type) {
    case BLOCK_TYPES.TEXT:
      return { ...base, variant: 'plain', content: 'Write something...', fontFamily: 'inter', fontSize: 'base', color: '', noteColor: '' }
    case BLOCK_TYPES.IMAGE:
      return { ...base, variant: 'default', src: '', alt: '', caption: '' }
    case BLOCK_TYPES.SONG:
      return { ...base, embedUrl: '', title: '', artist: '', autoplay: true, variant: 'default', coverUrl: '', accentColor: '', textColor: '', vinylBase: 'wood' }
    case BLOCK_TYPES.LINK:
      return { ...base, href: '', label: 'Click here', color: colors.primary, variant: 'default' }
    case BLOCK_TYPES.COUNTDOWN:
      return { ...base, targetDate: '', label: '', expiredMessage: '', variant: 'flip', clockColor: 'dark' }
    case BLOCK_TYPES.CAROUSEL:
      return { ...base, images: [], mode: 'slider', albumTitle: '', coverColor: '', coverTitleStyle: 'sticker' }
    case BLOCK_TYPES.CONTAINER:
      return {
        ...base,
        fullBleed: true,  // escapes the page's max-width column by default
        children: [],
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        padding: 24,
      }
    case BLOCK_TYPES.CUSTOM:
      return { ...base, html: '' }
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
  container: 'Container',
  custom: 'Custom HTML',
}

export const BLOCK_ICONS = {
  text: Type,
  image: ImageIcon,
  song: Music,
  link: Link,
  countdown: Timer,
  carousel: Images,
  container: Box,
  custom: Code,
}
