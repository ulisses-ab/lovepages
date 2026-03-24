import { ThreeDImageRing } from '../../ui/HeroRing'

export default function CarouselRingVariant({ block }) {
  const { images = [] } = block
  const urls = images.map(img => img.src).filter(Boolean)

  if (urls.length === 0) return null

  return (
    <div style={{ width: '100%', height: 440, position: 'relative' }}>
      <ThreeDImageRing
        images={urls}
        width={300}
        perspective={2000}
        imageDistance={500}
        initialRotation={180}
        animationDuration={1.5}
        staggerDelay={0.1}
        hoverOpacity={0.5}
        draggable
        mobileBreakpoint={768}
        mobileScaleFactor={0.8}
      />
    </div>
  )
}
