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
      <div className="w-full h-11 flex items-center justify-center overflow-hidden rounded">
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

function DefaultButtonPreview() {
  return (
    <div style={{
      background: colors.primary, borderRadius: 999, padding: '5px 14px',
      color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 700,
      letterSpacing: 0.3,
    }}>
      Click here →
    </div>
  )
}

function XPButtonPreview() {
  return (
    <div style={{
      background: '#f0f0f0', border: '2px solid #999', borderRadius: 2,
      padding: '4px 6px', width: '100%', boxSizing: 'border-box',
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #3a6ea5, #245cb5)',
        color: 'white', padding: '1px 4px', fontFamily: 'Tahoma, sans-serif', fontSize: 7, fontWeight: 700, marginBottom: 4,
      }}>
        Open Link
      </div>
      <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
        {['Open', 'Cancel'].map(l => (
          <div key={l} style={{
            background: '#e0e0e0',
            border: '1px solid #888',
            borderRadius: 1,
            padding: '2px 6px',
            fontFamily: 'Tahoma, sans-serif',
            fontSize: 7,
          }}>{l}</div>
        ))}
      </div>
    </div>
  )
}

export default function LinkBlock({ block, isEditing, onChange }) {
  const { href, label, color, variant = 'default' } = block
  const { t } = useT()

  if (isEditing) {
    const VARIANTS = [
      { value: 'default', label: t('link.variantDefault'), Preview: DefaultButtonPreview },
      { value: 'xp',      label: t('link.variantXp'),      Preview: XPButtonPreview },
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
            {VARIANTS.map(({ value, label: vLabel, Preview }) => (
              <VariantCard
                key={value}
                label={vLabel}
                selected={variant === value}
                onClick={() => onChange({ variant: value })}
              >
                <Preview />
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
