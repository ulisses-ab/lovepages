import { useRef, useState, useEffect } from 'react'
import { XP, raised, sunken, WinCtrlBtn, XPBtn } from '../XPShared'

const BASE_W = 380
const BASE_H = 310

function IconBack() {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
      <path d="M6,1 L1,5 L6,9 M1,5 L11,5" stroke="#333" strokeWidth="1.5"/>
    </svg>
  )
}
function IconFwd() {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
      <path d="M6,1 L11,5 L6,9 M11,5 L1,5" stroke="#333" strokeWidth="1.5"/>
    </svg>
  )
}
function IconUp() {
  return (
    <svg width="11" height="10" viewBox="0 0 11 10" fill="none">
      <path d="M1,8 L5.5,2 L10,8" stroke="#333" strokeWidth="1.5"/>
    </svg>
  )
}

export default function CarouselXPVariant({ block }) {
  const { images = [], albumTitle = '' } = block

  const wrapRef  = useRef(null)
  const [scale,   setScale]   = useState(1)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setScale(Math.min(entry.contentRect.width / BASE_W, 1))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const safeIdx      = images.length > 0 ? Math.min(current, images.length - 1) : 0
  const currentImage = images[safeIdx]

  function prev() { setCurrent(i => Math.max(0, i - 1)) }
  function next() { setCurrent(i => Math.min(images.length - 1, i + 1)) }

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
            <span style={{ fontSize: 14, marginRight: 5, lineHeight: 1 }}>📁</span>
            <span style={{
              flex: 1, color: XP.titleText, fontSize: 11, fontWeight: 'bold',
              textShadow: '1px 1px 1px rgba(0,0,30,0.5)',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              letterSpacing: 0.2,
            }}>
              {albumTitle || 'My Pictures'} - Windows Explorer
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
            {['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'].map(item => (
              <span key={item} style={{
                padding: '2px 5px', fontSize: 11,
                color: XP.text, cursor: 'default',
              }}>
                {item}
              </span>
            ))}
          </div>

          {/* ── Toolbar ──────────────────────────────────────────────────── */}
          <div style={{
            height: 30, flexShrink: 0,
            background: XP.chrome,
            borderBottom: `1px solid ${XP.chromeDark}`,
            display: 'flex', alignItems: 'center',
            padding: '0 6px', gap: 2,
          }}>
            <XPBtn onClick={prev} disabled={safeIdx === 0}><IconBack /></XPBtn>
            <XPBtn onClick={next} disabled={safeIdx >= images.length - 1}><IconFwd /></XPBtn>
            <XPBtn disabled><IconUp /></XPBtn>
            <div style={{ width: 1, height: 22, background: XP.edgeLo, margin: '0 3px' }} />
            {/* Address bar */}
            <div style={{
              flex: 1, height: 20,
              ...sunken,
              background: '#fff',
              display: 'flex', alignItems: 'center',
              padding: '0 6px',
              fontSize: 11, color: XP.text,
              overflow: 'hidden', whiteSpace: 'nowrap',
            }}>
              📁&nbsp; My Pictures{albumTitle ? ` › ${albumTitle}` : ''}
            </div>
          </div>

          {/* ── Body: sidebar + content ───────────────────────────────────── */}
          <div style={{
            flex: 1,
            display: 'flex',
            background: '#FFFFFF',
            overflow: 'hidden',
          }}>

            {/* Left task pane */}
            <div style={{
              width: 106, flexShrink: 0,
              background: XP.sidebarBg,
              borderRight: `1px solid ${XP.sidebarBdr}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              {/* Section header */}
              <div style={{
                padding: '5px 8px',
                background: `linear-gradient(180deg, #7BAAD8 0%, ${XP.sidebarHead} 100%)`,
                color: '#fff',
                fontSize: 10, fontWeight: 'bold',
                borderBottom: `1px solid ${XP.sidebarBdr}`,
              }}>
                Picture Tasks
              </div>
              {[
                { icon: '🖨️', label: 'Print pictures' },
                { icon: '📤', label: 'Share online' },
                { icon: '📀', label: 'Copy to CD' },
              ].map(({ icon, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 8px',
                  fontSize: 10, color: XP.textBlue,
                  cursor: 'default',
                  lineHeight: 1.3,
                }}>
                  <span style={{ fontSize: 12, flexShrink: 0 }}>{icon}</span>
                  <span style={{ textDecoration: 'underline' }}>{label}</span>
                </div>
              ))}

              <div style={{ height: 1, background: XP.sidebarBdr, margin: '2px 0' }} />
              <div style={{
                padding: '5px 8px',
                background: `linear-gradient(180deg, #7BAAD8 0%, ${XP.sidebarHead} 100%)`,
                color: '#fff',
                fontSize: 10, fontWeight: 'bold',
              }}>
                File and Folder Tasks
              </div>
              {[
                { icon: '📋', label: 'Copy this folder' },
                { icon: '📂', label: 'Move this folder' },
                { icon: '🗑️', label: 'Delete this folder' },
              ].map(({ icon, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 8px',
                  fontSize: 10, color: XP.textBlue,
                  cursor: 'default',
                  lineHeight: 1.3,
                }}>
                  <span style={{ fontSize: 12, flexShrink: 0 }}>{icon}</span>
                  <span style={{ textDecoration: 'underline' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Main image + filmstrip */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {images.length === 0 ? (
                <div style={{
                  flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#aaa', fontSize: 11,
                  background: '#FFFFFF',
                }}>
                  This folder is empty.
                </div>
              ) : (
                <>
                  {/* Main image viewport */}
                  <div style={{
                    flex: 1,
                    background: '#4A4A4A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {currentImage?.src ? (
                      <img
                        src={currentImage.src}
                        alt={currentImage.caption || ''}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                      />
                    ) : (
                      <span style={{ color: '#888', fontSize: 11 }}>No image</span>
                    )}
                  </div>

                  {/* Filmstrip */}
                  <div style={{
                    height: 54, flexShrink: 0,
                    background: '#3C3C3C',
                    borderTop: '2px solid #222',
                    display: 'flex', alignItems: 'center',
                    padding: '0 4px', gap: 3,
                    overflowX: 'auto',
                  }}>
                    {images.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setCurrent(i)}
                        style={{
                          width: 42, height: 42, flexShrink: 0,
                          border: i === safeIdx
                            ? '2px solid #6ABDE8'
                            : '2px solid #555',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          background: '#222',
                          boxShadow: i === safeIdx ? '0 0 4px rgba(106,189,232,0.6)' : 'none',
                        }}
                      >
                        {img.src && (
                          <img
                            src={img.src}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
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
              {images.length} object{images.length !== 1 ? 's' : ''}
              {currentImage?.caption ? ` — ${currentImage.caption}` : ''}
            </div>
            <div style={{
              width: 60, height: 14, paddingLeft: 4,
              ...sunken,
              display: 'flex', alignItems: 'center',
              fontSize: 10, color: XP.textMuted,
            }}>
              {images.length > 0 ? `${safeIdx + 1} of ${images.length}` : '0 items'}
            </div>
          </div>

        </div>
      </div>
      </div>
    </div>
  )
}
