import { getPageBgStyle } from '../../lib/pageUtils'
import BgEffect from './BgEffect'

/**
 * Wraps page content with the correct background treatment.
 *
 * viewportFixed (default: false) — pass true on the public page where
 * content scrolls at the HTML level.  Makes the background stay pinned
 * to the viewport instead of scrolling with the blocks.
 *   • fade:        layers use position:fixed instead of position:absolute
 *   • image:       adds background-attachment:fixed so the image stays put
 *   • solid color: no change (solid fills don't visually scroll anyway)
 *
 * Leave viewportFixed=false in the editor, where the preview sits inside
 * an overflow:auto panel — fixed positioning would escape the panel bounds.
 */
export default function PageBgWrapper({ settings, className = '', style = {}, children, viewportFixed = false }) {
  if (settings?.bgFade) {
    const fit1 = settings.bgImageFit  || 'cover'
    const fit2 = settings.bgImageFit2 || 'cover'
    const pos  = viewportFixed ? 'fixed' : 'absolute'
    const layer2 = {
      position: pos, inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundColor:  settings.bgColor2 || undefined,
      backgroundImage:  settings.bgImage2 ? `url(${settings.bgImage2})` : undefined,
      backgroundSize:   settings.bgImage2 ? (fit2 === 'tile' ? 'var(--bg-tile-size)' : fit2) : undefined,
      backgroundRepeat: settings.bgImage2 ? (fit2 === 'tile' ? 'repeat' : 'no-repeat') : undefined,
      backgroundPosition: settings.bgImage2 ? 'center' : undefined,
    }
    const layer1 = {
      position: pos, inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundColor:  settings.bgColor || undefined,
      backgroundImage:  settings.bgImage ? `url(${settings.bgImage})` : undefined,
      backgroundSize:   settings.bgImage ? (fit1 === 'tile' ? 'var(--bg-tile-size)' : fit1) : undefined,
      backgroundRepeat: settings.bgImage ? (fit1 === 'tile' ? 'repeat' : 'no-repeat') : undefined,
      backgroundPosition: settings.bgImage ? 'center' : undefined,
      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
    }
    return (
      <div className={className} style={{ position: 'relative', ...style }}>
        <div style={layer2} />
        <div style={layer1} />
        <BgEffect effect={settings?.bgEffect} />
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </div>
    )
  }

  // Non-fade: for image backgrounds on the public page, pin to viewport.
  const bgStyle = getPageBgStyle(settings)
  const finalBgStyle = (viewportFixed && bgStyle?.backgroundImage)
    ? { ...bgStyle, backgroundAttachment: 'fixed' }
    : bgStyle

  return (
    <div className={className} style={{ ...finalBgStyle, ...style }}>
      <BgEffect effect={settings?.bgEffect} />
      {children}
    </div>
  )
}
