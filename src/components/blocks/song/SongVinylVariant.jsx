import { useState, useEffect, useRef } from 'react'
import { HiddenPlayer } from './SongShared'

const PLAT = 175        // platter diameter px
const ARM_LEN = 88      // tonearm length px
const ARM_PLAY = 34    // degrees → needle on record
const ARM_REST = -18     // degrees → arm resting off record
const CTRL_GAP = 10     // gap between tonearm area and control panel
const CTRL_W = 85       // control panel width
const VINYL_BASE_W = 377
const VINYL_BASE_H = 211

function WoodTexture() {
  return <>
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
      backgroundImage: [
        'repeating-linear-gradient(91.5deg, transparent 0px, transparent 4px, rgba(255,180,80,0.045) 4px, rgba(255,180,80,0.045) 5px, transparent 5px, transparent 10px, rgba(0,0,0,0.07) 10px, rgba(0,0,0,0.07) 11px)',
        'repeating-linear-gradient(90.8deg, transparent 0px, transparent 16px, rgba(200,110,30,0.05) 16px, rgba(200,110,30,0.05) 18px, transparent 18px, transparent 28px)',
        'repeating-linear-gradient(89.2deg, transparent 0px, transparent 30px, rgba(255,210,120,0.03) 30px, rgba(255,210,120,0.03) 33px, transparent 33px, transparent 62px)',
        'repeating-linear-gradient(91deg, transparent 0px, transparent 44px, rgba(0,0,0,0.1) 44px, rgba(0,0,0,0.1) 45.5px)',
      ].join(','),
    }} />
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
      background: 'linear-gradient(168deg, rgba(200,120,30,0.05) 0%, transparent 35%, rgba(180,100,20,0.03) 65%, transparent 100%)',
    }} />
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
      background: 'linear-gradient(to bottom, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.01) 30%, transparent 60%)',
    }} />
  </>
}

function MetalTexture() {
  return <>
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
      backgroundImage: [
        'repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(255,255,255,0.018) 2px, rgba(255,255,255,0.018) 3px)',
        'repeating-linear-gradient(90deg, transparent 0px, transparent 8px, rgba(255,255,255,0.012) 8px, rgba(255,255,255,0.012) 9px)',
        'repeating-linear-gradient(90deg, transparent 0px, transparent 20px, rgba(0,0,0,0.06) 20px, rgba(0,0,0,0.06) 21px)',
      ].join(','),
    }} />
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
      background: 'linear-gradient(125deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 30%, transparent 55%, rgba(255,255,255,0.03) 80%, transparent 100%)',
    }} />
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
      background: 'linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, transparent 18%)',
    }} />
  </>
}

function Tonearm({ playing }) {
  return (
    <div style={{ position: 'absolute', left: PLAT + 14, top: 7, width: 22, height: 22, zIndex: 10 }}>
      {/* Bearing housing — outer chrome ring */}
      <div style={{
        position: 'absolute', width: 22, height: 22, borderRadius: '50%',
        background: 'linear-gradient(145deg, #c8c8c8 0%, #707070 50%, #303030 100%)',
        boxShadow: '0 3px 10px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.3)',
      }} />
      {/* Bearing housing — inner recess */}
      <div style={{
        position: 'absolute', top: 4, left: 4,
        width: 14, height: 14, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 32%, #999 0%, #444 55%, #1a1a1a 100%)',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)',
      }} />
      {/* Pivot centre pin */}
      <div style={{
        position: 'absolute', top: 9, left: 9,
        width: 4, height: 4, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #ccc, #555)',
      }} />

      {/* Rotating arm assembly */}
      <div style={{
        position: 'absolute', top: 11, left: 11,
        transformOrigin: '0 0',
        transform: `rotate(${playing ? ARM_PLAY : ARM_REST}deg)`,
        transition: 'transform 0.9s cubic-bezier(0.3, 0, 0.2, 1)',
      }}>
        {/* Counterweight — main cylinder */}
        <div style={{
          position: 'absolute', top: -34, left: -9,
          width: 18, height: 28, borderRadius: 3,
          background: 'linear-gradient(90deg, #1e1e1e 0%, #888 20%, #c8c8c8 50%, #888 80%, #1e1e1e 100%)',
          boxShadow: '0 3px 8px rgba(0,0,0,0.9)',
        }} />
        {/* Counterweight — fine-tune ring */}
        <div style={{
          position: 'absolute', top: -20, left: -10,
          width: 20, height: 5, borderRadius: 1,
          background: 'linear-gradient(90deg, #111 0%, #555 25%, #666 50%, #555 75%, #111 100%)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6)',
        }} />

        {/* Main arm tube */}
        <div style={{
          position: 'absolute', top: 2, left: -1.5,
          width: 3, height: 62, borderRadius: 2,
          background: 'linear-gradient(90deg, #2a2a2a 0%, #c0c0c0 28%, #eaeaea 50%, #c0c0c0 72%, #2a2a2a 100%)',
        }} />

        {/* Lower arm elbow — S-bend */}
        <div style={{
          position: 'absolute', top: 62, left: -2,
          width: 3, height: 14, borderRadius: 1,
          background: 'linear-gradient(90deg, #2a2a2a 0%, #aaa 28%, #d8d8d8 50%, #aaa 72%, #2a2a2a 100%)',
          transformOrigin: 'top center',
          transform: 'rotate(-9deg)',
        }} />

        {/* Headshell body */}
        <div style={{
          position: 'absolute', top: ARM_LEN - 22, left: -7,
          width: 13, height: 14,
          background: 'linear-gradient(175deg, #b8b8b8 0%, #858585 50%, #5a5a5a 100%)',
          borderRadius: '2px 2px 1px 1px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.7)',
          transform: 'rotate(-4deg)',
        }} />

        {/* Cartridge body */}
        <div style={{
          position: 'absolute', top: ARM_LEN - 10, left: -6,
          width: 11, height: 10,
          background: 'linear-gradient(180deg, #383838 0%, #141414 100%)',
          borderRadius: '0 0 2px 2px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 5px rgba(0,0,0,0.7)',
        }} />

        {/* Cantilever */}
        <div style={{
          position: 'absolute', top: ARM_LEN, left: -0.5,
          width: 1.5, height: 8,
          background: 'linear-gradient(to bottom, #d0d0d0, #666)',
          borderRadius: '0 0 1px 1px',
        }} />

        {/* Diamond tip */}
        <div style={{
          position: 'absolute', top: ARM_LEN + 7, left: -2,
          width: 4, height: 3,
          borderRadius: '1px 1px 2px 2px',
          background: 'radial-gradient(circle at 45% 35%, #fff, #aaa 50%, #555)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.8)',
        }} />
      </div>
    </div>
  )
}

function ControlPanel({ volume, setVolume, faderAreaRef, dragRef }) {
  return (
    <div style={{
      position: 'absolute',
      left: PLAT + 75 + CTRL_GAP, top: 0,
      width: CTRL_W, height: PLAT,
      borderRadius: 7,
      background: 'linear-gradient(170deg, #2a2a2a 0%, #181818 55%, #222 100%)',
      boxShadow: [
        'inset 0 1px 0 rgba(255,255,255,0.07)',
        'inset 0 0 0 1px rgba(255,255,255,0.04)',
        '0 6px 20px rgba(0,0,0,0.65)',
        'inset 0 -1px 0 rgba(0,0,0,0.5)',
      ].join(', '),
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '9px 0 10px',
    }}>
      {/* Brushed-metal texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(255,255,255,0.013) 3px, rgba(255,255,255,0.013) 6px)',
      }} />
      {/* Top bevel */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, pointerEvents: 'none', background: 'rgba(255,255,255,0.08)' }} />

      {/* VOL label */}
      <div style={{
        fontSize: 6.5, letterSpacing: 2.5,
        color: 'rgba(255,255,255,0.22)',
        fontFamily: 'monospace', textTransform: 'uppercase',
        marginBottom: 7, position: 'relative', zIndex: 1,
      }}>VOL</div>

      {/* Fader area */}
      <div ref={faderAreaRef} style={{
        position: 'relative', flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', zIndex: 1,
      }}>
        {/* Scale marks */}
        <div style={{
          position: 'absolute', left: '22%', top: '8%', height: '84%',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          {[true,false,false,true,false,false,true,false,false,true].map((big, i) => (
            <div key={i} style={{
              width: big ? 6 : 4, height: 1,
              background: `rgba(255,255,255,${big ? 0.28 : 0.1})`,
            }} />
          ))}
        </div>

        {/* Fader track */}
        <div style={{
          width: 5, height: '80%', borderRadius: 3,
          background: 'linear-gradient(to bottom, #060606, #1c1c1c 50%, #060606)',
          boxShadow: 'inset 0 2px 5px rgba(0,0,0,1), inset 0 0 0 1px rgba(255,255,255,0.05)',
          position: 'relative',
        }}>
          {/* Centre reference line */}
          <div style={{
            position: 'absolute', top: '50%', left: -9, right: -9, height: 1,
            background: 'rgba(255,255,255,0.18)', transform: 'translateY(-50%)',
          }} />
        </div>

        {/* Fader knob */}
        <div
          onMouseDown={e => {
            e.preventDefault()
            dragRef.current = { active: true, startY: e.clientY, startVol: volume }
          }}
          onTouchStart={e => {
            e.preventDefault()
            dragRef.current = { active: true, startY: e.touches[0].clientY, startVol: volume }
          }}
          style={{
            position: 'absolute', left: '50%',
            top: `${10 + (1 - volume / 100) * 80}%`,
            transform: 'translate(-50%, -50%)',
            width: 34, height: 15, borderRadius: 2,
            cursor: 'grab', userSelect: 'none', touchAction: 'none',
            background: 'linear-gradient(to bottom, #e8e8e8 0%, #d0d0d0 25%, #a8a8a8 50%, #c0c0c0 75%, #b0b0b0 100%)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.4)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2.5,
          }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: '52%', height: i === 1 ? 1.5 : 0.75,
              background: i === 1 ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.28)',
              borderRadius: 1, pointerEvents: 'none',
            }} />
          ))}
        </div>
      </div>

      {/* RPM + LED row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, position: 'relative', zIndex: 1 }}>
        {[{ label: '33', active: true }, { label: '45', active: false }].map(({ label, active }) => (
          <div key={label} style={{
            width: 22, height: 11, borderRadius: 2,
            background: active ? '#1a1a1a' : '#252525',
            boxShadow: active
              ? 'inset 0 2px 3px rgba(0,0,0,0.9), 0 0 0 0.5px rgba(255,255,255,0.04)'
              : '0 1px 3px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 0.5px rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 6, letterSpacing: 0.5, fontFamily: 'monospace',
            color: active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)',
          }}>
            {label}
          </div>
        ))}
        <div style={{
          width: 5, height: 5, borderRadius: '50%', marginLeft: 2,
          background: 'radial-gradient(circle at 35% 28%, #88ff99, #22cc55 65%)',
          boxShadow: '0 0 3px rgba(34,204,85,0.45)',
        }} />
      </div>
    </div>
  )
}

export default function SongVinylVariant({ block, playing, ready, togglePlay, volume, setVolume, mountRef, accent }) {
  const { coverUrl, vinylBase = 'wood' } = block

  const vinylWrapRef = useRef(null)
  const faderAreaRef = useRef(null)
  const dragRef = useRef({ active: false, startY: 0, startVol: 100 })
  const [vinylScale, setVinylScale] = useState(1)
  const [containerW, setContainerW] = useState(VINYL_BASE_W)

  useEffect(() => {
    const el = vinylWrapRef.current
    if (!el) return
    const update = () => {
      const w = el.offsetWidth
      if (w > 10) {
        setContainerW(w)
        setVinylScale(w < 500
          ? (w / PLAT) * 0.72
          : (w / VINYL_BASE_W) * 0.92
        )
      }
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    function onMove(e) {
      if (!dragRef.current.active || !faderAreaRef.current) return
      e.preventDefault()
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      const trackH = faderAreaRef.current.getBoundingClientRect().height * 0.8
      const dy = clientY - dragRef.current.startY
      const dVol = -(dy / trackH) * 100
      setVolume(Math.round(Math.max(0, Math.min(100, dragRef.current.startVol + dVol))))
    }
    function onUp() { dragRef.current.active = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  const isMobile = containerW < 500
  // On mobile: align the platter center with the container center, let right side overflow
  const PLAT_CENTER_X = 16 + PLAT / 2   // platter centre in unscaled housing coords
  const innerLeft  = isMobile ? containerW / 2 - PLAT_CENTER_X * vinylScale : '50%'
  const innerMarginLeft = isMobile ? 0 : -(VINYL_BASE_W / 2)
  const innerOrigin = isMobile ? 'top left' : 'top center'

  return (
    <div className="w-full" ref={vinylWrapRef}>
      <HiddenPlayer mountRef={mountRef} />
      <div style={{ position: 'relative', height: Math.round(VINYL_BASE_H * vinylScale) }}>
      <div style={{ position: 'absolute', top: 0, left: innerLeft, marginLeft: innerMarginLeft, width: VINYL_BASE_W, transformOrigin: innerOrigin, transform: `scale(${vinylScale})` }}>

      {/* Turntable base */}
      <div style={{
        position: 'relative',
        background: vinylBase === 'metal'
          ? 'linear-gradient(168deg, #2e2e2e 0%, #1a1a1a 45%, #232323 75%, #111 100%)'
          : 'linear-gradient(168deg, #1e0f04 0%, #0e0602 40%, #160b03 72%, #0a0401 100%)',
        borderRadius: 18,
        padding: '18px 16px 14px',
        boxShadow: '0 16px 56px rgba(0,0,0,0.7), 0 4px 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}>
        {vinylBase === 'wood' ? <WoodTexture /> : <MetalTexture />}
        {/* Base edge highlight */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }} />

        {/* Deck area */}
        <div style={{ position: 'relative', width: PLAT + 75 + CTRL_GAP + CTRL_W, height: PLAT, margin: '0 auto' }}>

          {/* Platter mat */}
          <div style={{
            position: 'absolute', left: 0, top: 0,
            width: PLAT, height: PLAT, borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 33%, #222 0%, #141414 45%, #0c0c0c 100%)',
            boxShadow: 'inset 0 3px 14px rgba(0,0,0,0.75), 0 0 0 2px rgba(255,255,255,0.025), 0 6px 24px rgba(0,0,0,0.6)',
          }}>
            {/* Vinyl record */}
            <div
              onClick={ready ? togglePlay : undefined}
              style={{
                position: 'absolute', top: '2.5%', left: '2.5%',
                width: '95%', height: '95%', borderRadius: '50%',
                background: 'repeating-radial-gradient(circle at 50% 50%, #0c0c0c 0px, #0c0c0c 1px, #1c1c1c 1px, #1c1c1c 2.5px)',
                cursor: ready ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'spin-vinyl 3.8s linear infinite',
                animationPlayState: playing ? 'running' : 'paused',
              }}
            >
              {/* Conic groove sheen */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
                background: 'conic-gradient(rgba(255,255,255,0.022) 0deg, transparent 55deg, rgba(255,255,255,0.014) 110deg, transparent 180deg, rgba(255,255,255,0.02) 225deg, transparent 290deg, rgba(255,255,255,0.022) 360deg)',
              }} />
              {/* Dead wax ring */}
              <div style={{
                position: 'absolute', width: '40%', height: '40%', borderRadius: '50%',
                background: 'radial-gradient(circle at 40% 35%, #181818, #0e0e0e)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.04)',
              }} />
              {/* Center label */}
              <div style={{
                position: 'relative', zIndex: 2,
                width: '34%', height: '34%', borderRadius: '50%', overflow: 'hidden',
                boxShadow: '0 0 0 2px rgba(255,255,255,0.15), 0 2px 6px rgba(0,0,0,0.5)',
              }}>
                {coverUrl
                  ? <img src={coverUrl} alt="label" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{
                      width: '100%', height: '100%',
                      background: `linear-gradient(135deg, ${accent}cc, ${accent}66)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>🎵</div>
                }
              </div>
              {/* Spindle */}
              <div style={{
                position: 'absolute', zIndex: 3,
                width: 7, height: 7, borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 28%, #ccc, #888, #444)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.9)',
              }} />
            </div>
          </div>

          <Tonearm playing={playing} />

          {/* Arm rest post */}
          <div style={{
            position: 'absolute', left: PLAT + 49, top: PLAT * 0.60,
            width: 11, height: 14,
            background: 'linear-gradient(180deg, #999 0%, #555 50%, #333 100%)',
            borderRadius: '3px 3px 2px 2px',
            boxShadow: '0 3px 8px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}>
            <div style={{
              position: 'absolute', top: 3, left: -1,
              width: 13, height: 4, borderRadius: 2,
              background: 'linear-gradient(90deg, #222, #777 50%, #222)',
            }} />
          </div>

          <ControlPanel volume={volume} setVolume={setVolume} faderAreaRef={faderAreaRef} dragRef={dragRef} />
        </div>
      </div>

      </div>
      </div>
    </div>
  )
}
