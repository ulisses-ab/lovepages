import { useState } from 'react'
import { Upload, ArrowDown } from 'lucide-react'
import { colors, inputClass } from '../../lib/theme'
import { supabase } from '../../lib/supabase'
import { useT } from '../../lib/i18n'
import ColorPicker from './ColorPicker'

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

  // Per-slot type for fade mode: 'color' | 'image'
  const [slot1Type, setSlot1Type] = useState(() => bgImage  ? 'image' : 'color')
  const [slot2Type, setSlot2Type] = useState(() => bgImage2 ? 'image' : 'color')

  function switchMode(m) {
    setMode(m)
    if (m === 'color') {
      onChange({ bgImage: '', bgImageFit: '', bgFade: false, bgColor2: '', bgImage2: '', bgImageFit2: '' })
    } else if (m === 'image') {
      onChange({ bgColor: '', bgFade: false, bgColor2: '', bgImage2: '', bgImageFit2: '' })
    } else {
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

  // One fade slot: color/image toggle + the relevant control
  function FadeSlot({ label, slotType, setSlotType, colorField, colorVal, imageField, imageVal, fitField, fitVal }) {
    const isUploading = uploading === imageField
    return (
      <div className="space-y-2">
        {/* Label + type toggle */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-fg-ghost">{label}</p>
          <div className="flex rounded overflow-hidden border border-overlay text-xs">
            {['color', 'image'].map(type => (
              <button
                key={type}
                onClick={() => {
                  setSlotType(type)
                  if (type === 'color') onChange({ [imageField]: '', [fitField]: '' })
                  else onChange({ [colorField]: '' })
                }}
                className={`px-2.5 py-1 transition ${
                  slotType === type
                    ? 'bg-primary text-white'
                    : 'bg-overlay text-fg-muted hover:text-fg-secondary'
                }`}
              >
                {type === 'color' ? t('style.color') : t('style.image')}
              </button>
            ))}
          </div>
        </div>

        {/* Color control */}
        {slotType === 'color' && (
          <ColorPicker
            value={colorVal}
            onChange={val => onChange({ [colorField]: val })}
            label={t('style.color')}
            clearable
            onClear={() => onChange({ [colorField]: '' })}
            alpha
          />
        )}

        {/* Image control */}
        {slotType === 'image' && (
          <div className="space-y-2">
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
        <ColorPicker
          value={bgColor}
          onChange={val => onChange({ bgColor: val })}
          label={t('style.color')}
          clearable
          onClear={() => onChange({ bgColor: '' })}
          alpha
        />
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

      {/* Fade mode — two slots, each with color/image toggle */}
      {mode === 'fade' && (
        <div className="space-y-3">
          <FadeSlot
            label={t('style.from')}
            slotType={slot1Type}      setSlotType={setSlot1Type}
            colorField="bgColor"     colorVal={bgColor}
            imageField="bgImage"     imageVal={bgImage}
            fitField="bgImageFit"    fitVal={bgImageFit}
          />
          <div className="flex items-center justify-center">
            <ArrowDown size={12} className="text-fg-ghost" />
          </div>
          <FadeSlot
            label={t('style.to')}
            slotType={slot2Type}      setSlotType={setSlot2Type}
            colorField="bgColor2"    colorVal={bgColor2}
            imageField="bgImage2"    imageVal={bgImage2}
            fitField="bgImageFit2"   fitVal={bgImageFit2}
          />
        </div>
      )}
    </div>
  )
}
