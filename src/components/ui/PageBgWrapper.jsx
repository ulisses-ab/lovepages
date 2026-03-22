import { lazy, Suspense } from 'react'
import { getPageBgStyle } from '../../lib/pageUtils'
import BgEffect from './BgEffect'

const ShaderBgLayer = lazy(() => import('./ShaderBgLayer'))

/**
 * Wraps page content with the correct background treatment.
 *
 * viewportFixed=true  (PublicPage): background layers use position:fixed so
 *   they stay pinned as the document scrolls. Children render in normal flow.
 *
 * viewportFixed=false (editor preview): background layers use position:absolute
 *   on a non-scrolling outer div. Children are wrapped in
 *   position:absolute;inset:0 so they fill the panel. The CALLER must put
 *   the scroll container (overflow-y:auto) INSIDE children, not on PageBgWrapper
 *   itself — that is the key: scroll container sits on top of a stationary bg.
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

  // Shader gradient — takes priority over all other background types
  if (settings?.bgShader) {
    return (
      <div className={className} style={{ position: 'relative', ...style }}>
        <Suspense fallback={null}>
          <ShaderBgLayer shaderProps={settings.bgShader} pos={bgPos} />
        </Suspense>
        <BgEffect effect={settings?.bgEffect} variant={settings?.bgEffectVariant} pos={bgPos} />
        <div style={contentStyle}>{children}</div>
      </div>
    )
  }

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
        <BgEffect effect={settings?.bgEffect} variant={settings?.bgEffectVariant} pos={bgPos} />
        <div style={contentStyle}>{children}</div>
      </div>
    )
  }

  // Non-fade with viewportFixed: fixed layer stays pinned to the viewport
  // as the document scrolls. Works on iOS Safari (no background-attachment:fixed).
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
        <BgEffect effect={settings?.bgEffect} variant={settings?.bgEffectVariant} pos="fixed" />
        <div style={contentStyle}>{children}</div>
      </div>
    )
  }

  // Editor with image/color bg: CSS background on the non-scrolling outer div
  // stays put naturally since the outer div never scrolls.
  // Also handles no-background case.
  const bgStyle = getPageBgStyle(settings)
  return (
    <div className={className} style={{ position: 'relative', ...bgStyle, ...style }}>
      <BgEffect effect={settings?.bgEffect} variant={settings?.bgEffectVariant} pos="absolute" />
      <div style={contentStyle}>{children}</div>
    </div>
  )
}
