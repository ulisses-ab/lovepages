import { useRef, useState, useEffect } from 'react'
import { XP, raised, sunken, WinCtrlBtn, XPBtn } from '../XPShared'
import { pad } from './CountdownShared'

const BASE_W = 356
const BASE_H = 216

export default function CountdownXPVariant({ days, hours, minutes, seconds, label }) {
  const wrapRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setScale(Math.min(entry.contentRect.width / BASE_W, 1))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const units = [
    { value: days,    unit: 'Days' },
    { value: hours,   unit: 'Hrs' },
    { value: minutes, unit: 'Min' },
    { value: seconds, unit: 'Sec' },
  ]

  const tabs = ['Date & Time', 'Time Zone', 'Internet Time']

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
            <span style={{ fontSize: 14, marginRight: 5, lineHeight: 1 }}>⏰</span>
            <span style={{
              flex: 1, color: XP.titleText, fontSize: 11, fontWeight: 'bold',
              textShadow: '1px 1px 1px rgba(0,0,30,0.5)',
              letterSpacing: 0.2,
            }}>
              Date and Time Properties
            </span>
            <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 2, gap: 2 }}>
              <WinCtrlBtn type="min" onClick={() => {}} />
              <WinCtrlBtn type="max" onClick={() => {}} />
              <WinCtrlBtn type="close" onClick={() => {}} />
            </div>
          </div>

          {/* ── Tab strip ────────────────────────────────────────────────── */}
          <div style={{
            height: 22, flexShrink: 0,
            background: XP.chromeDark,
            borderBottom: `2px solid ${XP.chrome}`,
            display: 'flex', alignItems: 'flex-end',
            paddingLeft: 6, gap: 2,
          }}>
            {tabs.map((tab, i) => (
              <div
                key={tab}
                onClick={() => setActiveTab(i)}
                style={{
                  padding: '2px 10px 3px',
                  fontSize: 11,
                  background: i === activeTab ? XP.chrome : XP.chromeDark,
                  border: `1px solid ${XP.edgeLo}`,
                  borderBottom: i === activeTab ? `1px solid ${XP.chrome}` : 'none',
                  cursor: 'default',
                  color: XP.text,
                  borderRadius: '3px 3px 0 0',
                  marginBottom: i === activeTab ? -2 : 0,
                  zIndex: i === activeTab ? 1 : 0,
                  position: 'relative',
                  userSelect: 'none',
                }}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <div style={{
            flex: 1,
            background: XP.chrome,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 20px 4px',
            gap: 10,
          }}>

            {label && (
              <div style={{
                fontSize: 11, color: XP.textMuted,
                textAlign: 'center', width: '100%',
              }}>
                {label}
              </div>
            )}

            {/* Digit display panels */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              {units.map(({ value, unit }, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  {/* Sunken digit inset */}
                  <div style={{
                    width: 54, height: 40,
                    ...sunken,
                    background: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: '"Courier New", Courier, monospace',
                    fontSize: 22, fontWeight: 'bold',
                    color: XP.textBlue,
                    letterSpacing: 2,
                  }}>
                    {pad(value)}
                  </div>
                  <span style={{
                    fontSize: 9, color: XP.textMuted,
                    fontFamily: 'Tahoma, sans-serif',
                  }}>
                    {unit}
                  </span>
                </div>
              ))}

              {/* Spin buttons group — decorative */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                gap: 1, paddingBottom: 16, marginLeft: 2,
              }}>
                <div style={{
                  width: 16, height: 12,
                  ...raised,
                  background: XP.chrome,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 7, cursor: 'default',
                }}>▲</div>
                <div style={{
                  width: 16, height: 12,
                  ...raised,
                  background: XP.chrome,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 7, cursor: 'default',
                }}>▼</div>
              </div>
            </div>
          </div>

          {/* ── Button row ───────────────────────────────────────────────── */}
          <div style={{
            height: 36, flexShrink: 0,
            background: XP.chromeDark,
            borderTop: `1px solid ${XP.edgeLo}`,
            display: 'flex', alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 10px', gap: 6,
          }}>
            <XPBtn wide primary>OK</XPBtn>
            <XPBtn wide>Cancel</XPBtn>
            <XPBtn wide>Apply</XPBtn>
          </div>

        </div>
      </div>
      {/* phantom div — corrects container height after CSS scale */}
      <div style={{ height: BASE_H * scale }} />
    </div>
  )
}
