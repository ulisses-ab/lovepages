import { colors, inputClass } from '../../lib/theme'
import { useT } from '../../lib/i18n'

export default function LinkBlock({ block, isEditing, onChange }) {
  const { href, label, color } = block
  const { t } = useT()

  if (isEditing) {
    return (
      <div className="space-y-2">
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
        <div className="flex items-center gap-2">
          <label className="text-xs text-fg-muted">{t('link.buttonColor')}</label>
          <input
            type="color"
            value={color || colors.primary}
            onChange={e => onChange({ color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
        </div>
      </div>
    )
  }

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
