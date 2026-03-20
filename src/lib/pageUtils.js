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
