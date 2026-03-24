import { nanoid } from 'nanoid'
import { colors } from './theme'
import { Type, ImageIcon, Music, Link, Timer, Images, Box, Code, PenLine, Gamepad2 } from 'lucide-react'

export const BLOCK_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  SONG: 'song',
  LINK: 'link',
  COUNTDOWN: 'countdown',
  CAROUSEL: 'carousel',
  CONTAINER: 'container',
  DRAWING: 'drawing',
  GAME: 'game',
  CUSTOM: 'custom',
}

export const TEXT_VARIANTS = ['plain', 'typewriter', 'postit', 'ransom']

export function createBlock(type) {
  const base = {
    id: nanoid(),
    type,
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
    case BLOCK_TYPES.GAME:
      return { ...base, variant: 'wordle', word: '', gameTitle: '', winMessage: '', loseMessage: '' }
    case BLOCK_TYPES.DRAWING:
      return { ...base, drawings: [], boardTitle: '', variant: 'default' }
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
  drawing: 'Drawing Board',
  game: 'Game',
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
  drawing: PenLine,
  game: Gamepad2,
}

/** Logo-color accent per block type — used by BlockPanel and SortableBlock */
export const BLOCK_ACCENTS = {
  [BLOCK_TYPES.TEXT]:       colors.logoRed,
  [BLOCK_TYPES.IMAGE]:      colors.logoOrange,
  [BLOCK_TYPES.SONG]:       colors.logoBlue,
  [BLOCK_TYPES.LINK]:       colors.logoGreen,
  [BLOCK_TYPES.COUNTDOWN]:  colors.logoOrange,
  [BLOCK_TYPES.CAROUSEL]:   colors.logoBlue,
  [BLOCK_TYPES.DRAWING]:    colors.logoGreen,
  [BLOCK_TYPES.GAME]:       colors.logoRed,
  [BLOCK_TYPES.CUSTOM]:     colors.logoOrange,
  [BLOCK_TYPES.CONTAINER]:  colors.logoBlue,
}

/**
 * CSS variable overrides (RGB channels) per block type.
 * Set these on a wrapper element to retheme all Tailwind `primary-*` classes within.
 */
export const BLOCK_ACCENT_VARS = {
  [BLOCK_TYPES.TEXT]:       { '--primary': '255 49 49',   '--primary-hover': '255 90 90',   '--primary-dim': '255 140 140', '--primary-subtle': '74 10 10'  },
  [BLOCK_TYPES.IMAGE]:     { '--primary': '255 117 31',  '--primary-hover': '255 150 80',  '--primary-dim': '255 180 130', '--primary-subtle': '78 35 4'   },
  [BLOCK_TYPES.SONG]:      { '--primary': '56 182 255',  '--primary-hover': '100 200 255', '--primary-dim': '150 215 255', '--primary-subtle': '8 45 78'   },
  [BLOCK_TYPES.LINK]:      { '--primary': '0 191 99',    '--primary-hover': '50 210 135',  '--primary-dim': '110 230 175', '--primary-subtle': '4 60 30'   },
  [BLOCK_TYPES.COUNTDOWN]: { '--primary': '255 117 31',  '--primary-hover': '255 150 80',  '--primary-dim': '255 180 130', '--primary-subtle': '78 35 4'   },
  [BLOCK_TYPES.CAROUSEL]:  { '--primary': '56 182 255',  '--primary-hover': '100 200 255', '--primary-dim': '150 215 255', '--primary-subtle': '8 45 78'   },
  [BLOCK_TYPES.DRAWING]:   { '--primary': '0 191 99',    '--primary-hover': '50 210 135',  '--primary-dim': '110 230 175', '--primary-subtle': '4 60 30'   },
  [BLOCK_TYPES.GAME]:      { '--primary': '255 49 49',   '--primary-hover': '255 90 90',   '--primary-dim': '255 140 140', '--primary-subtle': '74 10 10'  },
  [BLOCK_TYPES.CUSTOM]:    { '--primary': '255 117 31',  '--primary-hover': '255 150 80',  '--primary-dim': '255 180 130', '--primary-subtle': '78 35 4'   },
  [BLOCK_TYPES.CONTAINER]: { '--primary': '56 182 255',  '--primary-hover': '100 200 255', '--primary-dim': '150 215 255', '--primary-subtle': '8 45 78'   },
}
