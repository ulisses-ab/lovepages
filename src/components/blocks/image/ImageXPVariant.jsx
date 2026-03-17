import { useRef, useState, useEffect } from 'react'
import { XP, raised, sunken, WinCtrlBtn, XPBtn } from '../XPShared'

const BASE_W = 360
const BASE_H = 290

function IconZoomIn()  { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="3.5" stroke="#333" strokeWidth="1.5"/><line x1="7.8" y1="7.8" x2="11" y2="11" stroke="#333" strokeWidth="1.5"/><line x1="3" y1="5" x2="7" y2="5" stroke="#333" strokeWidth="1.5"/><line x1="5" y1="3" x2="5" y2="7" stroke="#333" strokeWidth="1.5"/></svg> }
function IconZoomOut() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="3.5" stroke="#333" strokeWidth="1.5"/><line x1="7.8" y1="7.8" x2="11" y2="11" stroke="#333" strokeWidth="1.5"/><line x1="3" y1="5" x2="7" y2="5" stroke="#333" strokeWidth="1.5"/></svg> }
function IconRotate()  { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6 A4 4 0 1 1 6 10" stroke="#333" strokeWidth="1.5"/><polygon points="1,3.5 2,7 4.5,4.5" fill="#333"/></svg> }
function IconPrev()    { return <svg width="9" height="12" viewBox="0 0 9 12" fill="none"><polygon points="9,0 0,6 9,12" fill="#444"/></svg> }
function IconNext()    { return <svg width="9" height="12" viewBox="0 0 9 12" fill="none"><polygon points="0,0 9,6 0,12" fill="#444"/></svg> }

export default function ImageXPVariant({ src, alt, caption }) {
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

  const windowTitle = caption
    ? `${caption} - Windows Picture and Fax Viewer`
    : 'Windows Picture and Fax Viewer'

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
            <span style={{ fontSize: 14, marginRight: 5, lineHeight: 1 }}>🖼️</span>
            <span style={{
              flex: 1, color: XP.titleText, fontSize: 11, fontWeight: 'bold',
              textShadow: '1px 1px 1px rgba(0,0,30,0.5)',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              letterSpacing: 0.2,
            }}>
              {windowTitle}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 2, gap: 2 }}>
              <WinCtrlBtn type="min" onClick={() => {}} />
              <WinCtrlBtn type="max" onClick={() => {}} />
              <WinCtrlBtn type="close" onClick={() => {}} />
            </div>
          </div>

          {/* ── Image viewport ───────────────────────────────────────────── */}
          <div style={{
            flex: 1,
            background: '#6B6B6B',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {src ? (
              <img
                src={src}
                alt={alt || ''}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                color: '#BBBBBB', fontSize: 12,
              }}>
                <span style={{ fontSize: 40, opacity: 0.5 }}>🖼️</span>
                <span>No image</span>
              </div>
            )}
          </div>

          {/* ── Navigation toolbar ───────────────────────────────────────── */}
          <div style={{
            height: 36, flexShrink: 0,
            background: XP.chrome,
            borderTop: `1px solid ${XP.chromeDark}`,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            padding: '0 8px', gap: 3,
          }}>
            <XPBtn disabled><IconPrev /></XPBtn>
            <div style={{ width: 1, height: 22, background: XP.edgeLo, margin: '0 4px' }} />
            <XPBtn><IconZoomOut /></XPBtn>
            <XPBtn><IconZoomIn /></XPBtn>
            <XPBtn><IconRotate /></XPBtn>
            <div style={{ width: 1, height: 22, background: XP.edgeLo, margin: '0 4px' }} />
            <XPBtn disabled><IconNext /></XPBtn>

            {/* Separator + print/email decorative buttons */}
            <div style={{ width: 1, height: 22, background: XP.edgeLo, margin: '0 4px' }} />
            <XPBtn>
              <span style={{ fontSize: 11 }}>🖨️</span>
            </XPBtn>
            <XPBtn>
              <span style={{ fontSize: 11 }}>✉️</span>
            </XPBtn>
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
              overflow: 'hidden', whiteSpace: 'nowrap',
            }}>
              {caption ? caption : 'Ready'}
            </div>
            <div style={{
              width: 60, height: 14, paddingLeft: 4,
              ...sunken,
              display: 'flex', alignItems: 'center',
              fontSize: 10, color: XP.textMuted,
            }}>
              1 of 1
            </div>
          </div>

        </div>
      </div>
      {/* phantom div — corrects container height after CSS scale */}
      <div style={{ height: BASE_H * scale }} />
    </div>
  )
}
