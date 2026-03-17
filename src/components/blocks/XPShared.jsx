import { useState } from 'react'

// ── Windows XP Luna Blue palette ──────────────────────────────────────────────
export const XP = {
  titleGradL:  '#245CDC',
  titleGradR:  '#5BAAF4',
  titleText:   '#FFFFFF',
  chrome:      '#ECE9D8',
  chromeDark:  '#D4D0C8',
  chromeMid:   '#F0EEE4',
  frameBlue:   '#1D5CB0',
  frameDark:   '#003566',
  edgeHiHi:    '#FFFFFF',
  edgeHi:      '#DFDFDF',
  edgeLo:      '#808080',
  edgeLoLo:    '#404040',
  text:        '#000000',
  textMuted:   '#444444',
  textBlue:    '#0A24AE',
  closeGradT:  '#E06060',
  closeGradB:  '#C03030',
  insetBg:     '#FFFFFF',
  statusBg:    '#ECE9D8',
  menuBg:      '#F5F4EF',
  sidebarBg:   '#EEF3FB',
  sidebarBdr:  '#7A9CC0',
  sidebarHead: '#5A7FB5',
}

// Classic 3-D raised border (button up)
export const raised = {
  borderTop:    '1px solid #FFFFFF',
  borderLeft:   '1px solid #FFFFFF',
  borderRight:  '1px solid #808080',
  borderBottom: '1px solid #808080',
  boxShadow: 'inset 1px 1px 0 #DFDFDF, inset -1px -1px 0 #404040',
}

// Classic 3-D sunken border (button pressed / inset)
export const sunken = {
  borderTop:    '1px solid #808080',
  borderLeft:   '1px solid #808080',
  borderRight:  '1px solid #FFFFFF',
  borderBottom: '1px solid #FFFFFF',
  boxShadow: 'inset 1px 1px 0 #404040, inset -1px -1px 0 #FFFFFF',
}

// ── Title-bar control button (min / max / close) ───────────────────────────────
export function WinCtrlBtn({ type, onClick }) {
  const [hover, setHover] = useState(false)
  const isClose = type === 'close'
  const style = {
    width: 21, height: 19,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
    fontSize: 10, fontWeight: 'bold',
    cursor: 'pointer', userSelect: 'none',
    borderRadius: '2px 2px 0 0',
    marginLeft: 2, flexShrink: 0,
    background: isClose
      ? hover
        ? 'linear-gradient(180deg, #FF7070 0%, #D83030 100%)'
        : 'linear-gradient(180deg, #E06060 0%, #C03030 100%)'
      : hover
        ? 'linear-gradient(180deg, #6BAAF8 0%, #3070D0 100%)'
        : 'linear-gradient(180deg, #5A9AE8 0%, #2860C0 100%)',
    color: '#fff',
    border: isClose ? '1px solid #9B2020' : '1px solid #0A3590',
    boxShadow: hover ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.35)',
    transition: 'none',
  }
  return (
    <div
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {type === 'min'
        ? <span style={{ fontSize: 11, lineHeight: 1, marginTop: 3 }}>_</span>
        : type === 'max'
          ? <span style={{ fontSize: 9, lineHeight: 1, border: '1.5px solid #fff', width: 8, height: 8, display: 'block' }} />
          : <span style={{ fontSize: 11, lineHeight: 1 }}>✕</span>}
    </div>
  )
}

// ── Classic XP push button ────────────────────────────────────────────────────
export function XPBtn({ onClick, disabled, children, wide, primary }) {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const style = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    ...(wide ? { minWidth: 72, padding: '0 10px' } : { width: 26 }),
    height: 23,
    background: active ? XP.chromeDark : hover ? XP.chromeMid : XP.chrome,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    fontFamily: 'Tahoma, sans-serif',
    fontSize: 11,
    color: XP.text,
    flexShrink: 0,
    outline: primary ? '2px solid #000' : 'none',
    outlineOffset: -4,
    ...(active ? sunken : raised),
  }
  return (
    <div
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false) }}
      onMouseDown={() => !disabled && setActive(true)}
      onMouseUp={() => setActive(false)}
      onClick={() => !disabled && onClick?.()}
    >
      {children}
    </div>
  )
}
