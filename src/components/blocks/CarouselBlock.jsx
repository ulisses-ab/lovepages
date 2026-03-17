import { X } from 'lucide-react'
import { inputClass, colors } from '../../lib/theme'
import { useT } from '../../lib/i18n'
import ImageUpload from '../ui/ImageUpload'
import ColorPicker from '../ui/ColorPicker'
import CarouselAlbumVariant, { AL } from './carousel/CarouselAlbumVariant'
import CarouselSliderVariant from './carousel/CarouselSliderVariant'
import CarouselXPVariant from './carousel/CarouselXPVariant'

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
    return (
      <div className="space-y-3">
        <div className="flex gap-1.5">
          {[
            { value: 'slider', label: '▤ Slider' },
            { value: 'album',  label: '📖 Album' },
            { value: 'xp',     label: '🪟 My Pictures' },
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
            <ColorPicker
              value={block.coverColor || AL.cover}
              onChange={val => onChange({ coverColor: val })}
              label="Cover color"
              clearable={!!block.coverColor}
              onClear={() => onChange({ coverColor: '' })}
            />
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

  // ── Variant dispatch ───────────────────────────────────────────────────────
  if (mode === 'xp')    return <CarouselXPVariant block={block} />
  if (mode === 'album') return <CarouselAlbumVariant block={block} />
  return <CarouselSliderVariant images={images} />
}
