import { colors, inputClass } from '../../lib/theme'
import { useT } from '../../lib/i18n'
import ColorPicker from '../ui/ColorPicker'
import LinkXPVariant from './link/LinkXPVariant'

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

export default function LinkBlock({ block, isEditing, onChange }) {
  const { href, label, color, variant = 'default' } = block
  const { t } = useT()

  if (isEditing) {
    const previewLabel = label || 'Click here →'
    const VARIANTS = [
      { value: 'default', label: t('link.variantDefault'), preview: (
        <ScaledPreview>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <span style={{ background: color || colors.primary, borderRadius: 999, padding: '12px 32px', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600 }}>
              {previewLabel}
            </span>
          </div>
        </ScaledPreview>
      )},
      { value: 'xp', label: t('link.variantXp'), preview: (
        <ScaledPreview scale={0.42}>
          <LinkXPVariant href="#" label={previewLabel} showFlag={block.showFlag !== false} baseColor={block.baseColor} />
        </ScaledPreview>
      )},
    ]

    return (
      <div className="space-y-3">
        {/* Content first: label then URL */}
        <input
          className={inputClass}
          placeholder={t('link.buttonText')}
          value={label}
          onChange={e => onChange({ label: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder={t('link.whereToGo')}
          value={href}
          onChange={e => onChange({ href: e.target.value })}
        />

        {/* Button style */}
        <div>
          <p className="text-xs text-fg-muted mb-2">{t('link.buttonStyle')}</p>
          <div className="grid grid-cols-2 gap-2">
            {VARIANTS.map(({ value, label: vLabel, preview }) => (
              <VariantCard
                key={value}
                label={vLabel}
                selected={variant === value}
                onClick={() => onChange({ variant: value })}
              >
                {preview}
              </VariantCard>
            ))}
          </div>
        </div>

        {/* Color controls below the style picker */}
        {variant === 'default' && (
          <ColorPicker
            value={color || colors.primary}
            onChange={val => onChange({ color: val })}
            label={t('link.buttonColor')}
          />
        )}
        {variant === 'xp' && (
          <>
            <ColorPicker
              value={block.baseColor || '#5DB52A'}
              onChange={val => onChange({ baseColor: val })}
              label={t('link.buttonColor')}
            />
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={block.showFlag !== false}
                onChange={e => onChange({ showFlag: e.target.checked })}
                className="accent-primary"
              />
              <span className="text-xs text-fg-muted">Show Windows logo</span>
            </label>
          </>
        )}
      </div>
    )
  }

  // ── Windows XP dialog ─────────────────────────────────────────────────────────
  if (variant === 'xp') return <LinkXPVariant href={href} label={label} showFlag={block.showFlag !== false} baseColor={block.baseColor} />

  // ── Default button ────────────────────────────────────────────────────────────
  return (
    <div className="flex justify-center">
      <a
        href={href || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-8 py-3 rounded-full text-white font-semibold text-sm shadow transition hover:opacity-90 active:scale-95"
        style={{ backgroundColor: color || colors.primary }}
      >
        {label || t('link.clickHere')}
      </a>
    </div>
  )
}
