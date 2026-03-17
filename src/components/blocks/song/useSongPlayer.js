import { useState, useEffect, useRef } from 'react'
import { registerPlayer, unregisterPlayer, pauseOthers } from '../../../lib/playerRegistry'
import { getYouTubeId } from '../../../lib/blockDefaults'

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

export function formatTime(secs) {
  if (!isFinite(secs) || secs < 0) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function useSongPlayer(block) {
  const { embedUrl = '', autoplay = false } = block
  const ytId = getYouTubeId(embedUrl)

  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState({ current: 0, duration: 0 })
  const [volume, setVolume] = useState(100)
  const playerRef = useRef(null)
  const mountRef = useRef(null)
  const progressIntervalRef = useRef(null)

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
    playerRef.current?.setVolume?.(volume)
  }, [volume])

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

  return { playing, ready, progress, volume, setVolume, togglePlay, handleSeek, mountRef }
}
