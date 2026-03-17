import { colors, inputClass } from '../../lib/theme'
import { useT } from '../../lib/i18n'
import ColorPicker from '../ui/ColorPicker'
import LinkXPVariant from './link/LinkXPVariant'

export default function LinkBlock({ block, isEditing, onChange }) {
  const { href, label, color, variant = 'default' } = block
  const { t } = useT()

  if (isEditing) {
    return (
      <div className="space-y-2">
        {/* Variant picker */}
        <div className="flex gap-1">
          {[
            { value: 'default', label: t('link.variantDefault') },
            { value: 'xp',      label: t('link.variantXp') },
          ].map(v => (
            <button
              key={v.value}
              onClick={() => onChange({ variant: v.value })}
              className={`flex-1 py-1 rounded text-xs transition ${
                variant === v.value
                  ? 'bg-primary text-white'
                  : 'bg-overlay text-fg-muted hover:bg-subtle'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <input
          className={inputClass}
          placeholder={t('link.buttonLabel')}
          value={label}
          onChange={e => onChange({ label: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="https://..."
          value={href}
          onChange={e => onChange({ href: e.target.value })}
        />
        {variant === 'default' && (
          <ColorPicker
            value={color || colors.primary}
            onChange={val => onChange({ color: val })}
            label={t('link.buttonColor')}
          />
        )}
      </div>
    )
  }

  // ── Windows XP dialog ─────────────────────────────────────────────────────────
  if (variant === 'xp') return <LinkXPVariant href={href} label={label} />

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
