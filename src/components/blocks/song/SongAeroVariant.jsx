import { useT } from '../../../lib/i18n'
import { formatTime } from './useSongPlayer'

// Frutiger Aero / Windows Media Player 9–10 skeuomorphic mini-player.
// Colors are intentional aesthetic choices, not theme values.

function EqBars({ playing }) {
  const bars = [
    { delay: '0ms',   height: 10 },
    { delay: '120ms', height: 14 },
    { delay: '60ms',  height: 8  },
    { delay: '180ms', height: 12 },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 14 }}>
      {bars.map((b, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: b.height,
            background: 'linear-gradient(to top, #00dd66, #88ffcc)',
            borderRadius: 1,
            boxShadow: '0 0 4px rgba(0,220,100,0.7)',
            transformOrigin: 'bottom',
            animation: playing ? `aero-eq 0.6s ease-in-out ${b.delay} infinite` : 'none',
            transform: playing ? undefined : 'scaleY(0.3)',
          }}
        />
      ))}
    </div>
  )
}

export default function SongAeroVariant({ block, playing, ready, progress, togglePlay, handleSeek }) {
  const { title, artist } = block
  const { t } = useT()
  const pct = progress.duration > 0 ? (progress.current / progress.duration) * 100 : 0

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 14px',
      borderRadius: 20,
      background: 'linear-gradient(160deg, #ddeaf4 0%, #b0c8dc 25%, #7898b4 55%, #c0d4e4 80%, #ddeaf4 100%)',
      border: '1px solid rgba(255,255,255,0.75)',
      boxShadow: [
        '0 6px 20px rgba(0,0,0,0.5)',
        'inset 0 1px 0 rgba(255,255,255,0.9)',
        'inset 0 -1px 0 rgba(0,0,0,0.25)',
        'inset 1px 0 0 rgba(255,255,255,0.5)',
        'inset -1px 0 0 rgba(0,0,0,0.1)',
      ].join(', '),
      overflow: 'hidden',
      userSelect: 'none',
    }}>

      {/* Glossy top-half reflection */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.12) 46%, transparent 100%)',
        borderRadius: 20,
      }} />

      {/* ── Left: circular control disc ── */}
      <div style={{
        position: 'relative',
        width: 76, height: 76,
        borderRadius: '50%',
        flexShrink: 0,
        background: 'radial-gradient(circle at 38% 32%, #6888a4 0%, #344e68 45%, #1e3248 100%)',
        boxShadow: [
          'inset 0 3px 8px rgba(0,0,0,0.65)',
          'inset 0 -1px 3px rgba(255,255,255,0.12)',
          '0 3px 8px rgba(0,0,0,0.5)',
          '0 1px 0 rgba(255,255,255,0.3)',
        ].join(', '),
        zIndex: 2,
      }}>
        {/* Outer ring groove */}
        <div style={{
          position: 'absolute', inset: 5, borderRadius: '50%',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)',
        }} />

        {/* Cardinal tick marks */}
        {[0, 90, 180, 270].map(deg => (
          <div key={deg} style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 4, height: 10,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 2,
            transform: `rotate(${deg}deg) translate(-50%, -34px)`,
            transformOrigin: '50% 100%',
          }} />
        ))}

        {/* Center play/pause button */}
        <button
          onClick={togglePlay}
          disabled={!ready}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 34, height: 34,
            borderRadius: '50%',
            border: '1px solid rgba(30,80,160,0.6)',
            cursor: ready ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12,
            color: '#d0eaff',
            background: [
              'radial-gradient(circle at 42% 36%, #5090d8 0%, #1a58b0 45%, #0a3070 100%)',
            ].join(', '),
            boxShadow: [
              'inset 0 -2px 4px rgba(0,0,0,0.7)',
              'inset 0 1px 3px rgba(120,180,255,0.25)',
              '0 0 10px rgba(30,100,220,0.55)',
              '0 2px 4px rgba(0,0,0,0.5)',
            ].join(', '),
            transition: 'opacity 0.15s',
            opacity: ready ? 1 : 0.45,
          }}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing
            ? <span style={{ lineHeight: 1 }}>⏸</span>
            : <span style={{ lineHeight: 1, marginLeft: 2 }}>▶</span>}
        </button>
      </div>

      {/* ── Right: LCD display ── */}
      <div style={{
        flex: 1, minWidth: 0,
        borderRadius: 8,
        padding: '8px 10px 8px',
        background: 'linear-gradient(180deg, #000c24 0%, #001440 100%)',
        boxShadow: [
          'inset 0 3px 12px rgba(0,0,0,0.95)',
          'inset 0 0 30px rgba(0,5,40,0.8)',
          '0 1px 0 rgba(255,255,255,0.18)',
        ].join(', '),
        border: '1px solid rgba(0,20,60,0.8)',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 2,
      }}>

        {/* CRT scanlines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,15,50,0.18) 3px, rgba(0,15,50,0.18) 4px)',
        }} />

        {/* Inner glow bloom */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 40%, rgba(20,80,200,0.18) 0%, transparent 70%)',
        }} />

        {/* Top row: time + EQ bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 5, position: 'relative' }}>
          <div style={{
            fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif",
            fontSize: 24,
            fontWeight: 300,
            letterSpacing: 1,
            lineHeight: 1,
            color: '#e8f4ff',
            textShadow: [
              '0 0 6px rgba(100,180,255,0.9)',
              '0 0 14px rgba(60,130,240,0.6)',
              '0 0 28px rgba(30,80,200,0.35)',
            ].join(', '),
          }}>
            {formatTime(progress.current)}
            {progress.duration > 0 && (
              <span style={{ fontSize: 12, opacity: 0.5, marginLeft: 5, letterSpacing: 0 }}>
                / {formatTime(progress.duration)}
              </span>
            )}
          </div>
          <EqBars playing={playing} />
        </div>

        {/* Title */}
        <div style={{
          fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif",
          fontSize: 11,
          fontWeight: 600,
          color: '#a8cce8',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          textShadow: '0 0 6px rgba(80,160,255,0.45)',
          position: 'relative',
        }}>
          {title || t('song.untitled')}
        </div>

        {/* Artist */}
        {artist && (
          <div style={{
            fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif",
            fontSize: 10,
            color: '#5888aa',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            marginTop: 1,
            position: 'relative',
          }}>
            {artist}
          </div>
        )}

        {!ready && (
          <div style={{ color: '#3a6080', fontFamily: "'Segoe UI', Tahoma, sans-serif", fontSize: 10, marginTop: 3 }}>
            {t('song.loading')}
          </div>
        )}

        {/* Green LED progress bar */}
        <div
          style={{
            marginTop: 7, height: 4, position: 'relative',
            background: 'rgba(0,30,10,0.7)',
            borderRadius: 3,
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.9), inset 0 0 6px rgba(0,0,0,0.5)',
            cursor: 'pointer',
          }}
          onClick={handleSeek}
          onTouchEnd={handleSeek}
          role="slider"
          aria-label="Seek"
          aria-valuenow={Math.round(progress.current)}
          aria-valuemin={0}
          aria-valuemax={Math.round(progress.duration)}
        >
          {/* Track ticks */}
          {[25, 50, 75].map(p => (
            <div key={p} style={{
              position: 'absolute', top: 0, bottom: 0,
              left: `${p}%`, width: 1,
              background: 'rgba(0,60,20,0.6)',
              pointerEvents: 'none',
            }} />
          ))}
          {/* Fill */}
          <div style={{
            position: 'absolute', inset: 0,
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #00bb44, #00ff88)',
            borderRadius: 3,
            boxShadow: '0 0 5px rgba(0,240,100,0.7), 0 0 10px rgba(0,200,70,0.4)',
            transition: 'width 0.5s linear',
          }} />
        </div>
      </div>
    </div>
  )
}
