import { useState } from 'react'
import { AlignLeft, AlignCenter, AlignRight, Upload } from 'lucide-react'
import { colors } from '../../lib/theme'
import { supabase } from '../../lib/supabase'
import { useT } from '../../lib/i18n'

const ALIGN_ICONS = { left: AlignLeft, center: AlignCenter, right: AlignRight }

export default function BlockStyleControls({ block, onChange }) {
  const { t } = useT()
  const [uploadingBg, setUploadingBg] = useState(false)

  async function handleBgImageFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBg(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `images/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('lovepages').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('lovepages').getPublicUrl(path)
      onChange({ bgImage: data.publicUrl })
    } finally {
      setUploadingBg(false)
    }
  }

  return (
    <div className="space-y-3 border-t border-overlay pt-3 mt-3">
      <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">{t('style.style')}</p>

      {/* Align — icon buttons */}
      <div className="flex gap-1">
        {['left', 'center', 'right'].map(a => {
          const Icon = ALIGN_ICONS[a]
          return (
            <button
              key={a}
              onClick={() => onChange({ align: a })}
              title={a}
              className={`flex-1 py-2 flex items-center justify-center rounded border transition ${
                block.align === a
                  ? 'bg-primary text-white border-primary'
                  : 'bg-overlay text-fg-tertiary border-subtle hover:border-primary-dim'
              }`}
            >
              <Icon size={14} />
            </button>
          )
        })}
      </div>

      {/* Background — color swatch + image upload side by side */}
      <div>
        <p className="text-xs text-fg-muted mb-2">{t('style.background')}</p>
        <div className="grid grid-cols-2 gap-2">

          {/* Color swatch */}
          <div className="flex items-center gap-2 min-w-0">
            <label className="relative cursor-pointer shrink-0">
              <div
                className="w-8 h-8 rounded-lg border-2 border-overlay hover:border-subtle transition"
                style={{ backgroundColor: block.bgColor || colors.surface }}
              />
              <input
                type="color"
                value={block.bgColor || colors.surface}
                onChange={e => onChange({ bgColor: e.target.value })}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </label>
            <span className="text-xs text-fg-faint truncate">{t('style.color')}</span>
            {block.bgColor && (
              <button
                onClick={() => onChange({ bgColor: '' })}
                className="ml-auto text-fg-ghost hover:text-fg-muted text-base leading-none shrink-0"
              >
                ×
              </button>
            )}
          </div>

          {/* Image thumbnail or upload button */}
          <div className="flex items-center gap-2 min-w-0">
            {block.bgImage ? (
              <div className="relative shrink-0">
                <img
                  src={block.bgImage}
                  className="w-8 h-8 rounded-lg object-cover border-2 border-overlay"
                />
                <button
                  onClick={() => onChange({ bgImage: '' })}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-base border border-subtle text-fg-muted hover:text-fg text-xs flex items-center justify-center leading-none"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className={`cursor-pointer shrink-0 ${uploadingBg ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="w-8 h-8 rounded-lg border-2 border-dashed border-overlay hover:border-subtle transition flex items-center justify-center text-fg-ghost hover:text-fg-muted">
                  <Upload size={12} />
                </div>
                <input type="file" accept="image/*" onChange={handleBgImageFile} className="hidden" />
              </label>
            )}
            <span className="text-xs text-fg-faint truncate">
              {uploadingBg ? t('imageUpload.uploading') : t('style.image')}
            </span>
          </div>
        </div>
      </div>

      {/* Text color — text blocks only */}
      {block.type === 'text' && (
        <div className="flex items-center gap-2">
          <label className="relative cursor-pointer shrink-0">
            <div
              className="w-8 h-8 rounded-lg border-2 border-overlay hover:border-subtle transition"
              style={{ backgroundColor: block.color || colors.fg }}
            />
            <input
              type="color"
              value={block.color || colors.fg}
              onChange={e => onChange({ color: e.target.value })}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </label>
          <span className="text-xs text-fg-faint">{t('style.textColor')}</span>
          {block.color && (
            <button
              onClick={() => onChange({ color: '' })}
              className="ml-auto text-fg-ghost hover:text-fg-muted text-base leading-none"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Border / Shadow / Full bleed — pill toggles */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { key: 'border',    label: t('style.border') },
          { key: 'shadow',    label: t('style.shadow') },
          { key: 'fullBleed', label: t('style.fullBleed') },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onChange({ [key]: !block[key] })}
            className={`px-3 py-1 text-xs rounded-full border transition ${
              block[key]
                ? 'bg-primary border-primary text-white'
                : 'bg-overlay border-subtle text-fg-muted hover:border-primary-dim'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
