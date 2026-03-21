import { X } from 'lucide-react'
import { inputClass, colors } from '../../lib/theme'
import { useT } from '../../lib/i18n'
import ImageUpload from '../ui/ImageUpload'
import ColorPicker from '../ui/ColorPicker'
import CarouselAlbumVariant, { AL } from './carousel/CarouselAlbumVariant'
import CarouselSliderVariant from './carousel/CarouselSliderVariant'
import CarouselXPVariant from './carousel/CarouselXPVariant'

function ModeCard({ label, selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-overlay bg-surface hover:border-subtle'
      }`}
    >
      <div className="w-full h-24 overflow-hidden rounded">
        {children}
      </div>
      <span className={`text-xs leading-tight text-center w-full truncate ${
        selected ? 'text-primary-dim font-medium' : 'text-fg-muted'
      }`}>
        {label}
      </span>
    </button>
  )
}

function ScaledPreview({ children, scale = 0.45 }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        width: '260px',
        left: '50%',
        top: 0,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: 'top center',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        {children}
      </div>
    </div>
  )
}

export default function CarouselBlock({ block, isEditing, onChange }) {
  const { images = [], mode = 'slider', albumTitle = '' } = block
  const { t } = useT()

  function updateImages(next) { onChange({ images: next }) }
  function addImage(src) { updateImages([...images, { src, caption: '' }]) }
  function removeImage(i) { updateImages(images.filter((_, idx) => idx !== i)) }
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

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (isEditing) {
    const previewImages = images.length > 0 ? images : [{ src: '', caption: '' }]
    const MODES = [
      { value: 'slider', label: 'Slideshow', preview: (
        <ScaledPreview scale={0.42}>
          <CarouselSliderVariant images={previewImages} />
        </ScaledPreview>
      )},
      { value: 'album', label: 'Photo album', preview: (
        <ScaledPreview scale={0.28}>
          <CarouselAlbumVariant block={{ ...block, images: previewImages }} />
        </ScaledPreview>
      )},
      { value: 'xp', label: 'Retro XP', preview: (
        <ScaledPreview scale={0.38}>
          <CarouselXPVariant block={{ ...block, images: previewImages }} />
        </ScaledPreview>
      )},
    ]

    return (
      <div className="space-y-3">
        {/* Display style first */}
        <div>
          <p className="text-xs text-fg-muted mb-2">{t('carousel.displayStyle')}</p>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map(({ value, label: mLabel, preview }) => (
              <ModeCard key={value} label={mLabel} selected={mode === value} onClick={() => onChange({ mode: value })}>
                {preview}
              </ModeCard>
            ))}
          </div>
        </div>

        {/* Album settings — only when album mode is active */}
        {mode === 'album' && (
          <div className="rounded-lg border border-overlay p-3 space-y-2.5">
            <p className="text-xs font-medium text-fg-muted">{t('carousel.albumSettings')}</p>
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
                { value: 'plain',   label: '✍️ Plain' },
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
            <ColorPicker
              value={block.coverColor || AL.cover}
              onChange={val => onChange({ coverColor: val })}
              label="Cover color"
              clearable={!!block.coverColor}
              onClear={() => onChange({ coverColor: '' })}
            />
          </div>
        )}

        {/* Photo list */}
        {images.length > 0 && (
          <div>
            <p className="text-xs text-fg-muted mb-2">{t('carousel.yourPhotos')}</p>
            <div className="space-y-2">
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
            </div>
          </div>
        )}

        <ImageUpload value="" onChange={addImage} previewClass="hidden" label={t('carousel.addPhoto')} />
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

  // ── Variant dispatch ───────────────────────────────────────────────────────
  if (mode === 'xp')    return <CarouselXPVariant block={block} />
  if (mode === 'album') return <CarouselAlbumVariant block={block} />
  return <CarouselSliderVariant images={images} />
}
