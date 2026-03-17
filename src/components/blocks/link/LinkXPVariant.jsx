import { useRef, useState, useEffect } from 'react'
import { XP, raised, sunken, WinCtrlBtn, XPBtn } from '../XPShared'

const BASE_W = 290
const BASE_H = 138

export default function LinkXPVariant({ href, label }) {
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

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'center', height: BASE_H * scale, overflow: 'hidden', lineHeight: 1 }}>
      <div style={{
        width: BASE_W,
        flexShrink: 0,
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
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
            <span style={{ fontSize: 14, marginRight: 5, lineHeight: 1 }}>🌐</span>
            <span style={{
              flex: 1, color: XP.titleText, fontSize: 11, fontWeight: 'bold',
              textShadow: '1px 1px 1px rgba(0,0,30,0.5)',
              letterSpacing: 0.2,
            }}>
              Open Link
            </span>
            <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 2, gap: 2 }}>
              <WinCtrlBtn type="close" onClick={() => {}} />
            </div>
          </div>

          {/* ── Dialog content ───────────────────────────────────────────── */}
          <div style={{
            flex: 1,
            background: XP.chrome,
            display: 'flex',
            flexDirection: 'column',
            padding: '14px 16px 10px',
            gap: 10,
          }}>

            {/* Icon + message row */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {/* Shield / warning icon (XP-style) */}
              <div style={{
                width: 36, height: 36, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, lineHeight: 1,
              }}>
                🌐
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 11, color: XP.text, lineHeight: 1.4, fontWeight: 'bold' }}>
                  {label || 'Click here'}
                </div>
                <div style={{
                  fontSize: 10, color: XP.textMuted, lineHeight: 1.3,
                }}>
                  This link will open a new window.
                </div>
              </div>
            </div>

            {/* Horizontal rule */}
            <div style={{
              height: 1,
              background: `linear-gradient(90deg, ${XP.chromeDark}, transparent)`,
              marginTop: 2,
            }} />

            {/* Button row */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
              <a
                href={href || '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <XPBtn wide primary>Open</XPBtn>
              </a>
              <XPBtn wide>Cancel</XPBtn>
            </div>

          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
