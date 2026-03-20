import { getPageBgStyle } from '../../lib/pageUtils'
import BgEffect from './BgEffect'

/**
 * Wraps page content with the correct background treatment.
 *
 * viewportFixed (default: false) — pass true when the background should stay
 * pinned while content scrolls:
 *   • All background types use position:fixed layers (contained by the nearest
 *     transform ancestor — see usage notes below).
 *   • The caller must set transform:translateZ(0) on the wrapper so that the
 *     fixed layers are contained to the panel rather than the browser viewport.
 *     Without this, fixed layers would escape to the full screen.
 *
 * Leave viewportFixed=false only when no pinning is needed (rare).
 */
export default function PageBgWrapper({ settings, className = '', style = {}, children, viewportFixed = false }) {
  const pos = viewportFixed ? 'fixed' : 'absolute'

  if (settings?.bgFade) {
    const fit1 = settings.bgImageFit  || 'cover'
    const fit2 = settings.bgImageFit2 || 'cover'
    const layer2 = {
      position: pos, inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundColor:    settings.bgColor2 || undefined,
      backgroundImage:    settings.bgImage2 ? `url(${settings.bgImage2})` : undefined,
      backgroundSize:     settings.bgImage2 ? (fit2 === 'tile' ? 'var(--bg-tile-size)' : fit2) : undefined,
      backgroundRepeat:   settings.bgImage2 ? (fit2 === 'tile' ? 'repeat' : 'no-repeat') : undefined,
      backgroundPosition: settings.bgImage2 ? 'center' : undefined,
    }
    const layer1 = {
      position: pos, inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundColor:    settings.bgColor || undefined,
      backgroundImage:    settings.bgImage ? `url(${settings.bgImage})` : undefined,
      backgroundSize:     settings.bgImage ? (fit1 === 'tile' ? 'var(--bg-tile-size)' : fit1) : undefined,
      backgroundRepeat:   settings.bgImage ? (fit1 === 'tile' ? 'repeat' : 'no-repeat') : undefined,
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

  // Non-fade with viewportFixed: use a fixed layer instead of background-attachment:fixed.
  // Works on iOS Safari (which ignores background-attachment:fixed) and is not clipped
  // by overflow:clip on the public page.
  if (viewportFixed && (settings?.bgImage || settings?.bgColor)) {
    const fit = settings.bgImageFit || 'cover'
    const bgLayer = {
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundColor:    settings.bgColor || undefined,
      backgroundImage:    settings.bgImage ? `url(${settings.bgImage})` : undefined,
      backgroundSize:     settings.bgImage ? (fit === 'tile' ? 'var(--bg-tile-size)' : fit) : undefined,
      backgroundRepeat:   settings.bgImage ? (fit === 'tile' ? 'repeat' : 'no-repeat') : undefined,
      backgroundPosition: 'center',
    }
    return (
      <div className={className} style={{ position: 'relative', ...style }}>
        <div style={bgLayer} />
        <BgEffect effect={settings?.bgEffect} />
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </div>
    )
  }

  // Simple case: solid color background or no background, no fixed pinning needed.
  // background-attachment:scroll (the default) keeps the color/image tied to the
  // element's border box so it doesn't scroll when overflow content scrolls.
  const bgStyle = getPageBgStyle(settings)
  return (
    <div className={className} style={{ ...bgStyle, ...style }}>
      <BgEffect effect={settings?.bgEffect} />
      {children}
    </div>
  )
}
