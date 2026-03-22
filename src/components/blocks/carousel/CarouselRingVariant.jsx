import { useEffect, useRef, useState } from 'react'

const PERSPECTIVE = 1500
const IMAGE_DIST  = 340    // photo ring radius
const W           = 300    // stage width
const H           = 400    // stage height
const DISC_D      = 780    // wooden turntable diameter
const TILT        = 8      // rotateX applied to ring: +° tilts the base toward viewer

// Oak wood grain for the turntable top surface (fine grain + specular sheen + warm base)
const WOOD_TOP = [
  'repeating-linear-gradient(89.2deg, transparent 0, transparent 5px, rgba(255,255,255,0.016) 5px, rgba(255,255,255,0.016) 6px)',
  'repeating-linear-gradient(90.8deg, transparent 0, transparent 3px, rgba(0,0,0,0.022) 3px, rgba(0,0,0,0.022) 4px)',
  'repeating-linear-gradient(89.5deg, transparent 0, transparent 17px, rgba(0,0,0,0.03) 17px, rgba(0,0,0,0.03) 20px)',
  'radial-gradient(ellipse at 38% 30%, rgba(255,235,185,0.22) 0%, transparent 48%)',
  'radial-gradient(ellipse at 50% 50%, #dfa05a 0%, #b86c2a 40%, #8a4818 65%, #5a2c08 100%)',
].join(', ')

// Darker side/rim colour (peeks below the top surface to suggest thickness)
const WOOD_RIM = 'linear-gradient(to bottom, #b06020, #6a3010, #b06020)'

function getBgPos(index, rotation, angle, sc) {
  const effectiveRot   = rotation - index * angle
  const parallaxOffset = ((effectiveRot % 360) + 360) % 360 / 360
  return `${-(parallaxOffset * (IMAGE_DIST * sc / 1.5))}px 0px`
}

export default function CarouselRingVariant({ block }) {
  const { images = [] } = block

  const containerRef = useRef(null)
  const ringRef      = useRef(null)

  const rotationRef  = useRef(0)
  const scaleRef     = useRef(1)
  const angleRef     = useRef(360 / Math.max(images.length, 1))
  const isDragging   = useRef(false)
  const startXRef    = useRef(0)
  const velocityRef  = useRef(0)
  const inertiaRaf   = useRef(null)

  const [scale, setScale]           = useState(1)
  const [showImages, setShowImages] = useState(false)

  angleRef.current = 360 / Math.max(images.length, 1)

  // ── DOM helpers ──────────────────────────────────────────────────────────────

  function applyRotation(deg) {
    rotationRef.current = deg
    const ring = ringRef.current
    if (!ring) return
    // TILT stays constant; only rotateY changes
    ring.style.transform = `rotateX(${TILT}deg) rotateY(${deg}deg)`
    // Update parallax only on photo divs (first images.length children; disc divs come after)
    Array.from(ring.children).slice(0, images.length).forEach((el, i) => {
      el.style.backgroundPosition = getBgPos(i, deg, angleRef.current, scaleRef.current)
    })
  }

  function stopInertia() {
    if (inertiaRaf.current) { cancelAnimationFrame(inertiaRaf.current); inertiaRaf.current = null }
  }

  function startInertia(vel0) {
    stopInertia()
    let vel = vel0 * 20
    function step() {
      vel *= 0.95
      if (Math.abs(vel) < 0.1) return
      applyRotation(rotationRef.current + vel)
      inertiaRaf.current = requestAnimationFrame(step)
    }
    inertiaRaf.current = requestAnimationFrame(step)
  }

  // ── Resize observer ──────────────────────────────────────────────────────────

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const w  = el.clientWidth
      const sc = w < 480 ? 0.60 : w < 680 ? 0.78 : 1
      scaleRef.current = sc
      setScale(sc)
    }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setShowImages(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => () => stopInertia(), [])

  // ── Global drag listeners ────────────────────────────────────────────────────

  useEffect(() => {
    function getX(e) { return e.touches ? e.touches[0].clientX : e.clientX }
    function onMove(e) {
      if (!isDragging.current) return
      if (e.touches) e.preventDefault()
      const dx = getX(e) - startXRef.current
      velocityRef.current = -dx * 0.5
      applyRotation(rotationRef.current + velocityRef.current)
      startXRef.current = getX(e)
    }
    function onEnd() {
      if (!isDragging.current) return
      isDragging.current = false
      if (containerRef.current) containerRef.current.style.cursor = 'grab'
      startInertia(velocityRef.current)
      velocityRef.current = 0
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onEnd)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend',  onEnd)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onEnd)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend',  onEnd)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function onDragStart(e) {
    isDragging.current = true
    stopInertia()
    startXRef.current  = e.touches ? e.touches[0].clientX : e.clientX
    velocityRef.current = 0
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
  }

  // ── Derived values ───────────────────────────────────────────────────────────

  const angle      = angleRef.current
  const scaledDist = IMAGE_DIST * scale

  // The disc is a flat circle lying in the 3D XZ plane.
  // We position it so its centre sits at ring-local (W/2, H, 0) — the bottom of the photos.
  // rotateX(90deg) on the disc div rotates it from XY-plane to XZ-plane (flat on the "table").
  const discLeft = (W - DISC_D) / 2   // negative — extends beyond ring div horizontally
  const discTop  = H - DISC_D / 2     // centred at Y = H (bottom of photo panels)
  const RIM_SINK = -20                 // rim rendered 20 px behind top surface in Z → visible thickness

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        // Extra height so the disc (which pops forward due to TILT) is fully visible
        height: Math.round(H * scale + 120),
        overflow: 'visible',
        position: 'relative',
        cursor: 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
    >
      {/* Perspective stage — slightly above vertical centre so disc appears below */}
      <div style={{
        perspective: `${PERSPECTIVE}px`,
        width:  `${W}px`,
        height: `${H}px`,
        position: 'absolute',
        left: '50%',
        top:  '44%',
        transform: 'translate(-50%, -50%)',
      }}>
        {/* Ring — all children (photos + disc) share the same spin + tilt */}
        <div
          ref={ringRef}
          style={{
            width:  '100%',
            height: '100%',
            position: 'absolute',
            transformStyle: 'preserve-3d',
            // TILT is baked into the initial transform; applyRotation keeps it constant
            transform: `rotateX(${TILT}deg) rotateY(0deg)`,
          }}
        >
          {/* ── Photo panels ── */}
          {images.map((img, index) => (
            <div
              key={index}
              style={{
                width:  '100%',
                height: '100%',
                position: 'absolute',
                backgroundImage:    `url(${img.src})`,
                backgroundSize:     'cover',
                backgroundRepeat:   'no-repeat',
                backgroundPosition: getBgPos(index, 0, angle, scale),
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: `rotateY(${index * -angle}deg) translateZ(${scaledDist}px)`,
                borderRadius: 3,
                opacity:    showImages ? 1 : 0,
                transition: `opacity 1.4s ease ${index * 0.08}s`,
                boxShadow: '0 8px 28px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.35)',
              }}
            />
          ))}

          {/* ── Disc rim — slightly behind the top face, darker wood colour ── */}
          <div style={{
            position: 'absolute',
            width:    DISC_D,
            height:   DISC_D,
            left:     discLeft,
            top:      discTop,
            borderRadius: '50%',
            // Sinks RIM_SINK px behind the top surface so it peeks below as a thickness band
            transform: `rotateX(90deg) translateZ(${RIM_SINK}px)`,
            background: WOOD_RIM,
          }} />

          {/* ── Disc top surface — wood grain, faces viewer after TILT ── */}
          <div style={{
            position: 'absolute',
            width:    DISC_D,
            height:   DISC_D,
            left:     discLeft,
            top:      discTop,
            borderRadius: '50%',
            transform: 'rotateX(90deg)',
            background: WOOD_TOP,
            boxShadow: [
              'inset 0 0 0 8px rgba(55,22,4,0.6)',   // dark outer ring (edge grain)
              'inset 0 0 0 14px rgba(70,30,6,0.3)',  // soft inner bevel
              'inset 0 0 80px rgba(0,0,0,0.22)',     // centre vignette
            ].join(', '),
          }} />
        </div>
      </div>

      {/* Elliptical ground shadow beneath the whole display */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width:  Math.round(DISC_D * 0.7 * scale),
        height: 22,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.42) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
