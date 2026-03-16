import { useState, useEffect, useRef } from 'react'
import { registerPlayer, unregisterPlayer, pauseOthers } from '../../lib/playerRegistry'
import { colors, inputClass } from '../../lib/theme'
import { getYouTubeId } from '../../lib/blockDefaults'
import { useT } from '../../lib/i18n'
import ImageUpload from '../ui/ImageUpload'

// Module-level YT API readiness handling so multiple blocks coexist
const ytReadyCallbacks = []
let ytApiLoaded = false

function onYTReady(cb) {
  if (window.YT?.Player) { cb(); return }
  ytReadyCallbacks.push(cb)
  if (!ytApiLoaded) {
    ytApiLoaded = true
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)
    window.onYouTubeIframeAPIReady = () => ytReadyCallbacks.forEach(fn => fn())
  }
}

function formatTime(secs) {
  if (!isFinite(secs) || secs < 0) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function ColorSwatch({ label, value, onChange }) {
  return (
    <label className="flex flex-col items-center gap-1 cursor-pointer">
      <span className="text-xs text-fg-muted">{label}</span>
      <div
        className="w-7 h-7 rounded-md border border-subtle relative overflow-hidden"
        style={{ background: value }}
      >
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
      </div>
    </label>
  )
}

export default function SongBlock({ block, isEditing, onChange }) {
  const { embedUrl = '', title, artist, autoplay = false, variant = 'default', coverUrl = '', accentColor = '', textColor = '' } = block
  const accent = accentColor || colors.primary
  const textCol = textColor  || colors.fg
  const { t } = useT()
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState({ current: 0, duration: 0 })
  const playerRef = useRef(null)
  const mountRef = useRef(null)
  const progressIntervalRef = useRef(null)
  const vinylWrapRef = useRef(null)
  const [vinylScale, setVinylScale] = useState(1)
  const ytId = getYouTubeId(embedUrl)

  useEffect(() => {
    if (!ytId || !mountRef.current) return
    let destroyed = false

    onYTReady(() => {
      if (destroyed || !mountRef.current) return
      if (playerRef.current) playerRef.current.destroy()

      playerRef.current = new window.YT.Player(mountRef.current, {
        videoId: ytId,
        playerVars: { autoplay: 0, controls: 0, rel: 0 },
        events: {
          onReady: () => {
            if (destroyed) return
            setReady(true)
            registerPlayer(block.id, () => playerRef.current?.pauseVideo())
            if (autoplay) {
              pauseOthers(block.id)
              playerRef.current?.playVideo()
            }
          },
          onStateChange: (e) => {
            if (destroyed) return
            const isNowPlaying = e.data === window.YT.PlayerState.PLAYING
            setPlaying(isNowPlaying)
            clearInterval(progressIntervalRef.current)
            if (isNowPlaying) {
              progressIntervalRef.current = setInterval(() => {
                const cur = playerRef.current?.getCurrentTime() ?? 0
                const dur = playerRef.current?.getDuration() ?? 0
                setProgress({ current: cur, duration: dur })
              }, 500)
            }
          },
        },
      })
    })

    return () => {
      destroyed = true
      clearInterval(progressIntervalRef.current)
      unregisterPlayer(block.id)
      playerRef.current?.destroy()
      playerRef.current = null
      setReady(false)
      setPlaying(false)
      setProgress({ current: 0, duration: 0 })
    }
  }, [ytId])

  useEffect(() => {
    if (variant !== 'vinyl') return
    const el = vinylWrapRef.current
    if (!el) return
    const VINYL_BASE_W = 392
    const update = () => {
      const w = el.offsetWidth
      if (w > 10) setVinylScale((w / VINYL_BASE_W) * 0.82)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [variant])

  function togglePlay() {
    if (!playerRef.current || !ready) return
    if (playing) {
      playerRef.current.pauseVideo()
    } else {
      pauseOthers(block.id)
      playerRef.current.playVideo()
    }
  }

  function handleSeek(e) {
    if (!playerRef.current || !ready || !progress.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clientX = e.touches?.[0]?.clientX ?? e.clientX
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const seekTo = ratio * progress.duration
    playerRef.current.seekTo(seekTo, true)
    setProgress(p => ({ ...p, current: seekTo }))
  }

  const VARIANTS = [
    { value: 'default', label: t('song.variantBar') },
    { value: 'cover',   label: t('song.variantCover') },
    { value: 'vinyl',   label: t('song.variantVinyl') },
  ]

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="space-y-2">
        {/* Variant picker */}
        <div className="flex gap-1">
          {VARIANTS.map(v => (
            <button
              key={v.value}
              onClick={() => onChange({ variant: v.value })}
              className={`flex-1 py-1 rounded text-xs transition ${
                variant === v.value
                  ? 'bg-primary text-white'
                  : 'bg-overlay text-fg-muted hover:bg-subtle'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <input
          className={inputClass}
          placeholder={t('song.youtubeUrl')}
          value={embedUrl}
          onChange={e => onChange({ embedUrl: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder={t('song.title')}
          value={title}
          onChange={e => onChange({ title: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder={t('song.artist')}
          value={artist}
          onChange={e => onChange({ artist: e.target.value })}
        />

        {(variant === 'cover' || variant === 'vinyl') && (
          <div className="space-y-1 pt-1">
            <p className="text-xs text-fg-muted">{t('song.coverImage')}</p>
            <ImageUpload
              value={coverUrl}
              onChange={url => onChange({ coverUrl: url })}
              previewClass="mt-1 rounded w-16 h-16 object-cover"
            />
          </div>
        )}

        {/* Color pickers */}
        <div className="flex items-center gap-4 pt-0.5">
          <ColorSwatch
            label="Accent"
            value={accent}
            onChange={val => onChange({ accentColor: val })}
          />
          <ColorSwatch
            label="Text"
            value={textCol}
            onChange={val => onChange({ textColor: val })}
          />
          {(accentColor || textColor) && (
            <button
              className="text-xs mt-4"
              style={{ color: colors.fgFaint }}
              onClick={() => onChange({ accentColor: '', textColor: '' })}
            >
              reset
            </button>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-fg-muted cursor-pointer">
          <input
            type="checkbox"
            checked={autoplay}
            onChange={e => onChange({ autoplay: e.target.checked })}
            className="accent-primary"
          />
          {t('song.autoplay')}
        </label>
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!ytId) {
    return (
      <div className="w-full h-16 bg-overlay rounded-xl flex items-center justify-center text-fg-faint text-sm">
        {t('song.noSong')}
      </div>
    )
  }

  // ── Shared pieces ──────────────────────────────────────────────────────────
  const hiddenPlayer = (
    <div style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
      <div ref={mountRef} />
    </div>
  )

  const progressBar = ready && (
    <div className="relative w-full">
      {/* Number on top */}
      <div className="absolute -top-5 left-0 w-full flex justify-end text-xs text-fg-faint tabular-nums">
        {formatTime(progress.current)}
        {progress.duration > 0 ? ` / ${formatTime(progress.duration)}` : ''}
      </div>

      {/* Progress bar — outer div is the touch hit area, inner div is the visual bar */}
      <div
        className="py-3 -my-3 cursor-pointer"
        onClick={handleSeek}
        onTouchEnd={handleSeek}
        role="slider"
        aria-label="Seek"
        aria-valuenow={Math.round(progress.current)}
        aria-valuemin={0}
        aria-valuemax={Math.round(progress.duration)}
      >
        <div className="h-1.5 bg-subtle rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: progress.duration > 0 ? `${(progress.current / progress.duration) * 100}%` : '0%',
              background: accent,
            }}
          />
        </div>
      </div>
    </div>
  )

  function PlayButton({ size = 'md' }) {
    const sz = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-12 h-12 text-lg'
    return (
      <button
        onClick={togglePlay}
        disabled={!ready}
        className={`${sz} rounded-full transition flex items-center justify-center shrink-0 shadow-md disabled:opacity-40`}
        style={{ background: accent }}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing
          ? <span className="leading-none" style={{ color: textCol }}>⏸</span>
          : <span className="leading-none" style={{ color: textCol, marginLeft: 2 }}>▶</span>}
      </button>
    )
  }

  // ── Cover variant ──────────────────────────────────────────────────────────
  if (variant === 'cover') {
    return (
      <div className="w-full">
        {hiddenPlayer}
        <div className="flex flex-col gap-3">
          {/* Clickable cover image */}
          <div className='w-full flex justify-start gap-4 mb-2'>
            <button
              onClick={togglePlay}
              disabled={!ready}
              className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden group disabled:cursor-default"
              style={{ boxShadow: '0 8px 28px rgba(0,0,0,0.55)' }}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {coverUrl
                ? <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
                : <div
                    className="w-full h-full flex items-center justify-center text-6xl"
                    style={{ background: `linear-gradient(135deg, ${colors.surface}, ${colors.base})` }}
                  >🎵</div>
              }
              {/* Play/pause overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity">
                <span className="text-white text-5xl leading-none drop-shadow-lg">
                  {playing ? '⏸' : '▶'}
                </span>
              </div>
            </button>
    
            <div className='flex-1 flex flex-col justify-between'>
              {/* Title + artist */}
              <div className="text-left">
                <p className="font-semibold text-xl" style={{ color: textCol }}>{title || t('song.untitled')}</p>
                {artist && <p className="text-base mt-0.5" style={{ color: textCol, opacity: 0.65 }}>{artist}</p>}
                {!ready && <p className="text-xs text-fg-faint mt-0.5">{t('song.loading')}</p>}
              </div>

              {progressBar}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Vinyl variant ──────────────────────────────────────────────────────────
  if (variant === 'vinyl') {
    const PLAT = 175       // platter diameter px
    const ARM_LEN = 88     // tonearm arm length px
    const ARM_PLAY = -32   // degrees from vertical → needle on record
    const ARM_REST = 20    // degrees from vertical → arm resting right of record
    const CTRL_GAP = 10    // gap between tonearm area and control panel
    const CTRL_W = 85      // control panel width
    const VINYL_BASE_W = 392
    const VINYL_BASE_H = 211

    return (
      <div className="w-full" ref={vinylWrapRef}>
        {hiddenPlayer}
        <div style={{ position: 'relative', height: Math.round(VINYL_BASE_H * vinylScale) }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', marginLeft: -(VINYL_BASE_W / 2), width: VINYL_BASE_W, transformOrigin: 'top center', transform: `scale(${vinylScale})` }}>
        {/* ── Turntable base ── */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(162deg, #1f1208 0%, #120a03 55%, #1c1007 100%)',
          borderRadius: 18,
          padding: '18px 16px 14px',
          boxShadow: '0 16px 56px rgba(0,0,0,0.7), 0 4px 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
          {/* Wood grain overlay */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
            backgroundImage: [
              'repeating-linear-gradient(94deg, transparent 0px, transparent 14px, rgba(255,255,255,0.006) 14px, rgba(255,255,255,0.006) 28px)',
              'repeating-linear-gradient(88deg, transparent 0px, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 40px)',
            ].join(','),
          }} />
          {/* Base edge highlight */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
          }} />

          {/* ── Deck area (platter + tonearm + control panel) ── */}
          <div style={{ position: 'relative', width: PLAT + 90 + CTRL_GAP + CTRL_W, height: PLAT, margin: '0 auto' }}>

            {/* Platter mat */}
            <div style={{
              position: 'absolute', left: 0, top: 0,
              width: PLAT, height: PLAT, borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 33%, #222 0%, #141414 45%, #0c0c0c 100%)',
              boxShadow: 'inset 0 3px 14px rgba(0,0,0,0.75), 0 0 0 2px rgba(255,255,255,0.025), 0 6px 24px rgba(0,0,0,0.6)',
            }}>
              {/* ── Vinyl record ── */}
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
                {/* Dead wax ring (smooth area around label) */}
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

            {/* ── Tonearm ── */}
            {/* Bearing housing */}
            <div style={{
              position: 'absolute',
              left: PLAT + 30, top: 8,
              width: 18, height: 18,
              zIndex: 10,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 28%, #ccc, #888, #333)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.2)',
              }} />
              {/* Rotating arm assembly (origin = bearing center) */}
              <div style={{
                position: 'absolute', top: 9, left: 9,
                transformOrigin: '0 0',
                transform: `rotate(${playing ? ARM_PLAY : ARM_REST}deg)`,
                transition: 'transform 0.95s cubic-bezier(0.3, 0, 0.2, 1)',
              }}>
                {/* Counterweight (opposite end) */}
                <div style={{
                  position: 'absolute', top: -22, left: -3.5,
                  width: 7, height: 20,
                  background: 'linear-gradient(90deg, #555, #999 50%, #666)',
                  borderRadius: 4,
                }} />
                {/* Arm body */}
                <div style={{
                  position: 'absolute', top: 0, left: -2,
                  width: 4, height: ARM_LEN - 16,
                  background: 'linear-gradient(90deg, #555, #aaa 45%, #999 55%, #555)',
                  borderRadius: '2px 2px 1px 1px',
                }} />
                {/* Headshell */}
                <div style={{
                  position: 'absolute', top: ARM_LEN - 22, left: -5,
                  width: 10, height: 16,
                  background: 'linear-gradient(90deg, #666, #bbb 50%, #777)',
                  borderRadius: 3,
                  transform: 'rotate(-6deg)',
                }} />
                {/* Stylus */}
                <div style={{
                  position: 'absolute', top: ARM_LEN - 5, left: -1,
                  width: 2.5, height: 7,
                  background: 'linear-gradient(to bottom, #aaa, #555)',
                  borderRadius: '0 0 1px 1px',
                }} />
              </div>
            </div>

            {/* Arm rest post */}
            <div style={{
              position: 'absolute', left: PLAT + 62, top: PLAT * 0.56,
              width: 10, height: 13,
              background: 'radial-gradient(circle at 40% 30%, #888, #444)',
              borderRadius: 3,
              boxShadow: '0 2px 6px rgba(0,0,0,0.7)',
            }} />

            {/* ── Control panel ── */}
            <div style={{
              position: 'absolute',
              left: PLAT + 90 + CTRL_GAP,
              top: 0,
              width: CTRL_W,
              height: PLAT,
              borderRadius: 7,
              background: 'linear-gradient(170deg, #2a2a2a 0%, #181818 55%, #222 100%)',
              boxShadow: [
                'inset 0 1px 0 rgba(255,255,255,0.07)',
                'inset 0 0 0 1px rgba(255,255,255,0.04)',
                '0 6px 20px rgba(0,0,0,0.65)',
                'inset 0 -1px 0 rgba(0,0,0,0.5)',
              ].join(', '),
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '9px 0 10px',
            }}>
              {/* Brushed-metal texture overlay */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(255,255,255,0.013) 3px, rgba(255,255,255,0.013) 6px)',
              }} />
              {/* Top bevel */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1, pointerEvents: 'none',
                background: 'rgba(255,255,255,0.08)',
              }} />

              {/* "PITCH" label */}
              <div style={{
                fontSize: 6.5, letterSpacing: 2.5,
                color: 'rgba(255,255,255,0.22)',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                marginBottom: 7,
                position: 'relative', zIndex: 1,
              }}>PITCH</div>

              {/* Fader area */}
              <div style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                zIndex: 1,
              }}>
                {/* Scale marks — left side */}
                <div style={{
                  position: 'absolute',
                  left: '22%',
                  top: '8%',
                  height: '84%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  {[true,false,false,true,false,false,true,false,false,true].map((big, i) => (
                    <div key={i} style={{
                      width: big ? 6 : 4,
                      height: 1,
                      background: `rgba(255,255,255,${big ? 0.28 : 0.1})`,
                    }} />
                  ))}
                </div>

                {/* Fader track */}
                <div style={{
                  width: 5,
                  height: '80%',
                  borderRadius: 3,
                  background: 'linear-gradient(to bottom, #060606, #1c1c1c 50%, #060606)',
                  boxShadow: [
                    'inset 0 2px 5px rgba(0,0,0,1)',
                    'inset 0 0 0 1px rgba(255,255,255,0.05)',
                  ].join(', '),
                  position: 'relative',
                }}>
                  {/* Centre reference line */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: -9,
                    right: -9,
                    height: 1,
                    background: 'rgba(255,255,255,0.18)',
                    transform: 'translateY(-50%)',
                  }} />
                </div>

                {/* Fader knob */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '37%',
                  transform: 'translate(-50%, -50%)',
                  width: 34,
                  height: 15,
                  borderRadius: 2,
                  background: [
                    'linear-gradient(to bottom,',
                    '#e8e8e8 0%,',
                    '#d0d0d0 25%,',
                    '#a8a8a8 50%,',
                    '#c0c0c0 75%,',
                    '#b0b0b0 100%)',
                  ].join(' '),
                  boxShadow: [
                    '0 4px 10px rgba(0,0,0,0.85)',
                    '0 1px 2px rgba(0,0,0,0.6)',
                    'inset 0 1px 0 rgba(255,255,255,0.7)',
                    'inset 0 -1px 0 rgba(0,0,0,0.25)',
                    '0 0 0 0.5px rgba(0,0,0,0.4)',
                  ].join(', '),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2.5,
                }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: '52%',
                      height: i === 1 ? 1.5 : 0.75,
                      background: i === 1
                        ? 'rgba(0,0,0,0.55)'
                        : 'rgba(0,0,0,0.28)',
                      borderRadius: 1,
                    }} />
                  ))}
                </div>
              </div>

              {/* RPM + LED row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                marginTop: 8,
                position: 'relative',
                zIndex: 1,
              }}>
                {[
                  { label: '33', active: true },
                  { label: '45', active: false },
                ].map(({ label, active }) => (
                  <div key={label} style={{
                    width: 22,
                    height: 11,
                    borderRadius: 2,
                    background: active ? '#1a1a1a' : '#252525',
                    boxShadow: active
                      ? 'inset 0 2px 3px rgba(0,0,0,0.9), 0 0 0 0.5px rgba(255,255,255,0.04)'
                      : '0 1px 3px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 0.5px rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 6,
                    letterSpacing: 0.5,
                    fontFamily: 'monospace',
                    color: active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)',
                  }}>
                    {label}
                  </div>
                ))}
                {/* Single status LED */}
                <div style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 28%, #88ff99, #22cc55 65%)',
                  boxShadow: '0 0 3px rgba(34,204,85,0.45)',
                  marginLeft: 2,
                }} />
              </div>
            </div>
          </div>

        </div>
        </div>
        </div>
      </div>
    )
  }

  // ── Default variant (bar) ──────────────────────────────────────────────────
  return (
    <div className="w-full">
      {hiddenPlayer}
      <div className="flex items-center gap-4 bg-overlay rounded-2xl px-5 py-4">
        <PlayButton size="md" />
        <div className="flex flex-col min-w-0 flex-1 gap-1.5">
          <span className="text-sm font-semibold truncate" style={{ color: textCol }}>
            {title || t('song.untitled')}
          </span>
          {artist && (
            <span className="text-xs truncate" style={{ color: textCol, opacity: 0.65 }}>{artist}</span>
          )}
          {!ready && (
            <span className="text-xs text-fg-faint">{t('song.loading')}</span>
          )}
          {progressBar}
        </div>
      </div>
    </div>
  )
}
