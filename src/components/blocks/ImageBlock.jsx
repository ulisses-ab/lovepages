import { inputClass } from '../../lib/theme'
import { useT } from '../../lib/i18n'
import ImageUpload from '../ui/ImageUpload'
import ImageXPVariant from './image/ImageXPVariant'

// Tape strip — same construction as the post-it tape in TextBlock
function Tape({ style }) {
  return (
    <div style={{
      width: 72, height: 26, overflow: 'hidden', pointerEvents: 'none',
      ...style,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.75) 20%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.75) 80%, transparent)' }} />
      <div style={{ position: 'absolute', top: 1.5, left: 0, right: 0, bottom: 1.5, background: 'rgba(248,242,218,0.18)' }} />
      <div style={{ position: 'absolute', top: 2, left: '-10%', right: '-10%', bottom: 2, background: 'linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0.32) 52%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(210,200,170,0.5) 20%, rgba(210,200,170,0.6) 50%, rgba(210,200,170,0.5) 80%, transparent)' }} />
    </div>
  )
}

export default function ImageBlock({ block, isEditing, onChange }) {
  const { src, alt, caption, variant = 'default', align = 'center' } = block
  const { t } = useT()

  if (isEditing) {
    return (
      <div className="space-y-2">
        <select
          className={inputClass}
          value={variant}
          onChange={e => onChange({ variant: e.target.value })}
        >
          <option value="default">{t('image.variantDefault')}</option>
          <option value="polaroid">{t('image.variantPolaroid')}</option>
          <option value="xp">{t('image.variantXp')}</option>
        </select>
        <ImageUpload
          value={src}
          onChange={url => onChange({ src: url })}
          previewClass="mt-1 rounded max-h-40 object-cover"
        />
        <input
          className={inputClass}
          placeholder={t('image.caption')}
          value={caption}
          onChange={e => onChange({ caption: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder={t('image.altText')}
          value={alt}
          onChange={e => onChange({ alt: e.target.value })}
        />
      </div>
    )
  }

  // ── Windows XP Picture Viewer ────────────────────────────────────────────────
  if (variant === 'xp') return <ImageXPVariant src={src} alt={alt} caption={caption} />

  // ── Polaroid ──────────────────────────────────────────────────────────────────
  if (variant === 'polaroid') {
    // Deterministic tilt from block id so each polaroid feels unique but stable
    const seed = (block.id ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const rot  = ((seed % 9) - 4) * 0.55   // –2.2° to +2.2°
    const tapeRot = ((seed % 5) - 2) * 1.2 // –2.4° to +2.4° (tape itself tilts slightly)

    const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' }
    const justify = justifyMap[align] ?? 'center'

    return (
      <div style={{ display: 'flex', justifyContent: justify, paddingTop: 22, paddingBottom: 6 }}>
        <div style={{ position: 'relative', display: 'inline-block', transform: `rotate(${rot}deg)`, transformOrigin: 'center 15%' }}>

          {/* Tape — overhangs the top edge of the polaroid */}
          <Tape style={{
            position: 'absolute',
            top: -13,
            left: '50%',
            transform: `translateX(-50%) rotate(${tapeRot}deg)`,
            zIndex: 4,
          }} />

          {/* Polaroid frame */}
          <div style={{
            background: 'linear-gradient(170deg, #faf9f6 0%, #f5f3ee 100%)',
            padding: '10px 10px 48px',
            boxShadow: [
              '0 6px 24px rgba(0,0,0,0.28)',
              '0 2px 6px rgba(0,0,0,0.16)',
              'inset 0 0 0 1px rgba(0,0,0,0.04)',
            ].join(', '),
            maxWidth: 300,
          }}>

            {/* Photo area */}
            {src ? (
              <img
                src={src}
                alt={alt}
                style={{ display: 'block', width: '100%', aspectRatio: '1/1', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%', aspectRatio: '1/1',
                background: 'linear-gradient(145deg, #e2ddd5, #d8d2c8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#b0a898', fontSize: 13,
              }}>
                {t('image.noImage')}
              </div>
            )}

            {/* Caption strip */}
            <div style={{ paddingTop: 10, paddingBottom: 2, textAlign: 'center', minHeight: 32 }}>
              {caption && (
                <p style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#3a3028',
                  margin: 0,
                  lineHeight: 1.3,
                }}>
                  {caption}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Default ───────────────────────────────────────────────────────────────────
  if (!src) {
    return (
      <div className="w-full h-40 bg-overlay rounded flex items-center justify-center text-fg-faint text-sm">
        {t('image.noImage')}
      </div>
    )
  }

  return (
    <figure className="w-full">
      <img src={src} alt={alt} className="w-full rounded object-cover" />
      {caption && (
        <figcaption className="text-center text-sm text-fg-muted mt-1">{caption}</figcaption>
      )}
    </figure>
  )
}
