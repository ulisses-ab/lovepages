/**
 * Maps block.size → flex child style.
 * Applied by BlockRenderer (public view) and SortableBlock (editor canvas) so the
 * block's visual footprint is identical in both modes.
 */
export function getSizeStyle(size) {
  switch (size) {
    case 'half':  return { flex: '1 1 calc(50% - 8px)', minWidth: '200px', maxWidth: '100%' }
    case 'third': return { flex: '1 1 calc(33.33% - 11px)', minWidth: '150px', maxWidth: '100%' }
    case 'auto':  return { flexShrink: 0 }
    default:      return { width: '100%' }  // 'full'
  }
}

/**
 * Converts a page's settings object into an inline style object for the page background.
 * Used by both EditorPage (preview) and PublicPage.
 */
export function getPageBgStyle(settings) {
  if (settings?.bgImage) {
    const fit = settings.bgImageFit || 'cover'
    return {
      backgroundImage: `url(${settings.bgImage})`,
      backgroundSize: fit === 'tile' ? 'var(--bg-tile-size)' : fit,
      backgroundRepeat: fit === 'tile' ? 'repeat' : 'no-repeat',
      backgroundPosition: 'center',
    }
  }
  if (settings?.bgColor) return { backgroundColor: settings.bgColor }
  return undefined
}
