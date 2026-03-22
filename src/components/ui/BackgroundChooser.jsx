import { useState } from 'react'
import { Upload, ArrowDown } from 'lucide-react'
import { inputClass } from '../../lib/theme'
import { supabase } from '../../lib/supabase'
import { useT } from '../../lib/i18n'
import ColorPicker from './ColorPicker'

/**
 * Unified background chooser — Presets, Color, Image (with fit), or Fade (two-stop blend).
 *
 * Props:
 *   bgColor, bgImage, bgImageFit   — primary background
 *   bgFade, bgColor2, bgImage2, bgImageFit2 — fade second stop
 *   bgShader                       — ShaderGradient props object (overrides all others)
 *   onChange(patch)                — merges patch into parent state
 */

const CLEAR_SHADER = { bgShader: null }
const CLEAR_ALL    = { bgShader: null, bgFade: false, bgColor: '', bgImage: '', bgImageFit: '', bgColor2: '', bgImage2: '', bgImageFit2: '' }

const PRESETS = [
  // Light / pastel
  { label: 'White',    bg: '#ffffff', patch: { ...CLEAR_SHADER, bgFade: false, bgColor: '#ffffff', bgImage: '', bgColor2: '', bgImage2: '' } },
  { label: 'Cream',    bg: '#f5f0e8', patch: { ...CLEAR_SHADER, bgFade: false, bgColor: '#f5f0e8', bgImage: '', bgColor2: '', bgImage2: '' } },
  { label: 'Blush',    bg: '#fce4ec', patch: { ...CLEAR_SHADER, bgFade: false, bgColor: '#fce4ec', bgImage: '', bgColor2: '', bgImage2: '' } },
  { label: 'Lavender', bg: '#f3e5f5', patch: { ...CLEAR_SHADER, bgFade: false, bgColor: '#f3e5f5', bgImage: '', bgColor2: '', bgImage2: '' } },
  { label: 'Sky',      bg: '#dbeafe', patch: { ...CLEAR_SHADER, bgFade: false, bgColor: '#dbeafe', bgImage: '', bgColor2: '', bgImage2: '' } },
  // Dark / moody
  { label: 'Charcoal', bg: '#1c1c1c', patch: { ...CLEAR_SHADER, bgFade: false, bgColor: '#1c1c1c', bgImage: '', bgColor2: '', bgImage2: '' } },
  { label: 'Midnight', bg: '#1a1a2e', patch: { ...CLEAR_SHADER, bgFade: false, bgColor: '#1a1a2e', bgImage: '', bgColor2: '', bgImage2: '' } },
  { label: 'Plum',     bg: '#2c1a2e', patch: { ...CLEAR_SHADER, bgFade: false, bgColor: '#2c1a2e', bgImage: '', bgColor2: '', bgImage2: '' } },
  { label: 'Navy',     bg: '#0f172a', patch: { ...CLEAR_SHADER, bgFade: false, bgColor: '#0f172a', bgImage: '', bgColor2: '', bgImage2: '' } },
  { label: 'Black',    bg: '#000000', patch: { ...CLEAR_SHADER, bgFade: false, bgColor: '#000000', bgImage: '', bgColor2: '', bgImage2: '' } },
  // Gradients
  { label: 'Peach',    bg: 'linear-gradient(to bottom,#fed7aa,#fda4af)', patch: { ...CLEAR_SHADER, bgFade: true, bgColor: '#fed7aa', bgImage: '', bgColor2: '#fda4af', bgImage2: '' } },
  { label: 'Bloom',    bg: 'linear-gradient(to bottom,#f8b4d9,#e9d5ff)', patch: { ...CLEAR_SHADER, bgFade: true, bgColor: '#f8b4d9', bgImage: '', bgColor2: '#e9d5ff', bgImage2: '' } },
  { label: 'Sunset',   bg: 'linear-gradient(to bottom,#ff6b8a,#ff9a3c)', patch: { ...CLEAR_SHADER, bgFade: true, bgColor: '#ff6b8a', bgImage: '', bgColor2: '#ff9a3c', bgImage2: '' } },
  { label: 'Dusk',     bg: 'linear-gradient(to bottom,#3b0764,#1e1b4b)', patch: { ...CLEAR_SHADER, bgFade: true, bgColor: '#3b0764', bgImage: '', bgColor2: '#1e1b4b', bgImage2: '' } },
  { label: 'Ocean',    bg: 'linear-gradient(to bottom,#0c4a6e,#0f172a)', patch: { ...CLEAR_SHADER, bgFade: true, bgColor: '#0c4a6e', bgImage: '', bgColor2: '#0f172a', bgImage2: '' } },
]

// Animated shader gradient presets.
// `bg` is a CSS gradient approximation used for the swatch preview.
// `shaderProps` are passed directly to <ShaderGradient />.
const SHADER_PRESETS = [
  {
    label: 'Aurora',
    bg: 'linear-gradient(135deg,#52ff89,#dbba95,#d0bce1)',
    shaderProps: { color1: '#52ff89', color2: '#dbba95', color3: '#d0bce1', type: 'plane', animate: 'on', uSpeed: 0.3, uStrength: 2, uFrequency: 5.5, cDistance: 3.6, cPolarAngle: 90, lightType: '3d', grain: 'off' },
  },
  {
    label: 'Ember',
    bg: 'linear-gradient(135deg,#ff3131,#ff9a00,#2c1a2e)',
    shaderProps: { color1: '#ff3131', color2: '#ff9a00', color3: '#2c1a2e', type: 'plane', animate: 'on', uSpeed: 0.3, uStrength: 3, uFrequency: 5.5, cDistance: 3.6, cPolarAngle: 90, lightType: '3d', grain: 'on' },
  },
  {
    label: 'Cosmic',
    bg: 'linear-gradient(135deg,#6366f1,#1e1b4b,#0f172a)',
    shaderProps: { color1: '#6366f1', positionX: -0, color2: '#1e1b4b', color3: '#0f172a', type: 'plane', animate: 'on', uSpeed: 0.2, uStrength: 2, uFrequency: 5.5, cDistance: 5, cameraZoom: 10.09, cPolarAngle: 110, lightType: '3d', grain: 'on' },
  },
  {
    label: 'Rose',
    bg: 'linear-gradient(135deg,#f9a8d4,#e879f9,#fce7f3)',
    shaderProps: { color1: '#f9a8d4', color2: '#e879f9', color3: '#fce7f3', type: 'plane', animate: 'on', uSpeed: 0.2, uStrength: 2.5, uFrequency: 4, cDistance: 3.6, cPolarAngle: 90, lightType: '3d', grain: 'off' },
  },
  {
    label: 'Mint',
    bg: 'linear-gradient(135deg,#94ffd1,#6bf5ff,#ffffff)',
    shaderProps: { animate: 'on', brightness: 1.2, cAzimuthAngle: 170, cDistance: 4.4, cPolarAngle: 70, cameraZoom: 1, color1: '#94ffd1', color2: '#6bf5ff', color3: '#ffffff', envPreset: 'city', grain: 'off', lightType: '3d', positionY: 0.9, positionZ: -0.3, reflection: 0.1, rotationX: 45, type: 'waterPlane', uDensity: 1.2, uSpeed: 0.2, uStrength: 3.4 },
  },
  {
    label: 'Velvet',
    bg: 'linear-gradient(135deg,#7c3aed,#1e1b4b,#831843)',
    shaderProps: { color1: '#7c3aed', color2: '#1e1b4b', color3: '#831843', type: 'plane', animate: 'on', uSpeed: 0.2, uStrength: 2, uFrequency: 3, cDistance: 3.6, cPolarAngle: 90, lightType: '3d', grain: 'on' },
  },
  {
    label: 'Aero',
    bg: 'linear-gradient(135deg,#0017c4,#00ff37,#00ceb6)',
    shaderProps: { animate: 'on', brightness: 0.8, cAzimuthAngle: 270, cDistance: 0.5, cPolarAngle: 180, cameraZoom: 15.08, color1: '#0017c4', color2: '#00ff37', color3: '#00ceb6', envPreset: 'lobby', grain: 'off', lightType: 'env', positionX: -0.1, reflection: 0.4, rotationY: 130, rotationZ: 70, type: 'sphere', uAmplitude: 7, uDensity: 0, uFrequency: 5.5, uSpeed: 0.3, uStrength: 6.9 },
  },
  {
    label: 'Nebula',
    bg: 'linear-gradient(135deg,#809bd6,#910aff,#af38ff)',
    shaderProps: { animate: 'on', positionX: 0, positionY: 0, brightness: 1.5, cAzimuthAngle: 250, cDistance: 1.5, cPolarAngle: 140, cameraZoom: 12.5, color1: '#809bd6', color2: '#910aff', color3: '#af38ff', envPreset: 'city', grain: 'on', lightType: '3d', reflection: 0.5, rotationZ: 140, type: 'sphere', uAmplitude: 7, uDensity: 0.8, uFrequency: 5.5, uSpeed: 0.3, uStrength: 0.4 },
  },
]

export default function BackgroundChooser({
  bgColor = '',
  bgImage = '',
  bgImageFit = 'cover',
  bgFade = false,
  bgColor2 = '',
  bgImage2 = '',
  bgImageFit2 = 'cover',
  bgShader = null,
  onChange,
}) {
  const { t } = useT()
  const [uploading, setUploading] = useState(null)

  const [mode, setMode] = useState(() => {
    if (bgFade) return 'fade'
    if (bgImage) return 'image'
    return 'presets'
  })

  const [slot1Type, setSlot1Type] = useState(() => bgImage  ? 'image' : 'color')
  const [slot2Type, setSlot2Type] = useState(() => bgImage2 ? 'image' : 'color')

  function switchMode(m) {
    setMode(m)
    if (m === 'presets') return
    if (m === 'color') {
      onChange({ ...CLEAR_ALL, bgColor })
    } else if (m === 'image') {
      onChange({ ...CLEAR_ALL })
    } else if (m === 'fade') {
      onChange({ bgShader: null, bgFade: true })
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

  const TABS = [
    { key: 'presets', label: t('style.presets') },
    { key: 'color',   label: t('pageOptions.bgColor') },
    { key: 'image',   label: t('pageOptions.bgImage') },
    { key: 'fade',    label: t('style.fade') },
  ]

  function FadeSlot({ label, slotType, setSlotType, colorField, colorVal, imageField, imageVal, fitField, fitVal }) {
    const isUploading = uploading === imageField
    return (
      <div className="space-y-2">
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
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(imageField, f) }} className="hidden" />
              </label>
            )}
            {imageVal && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-fg-muted shrink-0">{t('pageOptions.bgFit')}</span>
                <select value={fitVal || 'cover'} onChange={e => onChange({ [fitField]: e.target.value })} className={inputClass + ' flex-1 py-1'}>
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
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-overlay mb-3">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
              mode === key
                ? 'text-fg border-primary'
                : 'text-fg-ghost border-transparent hover:text-fg-muted hover:border-overlay'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Presets */}
      {mode === 'presets' && (
        <div className="space-y-4">
          {/* Solid / gradient swatches */}
          <div className="grid grid-cols-5 gap-1.5">
            {/* Clear / none */}
            <button
              onClick={() => onChange(CLEAR_ALL)}
              className="flex flex-col items-center gap-1 group"
              title="None"
            >
              <div className="w-full aspect-square rounded border-2 border-dashed border-overlay group-hover:border-subtle transition relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, transparent calc(50% - 0.5px), rgba(150,70,70,0.5) calc(50% - 0.5px), rgba(150,70,70,0.5) calc(50% + 0.5px), transparent calc(50% + 0.5px))' }} />
              </div>
              <span className="text-[9px] text-fg-ghost leading-none">None</span>
            </button>
            {PRESETS.map(({ label, bg, patch }) => (
              <button
                key={label}
                onClick={() => onChange(patch)}
                className="flex flex-col items-center gap-1 group"
                title={label}
              >
                <div
                  className="w-full aspect-square rounded border border-overlay group-hover:scale-110 group-hover:shadow-lg transition-transform"
                  style={{ background: bg }}
                />
                <span className="text-[9px] text-fg-ghost leading-none">{label}</span>
              </button>
            ))}
          </div>

          {/* Animated shader gradients */}
          <div>
            <p className="text-[10px] font-semibold text-fg-ghost uppercase tracking-wider mb-2">
              Animated gradients
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SHADER_PRESETS.map(({ label, bg, shaderProps }) => (
                <button
                  key={label}
                  onClick={() => onChange({ bgShader: shaderProps, bgColor: '', bgImage: '', bgFade: false, bgColor2: '', bgImage2: '' })}
                  className="flex flex-col items-center gap-1 group"
                  title={label}
                >
                  <div
                    className="w-full rounded border border-overlay group-hover:scale-105 group-hover:shadow-lg transition-transform relative overflow-hidden"
                    style={{ aspectRatio: '3/2', background: bg }}
                  >
                    {/* Pulsing dot — signals it's animated */}
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
                  </div>
                  <span className="text-[9px] text-fg-ghost leading-none">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Color */}
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

      {/* Image */}
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
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage('bgImage', f) }} className="hidden" />
            </label>
          )}
          {bgImage && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-fg-muted shrink-0">{t('pageOptions.bgFit')}</span>
              <select value={bgImageFit || 'cover'} onChange={e => onChange({ bgImageFit: e.target.value })} className={inputClass + ' flex-1 py-1'}>
                <option value="cover">{t('pageOptions.bgFitCover')}</option>
                <option value="contain">{t('pageOptions.bgFitContain')}</option>
                <option value="tile">{t('pageOptions.bgFitTile')}</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Fade */}
      {mode === 'fade' && (
        <div className="space-y-3">
          <FadeSlot
            label={t('style.from')}
            slotType={slot1Type}   setSlotType={setSlot1Type}
            colorField="bgColor"   colorVal={bgColor}
            imageField="bgImage"   imageVal={bgImage}
            fitField="bgImageFit"  fitVal={bgImageFit}
          />
          <div className="flex items-center justify-center">
            <ArrowDown size={12} className="text-fg-ghost" />
          </div>
          <FadeSlot
            label={t('style.to')}
            slotType={slot2Type}    setSlotType={setSlot2Type}
            colorField="bgColor2"   colorVal={bgColor2}
            imageField="bgImage2"   imageVal={bgImage2}
            fitField="bgImageFit2"  fitVal={bgImageFit2}
          />
        </div>
      )}
    </div>
  )
}
