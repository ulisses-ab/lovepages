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

export default function SongBlock({ block, isEditing, onChange }) {
  const { embedUrl = '', title, artist, autoplay = false, variant = 'default', coverUrl = '' } = block
  const { t } = useT()
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState({ current: 0, duration: 0 })
  const playerRef = useRef(null)
  const mountRef = useRef(null)
  const progressIntervalRef = useRef(null)
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
            className="h-full bg-primary rounded-full transition-[width] duration-500"
            style={{ width: progress.duration > 0 ? `${(progress.current / progress.duration) * 100}%` : '0%' }}
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
        className={`${sz} rounded-full bg-primary hover:bg-primary-hover transition flex items-center justify-center shrink-0 shadow-md disabled:opacity-40`}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing
          ? <span className="text-white leading-none">⏸</span>
          : <span className="text-white leading-none" style={{ marginLeft: 2 }}>▶</span>}
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
                <p className="font-semibold text-fg text-xl text-base">{title || t('song.untitled')}</p>
                {artist && <p className="text-l text-fg-muted mt-0.5">{artist}</p>}
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
    return (
      <div className="w-full">
        {hiddenPlayer}
        <div className="flex flex-col items-center gap-4 rounded-2xl px-6 py-6">
          {/* Disc + play button */}
          <div className="flex items-center gap-5">
            <PlayButton size="lg" />
            <div
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-full relative flex items-center justify-center shadow-2xl"
              style={{
                background: `repeating-radial-gradient(circle, ${colors.vinylDark} 0%, ${colors.vinylMid} 4%, ${colors.vinylDark} 8%)`,
                animation: 'spin-vinyl 4s linear infinite',
                animationPlayState: playing ? 'running' : 'paused',
              }}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-subtle shadow-inner z-10">
                {coverUrl
                  ? <img src={coverUrl} alt="label" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-surface flex items-center justify-center text-2xl">🎵</div>
                }
              </div>
              <div className="absolute w-2 h-2 rounded-full bg-base z-20" />
            </div>
          </div>

          {/* Title + artist */}
          <div className="w-full text-center">
            <p className="font-semibold text-fg">{title || t('song.untitled')}</p>
            {artist && <p className="text-xs text-fg-muted mt-0.5">{artist}</p>}
            {!ready && <p className="text-xs text-fg-faint mt-0.5">{t('song.loading')}</p>}
          </div>
          <div className="w-full">{progressBar}</div>
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
          <span className="text-sm font-semibold text-fg truncate">
            {title || t('song.untitled')}
          </span>
          {artist && (
            <span className="text-xs text-fg-muted truncate">{artist}</span>
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
