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
      <div className="w-full h-12 flex items-center justify-center overflow-hidden rounded">
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

function SliderPreview() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '90%' }}>
      <div style={{ color: '#6b7280', fontSize: 12, flexShrink: 0 }}>‹</div>
      <div style={{ flex: 1, aspectRatio: '4/3', background: '#3a4453', borderRadius: 3, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 4 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1, 0, 0].map((a, i) => (
            <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: a ? colors.primary : '#4b5563' }} />
          ))}
        </div>
      </div>
      <div style={{ color: '#6b7280', fontSize: 12, flexShrink: 0 }}>›</div>
    </div>
  )
}

function AlbumPreview() {
  return (
    <div style={{ display: 'flex', width: '80%', height: 40 }}>
      <div style={{
        flex: 1, background: '#2c1a2e', borderRadius: '3px 0 0 3px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 7, color: '#f5e8d0', fontFamily: 'Georgia, serif',
      }}>
        cover
      </div>
      <div style={{
        flex: 1, background: '#f4edd8', borderRadius: '0 3px 3px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 4,
      }}>
        <div style={{ width: '80%', aspectRatio: '1', background: '#fff', border: '1px solid #ddd' }} />
      </div>
    </div>
  )
}

function XPCarouselPreview() {
  return (
    <div style={{ border: '2px solid #999', borderRadius: 2, overflow: 'hidden', width: '100%' }}>
      <div style={{
        background: 'linear-gradient(180deg, #3a6ea5, #245cb5)',
        color: 'white', padding: '2px 5px', fontFamily: 'Tahoma, sans-serif', fontSize: 7, fontWeight: 700,
      }}>
        My Pictures
      </div>
      <div style={{ background: '#ece9d8', padding: 4, display: 'flex', gap: 3, alignItems: 'center' }}>
        <div style={{ width: 30, height: 24, background: '#d0d8e0', border: '1px solid #aaa' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[70, 50].map((w, i) => (
            <div key={i} style={{ height: 4, background: '#bbb', borderRadius: 2, width: `${w}%` }} />
          ))}
        </div>
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
    const MODES = [
      { value: 'slider', label: 'Slideshow', Preview: SliderPreview },
      { value: 'album',  label: 'Photo album', Preview: AlbumPreview },
      { value: 'xp',     label: 'Retro XP',  Preview: XPCarouselPreview },
    ]

    return (
      <div className="space-y-3">
        {/* Display style first */}
        <div>
          <p className="text-xs text-fg-muted mb-2">{t('carousel.displayStyle')}</p>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map(({ value, label: mLabel, Preview }) => (
              <ModeCard key={value} label={mLabel} selected={mode === value} onClick={() => onChange({ mode: value })}>
                <Preview />
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
