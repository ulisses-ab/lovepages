import { getPageBgStyle } from '../../lib/pageUtils'
import BgEffect from './BgEffect'

/**
 * Wraps page content with the correct background treatment.
 *
 * viewportFixed=true  (PublicPage): background layers use position:fixed so
 *   they stay pinned as the document scrolls. Children render in normal flow.
 *
 * viewportFixed=false (editor preview): background layers use position:absolute
 *   on a non-scrolling outer div. Children are wrapped in
 *   position:absolute;inset:0 so they fill the panel — the CALLER must put
 *   overflow-y:auto on whatever is inside children (e.g. Canvas), NOT on
 *   PageBgWrapper itself. This is the key: scroll container is INSIDE
 *   the background container, so the background never scrolls.
 */
export default function PageBgWrapper({ settings, className = '', style = {}, children, viewportFixed = false }) {
  const bgPos = viewportFixed ? 'fixed' : 'absolute'

  // Children wrapper:
  //   viewportFixed  → in-flow (grows with content, document scroll)
  //   !viewportFixed → absolute fill (editor panel has a fixed flex height;
  //                    inner overflow-y:auto is set by the caller on Canvas wrapper)
  const contentStyle = viewportFixed
    ? { position: 'relative', zIndex: 1 }
    : { position: 'absolute', inset: 0, zIndex: 1 }

  if (settings?.bgFade) {
    const fit1 = settings.bgImageFit  || 'cover'
    const fit2 = settings.bgImageFit2 || 'cover'
    const layer2 = {
      position: bgPos, inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundColor:    settings.bgColor2 || undefined,
      backgroundImage:    settings.bgImage2 ? `url(${settings.bgImage2})` : undefined,
      backgroundSize:     settings.bgImage2 ? (fit2 === 'tile' ? 'var(--bg-tile-size)' : fit2) : undefined,
      backgroundRepeat:   settings.bgImage2 ? (fit2 === 'tile' ? 'repeat' : 'no-repeat') : undefined,
      backgroundPosition: settings.bgImage2 ? 'center' : undefined,
    }
    const layer1 = {
      position: bgPos, inset: 0, zIndex: 0, pointerEvents: 'none',
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
        <BgEffect effect={settings?.bgEffect} pos={bgPos} />
        <div style={contentStyle}>{children}</div>
      </div>
    )
  }

  // Non-fade image or color — use a background layer when viewportFixed (fixed position),
  // or a CSS background on the outer div when in the editor (stays on non-scrolling element).
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
        <BgEffect effect={settings?.bgEffect} pos="fixed" />
        <div style={contentStyle}>{children}</div>
      </div>
    )
  }

  // Editor with image/color bg, or no background at all.
  // CSS background on the non-scrolling outer div stays put naturally.
  const bgStyle = getPageBgStyle(settings)
  return (
    <div className={className} style={{ position: 'relative', ...bgStyle, ...style }}>
      <BgEffect effect={settings?.bgEffect} pos="absolute" />
      <div style={contentStyle}>{children}</div>
    </div>
  )
}
