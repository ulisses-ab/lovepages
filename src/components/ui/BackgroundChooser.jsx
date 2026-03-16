import { useState } from 'react'
import { Upload, ArrowDown } from 'lucide-react'
import { colors, inputClass } from '../../lib/theme'
import { supabase } from '../../lib/supabase'
import { useT } from '../../lib/i18n'

/**
 * Unified background chooser — Color, Image (with fit), or Fade (two-stop blend).
 *
 * Props:
 *   bgColor, bgImage, bgImageFit   — primary background
 *   bgFade, bgColor2, bgImage2, bgImageFit2 — fade second stop
 *   onChange(patch)                — merges patch into parent state
 */
export default function BackgroundChooser({
  bgColor = '',
  bgImage = '',
  bgImageFit = 'cover',
  bgFade = false,
  bgColor2 = '',
  bgImage2 = '',
  bgImageFit2 = 'cover',
  onChange,
}) {
  const { t } = useT()
  const [uploading, setUploading] = useState(null)

  const [mode, setMode] = useState(() => {
    if (bgFade) return 'fade'
    if (bgImage) return 'image'
    return 'color'
  })

  function switchMode(m) {
    setMode(m)
    if (m === 'color') {
      onChange({ bgImage: '', bgImageFit: '', bgFade: false, bgColor2: '', bgImage2: '', bgImageFit2: '' })
    } else if (m === 'image') {
      onChange({ bgColor: '', bgFade: false, bgColor2: '', bgImage2: '', bgImageFit2: '' })
    } else {
      // fade — keep existing primary color/image as "from" layer
      onChange({ bgFade: true })
    }
  }

  async function uploadImage(field, file) {
    setUploading(field)
    try {
      const ext = file.name.split('.').pop()
      const path = `images/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('lovepages').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('lovepages').getPublicUrl(path)
      onChange({ [field]: data.publicUrl })
    } finally {
      setUploading(null)
    }
  }

  // Renders the full color + image + fit controls for one background layer.
  // Mirrors the "image" mode UI exactly, with an additional color picker on top.
  function LayerSlot({ label, colorField, imageField, fitField, colorVal, imageVal, fitVal }) {
    const isUploading = uploading === imageField
    return (
      <div className="space-y-2">
        {label && <p className="text-xs text-fg-ghost">{label}</p>}

        {/* Color */}
        <div className="flex items-center gap-2">
          <label className="relative cursor-pointer shrink-0">
            <div
              className="w-8 h-8 rounded-lg border-2 border-overlay hover:border-subtle transition"
              style={{ backgroundColor: colorVal || colors.surface }}
            />
            <input
              type="color"
              value={colorVal || colors.surface}
              onChange={e => onChange({ [colorField]: e.target.value })}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </label>
          <span className="text-xs text-fg-faint">{t('style.color')}</span>
          {colorVal && (
            <button
              onClick={() => onChange({ [colorField]: '' })}
              className="ml-auto text-xs text-fg-ghost hover:text-fg-muted"
            >
              {t('style.clear')}
            </button>
          )}
        </div>

        {/* Image */}
        {imageVal ? (
          <div className="relative">
            <img src={imageVal} className="w-full h-16 rounded-lg object-cover border border-overlay" />
            <button
              onClick={() => onChange({ [imageField]: '', [fitField]: '' })}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-base/80 border border-subtle text-fg-muted hover:text-fg text-xs flex items-center justify-center"
            >×</button>
          </div>
        ) : (
          <label className={`flex items-center gap-2 px-3 py-2.5 rounded bg-overlay border border-dashed border-subtle text-sm text-fg-muted cursor-pointer hover:bg-subtle hover:text-fg-secondary transition select-none ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload size={12} />
            {isUploading ? t('imageUpload.uploading') : t('imageUpload.upload')}
            <input
              type="file"
              accept="image/*"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(imageField, f) }}
              className="hidden"
            />
          </label>
        )}

        {/* Fit — only shown when an image is set */}
        {imageVal && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted shrink-0">{t('pageOptions.bgFit')}</span>
            <select
              value={fitVal || 'cover'}
              onChange={e => onChange({ [fitField]: e.target.value })}
              className={inputClass + ' flex-1 py-1'}
            >
              <option value="cover">{t('pageOptions.bgFitCover')}</option>
              <option value="contain">{t('pageOptions.bgFitContain')}</option>
              <option value="tile">{t('pageOptions.bgFitTile')}</option>
            </select>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Mode tabs */}
      <div className="flex rounded overflow-hidden border border-overlay text-xs">
        {[
          { key: 'color', label: t('pageOptions.bgColor') },
          { key: 'image', label: t('pageOptions.bgImage') },
          { key: 'fade',  label: t('style.fade') },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex-1 px-2 py-2 transition ${
              mode === key
                ? 'bg-primary text-white'
                : 'bg-overlay text-fg-muted hover:text-fg-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Color mode */}
      {mode === 'color' && (
        <div className="flex items-center gap-2">
          <label className="relative cursor-pointer shrink-0">
            <div
              className="w-8 h-8 rounded-lg border-2 border-overlay hover:border-subtle transition"
              style={{ backgroundColor: bgColor || colors.surface }}
            />
            <input
              type="color"
              value={bgColor || colors.surface}
              onChange={e => onChange({ bgColor: e.target.value })}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </label>
          <span className="text-xs text-fg-faint">{t('style.color')}</span>
          {bgColor && (
            <button
              onClick={() => onChange({ bgColor: '' })}
              className="ml-auto text-xs text-fg-ghost hover:text-fg-muted"
            >
              {t('style.clear')}
            </button>
          )}
        </div>
      )}

      {/* Image mode */}
      {mode === 'image' && (
        <div className="space-y-2">
          {bgImage ? (
            <div className="relative">
              <img src={bgImage} className="w-full h-16 rounded-lg object-cover border border-overlay" />
              <button
                onClick={() => onChange({ bgImage: '', bgImageFit: '' })}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-base/80 border border-subtle text-fg-muted hover:text-fg text-xs flex items-center justify-center"
              >×</button>
            </div>
          ) : (
            <label className={`flex items-center gap-2 px-3 py-2.5 rounded bg-overlay border border-dashed border-subtle text-sm text-fg-muted cursor-pointer hover:bg-subtle hover:text-fg-secondary transition select-none ${uploading === 'bgImage' ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload size={12} />
              {uploading === 'bgImage' ? t('imageUpload.uploading') : t('imageUpload.upload')}
              <input
                type="file"
                accept="image/*"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage('bgImage', f) }}
                className="hidden"
              />
            </label>
          )}
          {bgImage && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-fg-muted shrink-0">{t('pageOptions.bgFit')}</span>
              <select
                value={bgImageFit || 'cover'}
                onChange={e => onChange({ bgImageFit: e.target.value })}
                className={inputClass + ' flex-1 py-1'}
              >
                <option value="cover">{t('pageOptions.bgFitCover')}</option>
                <option value="contain">{t('pageOptions.bgFitContain')}</option>
                <option value="tile">{t('pageOptions.bgFitTile')}</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Fade mode — two full layer slots */}
      {mode === 'fade' && (
        <div className="space-y-3">
          <LayerSlot
            label={t('style.from')}
            colorField="bgColor"   colorVal={bgColor}
            imageField="bgImage"   imageVal={bgImage}
            fitField="bgImageFit"  fitVal={bgImageFit}
          />
          <div className="flex items-center justify-center py-0.5">
            <ArrowDown size={12} className="text-fg-ghost" />
          </div>
          <LayerSlot
            label={t('style.to')}
            colorField="bgColor2"   colorVal={bgColor2}
            imageField="bgImage2"   imageVal={bgImage2}
            fitField="bgImageFit2"  fitVal={bgImageFit2}
          />
        </div>
      )}
    </div>
  )
}
