import { useState, useRef, useEffect, forwardRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { inputClass, colors } from '../../lib/theme'
import { useT } from '../../lib/i18n'
import ImageUpload from '../ui/ImageUpload'

// ── Album aesthetic constants ─────────────────────────────────────────────────
const AL = {
  page:        '#f4edd8',
  pageDark:    '#ece2c6',
  photoFrame:  '#f8f5ef',
  photoShadow: 'rgba(60,40,15,0.28)',
  text:        '#5c4a32',
  textMuted:   '#9a8068',
  cover:       '#2c1a2e',
  coverAccent: '#a07848',
  coverBorder: '#c4a05a',
  coverTitle:  '#f5e8d0',
  spine:       '#1e1020',
  gold:        '#c9a84c',
  goldLight:   '#e8c97a',
  goldDark:    '#a07838',
}

const handwritten = "'Caveat', 'Segoe Script', 'Brush Script MT', cursive"

// ── Photo corner pocket (triangular mounting corner on the photo) ──────────────
function PhotoCorner({ pos }) {
  const S = 14
  const color = 'rgba(12,8,3,0.72)'
  const base = { position: 'absolute', width: S, height: S, pointerEvents: 'none', zIndex: 2 }
  const clips = {
    tl: { ...base, top: -1, left: -1,  clipPath: 'polygon(0 0, 100% 0, 0 100%)',  background: color },
    tr: { ...base, top: -1, right: -1, clipPath: 'polygon(0 0, 100% 0, 100% 100%)', background: color },
    bl: { ...base, bottom: -1, left: -1,  clipPath: 'polygon(0 0, 0 100%, 100% 100%)',  background: color },
    br: { ...base, bottom: -1, right: -1, clipPath: 'polygon(100% 0, 0 100%, 100% 100%)', background: color },
  }
  return <div style={clips[pos]} />
}

// ── Gold metallic corner bracket for the cover ────────────────────────────────
function CoverCorner({ pos }) {
  const ARM = 22, THK = 4, INS = 10
  const isTop  = pos[0] === 't'
  const isLeft = pos[1] === 'l'
  const edgeV = isTop  ? { top: INS }    : { bottom: INS }
  const edgeH = isLeft ? { left: INS }   : { right: INS }
  const goldGrad = 'linear-gradient(to bottom, #e8c97a 0%, #c9a84c 45%, #a07838 78%, #c9a84c 100%)'
  const shadow = '0 2px 6px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.28)'
  return (
    <>
      {/* Horizontal arm */}
      <div style={{ position: 'absolute', ...edgeV, ...edgeH, width: ARM, height: THK, background: goldGrad, boxShadow: shadow, zIndex: 4 }} />
      {/* Vertical arm */}
      <div style={{ position: 'absolute', ...edgeV, ...edgeH, width: THK, height: ARM, background: goldGrad, boxShadow: shadow, zIndex: 4 }} />
    </>
  )
}

// ── Leather / cloth cover texture (5-layer gradient stack) ────────────────────
function LeatherTexture() {
  return (
    <>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: [
          // Fine cross-grain weave lines ~95°
          'repeating-linear-gradient(95deg, transparent 0px, transparent 2px, rgba(255,255,255,0.022) 2px, rgba(255,255,255,0.022) 3px, transparent 3px, transparent 5px, rgba(0,0,0,0.048) 5px, rgba(0,0,0,0.048) 6px)',
          // Perpendicular grain ~5°
          'repeating-linear-gradient(5deg, transparent 0px, transparent 3px, rgba(255,255,255,0.015) 3px, rgba(255,255,255,0.015) 4px, transparent 4px, transparent 8px, rgba(0,0,0,0.038) 8px, rgba(0,0,0,0.038) 9px)',
          // Broader pebble undulation
          'repeating-linear-gradient(88deg, transparent 0px, transparent 9px, rgba(0,0,0,0.052) 9px, rgba(0,0,0,0.052) 11px, transparent 11px, transparent 20px)',
          // Directional sheen (light from top-left)
          'linear-gradient(148deg, rgba(255,255,255,0.082) 0%, rgba(255,255,255,0.022) 28%, transparent 52%, rgba(0,0,0,0.1) 82%, rgba(0,0,0,0.2) 100%)',
          // Spine shadow (left edge always darker on front cover)
          'linear-gradient(to right, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.08) 18%, transparent 44%)',
        ].join(', '),
      }} />
      {/* Top specular strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '28%', pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.055) 0%, transparent 100%)',
      }} />
    </>
  )
}

// ── Album cover ────────────────────────────────────────────────────────────────
const AlbumCover = forwardRef(function AlbumCover({ title, coverColor, coverTitleStyle = 'sticker' }, ref) {
  const bg    = coverColor || AL.cover
  const label = title || 'Our Photos'

  const titleNode = coverTitleStyle === 'sticker' ? (
    <div style={{
      background: '#fffef5', borderRadius: 5, padding: '7px 15px',
      transform: 'rotate(-2deg)',
      border: '2px solid #c82020',
      boxShadow: '0 4px 14px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.9)',
      maxWidth: '76%',
    }}>
      <p style={{
        color: '#3a2010', fontFamily: handwritten,
        fontSize: 15, fontWeight: 700, textAlign: 'center',
        lineHeight: 1.3, margin: 0,
      }}>{label}</p>
    </div>
  ) : coverTitleStyle === 'postit' ? (
    <div style={{ position: 'relative', transform: 'rotate(1.8deg)', display: 'inline-block' }}>
      <div style={{
        padding: '11px 16px 12px',
        background: 'linear-gradient(175deg, #fef08a 0%, #fde047 60%, #facc15 100%)',
        boxShadow: '0 5px 18px rgba(0,0,0,0.55), 3px 4px 0 rgba(0,0,0,0.12)',
        maxWidth: 180, textAlign: 'center',
      }}>
        <p style={{
          color: '#1c1400', fontFamily: handwritten,
          fontSize: 15, fontWeight: 700, lineHeight: 1.2, margin: 0,
        }}>{label}</p>
      </div>
      {/* Clear tape */}
      <div style={{
        position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)',
        width: 52, height: 18, pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.72) 20%, rgba(255,255,255,0.88) 50%, rgba(255,255,255,0.72) 80%, transparent)' }} />
        <div style={{ position: 'absolute', top: 1.5, left: 0, right: 0, bottom: 1.5, background: 'rgba(248,242,218,0.12)' }} />
        <div style={{ position: 'absolute', top: 2, left: '-10%', right: '-10%', bottom: 2, background: 'linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.2) 48%, rgba(255,255,255,0.3) 52%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(210,200,170,0.48) 20%, rgba(210,200,170,0.6) 50%, rgba(210,200,170,0.48) 80%, transparent)' }} />
      </div>
    </div>
  ) : (
    <p style={{
      color: AL.coverTitle, fontFamily: 'Georgia, "Times New Roman", serif',
      letterSpacing: '0.08em', fontSize: 15, fontWeight: 400, textAlign: 'center',
      padding: '0 22px', lineHeight: 1.55, margin: 0,
      textTransform: 'uppercase', textShadow: '0 1px 8px rgba(0,0,0,0.6)',
    }}>{label}</p>
  )

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: bg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', userSelect: 'none',
      }}>
        <LeatherTexture />

        {/* Debossed double-rule inset frame */}
        <div style={{
          position: 'absolute', inset: 16, pointerEvents: 'none', borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.055), 0 0 0 1px rgba(0,0,0,0.3)',
        }}>
          <div style={{ position: 'absolute', inset: 5, borderRadius: 2, border: '0.5px solid rgba(180,150,100,0.18)' }} />
        </div>

        {/* Gold corner protectors */}
        {['tl','tr','bl','br'].map(pos => <CoverCorner key={pos} pos={pos} />)}

        {titleNode}
      </div>
    </div>
  )
})

// ── Album page ─────────────────────────────────────────────────────────────────
const AlbumPage = forwardRef(function AlbumPage({ image, index, pageHeight = 320 }, ref) {
  const tilt     = ((index % 3) - 1) * 1.1
  const imgHeight = Math.floor(pageHeight * 0.44)

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: index % 2 === 0 ? AL.page : AL.pageDark,
        backgroundImage: [
          'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(160,130,90,0.06) 29px)',
          'repeating-linear-gradient(112deg, transparent 0px, transparent 22px, rgba(160,130,90,0.024) 22px, rgba(160,130,90,0.024) 24px, transparent 24px, transparent 50px)',
          'radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(80,55,30,0.1) 100%)',
        ].join(', '),
        boxShadow: index % 2 === 0
          ? 'inset -10px 0 22px rgba(60,40,20,0.13), inset 0 0 28px rgba(80,55,30,0.07)'
          : 'inset  10px 0 22px rgba(60,40,20,0.13), inset 0 0 28px rgba(80,55,30,0.07)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        userSelect: 'none', overflow: 'hidden',
      }}>

        {image ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            width: '100%', padding: '12px 16px', position: 'relative', zIndex: 1,
          }}>
            {/* White-framed Polaroid print */}
            <div style={{
              background: AL.photoFrame,
              padding: '7px 7px 26px 7px',
              boxShadow: `3px 6px 20px ${AL.photoShadow}, 0 2px 5px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(200,185,155,0.15)`,
              transform: `rotate(${tilt}deg)`,
              maxWidth: '87%',
              position: 'relative',
            }}>
              {/* Photo with mounting corners */}
              <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                <img
                  src={image.src}
                  alt={image.caption || ''}
                  style={{ display: 'block', width: '100%', height: imgHeight, objectFit: 'cover' }}
                  draggable={false}
                />
                {['tl','tr','bl','br'].map(pos => <PhotoCorner key={pos} pos={pos} />)}
              </div>
            </div>

            {image.caption && (
              <p style={{
                color: AL.textMuted, fontFamily: 'Georgia, serif', fontSize: 11,
                fontStyle: 'italic', textAlign: 'center', maxWidth: '84%',
                marginTop: 13, marginBottom: 0,
                transform: `rotate(${-tilt * 0.3}deg)`,
              }}>
                {image.caption}
              </p>
            )}
          </div>
        ) : (
          <div style={{ color: AL.textMuted, fontSize: 11, fontFamily: 'serif' }}>—</div>
        )}

        <div style={{
          position: 'absolute', bottom: 8, right: 12,
          color: AL.textMuted, fontFamily: 'Georgia, serif', fontSize: 10, opacity: 0.45,
        }}>
          {index + 1}
        </div>
      </div>
    </div>
  )
})

// ── Back cover ─────────────────────────────────────────────────────────────────
const AlbumBackCover = forwardRef(function AlbumBackCover({ coverColor }, ref) {
  const bg = coverColor || AL.cover
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: bg,
        overflow: 'hidden',
      }}>
        {/* Same leather texture, slightly darkened */}
        <LeatherTexture />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)', pointerEvents: 'none' }} />

        {/* Inset border */}
        <div style={{
          position: 'absolute', inset: 16, pointerEvents: 'none', borderRadius: 3,
          border: `1px solid rgba(180,150,100,0.22)`, opacity: 0.35,
        }} />

        {/* Decorative circular publisher seal */}
        {[52, 36, 6].map((size, i) => (
          <div key={i} style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size, height: size, borderRadius: '50%',
            border: i < 2 ? `${i === 0 ? 1 : 0.5}px solid rgba(180,150,100,0.28)` : 'none',
            background: i === 2 ? `rgba(180,150,100,0.22)` : 'transparent',
          }} />
        ))}

        {/* Gold corner protectors (mirrored — no leather sheen direction matters) */}
        {['tl','tr','bl','br'].map(pos => <CoverCorner key={pos} pos={pos} />)}
      </div>
    </div>
  )
})

// ── Album view ─────────────────────────────────────────────────────────────────
function AlbumView({ block }) {
  const { images = [], albumTitle = '', coverColor = '', coverTitleStyle = 'sticker' } = block
  const bookRef      = useRef()
  const containerRef = useRef()
  const [page, setPage]         = useState(0)
  const [pageSize, setPageSize] = useState(null)

  const STRIP  = 24
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = (w) => {
      if (w < 10) return
      const isMobile = w < 500
      const pageW = isMobile ? Math.floor(w - STRIP) : Math.floor(w / 2)
      const pageH = Math.floor(pageW * (320 / 240))
      setMobile(isMobile)
      setPageSize({ width: pageW, height: pageH })
    }
    update(el.clientWidth)
    const observer = new ResizeObserver(entries => update(entries[0].contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const paddedImages = images.length % 2 !== 0 ? [...images, null] : images
  const totalPages   = paddedImages.length + 2
  const mobileOffset = (mobile && pageSize) ? -(pageSize.width - STRIP) : 0

  function onFlip(e) { setPage(e.data) }
  function flipPrev() { bookRef.current?.pageFlip().flipPrev() }
  function flipNext() { bookRef.current?.pageFlip().flipNext() }

  const coverBg = coverColor || AL.cover

  return (
    <div ref={containerRef} className="w-full py-2 flex flex-col items-center gap-3">
      {pageSize && (
        <div style={mobile ? { width: pageSize.width + STRIP, overflow: 'visible' } : {}}>
          <div style={mobile ? { transform: `translateX(${mobileOffset}px)` } : {}}>
            <div style={{ filter: 'drop-shadow(0 3px 6px rgba(30,15,10,0.5)) drop-shadow(0 14px 38px rgba(30,15,10,0.38)) drop-shadow(0 36px 64px rgba(0,0,0,0.22))' }}>
              <HTMLFlipBook
                key={`${pageSize.width}x${pageSize.height}x${mobile}x${totalPages}`}
                ref={bookRef}
                width={pageSize.width}
                height={pageSize.height}
                size="fixed"
                showCover
                usePortrait={false}
                flippingTime={680}
                useMouseEvents
                mobileScrollSupport
                drawShadow
                onFlip={onFlip}
                startPage={0}
              >
                <AlbumCover title={albumTitle} coverColor={coverColor} coverTitleStyle={coverTitleStyle} />
                {paddedImages.map((img, i) => (
                  <AlbumPage key={i} image={img} index={i} pageHeight={pageSize.height} />
                ))}
                <AlbumBackCover coverColor={coverColor} />
              </HTMLFlipBook>
            </div>
          </div>
        </div>
      )}

      {pageSize && (
        <div className="flex items-center gap-4">
          <button
            onClick={flipPrev}
            disabled={page === 0}
            style={{
              width: 32, height: 28, borderRadius: '4px 4px 6px 6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: coverBg,
              backgroundImage: 'linear-gradient(168deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
              color: AL.coverTitle, opacity: page === 0 ? 0.3 : 1,
              transition: 'opacity 0.2s', cursor: page === 0 ? 'default' : 'pointer',
              border: 'none', outline: 'none',
            }}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ color: 'rgba(200,170,120,0.65)', fontFamily: 'Georgia, serif', fontSize: 11, letterSpacing: '0.08em', userSelect: 'none' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={flipNext}
            disabled={page >= totalPages - 1}
            style={{
              width: 32, height: 28, borderRadius: '4px 4px 6px 6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: coverBg,
              backgroundImage: 'linear-gradient(168deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
              color: AL.coverTitle, opacity: page >= totalPages - 1 ? 0.3 : 1,
              transition: 'opacity 0.2s', cursor: page >= totalPages - 1 ? 'default' : 'pointer',
              border: 'none', outline: 'none',
            }}
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CarouselBlock({ block, isEditing, onChange }) {
  const { images = [], mode = 'slider', albumTitle = '' } = block
  const { t } = useT()
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(null)

  function updateImages(next) { onChange({ images: next }) }
  function addImage(src) { updateImages([...images, { src, caption: '' }]) }

  function removeImage(i) {
    const next = images.filter((_, idx) => idx !== i)
    updateImages(next)
    if (current >= next.length) setCurrent(Math.max(0, next.length - 1))
  }

  function updateCaption(i, caption) {
    updateImages(images.map((img, idx) => idx === i ? { ...img, caption } : img))
  }

  function moveUp(i) {
    if (i === 0) return
    const next = [...images]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    updateImages(next)
  }

  function moveDown(i) {
    if (i === images.length - 1) return
    const next = [...images]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    updateImages(next)
  }

  function prev() { setCurrent(c => (c - 1 + images.length) % images.length) }
  function next() { setCurrent(c => (c + 1) % images.length) }

  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -40) next()
    else if (dx > 40) prev()
    touchStartX.current = null
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex gap-1.5">
          {[
            { value: 'slider', label: '▤ Slider' },
            { value: 'album',  label: '📖 Album' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange({ mode: opt.value })}
              className="px-3 py-1 rounded text-xs font-medium transition-all"
              style={{
                background: mode === opt.value ? colors.primary : colors.overlay,
                color: mode === opt.value ? colors.fg : colors.fgMuted,
                border: mode === opt.value ? `1px solid ${colors.primaryDim}` : `1px solid transparent`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {mode === 'album' && (
          <>
            <input
              className={inputClass}
              placeholder={t('carousel.albumTitlePlaceholder')}
              value={albumTitle}
              onChange={e => onChange({ albumTitle: e.target.value })}
            />
            <div className="flex gap-1.5">
              {[
                { value: 'sticker', label: '🏷 Sticker' },
                { value: 'postit',  label: '📝 Post-it' },
                { value: 'plain',   label: '✍️ Escrito' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ coverTitleStyle: opt.value })}
                  className="px-2.5 py-1 rounded text-xs font-medium transition-all"
                  style={{
                    background: (block.coverTitleStyle || 'sticker') === opt.value ? colors.primary : colors.overlay,
                    color: (block.coverTitleStyle || 'sticker') === opt.value ? colors.fg : colors.fgMuted,
                    border: (block.coverTitleStyle || 'sticker') === opt.value ? `1px solid ${colors.primaryDim}` : '1px solid transparent',
                  }}
                >{opt.label}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs" style={{ color: colors.fgMuted }}>Cover color</label>
              <input
                type="color"
                value={block.coverColor || AL.cover}
                onChange={e => onChange({ coverColor: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0"
              />
              {block.coverColor && (
                <button
                  onClick={() => onChange({ coverColor: '' })}
                  className="text-xs"
                  style={{ color: colors.fgFaint }}
                >
                  Reset
                </button>
              )}
            </div>
          </>
        )}

        {images.map((img, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => moveUp(i)}
                disabled={i === 0}
                className="text-xs leading-none px-1 py-0.5 rounded disabled:opacity-20 transition"
                style={{ color: colors.fgFaint, background: colors.overlay }}
              >▲</button>
              <button
                onClick={() => moveDown(i)}
                disabled={i === images.length - 1}
                className="text-xs leading-none px-1 py-0.5 rounded disabled:opacity-20 transition"
                style={{ color: colors.fgFaint, background: colors.overlay }}
              >▼</button>
            </div>
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: colors.overlay }}>
              {img.src
                ? <img src={img.src} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-fg-faint text-xs">?</div>
              }
            </div>
            <input
              className={`${inputClass} flex-1`}
              placeholder={t('carousel.captionPlaceholder')}
              value={img.caption}
              onChange={e => updateCaption(i, e.target.value)}
            />
            <button
              onClick={() => removeImage(i)}
              className="shrink-0 p-1 rounded transition"
              style={{ color: colors.fgFaint }}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <ImageUpload value="" onChange={addImage} previewClass="hidden" />
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (images.length === 0) {
    return (
      <div
        className="w-full aspect-[4/3] rounded-xl flex items-center justify-center text-sm"
        style={{ background: colors.overlay, color: colors.fgFaint }}
      >
        {t('carousel.noImages')}
      </div>
    )
  }

  // ── Album mode ─────────────────────────────────────────────────────────────
  if (mode === 'album') return <AlbumView block={block} />

  // ── Single image ───────────────────────────────────────────────────────────
  if (images.length === 1) {
    return (
      <figure className="w-full">
        <img src={images[0].src} alt={images[0].caption} className="w-full rounded-xl object-cover" />
        {images[0].caption && (
          <figcaption className="text-center text-sm mt-2" style={{ color: colors.fgMuted }}>
            {images[0].caption}
          </figcaption>
        )}
      </figure>
    )
  }

  // ── Slider ─────────────────────────────────────────────────────────────────
  const caption = images[current]?.caption

  return (
    <div className="w-full select-none">
      <div
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((img, i) => (
            <div key={i} className="w-full h-full shrink-0">
              <img src={img.src} alt={img.caption} className="w-full h-full object-cover" draggable={false} />
            </div>
          ))}
        </div>

        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition"
          style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}
          aria-label="Previous"
        ><ChevronLeft size={16} /></button>

        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition"
          style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}
          aria-label="Next"
        ><ChevronRight size={16} /></button>

        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-200"
              style={{ width: i === current ? 18 : 6, height: 6, background: i === current ? '#fff' : 'rgba(255,255,255,0.45)' }}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {caption && (
        <p className="text-center text-sm mt-2" style={{ color: colors.fgMuted }}>{caption}</p>
      )}
    </div>
  )
}
