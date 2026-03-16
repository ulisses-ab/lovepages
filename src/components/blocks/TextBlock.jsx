import { inputClass } from '../../lib/theme'
import { useT } from '../../lib/i18n'

export default function TextBlock({ block, isEditing, onChange }) {
  const { variant, content, align, fontFamily = 'sans', fontSize = 'base', color = '', noteColor = '' } = block
  const { t } = useT()

  const FONT_FAMILIES = {
    sans:    { label: t('text.sansSerif'), style: 'system-ui, sans-serif' },
    serif:   { label: t('text.serif'),     style: 'Georgia, serif' },
    mono:    { label: t('text.monospace'), style: 'monospace' },
    cursive: { label: t('text.cursive'),   style: 'cursive' },
  }

  const FONT_SIZES = {
    sm:   { label: t('text.small'),   class: 'text-sm',  px: 14 },
    base: { label: t('text.medium'),  class: 'text-base', px: 16 },
    lg:   { label: t('text.large'),   class: 'text-lg',  px: 18 },
    xl:   { label: t('text.xLarge'),  class: 'text-xl',  px: 20 },
    '2xl':{ label: t('text.2xLarge'), class: 'text-2xl', px: 24 },
    '3xl':{ label: t('text.3xLarge'), class: 'text-3xl', px: 30 },
    '4xl':{ label: t('text.4xLarge'), class: 'text-4xl', px: 36 },
  }

  const isPhysical = variant === 'typewriter' || variant === 'postit'

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
          <option value="typewriter">{t('text.typewriter')}</option>
          <option value="postit">{t('text.postit')}</option>
        </select>

        {!isPhysical && (
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
        )}

        {isPhysical && (
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className={inputClass + ' flex-1'}
              value={fontSize}
              onChange={e => onChange({ fontSize: e.target.value })}
            >
              {Object.entries(FONT_SIZES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            {variant === 'postit' && (
              <label className="flex items-center gap-2 text-sm text-fg-muted flex-1">
                <span className="whitespace-nowrap">{t('text.noteColor')}</span>
                <input
                  type="color"
                  value={noteColor || '#fde68a'}
                  onChange={e => onChange({ noteColor: e.target.value })}
                  className="w-8 h-7 rounded cursor-pointer border border-subtle bg-transparent"
                />
              </label>
            )}
          </div>
        )}

        <textarea
          className={inputClass + ' resize-y min-h-[80px]'}
          value={content}
          onChange={e => onChange({ content: e.target.value })}
          placeholder={t('text.writeSomething')}
        />
      </div>
    )
  }

  // ── Standard variants ────────────────────────────────────────────────────────
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

  // ── Typewriter note ──────────────────────────────────────────────────────────
  // Aesthetic: cottagecore — aged paper, red margin, ruled lines, mono ink feel
  if (variant === 'typewriter') {
    const lineH = 26
    const topPad = 34

    return (
      <div style={{
        position: 'relative',
        background: 'linear-gradient(175deg, #f8f3e8 0%, #f2ead6 60%, #ede3c8 100%)',
        borderRadius: 3,
        padding: `${topPad}px 28px 28px 56px`,
        boxShadow: [
          '2px 4px 14px rgba(0,0,0,0.22)',
          '0 1px 3px rgba(0,0,0,0.12)',
          'inset 0 0 0 1px rgba(120,90,40,0.08)',
        ].join(', '),
        overflow: 'hidden',
      }}>
        {/* Paper grain */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 3, pointerEvents: 'none',
          backgroundImage: [
            'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(120,80,20,0.025) 1px, rgba(120,80,20,0.025) 2px)',
            'repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(100,60,10,0.015) 3px, rgba(100,60,10,0.015) 4px)',
          ].join(', '),
        }} />

        {/* Ruled lines — light blue like vintage notebook paper */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${lineH - 1}px, rgba(140,175,210,0.30) ${lineH - 1}px, rgba(140,175,210,0.30) ${lineH}px)`,
          backgroundPosition: `0 ${topPad}px`,
        }} />

        {/* Red margin line */}
        <div style={{
          position: 'absolute', left: 42, top: 0, bottom: 0, width: 1.5,
          background: 'rgba(195,55,55,0.45)',
        }} />

        {/* Slight age vignette */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 3, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(120,80,20,0.06) 100%)',
        }} />

        {/* Typed text */}
        <p style={{
          position: 'relative',
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: FONT_SIZES[fontSize]?.px ?? 16,
          lineHeight: `${lineH}px`,
          color: '#1c140a',
          whiteSpace: 'pre-wrap',
          letterSpacing: '0.04em',
          textAlign: align === 'center' ? 'center' : align === 'right' ? 'right' : 'left',
          // Simulate ink impression — slight shadow adds weight to letters
          textShadow: '0.4px 0.4px 0 rgba(0,0,0,0.18), -0.2px 0 0 rgba(0,0,0,0.07)',
          margin: 0,
        }}>
          {content}
        </p>
      </div>
    )
  }

  // ── Post-it note ─────────────────────────────────────────────────────────────
  // Aesthetic: playful/bold — square sticky note taped to the background
  if (variant === 'postit') {
    const bg = noteColor || '#fde68a'


    return (
      // Outer wrapper: constrain width, center, give space above for tape
      <div style={{ position: 'relative', paddingTop: 14, maxWidth: 220, margin: '0 auto' }}>

        {/* Scotch tape — centered, slightly rotated, overlaps top edge of note */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%) rotate(-1.5deg)',
          width: 60, height: 22,
          zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(245,238,175,0.50) 0%, rgba(255,252,215,0.42) 45%, rgba(245,238,175,0.50) 100%)',
          boxShadow: [
            'inset 0 0 0 1px rgba(200,175,60,0.22)',
            '0 1px 4px rgba(0,0,0,0.13)',
          ].join(', '),
        }}>
          {/* Center gloss stripe */}
          <div style={{
            position: 'absolute', top: '30%', bottom: '30%', left: '10%', right: '10%',
            background: 'rgba(255,255,255,0.22)',
            borderRadius: 1,
          }} />
        </div>

        {/* The note itself — square, plain, slightly rotated */}
        <div style={{
          position: 'relative',
          aspectRatio: '1 / 1',
          background: bg,
          overflow: 'hidden',
          transform: 'rotate(-1.2deg)',
          boxShadow: [
            '4px 7px 22px rgba(0,0,0,0.24)',
            '1px 2px 5px rgba(0,0,0,0.14)',
          ].join(', '),
          zIndex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          padding: '16px',
        }}>
          <p style={{
            position: 'relative',
            fontFamily: 'cursive, "Comic Sans MS", sans-serif',
            fontSize: FONT_SIZES[fontSize]?.px ?? 16,
            lineHeight: 1.55,
            color: '#1a1008',
            whiteSpace: 'pre-wrap',
            textAlign: align === 'center' ? 'center' : align === 'right' ? 'right' : 'left',
            margin: 0,
            width: '100%',
          }}>
            {content}
          </p>
        </div>
      </div>
    )
  }

  return (
    <p className={`leading-relaxed ${sizeClass} ${alignClass}`} style={fontStyle}>
      {content}
    </p>
  )
}
