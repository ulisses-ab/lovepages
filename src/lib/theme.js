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

  // Countdown block variant palette
  countdownSoftTile:   'rgba(251, 207, 232, 0.22)', // blush tile background
  countdownSoftBorder: 'rgba(251, 207, 232, 0.50)', // blush tile border
  countdownSoftNumber: '#be185d',                    // deep rose for digits
  countdownSoftUnit:   '#f472b6',                    // rose-400 for unit labels
  primaryGlow:         'rgba(147, 51, 234, 0.35)',   // purple glow for bold tiles

  // ── Frutiger Aero aesthetic ─────────────────────────────────────────────────
  // Used by CountdownAeroVariant, SongAeroVariant (sky-blue housing + lime accents)
  aeroShellLight:   '#ddf1ff', // outer pill top
  aeroShellMid:     '#b2dcf5', // outer pill mid
  aeroShellDark:    '#7ec5ee', // outer pill bottom
  aeroPanelDeep:    '#0c3a88', // inner display capsule mid
  aeroPanelDark:    '#07235a', // inner display capsule edge
  aeroTextDim:      'rgba(180,220,255,0.75)', // status label
  aeroUnitLabel:    'rgba(140,200,255,0.7)',  // unit labels under digits
  aeroLimeGreen:    '#54e83a', // progress bar fill start
  aeroLimeLight:    '#a8ff5a', // progress bar fill end
  aeroKnobTop:      '#d4ffb0', // progress knob top
  aeroKnobBot:      '#7af040', // progress knob bottom

  // ── Flip clock aesthetic (dark/moody) ───────────────────────────────────────
  // Used by CountdownFlipVariant CLOCK_THEMES — kept here for reference/future use
  flipDarkHousingTop: '#282828',
  flipDarkHousingBot: '#111111',
  flipDarkPanel:      '#1e1e1e',
  flipDarkNum:        '#ddd7c8',
  flipBeigeHousingTop:'#ede4d0',
  flipBeigeHousingBot:'#cfc4a8',
  flipBeigePanel:     '#f5ede0',
  flipBeigeNum:       '#2a1f0e',

  // ── Album / carousel aesthetic (cottagecore) ────────────────────────────────
  // Used by CarouselAlbumVariant AL constants — kept here for reference/future use
  albumPage:          '#f4edd8', // right page
  albumPageDark:      '#ece2c6', // left page
  albumPhotoFrame:    '#f8f5ef', // photo mount background
  albumText:          '#5c4a32', // primary text
  albumTextMuted:     '#9a8068', // captions, page numbers
  albumCoverDefault:  '#2c1a2e', // default cover (deep plum)
  albumCoverTitle:    '#f5e8d0', // cover title text (plain style)
  albumGold:          '#c9a84c', // gold corner brackets mid
  albumGoldLight:     '#e8c97a', // gold corner brackets top
  albumGoldDark:      '#a07838', // gold corner brackets bottom

  // ── Typewriter / cottagecore aesthetic ──────────────────────────────────────
  // Used by TextTypewriterVariant and CountdownShared LabelTag
  typewriterPaper:    '#f8f3e8', // cream paper background
  typewriterInk:      '#1c140a', // dark brown ink

  // ── Post-it aesthetic (playful/bold) ────────────────────────────────────────
  // Used by TextPostitVariant, CountdownShared LabelTag, CarouselAlbumVariant
  postitYellow:       '#fde047', // default sticky note color
  postitInk:          '#1c1400', // handwritten text color
}

/** Shared Tailwind class string for editor text inputs / selects. */
export const inputClass = 'w-full bg-overlay border border-subtle text-fg-secondary placeholder-fg-faint rounded px-2 py-1.5 text-sm'
