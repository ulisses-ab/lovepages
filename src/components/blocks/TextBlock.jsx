import { useState, useRef, useEffect } from 'react'
import { ChevronDown, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { inputClass, colors } from '../../lib/theme'
import { useT } from '../../lib/i18n'
import ColorPicker from '../ui/ColorPicker'
import CollapsibleSection from '../ui/CollapsibleSection'
import TextTypewriterVariant from './text/TextTypewriterVariant'
import TextPostitVariant from './text/TextPostitVariant'
import TextRansomVariant from './text/TextRansomVariant'
import TextCyberpunkVariant from './text/TextCyberpunkVariant'
import TextXPVariant from './text/TextXPVariant'

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

// Mini visual previews for each text variant
function VariantCard({ value, label, selected, onClick, children }) {
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

function PlainPreview() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#f3f4f6', textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>Aa</div>
      <div style={{ fontSize: 9, opacity: 0.5, marginTop: 2 }}>plain text</div>
    </div>
  )
}

function TypewriterPreview() {
  return (
    <div style={{
      background: '#f8f3e8', borderRadius: 4, padding: '5px 7px', width: '100%',
      fontFamily: "'Courier New', monospace", fontSize: 8, color: '#1c140a', lineHeight: 1.5,
    }}>
      <div style={{ borderLeft: '2px solid #c0392b', paddingLeft: 4 }}>
        Dear friend,<br />I hope this<br />finds you well…
      </div>
    </div>
  )
}

function PostitPreview() {
  return (
    <div style={{
      background: '#fde047', borderRadius: 2, padding: '5px 7px', width: '100%',
      fontFamily: "'Caveat', cursive", fontSize: 10, color: '#1c1400', lineHeight: 1.4,
      boxShadow: '2px 3px 6px rgba(0,0,0,0.2)',
    }}>
      <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 3, marginBottom: 3, fontSize: 7, opacity: 0.5 }}>note</div>
      Don't forget<br />to smile today!
    </div>
  )
}

function RansomPreview() {
  const letters = [
    { ch: 'R', font: 'Impact', color: '#ef4444', bg: '#1e1e1e', rot: -4, size: 13 },
    { ch: 'A', font: 'Georgia', color: '#fbbf24', bg: 'transparent', rot: 3, size: 11 },
    { ch: 'N', font: 'Comic Sans MS, cursive', color: '#22d3ee', bg: '#1a1a1a', rot: -2, size: 10 },
    { ch: 'S', font: 'serif', color: '#f3f4f6', bg: '#dc2626', rot: 5, size: 12 },
    { ch: 'O', font: 'monospace', color: '#4ade80', bg: 'transparent', rot: -3, size: 9 },
    { ch: 'M', font: "'Arial Black', sans-serif", color: '#f97316', bg: '#111', rot: 4, size: 11 },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
      {letters.map((l, i) => (
        <span key={i} style={{
          fontFamily: l.font, fontSize: l.size, color: l.color,
          background: l.bg, transform: `rotate(${l.rot}deg)`,
          display: 'inline-block', lineHeight: 1, padding: '0 1px',
          fontWeight: i % 2 === 0 ? 700 : 400,
        }}>{l.ch}</span>
      ))}
    </div>
  )
}

function CyberpunkPreview() {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #06060f 0%, #0a0018 100%)',
      border: '1px solid #00e5ff', borderRadius: 3, padding: '5px 8px', width: '100%',
      fontFamily: "'Space Mono', monospace", color: '#00e5ff', fontSize: 9,
      textShadow: '0 0 6px #00e5ff, 0 0 12px #00e5ff44',
      lineHeight: 1.4,
    }}>
      <div style={{ opacity: 0.5, fontSize: 7, marginBottom: 2, letterSpacing: 1 }}>// SYS</div>
      HELLO_WORLD
    </div>
  )
}

function XPPreview() {
  return (
    <div style={{ border: '1px solid #999', borderRadius: 2, overflow: 'hidden', width: '100%', fontSize: 8 }}>
      <div style={{
        background: 'linear-gradient(180deg, #3a6ea5, #245cb5)',
        color: 'white', padding: '2px 5px', fontFamily: 'Tahoma, sans-serif', fontSize: 8, fontWeight: 700,
      }}>
        Notepad
      </div>
      <div style={{
        background: '#fff', fontFamily: "'Courier New', monospace",
        color: '#000', padding: '3px 5px', fontSize: 8, lineHeight: 1.4,
      }}>
        Once upon<br />a time…
      </div>
    </div>
  )
}

export default function TextBlock({ block, isEditing, onChange }) {
  const { variant, content, align, fontFamily = 'inter', fontSize = 'base', color = '', noteColor = '' } = block
  const { t } = useT()

  const isPhysical = variant === 'typewriter' || variant === 'postit' || variant === 'ransom' || variant === 'cyberpunk' || variant === 'xp'

  if (isEditing) {
    const VARIANTS = [
      { value: 'plain',      label: t('text.plain'),       Preview: PlainPreview },
      { value: 'typewriter', label: t('text.typewriter'),  Preview: TypewriterPreview },
      { value: 'postit',     label: t('text.postit'),      Preview: PostitPreview },
      { value: 'ransom',     label: t('text.ransom'),      Preview: RansomPreview },
      { value: 'cyberpunk',  label: 'Cyberpunk',           Preview: CyberpunkPreview },
      { value: 'xp',         label: t('text.xp'),          Preview: XPPreview },
    ]

    return (
      <div className="space-y-3">
        {/* Content first */}
        <textarea
          className={inputClass + ' resize-y min-h-[90px]'}
          value={content}
          onChange={e => onChange({ content: e.target.value })}
          placeholder={t('text.writeSomething')}
          autoFocus
        />

        {/* Visual variant picker */}
        <div>
          <p className="text-xs text-fg-muted mb-2">{t('text.style')}</p>
          <div className="grid grid-cols-3 gap-2">
            {VARIANTS.map(({ value, label, Preview }) => (
              <VariantCard
                key={value}
                value={value}
                label={label}
                selected={variant === value}
                onClick={() => onChange({ variant: value })}
              >
                <Preview />
              </VariantCard>
            ))}
          </div>
        </div>

        {/* Post-it color — shown inline when postit is selected */}
        {variant === 'postit' && (
          <ColorPicker
            value={noteColor || '#fde047'}
            onChange={val => onChange({ noteColor: val })}
            label={t('text.noteColor')}
          />
        )}

        {/* Customize look — collapsible, available for all variants */}
        <CollapsibleSection title={t('text.customizeLook')}>
          {/* Size + align — available for all variants */}
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

          {/* Font + style toggles — plain variant only */}
          {!isPhysical && (
            <>
              <FontPicker value={fontFamily} onChange={v => onChange({ fontFamily: v })} />
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
                <ColorPicker
                  value={color || colors.fg}
                  onChange={val => onChange({ color: val })}
                />
              </div>
            </>
          )}
        </CollapsibleSection>
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
  if (variant === 'typewriter') return <TextTypewriterVariant content={content} sizePx={sizePx} textAlign={textAlign} />

  // ── Post-it note ──────────────────────────────────────────────────────────────
  if (variant === 'postit') return <TextPostitVariant content={content} sizePx={sizePx} textAlign={textAlign} noteColor={noteColor} />

  // ── Ransom note ───────────────────────────────────────────────────────────────
  if (variant === 'ransom') return <TextRansomVariant content={content} sizePx={sizePx} textAlign={textAlign} />

  // ── Cyberpunk ─────────────────────────────────────────────────────────────────
  if (variant === 'cyberpunk') return <TextCyberpunkVariant content={content} sizePx={sizePx} textAlign={textAlign} />

  // ── Windows XP Notepad ────────────────────────────────────────────────────────
  if (variant === 'xp') return <TextXPVariant content={content} sizePx={sizePx} textAlign={textAlign} />

  // Fallback
  return <p style={{ fontSize: sizePx, textAlign, color: color || colors.fg, whiteSpace: 'pre-wrap' }}>{content}</p>
}
