import { useState, useRef, useEffect } from 'react'
import { ChevronDown, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { inputClass, colors } from '../../lib/theme'
import { useT } from '../../lib/i18n'
import ColorPicker from '../ui/ColorPicker'

// All available fonts — each key maps to its CSS font-family stack.
// These are loaded via Google Fonts in index.html.
export const FONTS = {
  inter:      { label: 'Inter',              css: "'Inter', system-ui, sans-serif" },
  playfair:   { label: 'Playfair Display',   css: "'Playfair Display', Georgia, serif" },
  cormorant:  { label: 'Cormorant Garamond', css: "'Cormorant Garamond', Georgia, serif" },
  abril:      { label: 'Abril Fatface',      css: "'Abril Fatface', serif" },
  bebas:      { label: 'Bebas Neue',         css: "'Bebas Neue', Impact, sans-serif" },
  righteous:  { label: 'Righteous',          css: "'Righteous', sans-serif" },
  fredoka:    { label: 'Fredoka',            css: "'Fredoka', sans-serif" },
  pacifico:   { label: 'Pacifico',           css: "'Pacifico', cursive" },
  dancing:    { label: 'Dancing Script',     css: "'Dancing Script', cursive" },
  caveat:     { label: 'Caveat',             css: "'Caveat', cursive" },
  elite:      { label: 'Special Elite',      css: "'Special Elite', monospace" },
  spacemono:  { label: 'Space Mono',         css: "'Space Mono', monospace" },
}

const FONT_SIZES = {
  sm:   { label: 'S',  px: 14 },
  base: { label: 'M',  px: 16 },
  lg:   { label: 'L',  px: 18 },
  xl:   { label: 'XL', px: 20 },
  '2xl':{ label: '2×', px: 24 },
  '3xl':{ label: '3×', px: 30 },
  '4xl':{ label: '4×', px: 36 },
}

// Ransom note: pool of distinct font stacks for per-letter randomisation
const RANSOM_FONTS = [
  "'Playfair Display', serif",
  "'Cormorant Garamond', serif",
  "'Abril Fatface', serif",
  "'Bebas Neue', sans-serif",
  "'Special Elite', monospace",
  "'Space Mono', monospace",
  "'Dancing Script', cursive",
  "'Fredoka', sans-serif",
  "Impact, 'Arial Black', sans-serif",
  "Georgia, serif",
  "'Times New Roman', serif",
  "Arial, Helvetica, sans-serif",
]

// Paired fg/bg themes — always readable, deliberately mismatched
const RANSOM_THEMES = [
  { bg: 'transparent', color: '#111111' },
  { bg: 'transparent', color: '#111111' },
  { bg: 'transparent', color: '#111111' },
  { bg: 'transparent', color: '#1a1a1a' },
  { bg: '#000000',     color: '#f0f0f0' },
  { bg: '#f5f0e1',     color: '#111111' },
  { bg: '#fffde7',     color: '#8b0000' },
  { bg: '#fce4ec',     color: '#880e4f' },
  { bg: '#e8f5e9',     color: '#1b5e20' },
  { bg: '#fff8e1',     color: '#e65100' },
  { bg: 'transparent', color: '#00008b' },
  { bg: 'transparent', color: '#8b0000' },
  { bg: '#ffffff',     color: '#000000' },
]

// Fast seeded pseudo-random: deterministic per (index, seed) pair
function ransomRand(i, offset, seed) {
  const x = ((i * 7 + offset + 1) * 2654435761 + seed * 6271) >>> 0
  return x / 0xffffffff
}

// Legacy font keys used by old heading/paragraph/quote blocks
const LEGACY_FONTS = {
  sans:    'system-ui, sans-serif',
  serif:   'Georgia, serif',
  mono:    'monospace',
  cursive: 'cursive',
}

function FontPicker({ value, onChange: onChangeProp }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const selected = FONTS[value] ?? FONTS.inter

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={inputClass + ' flex items-center justify-between gap-2 cursor-pointer w-full'}
        style={{ fontFamily: selected.css }}
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown size={14} className={`shrink-0 text-fg-ghost transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-overlay rounded-lg shadow-xl overflow-y-auto max-h-56">
          {Object.entries(FONTS).map(([key, { label, css }]) => (
            <button
              key={key}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onChangeProp(key); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-sm transition ${
                key === value
                  ? 'bg-primary/20 text-primary-dim'
                  : 'text-fg-secondary hover:bg-overlay'
              }`}
              style={{ fontFamily: css }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TextBlock({ block, isEditing, onChange }) {
  const { variant, content, align, fontFamily = 'inter', fontSize = 'base', color = '', noteColor = '' } = block
  const { t } = useT()

  const isPhysical = variant === 'typewriter' || variant === 'postit' || variant === 'ransom'

  if (isEditing) {
    return (
      <div className="space-y-3">
        {/* Variant selector */}
        <select
          className={inputClass}
          value={variant}
          onChange={e => onChange({ variant: e.target.value })}
        >
          <option value="plain">{t('text.plain')}</option>
          <option value="typewriter">{t('text.typewriter')}</option>
          <option value="postit">{t('text.postit')}</option>
          <option value="ransom">{t('text.ransom')}</option>
        </select>

        {/* Plain variant controls */}
        {variant === 'plain' && (
          <>
            {/* Font picker */}
            <FontPicker value={fontFamily} onChange={v => onChange({ fontFamily: v })} />

            {/* Size */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-fg-muted shrink-0">Size</span>
              <input
                type="number"
                min={8} max={200}
                value={typeof fontSize === 'number' ? fontSize : (FONT_SIZES[fontSize]?.px ?? 16)}
                onChange={e => onChange({ fontSize: Math.max(8, Math.min(200, Number(e.target.value))) })}
                className={inputClass + ' w-20 py-1'}
              />
              <span className="text-xs text-fg-ghost">px</span>
            </div>

            {/* Style toggles */}
            <div className="flex gap-1.5">
              <button
                onClick={() => onChange({ bold: !block.bold })}
                className={`w-9 h-9 rounded border text-sm font-bold transition ${
                  block.bold
                    ? 'bg-primary border-primary text-white'
                    : 'bg-overlay border-subtle text-fg-muted hover:border-primary-dim'
                }`}
              >
                B
              </button>
              <button
                onClick={() => onChange({ italic: !block.italic })}
                className={`w-9 h-9 rounded border text-sm italic transition ${
                  block.italic
                    ? 'bg-primary border-primary text-white'
                    : 'bg-overlay border-subtle text-fg-muted hover:border-primary-dim'
                }`}
              >
                I
              </button>
              <button
                onClick={() => onChange({ outline: !block.outline })}
                title={t('text.outlineHint')}
                className={`w-9 h-9 rounded border text-sm font-bold transition ${
                  block.outline
                    ? 'bg-primary border-primary text-white'
                    : 'bg-overlay border-subtle text-fg-muted hover:border-primary-dim'
                }`}
                style={block.outline ? {} : {
                  color: 'transparent',
                  WebkitTextStroke: `1.5px var(--color-fg-muted, #888)`,
                }}
              >
                O
              </button>
              {block.outline && (
                <ColorPicker
                  value={block.outlineColor || colors.fg}
                  onChange={val => onChange({ outlineColor: val })}
                />
              )}
              <div className="flex-1" />
              {[
                { a: 'left',   Icon: AlignLeft },
                { a: 'center', Icon: AlignCenter },
                { a: 'right',  Icon: AlignRight },
              ].map(({ a, Icon }) => (
                <button
                  key={a}
                  onClick={() => onChange({ align: a })}
                  className={`w-9 h-9 flex items-center justify-center rounded border transition ${
                    (block.align || 'left') === a
                      ? 'bg-primary border-primary text-white'
                      : 'bg-overlay border-subtle text-fg-muted hover:border-primary-dim'
                  }`}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </>
        )}

        {/* Size + align for physical variants */}
        {isPhysical && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-fg-muted shrink-0">Size</span>
            <input
              type="number"
              min={8} max={200}
              value={typeof fontSize === 'number' ? fontSize : (FONT_SIZES[fontSize]?.px ?? 16)}
              onChange={e => onChange({ fontSize: Math.max(8, Math.min(200, Number(e.target.value))) })}
              className={inputClass + ' w-20 py-1'}
            />
            <span className="text-xs text-fg-ghost">px</span>
            <div className="flex-1" />
            {[
              { a: 'left',   Icon: AlignLeft },
              { a: 'center', Icon: AlignCenter },
              { a: 'right',  Icon: AlignRight },
            ].map(({ a, Icon }) => (
              <button
                key={a}
                onClick={() => onChange({ align: a })}
                className={`w-9 h-9 flex items-center justify-center rounded border transition ${
                  (block.align || 'left') === a
                    ? 'bg-primary border-primary text-white'
                    : 'bg-overlay border-subtle text-fg-muted hover:border-primary-dim'
                }`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        )}

        {/* Post-it color */}
        {variant === 'postit' && (
          <ColorPicker
            value={noteColor || '#fde047'}
            onChange={val => onChange({ noteColor: val })}
            label={t('text.noteColor')}
          />
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

  // ── Render ────────────────────────────────────────────────────────────────────

  const textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left'
  const sizePx = typeof fontSize === 'number' ? fontSize : (FONT_SIZES[fontSize]?.px ?? 16)

  // ── Plain (replaces heading / paragraph / quote) ──────────────────────────────
  if (variant === 'plain' || variant === 'heading' || variant === 'paragraph' || variant === 'quote') {
    const fontStack = FONTS[fontFamily]?.css ?? LEGACY_FONTS[fontFamily] ?? FONTS.inter.css
    const textColor = color || colors.fg
    // Legacy bold/italic from old variants
    const isBold   = block.bold   || variant === 'heading'
    const isItalic = block.italic || variant === 'quote'

    const style = {
      fontFamily: fontStack,
      fontSize: sizePx,
      fontWeight: isBold ? 700 : 400,
      fontStyle: isItalic ? 'italic' : 'normal',
      lineHeight: 1.5,
      whiteSpace: 'pre-wrap',
      textAlign,
      color: textColor,
      ...(block.outline && {
        WebkitTextStroke: `0.04em ${block.outlineColor || textColor}`,
        paintOrder: 'stroke fill',
      }),
    }

    return <p style={style}>{content}</p>
  }

  // ── Typewriter note ───────────────────────────────────────────────────────────
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
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 3, pointerEvents: 'none',
          backgroundImage: [
            'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(120,80,20,0.025) 1px, rgba(120,80,20,0.025) 2px)',
            'repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(100,60,10,0.015) 3px, rgba(100,60,10,0.015) 4px)',
          ].join(', '),
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${lineH - 1}px, rgba(140,175,210,0.30) ${lineH - 1}px, rgba(140,175,210,0.30) ${lineH}px)`,
          backgroundPosition: `0 ${topPad}px`,
        }} />
        <div style={{
          position: 'absolute', left: 42, top: 0, bottom: 0, width: 1.5,
          background: 'rgba(195,55,55,0.45)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 3, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(120,80,20,0.06) 100%)',
        }} />
        <p style={{
          position: 'relative',
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: sizePx,
          lineHeight: `${lineH}px`,
          color: '#1c140a',
          whiteSpace: 'pre-wrap',
          letterSpacing: '0.04em',
          textAlign,
          textShadow: '0.4px 0.4px 0 rgba(0,0,0,0.18), -0.2px 0 0 rgba(0,0,0,0.07)',
          margin: 0,
        }}>
          {content}
        </p>
      </div>
    )
  }

  // ── Post-it note ──────────────────────────────────────────────────────────────
  if (variant === 'postit') {
    const base = noteColor || '#fde047'
    const hexToRgb = h => {
      const n = parseInt(h.replace('#', ''), 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }
    const toHex = ([r, g, b]) =>
      '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
    const [r, g, b] = hexToRgb(base)
    const light    = toHex([r * 1.08, g * 1.08, b * 1.08])
    const dark     = toHex([r * 0.88, g * 0.88, b * 0.88])
    const gradient = `linear-gradient(175deg, ${light} 0%, ${base} 60%, ${dark} 100%)`
    return (
      <div style={{ position: 'relative', paddingTop: 14, maxWidth: 220, margin: '0 auto' }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%',
          transform: 'translateX(-50%) rotate(-1.5deg)',
          width: 60, height: 22, zIndex: 2, overflow: 'hidden', pointerEvents: 'none',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.75) 20%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.75) 80%, transparent)' }} />
          <div style={{ position: 'absolute', top: 1.5, left: 0, right: 0, bottom: 1.5, background: 'rgba(248,242,218,0.13)' }} />
          <div style={{ position: 'absolute', top: 2, left: '-10%', right: '-10%', bottom: 2, background: 'linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0.32) 52%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(210,200,170,0.5) 20%, rgba(210,200,170,0.6) 50%, rgba(210,200,170,0.5) 80%, transparent)' }} />
        </div>
        <div style={{
          position: 'relative', aspectRatio: '1 / 1', background: gradient, overflow: 'hidden',
          transform: 'rotate(-2deg)',
          boxShadow: '0 4px 18px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.3), 4px 5px 0 rgba(0,0,0,0.1)',
          zIndex: 1, display: 'flex', alignItems: 'flex-start', padding: '16px',
        }}>
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: sizePx,
            fontWeight: 700,
            lineHeight: 1.4,
            color: '#1c1400',
            whiteSpace: 'pre-wrap',
            textAlign,
            margin: 0,
            width: '100%',
          }}>
            {content}
          </p>
        </div>
      </div>
    )
  }

  // ── Ransom note ───────────────────────────────────────────────────────────────
  if (variant === 'ransom') {
    // Seed from the content so the same text always renders identically
    const seed = content.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0) & 0x7fffffff
    const chars = content.split('')
    return (
      <p style={{ textAlign, margin: 0, lineHeight: 2, wordBreak: 'break-word' }}>
        {chars.map((char, i) => {
          if (char === '\n') return <br key={i} />
          if (char === ' ')  return <span key={i} style={{ display: 'inline-block', width: sizePx * 0.4 }} />

          const r = (offset) => ransomRand(i, offset, seed)
          const theme    = RANSOM_THEMES[Math.floor(r(0) * RANSOM_THEMES.length)]
          const font     = RANSOM_FONTS[Math.floor(r(1) * RANSOM_FONTS.length)]
          const weight   = r(2) > 0.45 ? 700 : 400
          const isItalic = r(3) > 0.72
          const isUpper  = r(4) > 0.55
          const scale    = 0.72 + r(5) * 0.72  // 0.72× – 1.44×
          const rotate   = (r(6) - 0.5) * 18   // –9° to +9°
          const hasBg    = theme.bg !== 'transparent'
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontFamily: font,
                fontWeight: weight,
                fontStyle: isItalic ? 'italic' : 'normal',
                fontSize: sizePx * scale,
                textTransform: isUpper ? 'uppercase' : 'none',
                transform: `rotate(${rotate}deg)`,
                transformOrigin: 'center 85%',
                color: theme.color,
                backgroundColor: theme.bg,
                padding: hasBg ? '1px 3px' : '0 1px',
                margin: `0 ${Math.round(r(7) * 1.5)}px`,
                lineHeight: 1.05,
                verticalAlign: 'bottom',
              }}
            >
              {char}
            </span>
          )
        })}
      </p>
    )
  }

  // Fallback
  return <p style={{ fontSize: sizePx, textAlign, color: color || colors.fg, whiteSpace: 'pre-wrap' }}>{content}</p>
}
