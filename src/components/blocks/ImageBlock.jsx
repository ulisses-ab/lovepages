import { inputClass } from '../../lib/theme'
import { useT } from '../../lib/i18n'
import ImageUpload from '../ui/ImageUpload'
import CollapsibleSection from '../ui/CollapsibleSection'
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

function VariantCard({ label, selected, onClick, children }) {
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

function DefaultPreview() {
  return (
    <div style={{
      width: '100%', height: '100%', background: 'linear-gradient(145deg, #3a4453, #2a3340)',
      borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
        <rect x="1" y="1" width="20" height="16" rx="2" stroke="#6b7280" strokeWidth="1.5" />
        <circle cx="7" cy="7" r="2" fill="#6b7280" />
        <path d="M1 13l5-4 4 3 4-5 7 6" stroke="#6b7280" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function PolaroidPreview() {
  return (
    <div style={{
      background: '#faf9f6', padding: '5px 5px 14px', borderRadius: 2,
      boxShadow: '0 3px 10px rgba(0,0,0,0.3)', transform: 'rotate(-2deg)',
      display: 'inline-block',
    }}>
      <div style={{
        width: 36, height: 36, background: 'linear-gradient(145deg, #3a4453, #2a3340)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="14" height="11" viewBox="0 0 22 18" fill="none">
          <rect x="1" y="1" width="20" height="16" rx="2" stroke="#6b7280" strokeWidth="2" />
          <circle cx="7" cy="7" r="2" fill="#6b7280" />
          <path d="M1 13l5-4 4 3 4-5 7 6" stroke="#6b7280" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

function XPPreview() {
  return (
    <div style={{ border: '2px solid #999', borderRadius: 2, overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
      <div style={{
        background: 'linear-gradient(180deg, #3a6ea5, #245cb5)',
        color: 'white', padding: '2px 5px', fontFamily: 'Tahoma, sans-serif', fontSize: 7, fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 3,
      }}>
        <span>🖼</span> Photo Viewer
      </div>
      <div style={{
        background: '#f0f0f0', height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 24, height: 20, background: '#c8d8e8', border: '1px solid #aaa' }} />
      </div>
    </div>
  )
}

export default function ImageBlock({ block, isEditing, onChange }) {
  const { src, alt, caption, variant = 'default', align = 'center' } = block
  const { t } = useT()

  if (isEditing) {
    const VARIANTS = [
      { value: 'default',  label: t('image.variantDefault'),  Preview: DefaultPreview },
      { value: 'polaroid', label: t('image.variantPolaroid'), Preview: PolaroidPreview },
      { value: 'xp',       label: t('image.variantXp'),       Preview: XPPreview },
    ]

    return (
      <div className="space-y-3">
        {/* Upload / image area first */}
        <ImageUpload
          value={src}
          onChange={url => onChange({ src: url })}
          previewClass="mt-1 rounded max-h-40 object-cover"
        />

        {/* Caption */}
        <input
          className={inputClass}
          placeholder={t('image.caption')}
          value={caption}
          onChange={e => onChange({ caption: e.target.value })}
        />

        {/* Frame style */}
        <div>
          <p className="text-xs text-fg-muted mb-2">{t('image.frameStyle')}</p>
          <div className="grid grid-cols-3 gap-2">
            {VARIANTS.map(({ value, label, Preview }) => (
              <VariantCard
                key={value}
                label={label}
                selected={variant === value}
                onClick={() => onChange({ variant: value })}
              >
                <Preview />
              </VariantCard>
            ))}
          </div>
        </div>

        {/* Accessibility — collapsed */}
        <CollapsibleSection title={t('image.accessibility')}>
          <input
            className={inputClass}
            placeholder={t('image.altText')}
            value={alt}
            onChange={e => onChange({ alt: e.target.value })}
          />
        </CollapsibleSection>
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
      <img src={src} alt={alt} className="w-full object-cover" />
      {caption && (
        <figcaption className="text-center text-sm text-fg-muted mt-1">{caption}</figcaption>
      )}
    </figure>
  )
}
