import { getPageBgStyle } from '../../lib/pageUtils'
import BgEffect from './BgEffect'

/**
 * Wraps page content with the correct background treatment.
 * - Plain color / image: applies inline style directly (same as before)
 * - Fade: renders two position:fixed layers behind the content so the
 *   fade effect fills the viewport regardless of scroll depth.
 */
export default function PageBgWrapper({ settings, className = '', style = {}, children, contained = false }) {
  if (settings?.bgFade) {
    const fit1 = settings.bgImageFit  || 'cover'
    const fit2 = settings.bgImageFit2 || 'cover'
    const layer2 = {
      position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundColor: settings.bgColor2 || undefined,
      backgroundImage: settings.bgImage2 ? `url(${settings.bgImage2})` : undefined,
      backgroundSize: settings.bgImage2 ? (fit2 === 'tile' ? 'var(--bg-tile-size)' : fit2) : undefined,
      backgroundRepeat: settings.bgImage2 ? (fit2 === 'tile' ? 'repeat' : 'no-repeat') : undefined,
      backgroundPosition: settings.bgImage2 ? 'center' : undefined,
    }
    const layer1 = {
      position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundColor: settings.bgColor || undefined,
      backgroundImage: settings.bgImage ? `url(${settings.bgImage})` : undefined,
      backgroundSize: settings.bgImage ? (fit1 === 'tile' ? 'var(--bg-tile-size)' : fit1) : undefined,
      backgroundRepeat: settings.bgImage ? (fit1 === 'tile' ? 'repeat' : 'no-repeat') : undefined,
      backgroundPosition: settings.bgImage ? 'center' : undefined,
      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
    }
    return (
      <div className={className} style={{ position: 'relative', overflow: contained ? 'hidden' : undefined, ...style }}>
        <div style={layer2} />
        <div style={layer1} />
        <BgEffect effect={settings?.bgEffect} contained={contained} />
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </div>
    )
  }

  return (
    <div className={className} style={{ position: 'relative', overflow: contained ? 'hidden' : undefined, ...getPageBgStyle(settings), ...style }}>
      <BgEffect effect={settings?.bgEffect} contained={contained} />
      {children}
    </div>
  )
}
