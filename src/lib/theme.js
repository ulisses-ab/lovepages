/**
 * Single source of truth for the app color palette.
 * Imported by tailwind.config.js (build-time aliases) and by any
 * component that needs a color value at JS runtime (e.g. inline styles).
 */
export const colors = {
  // Page-level backgrounds
  base:    '#23272a', // outermost page bg
  surface: '#2e343d', // panels, cards
  overlay: '#424a57', // inputs, secondary surfaces, panel borders
  subtle:  '#5a616a', // input borders, hover backgrounds

  // Foreground / text
  fg:          '#f3f4f6', // primary text
  fgSecondary: '#e5e7eb',
  fgTertiary:  '#d1d5db',
  fgMuted:     '#9ca3af',
  fgFaint:     '#6b7280',
  fgGhost:     '#4b5563',

  // Brand / primary (purple)
  primary:       '#9333ea', // main buttons, active states
  primaryHover:  '#7e22ce', // button hover
  primaryDim:    '#c084fc', // subtle text, dim borders
  primarySubtle: '#4a044e', // very dark purple for hover bg tints

  // Vinyl disc gradient shades (SongBlock vinyl variant)
  vinylDark: '#0d0d0d',
  vinylMid:  '#1c1c1c',

  // Confetti burst colors (CountdownBlock celebration)
  confettiPink:   '#f9a8d4',
  confettiYellow: '#fde68a',
  confettiGreen:  '#6ee7b7',
}

/** Shared Tailwind class string for editor text inputs / selects. */
export const inputClass = 'w-full bg-overlay border border-subtle text-fg-secondary placeholder-fg-faint rounded px-2 py-1.5 text-sm'
