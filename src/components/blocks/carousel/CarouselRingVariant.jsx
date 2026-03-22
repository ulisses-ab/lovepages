import { useEffect, useRef, useState } from 'react'

const PERSPECTIVE   = 2000
const IMAGE_DIST    = 500
const W             = 300   // inner stage width (px)
const H             = 400   // inner stage height (px)

/**
 * Parallax background-position so each image "pans" as the ring rotates.
 * Matches the original ThreeDImageRing formula exactly.
 */
function getBgPos(index, rotation, angle, sc) {
  const effectiveRot   = rotation - index * angle
  const parallaxOffset = ((effectiveRot % 360) + 360) % 360 / 360
  return `${-(parallaxOffset * (IMAGE_DIST * sc / 1.5))}px 0px`
}

export default function CarouselRingVariant({ block }) {
  const { images = [] } = block

  const containerRef  = useRef(null)
  const ringRef       = useRef(null)

  // All mutable runtime state lives in refs to avoid re-renders during drag
  const rotationRef   = useRef(0)
  const scaleRef      = useRef(1)
  const angleRef      = useRef(360 / Math.max(images.length, 1))
  const isDragging    = useRef(false)
  const startXRef     = useRef(0)
  const velocityRef   = useRef(0)
  const inertiaRaf    = useRef(null)

  // React state only for things that need to trigger a DOM update via React
  const [scale, setScale]         = useState(1)
  const [showImages, setShowImages] = useState(false)

  // Keep angleRef in sync when images.length changes (between renders)
  angleRef.current = 360 / Math.max(images.length, 1)

  // ── DOM helpers ──────────────────────────────────────────────────────────────

  function applyRotation(deg) {
    rotationRef.current = deg
    const ring = ringRef.current
    if (!ring) return
    ring.style.transform = `rotateY(${deg}deg)`
    Array.from(ring.children).forEach((el, i) => {
      el.style.backgroundPosition = getBgPos(i, deg, angleRef.current, scaleRef.current)
    })
  }

  function stopInertia() {
    if (inertiaRaf.current) {
      cancelAnimationFrame(inertiaRaf.current)
      inertiaRaf.current = null
    }
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
      const w     = el.clientWidth
      const sc    = w < 480 ? 0.62 : w < 680 ? 0.80 : 1
      scaleRef.current = sc
      setScale(sc)
    }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Entrance opacity stagger
  useEffect(() => {
    const t = setTimeout(() => setShowImages(true), 80)
    return () => clearTimeout(t)
  }, [])

  // Cleanup on unmount
  useEffect(() => () => stopInertia(), [])

  // ── Global drag listeners (attached once) ────────────────────────────────────

  useEffect(() => {
    function getClientX(e) {
      return e.touches ? e.touches[0].clientX : e.clientX
    }
    function onMove(e) {
      if (!isDragging.current) return
      if (e.touches) e.preventDefault()
      const dx = getClientX(e) - startXRef.current
      velocityRef.current = -dx * 0.5
      applyRotation(rotationRef.current + velocityRef.current)
      startXRef.current = getClientX(e)
    }
    function onEnd() {
      if (!isDragging.current) return
      isDragging.current = false
      if (containerRef.current) containerRef.current.style.cursor = 'grab'
      startInertia(velocityRef.current)
      velocityRef.current = 0
    }

    document.addEventListener('mousemove',  onMove)
    document.addEventListener('mouseup',    onEnd)
    document.addEventListener('touchmove',  onMove,  { passive: false })
    document.addEventListener('touchend',   onEnd)

    return () => {
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mouseup',    onEnd)
      document.removeEventListener('touchmove',  onMove)
      document.removeEventListener('touchend',   onEnd)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drag start (React event) ─────────────────────────────────────────────────

  function onDragStart(e) {
    isDragging.current = true
    stopInertia()
    startXRef.current  = e.touches ? e.touches[0].clientX : e.clientX
    velocityRef.current = 0
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const angle      = angleRef.current
  const scaledDist = IMAGE_DIST * scale

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: Math.round(H * scale + 40),
        overflow: 'visible',
        position: 'relative',
        cursor: 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
    >
      {/* Perspective stage — centred inside the container */}
      <div style={{
        perspective: `${PERSPECTIVE}px`,
        width:  `${W}px`,
        height: `${H}px`,
        position: 'absolute',
        left: '50%',
        top:  '50%',
        transform: 'translate(-50%, -50%)',
      }}>
        {/* Rotating ring */}
        <div
          ref={ringRef}
          style={{
            width:  '100%',
            height: '100%',
            position: 'absolute',
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotationRef.current}deg)`,
          }}
        >
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
                backgroundPosition: getBgPos(index, rotationRef.current, angle, scale),
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: `rotateY(${index * -angle}deg) translateZ(${scaledDist}px)`,
                borderRadius: 6,
                opacity: showImages ? 1 : 0,
                transition: `opacity 1.4s ease ${index * 0.08}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Subtle ground shadow */}
      <div style={{
        position: 'absolute',
        bottom: 4,
        left: '50%',
        transform: 'translateX(-50%)',
        width: W * 0.85 * scale,
        height: 28,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 72%)',
        pointerEvents: 'none',
      }} />

      {/* Drag hint */}
      {!showImages && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          width: '100%',
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(255,255,255,0.4)',
          pointerEvents: 'none',
        }}>
          drag to spin
        </div>
      )}
    </div>
  )
}
