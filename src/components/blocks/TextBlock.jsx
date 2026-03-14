import { inputClass } from '../../lib/theme'
import { useT } from '../../lib/i18n'

export default function TextBlock({ block, isEditing, onChange }) {
  const { variant, content, align, fontFamily = 'sans', fontSize = 'base', color = '' } = block
  const { t } = useT()

  const FONT_FAMILIES = {
    sans:    { label: t('text.sansSerif'), style: 'system-ui, sans-serif' },
    serif:   { label: t('text.serif'),     style: 'Georgia, serif' },
    mono:    { label: t('text.monospace'), style: 'monospace' },
    cursive: { label: t('text.cursive'),   style: 'cursive' },
  }

  const FONT_SIZES = {
    sm:   { label: t('text.small'),   class: 'text-sm' },
    base: { label: t('text.medium'),  class: 'text-base' },
    lg:   { label: t('text.large'),   class: 'text-lg' },
    xl:   { label: t('text.xLarge'),  class: 'text-xl' },
    '2xl':{ label: t('text.2xLarge'), class: 'text-2xl' },
    '3xl':{ label: t('text.3xLarge'), class: 'text-3xl' },
    '4xl':{ label: t('text.4xLarge'), class: 'text-4xl' },
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <select
          className={inputClass}
          value={variant}
          onChange={e => onChange({ variant: e.target.value })}
        >
          <option value="heading">{t('text.heading')}</option>
          <option value="paragraph">{t('text.paragraph')}</option>
          <option value="quote">{t('text.quote')}</option>
        </select>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            className={inputClass + ' flex-1'}
            value={fontFamily}
            onChange={e => onChange({ fontFamily: e.target.value })}
          >
            {Object.entries(FONT_FAMILIES).map(([key, { label, style }]) => (
              <option key={key} value={key} style={{ fontFamily: style }}>{label}</option>
            ))}
          </select>
          <select
            className={inputClass + ' flex-1'}
            value={fontSize}
            onChange={e => onChange({ fontSize: e.target.value })}
          >
            {Object.entries(FONT_SIZES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <textarea
          className={inputClass + ' resize-y min-h-[80px]'}
          value={content}
          onChange={e => onChange({ content: e.target.value })}
          placeholder={t('text.writeSomething')}
        />
      </div>
    )
  }

  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
  const sizeClass = FONT_SIZES[fontSize]?.class ?? 'text-base'
  const fontStyle = {
    fontFamily: FONT_FAMILIES[fontFamily]?.style ?? 'system-ui, sans-serif',
    ...(color ? { color } : {}),
  }

  if (variant === 'heading') {
    return (
      <h2 className={`font-bold leading-tight ${sizeClass} ${alignClass}`} style={fontStyle}>
        {content}
      </h2>
    )
  }
  if (variant === 'quote') {
    return (
      <blockquote
        className={`border-l-4 border-primary-dim pl-4 italic text-fg-tertiary ${sizeClass} ${alignClass}`}
        style={fontStyle}
      >
        {content}
      </blockquote>
    )
  }
  return (
    <p className={`leading-relaxed ${sizeClass} ${alignClass}`} style={fontStyle}>
      {content}
    </p>
  )
}
