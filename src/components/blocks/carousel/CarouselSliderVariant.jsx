import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { colors } from '../../../lib/theme'

export default function CarouselSliderVariant({ images }) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(null)

  function prev() { setCurrent(c => (c - 1 + images.length) % images.length) }
  function next() { setCurrent(c => (c + 1) % images.length) }

  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -40) next()
    else if (dx > 40) prev()
    touchStartX.current = null
  }

  // ── Single image (no controls needed) ──────────────────────────────────────
  if (images.length === 1) {
    return (
      <figure className="w-full">
        <img src={images[0].src} alt={images[0].caption} className="w-full rounded-xl object-cover" />
        {images[0].caption && (
          <figcaption className="text-center text-sm mt-2" style={{ color: colors.fgMuted }}>
            {images[0].caption}
          </figcaption>
        )}
      </figure>
    )
  }

  // ── Multi-image slider ──────────────────────────────────────────────────────
  const caption = images[current]?.caption

  return (
    <div className="w-full select-none">
      <div
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((img, i) => (
            <div key={i} className="w-full h-full shrink-0">
              <img src={img.src} alt={img.caption} className="w-full h-full object-cover" draggable={false} />
            </div>
          ))}
        </div>

        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition"
          style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}
          aria-label="Previous"
        ><ChevronLeft size={16} /></button>

        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition"
          style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}
          aria-label="Next"
        ><ChevronRight size={16} /></button>

        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-200"
              style={{ width: i === current ? 18 : 6, height: 6, background: i === current ? '#fff' : 'rgba(255,255,255,0.45)' }}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {caption && (
        <p className="text-center text-sm mt-2" style={{ color: colors.fgMuted }}>{caption}</p>
      )}
    </div>
  )
}
