import { useEffect, useRef, useState } from 'react'
import { formatTime } from './useSongPlayer'

// ── Windows XP Luna Blue palette ────────────────────────────────────────────
const XP = {
  // Title bar gradient
  titleGradL: '#245CDC',
  titleGradR: '#5BAAF4',
  titleText:  '#FFFFFF',
  // Window chrome
  chrome:     '#ECE9D8',    // main surface (#ECE9D8 Luna default)
  chromeDark: '#D4D0C8',    // darker chrome, borders
  chromeMid:  '#F0EEE4',    // lighter variant
  frameBlue:  '#1D5CB0',    // outer window frame
  frameDark:  '#003566',    // outer dark ring
  // 3-D edge helpers (light → dark)
  edgeHiHi:   '#FFFFFF',
  edgeHi:     '#DFDFDF',
  edgeLo:     '#808080',
  edgeLoLo:   '#404040',
  // Text
  text:       '#000000',
  textMuted:  '#444444',
  textBlue:   '#0A24AE',
  // Seek/progress
  trackBg:    '#FFFFFF',
  trackBorder:'#7F9DB9',
  thumb:      '#1A5276',
  // Close button red
  closeGradT: '#E06060',
  closeGradB: '#C03030',
  // Inset panel
  insetBg:    '#FFFFFF',
  insetBorder:'#7F9DB9',
  // Status bar
  statusBg:   '#ECE9D8',
  // Menu bar
  menuBg:     '#F5F4EF',
}

// ── Helpers ─────────────────────────────────────────────────────────────────

// Classic 3-D raised border (like a button)
const raised = {
  borderTop:    `1px solid ${XP.edgeHiHi}`,
  borderLeft:   `1px solid ${XP.edgeHiHi}`,
  borderRight:  `1px solid ${XP.edgeLo}`,
  borderBottom: `1px solid ${XP.edgeLo}`,
  boxShadow: `inset 1px 1px 0 ${XP.edgeHi}, inset -1px -1px 0 ${XP.edgeLoLo}`,
}

// Classic 3-D sunken (inset) border
const sunken = {
  borderTop:    `1px solid ${XP.edgeLo}`,
  borderLeft:   `1px solid ${XP.edgeLo}`,
  borderRight:  `1px solid ${XP.edgeHi}`,
  borderBottom: `1px solid ${XP.edgeHi}`,
  boxShadow: `inset 1px 1px 0 ${XP.edgeLoLo}, inset -1px -1px 0 ${XP.edgeHiHi}`,
}

// ── Sub-components ───────────────────────────────────────────────────────────

// Window title-bar control button (min / max / close)
function WinCtrlBtn({ type, onClick }) {
  const [hover, setHover] = useState(false)
  const isClose = type === 'close'
  const baseStyle = {
    width: 21, height: 19,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
    fontSize: 10,
    fontWeight: 'bold',
    cursor: 'pointer',
    userSelect: 'none',
    borderRadius: isClose ? '2px 2px 0 0' : '2px 2px 0 0',
    marginLeft: 2,
    flexShrink: 0,
    background: isClose
      ? hover ? `linear-gradient(180deg, #FF7070 0%, #D83030 100%)` : `linear-gradient(180deg, ${XP.closeGradT} 0%, ${XP.closeGradB} 100%)`
      : hover ? `linear-gradient(180deg, #6BAAF8 0%, #3070D0 100%)` : `linear-gradient(180deg, #5A9AE8 0%, #2860C0 100%)`,
    color: '#fff',
    border: isClose ? '1px solid #9B2020' : '1px solid #0A3590',
    boxShadow: hover ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.35)',
    transition: 'none',
    WebkitFontSmoothing: 'none',
  }
  const icons = { min: '─', max: '□', close: '✕' }
  return (
    <div
      style={baseStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {type === 'min' ? <span style={{ fontSize: 11, lineHeight: 1, marginTop: 3 }}>_</span>
       : type === 'max' ? <span style={{ fontSize: 9, lineHeight: 1, border: '1.5px solid #fff', width: 8, height: 8, display: 'block' }} />
       : <span style={{ fontSize: 11, lineHeight: 1 }}>✕</span>}
    </div>
  )
}

// Classic XP push button (transport controls)
function XPBtn({ onClick, disabled, children, wide }) {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const style = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: wide ? 38 : 26, height: 22,
    background: active
      ? XP.chromeDark
      : hover ? XP.chromeMid : XP.chrome,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    fontFamily: 'Tahoma, sans-serif',
    fontSize: 10,
    color: XP.text,
    flexShrink: 0,
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

// SVG transport icons
function IconPlay()      { return <svg width="9" height="10" viewBox="0 0 9 10" fill="none"><polygon points="1,0 9,5 1,10" fill="#222" /></svg> }
function IconPause()     { return <svg width="9" height="10" viewBox="0 0 9 10" fill="none"><rect x="0" y="0" width="3" height="10" fill="#222"/><rect x="5" y="0" width="3" height="10" fill="#222"/></svg> }
function IconStop()      { return <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><rect x="0" y="0" width="9" height="9" fill="#222"/></svg> }
function IconSkipBack()  { return <svg width="11" height="10" viewBox="0 0 11 10" fill="none"><rect x="0" y="0" width="2.5" height="10" fill="#222"/><polygon points="11,0 3,5 11,10" fill="#222"/></svg> }
function IconSkipFwd()   { return <svg width="11" height="10" viewBox="0 0 11 10" fill="none"><rect x="8.5" y="0" width="2.5" height="10" fill="#222"/><polygon points="0,0 8,5 0,10" fill="#222"/></svg> }
function IconVolume()    { return <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><polygon points="0,3 4,3 7,0 7,10 4,7 0,7" fill="#555"/><path d="M9,1 Q12,5 9,9" stroke="#555" strokeWidth="1.5" fill="none"/></svg> }

// ── Main component ──────────────────────────────────────────────────────────

const BASE_W = 362
const BASE_H = 222

export default function SongXPVariant({ block, playing, ready, progress, togglePlay, handleSeek }) {
  const { title = 'Untitled', artist = '', coverUrl = '' } = block

  const wrapRef  = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      setScale(Math.min(w / BASE_W, 1))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pct = progress?.duration > 0 ? (progress.current / progress.duration) * 100 : 0
  const elapsed = formatTime(progress?.current ?? 0)
  const duration = formatTime(progress?.duration ?? 0)

  function seekFromClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = (e.clientX - rect.left) / rect.width
    handleSeek?.({ currentTarget: e.currentTarget, clientX: e.clientX })
  }

  return (
    <div ref={wrapRef} style={{ width: '100%', lineHeight: 1 }}>
      <div style={{
        width: BASE_W, height: BASE_H,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
        fontSize: 11,
        color: XP.text,
      }}>

        {/* ── Outer window frame ─────────────────────────────────────────── */}
        <div style={{
          width: BASE_W, height: BASE_H,
          background: XP.chrome,
          border: `3px solid ${XP.frameBlue}`,
          outline: `1px solid ${XP.frameDark}`,
          boxShadow: '4px 4px 12px rgba(0,0,0,0.55)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>

          {/* ── Title bar ─────────────────────────────────────────────────── */}
          <div style={{
            height: 28, flexShrink: 0,
            background: `linear-gradient(90deg, ${XP.titleGradL} 0%, ${XP.titleGradR} 70%, #80C0FF 100%)`,
            display: 'flex', alignItems: 'center',
            padding: '0 4px 0 6px',
            gap: 0,
          }}>
            {/* App icon */}
            <span style={{ fontSize: 14, marginRight: 5, lineHeight: 1 }}>🎵</span>
            {/* Title text */}
            <span style={{
              flex: 1, color: XP.titleText,
              fontSize: 11, fontWeight: 'bold',
              textShadow: '1px 1px 1px rgba(0,0,30,0.5)',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              letterSpacing: 0.2,
            }}>
              Windows Media Player
            </span>
            {/* Window controls */}
            <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 2, gap: 2 }}>
              <WinCtrlBtn type="min" onClick={() => {}} />
              <WinCtrlBtn type="max" onClick={() => {}} />
              <WinCtrlBtn type="close" onClick={() => {}} />
            </div>
          </div>

          {/* ── Menu bar ──────────────────────────────────────────────────── */}
          <div style={{
            height: 20, flexShrink: 0,
            background: XP.menuBg,
            borderBottom: `1px solid ${XP.chromeDark}`,
            display: 'flex', alignItems: 'center',
            paddingLeft: 6, gap: 2,
          }}>
            {['File', 'View', 'Play', 'Tools', 'Help'].map(item => (
              <span key={item} style={{
                padding: '2px 6px',
                fontSize: 11,
                color: XP.text,
                cursor: 'default',
                borderRadius: 2,
              }}>
                {item}
              </span>
            ))}
          </div>

          {/* ── Main content area ─────────────────────────────────────────── */}
          <div style={{
            flex: 1,
            background: '#FFFFFF',
            display: 'flex',
            borderBottom: `1px solid ${XP.chromeDark}`,
            overflow: 'hidden',
          }}>
            {/* Cover art panel (sunken inset) */}
            <div style={{
              width: 90, flexShrink: 0,
              margin: 8,
              ...sunken,
              background: '#000',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {coverUrl ? (
                <img src={coverUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 28, opacity: 0.4 }}>🎵</span>
                  <span style={{ color: '#555', fontSize: 9, textAlign: 'center', padding: '0 4px' }}>No cover</span>
                </div>
              )}
            </div>

            {/* Track info + seek */}
            <div style={{
              flex: 1, padding: '8px 8px 8px 0',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              overflow: 'hidden',
            }}>
              {/* Song title */}
              <div style={{
                fontWeight: 'bold', fontSize: 12, color: XP.textBlue,
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                lineHeight: 1.3,
              }}>
                {title || 'Unknown Track'}
              </div>

              {/* Artist */}
              <div style={{
                fontSize: 11, color: XP.textMuted,
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                lineHeight: 1.3,
              }}>
                {artist || 'Unknown Artist'}
              </div>

              {/* Playing status dot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: playing ? '#22AA22' : ready ? '#AAAAAA' : '#CCAA00',
                  boxShadow: playing ? '0 0 4px #22AA22' : 'none',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 10, color: XP.textMuted }}>
                  {playing ? 'Playing' : ready ? 'Paused' : 'Loading…'}
                </span>
              </div>

              {/* Time display */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 10, color: XP.text,
                fontFamily: '"Courier New", Courier, monospace',
              }}>
                <span style={{ minWidth: 36 }}>{elapsed}</span>
                <span style={{ color: XP.chromeDark }}>/</span>
                <span style={{ color: XP.textMuted }}>{duration}</span>
              </div>

              {/* Seek bar */}
              <div
                style={{ position: 'relative', height: 22, cursor: 'pointer' }}
                onClick={handleSeek}
              >
                {/* Track groove (sunken) */}
                <div style={{
                  position: 'absolute', top: '50%', left: 0, right: 0,
                  transform: 'translateY(-50%)',
                  height: 6,
                  background: XP.trackBg,
                  borderTop:    `1px solid ${XP.edgeLo}`,
                  borderLeft:   `1px solid ${XP.edgeLo}`,
                  borderRight:  `1px solid ${XP.edgeHi}`,
                  borderBottom: `1px solid ${XP.edgeHi}`,
                  boxShadow: `inset 1px 1px 0 ${XP.edgeLoLo}`,
                }}>
                  {/* Fill */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0,
                    width: `${pct}%`,
                    background: `linear-gradient(180deg, #4EA6DF 0%, #1A6AAF 100%)`,
                  }} />
                </div>
                {/* Thumb */}
                <div style={{
                  position: 'absolute', top: '50%',
                  left: `${pct}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 11, height: 18,
                  background: `linear-gradient(180deg, ${XP.chromeMid} 0%, ${XP.chromeDark} 100%)`,
                  ...raised,
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 2,
                  pointerEvents: 'none',
                }}>
                  {/* Grip lines */}
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 1, height: 10, background: `linear-gradient(180deg, ${XP.edgeHiHi}, ${XP.edgeLo})` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Transport controls bar ─────────────────────────────────────── */}
          <div style={{
            height: 38, flexShrink: 0,
            background: XP.chrome,
            borderBottom: `1px solid ${XP.chromeDark}`,
            display: 'flex', alignItems: 'center',
            padding: '0 8px', gap: 3,
          }}>
            {/* Transport group */}
            <XPBtn onClick={() => {}} disabled={!ready}><IconSkipBack /></XPBtn>
            <XPBtn onClick={togglePlay} disabled={!ready} wide>
              {playing ? <IconPause /> : <IconPlay />}
            </XPBtn>
            <XPBtn onClick={togglePlay} disabled={!ready}><IconStop /></XPBtn>
            <XPBtn onClick={() => {}} disabled={!ready}><IconSkipFwd /></XPBtn>

            {/* Separator */}
            <div style={{ width: 1, height: 22, background: XP.edgeLo, margin: '0 4px' }} />

            {/* Volume area */}
            <IconVolume />
            <div style={{
              flex: 1, maxWidth: 80, height: 6, position: 'relative',
              background: XP.trackBg,
              ...sunken,
              cursor: 'pointer',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0,
                width: '70%',
                background: `linear-gradient(180deg, #6ABDE8 0%, #2070B8 100%)`,
              }} />
            </div>

            {/* Separator */}
            <div style={{ width: 1, height: 22, background: XP.edgeLo, margin: '0 4px' }} />

            {/* Visualizer bars (decorative) */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 18 }}>
              {[10, 16, 12, 18, 8, 14, 10].map((h, i) => (
                <div key={i} style={{
                  width: 3, height: playing ? h : 3,
                  background: `linear-gradient(180deg, #3AABF0 0%, #0055A0 100%)`,
                  transition: 'height 0.15s ease',
                  flexShrink: 0,
                }} />
              ))}
            </div>
          </div>

          {/* ── Status bar ────────────────────────────────────────────────── */}
          <div style={{
            height: 20, flexShrink: 0,
            background: XP.statusBg,
            display: 'flex', alignItems: 'center',
            gap: 4, padding: '0 4px',
          }}>
            {/* Status panel */}
            <div style={{
              flex: 1, height: 14, paddingLeft: 6,
              ...sunken,
              display: 'flex', alignItems: 'center',
              fontSize: 10, color: XP.textMuted,
              overflow: 'hidden', whiteSpace: 'nowrap',
            }}>
              {playing ? `Now Playing: ${title || 'Unknown Track'}` : ready ? 'Ready' : 'Connecting…'}
            </div>
            {/* Time panel */}
            <div style={{
              width: 60, height: 14, paddingLeft: 4,
              ...sunken,
              display: 'flex', alignItems: 'center',
              fontSize: 10,
              fontFamily: '"Courier New", Courier, monospace',
              color: XP.text,
            }}>
              {elapsed}
            </div>
          </div>

        </div>{/* outer window frame */}
      </div>
      {/* phantom div to set container height */}
      <div style={{ height: BASE_H * scale }} />
    </div>
  )
}
