import { useRef, useState, useEffect } from 'react'
import { XP, raised, sunken, WinCtrlBtn } from '../XPShared'

const BASE_W = 340
const BASE_H = 220

export default function TextXPVariant({ content, sizePx, textAlign }) {
  const wrapRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setScale(Math.min(entry.contentRect.width / BASE_W, 1))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const lines   = content ? content.split('\n').length : 1
  const chars   = content ? content.length : 0

  return (
    <div ref={wrapRef} style={{ width: '100%', lineHeight: 1 }}>
      <div style={{
        width: BASE_W,
        height: BASE_H,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
        fontSize: 11,
        color: XP.text,
      }}>

        {/* ── Outer window frame ──────────────────────────────────────────── */}
        <div style={{
          width: BASE_W,
          height: BASE_H,
          background: XP.chrome,
          border: `3px solid ${XP.frameBlue}`,
          outline: `1px solid ${XP.frameDark}`,
          boxShadow: '4px 4px 12px rgba(0,0,0,0.55)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>

          {/* ── Title bar ────────────────────────────────────────────────── */}
          <div style={{
            height: 28, flexShrink: 0,
            background: `linear-gradient(90deg, ${XP.titleGradL} 0%, ${XP.titleGradR} 70%, #80C0FF 100%)`,
            display: 'flex', alignItems: 'center',
            padding: '0 4px 0 6px',
          }}>
            <span style={{ fontSize: 14, marginRight: 5, lineHeight: 1 }}>📝</span>
            <span style={{
              flex: 1, color: XP.titleText, fontSize: 11, fontWeight: 'bold',
              textShadow: '1px 1px 1px rgba(0,0,30,0.5)',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              letterSpacing: 0.2,
            }}>
              Untitled - Notepad
            </span>
            <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 2, gap: 2 }}>
              <WinCtrlBtn type="min" onClick={() => {}} />
              <WinCtrlBtn type="max" onClick={() => {}} />
              <WinCtrlBtn type="close" onClick={() => {}} />
            </div>
          </div>

          {/* ── Menu bar ─────────────────────────────────────────────────── */}
          <div style={{
            height: 20, flexShrink: 0,
            background: XP.menuBg,
            borderBottom: `1px solid ${XP.chromeDark}`,
            display: 'flex', alignItems: 'center',
            paddingLeft: 6,
          }}>
            {['File', 'Edit', 'Format', 'View', 'Help'].map(item => (
              <span key={item} style={{
                padding: '2px 6px', fontSize: 11,
                color: XP.text, cursor: 'default',
              }}>
                {item}
              </span>
            ))}
          </div>

          {/* ── Text area ────────────────────────────────────────────────── */}
          <div style={{
            flex: 1,
            margin: 2,
            ...sunken,
            background: '#FFFFFF',
            padding: '4px 6px',
            overflowY: 'auto',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: Math.min(typeof sizePx === 'number' ? sizePx : 13, 14),
            color: XP.text,
            textAlign,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.4,
          }}>
            {content || ''}
          </div>

          {/* ── Status bar ───────────────────────────────────────────────── */}
          <div style={{
            height: 20, flexShrink: 0,
            background: XP.statusBg,
            borderTop: `1px solid ${XP.chromeDark}`,
            display: 'flex', alignItems: 'center',
            padding: '0 4px', gap: 3,
          }}>
            <div style={{
              flex: 1, height: 14, paddingLeft: 6,
              ...sunken,
              display: 'flex', alignItems: 'center',
              fontSize: 10, color: XP.textMuted,
            }}>
              Ln {lines}, Col 1
            </div>
            <div style={{
              width: 76, height: 14, paddingLeft: 4,
              ...sunken,
              display: 'flex', alignItems: 'center',
              fontSize: 10, color: XP.textMuted,
            }}>
              {chars} char{chars !== 1 ? 's' : ''}
            </div>
          </div>

        </div>
      </div>
      {/* phantom div — corrects container height after CSS scale */}
      <div style={{ height: BASE_H * scale }} />
    </div>
  )
}
