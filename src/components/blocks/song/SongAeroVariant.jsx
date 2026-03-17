import { useT } from '../../../lib/i18n'
import { formatTime } from './useSongPlayer'

// Frutiger Aero / Windows Media Player 9–10 skeuomorphic mini-player.
// Colors are intentional aesthetic choices, not theme values.

// Single column of EQ bars; mirror=true flips the bar heights for visual symmetry
function EqBars({ playing, mirror = false }) {
  const heights = mirror ? [10, 14, 8, 12] : [12, 8, 14, 10]
  const delays  = mirror ? ['180ms','60ms','120ms','0ms'] : ['0ms','120ms','60ms','180ms']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2, height: 36 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 18, height: h,
            background: 'linear-gradient(to right, #00bb44, #44ff99)',
            borderRadius: 2,
            boxShadow: '0 0 5px rgba(0,220,100,0.65)',
            transformOrigin: mirror ? 'right' : 'left',
            animation: playing ? `aero-eq 0.6s ease-in-out ${delays[i]} infinite` : 'none',
            transform: playing ? undefined : 'scaleX(0.35)',
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
    // Outer wrapper centers the egg horizontally within the block
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 260,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px 22px 38px',
        gap: 14,
        // Standing egg: top is flatter/pointier, bottom is fuller/rounder
        borderTopLeftRadius: '50% 30%',
        borderTopRightRadius: '50% 30%',
        borderBottomLeftRadius: '50% 70%',
        borderBottomRightRadius: '50% 70%',
        background: 'linear-gradient(175deg, #e0ecf6 0%, #b4cade 20%, #8aa8c4 45%, #7090aa 65%, #b8cedf 85%, #e0ecf6 100%)',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: [
          '0 8px 28px rgba(0,0,0,0.5)',
          '0 2px 6px rgba(0,0,0,0.35)',
          'inset 0 1px 0 rgba(255,255,255,0.95)',
          'inset 0 -2px 0 rgba(0,0,0,0.2)',
        ].join(', '),
        overflow: 'hidden',
        userSelect: 'none',
      }}>

        {/* Glossy top-half egg reflection */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.14) 42%, transparent 100%)',
          borderTopLeftRadius: '50% 30%',
          borderTopRightRadius: '50% 30%',
          borderBottomLeftRadius: '50% 70%',
          borderBottomRightRadius: '50% 70%',
        }} />

        {/* ── LCD screen ── */}
        <div style={{
          width: '88%',
          borderRadius: 9,
          padding: '9px 11px 10px',
          background: 'linear-gradient(180deg, #000a20 0%, #001030 50%, #001848 100%)',
          boxShadow: [
            'inset 0 3px 12px rgba(0,0,0,0.95)',
            'inset 0 0 28px rgba(0,5,40,0.85)',
            '0 2px 0 rgba(255,255,255,0.22)',
            '0 -1px 0 rgba(0,0,0,0.3)',
          ].join(', '),
          border: '1px solid rgba(0,15,50,0.9)',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 2,
        }}>
          {/* CRT scanlines */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,12,44,0.2) 3px, rgba(0,12,44,0.2) 4px)',
          }} />
          {/* Inner bloom */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 35%, rgba(20,80,200,0.2) 0%, transparent 65%)',
          }} />

          {/* Time */}
          <div style={{
            fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif",
            fontSize: 28, fontWeight: 300, letterSpacing: 2, lineHeight: 1,
            color: '#e8f4ff', position: 'relative',
            textShadow: [
              '0 0 6px rgba(120,190,255,0.95)',
              '0 0 14px rgba(60,130,240,0.65)',
              '0 0 28px rgba(30,80,200,0.4)',
            ].join(', '),
          }}>
            {formatTime(progress.current)}
            {progress.duration > 0 && (
              <span style={{ fontSize: 13, opacity: 0.45, marginLeft: 6, letterSpacing: 0 }}>
                / {formatTime(progress.duration)}
              </span>
            )}
          </div>

          {/* Title */}
          <div style={{
            fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif",
            fontSize: 11, fontWeight: 700, marginTop: 6,
            color: '#90bedd',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            textShadow: '0 0 8px rgba(80,160,255,0.4)',
            position: 'relative',
          }}>
            {title || t('song.untitled')}
          </div>

          {/* Artist */}
          {artist && (
            <div style={{
              fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif",
              fontSize: 10, color: '#4a7898', marginTop: 1,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              position: 'relative',
            }}>
              {artist}
            </div>
          )}

          {!ready && (
            <div style={{ color: '#2a5070', fontFamily: "'Segoe UI', Tahoma, sans-serif", fontSize: 10, marginTop: 3, position: 'relative' }}>
              {t('song.loading')}
            </div>
          )}
        </div>

        {/* ── Control disc + flanking EQ bars ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 2 }}>
          <EqBars playing={playing} />

          {/* Circular control disc */}
          <div style={{
            position: 'relative',
            width: 90, height: 90,
            borderRadius: '50%',
            flexShrink: 0,
            background: 'radial-gradient(circle at 38% 33%, #6a8aaa 0%, #364e68 48%, #1c3050 100%)',
            boxShadow: [
              'inset 0 3px 10px rgba(0,0,0,0.7)',
              'inset 0 -1px 4px rgba(255,255,255,0.1)',
              '0 4px 12px rgba(0,0,0,0.55)',
              '0 1px 0 rgba(255,255,255,0.35)',
            ].join(', '),
          }}>
            {/* Ring groove */}
            <div style={{
              position: 'absolute', inset: 6, borderRadius: '50%',
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)',
            }} />

            {/* Cardinal ticks */}
            {[0, 90, 180, 270].map(deg => (
              <div key={deg} style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 4, height: 9,
                background: 'rgba(255,255,255,0.18)',
                borderRadius: 2,
                transform: `rotate(${deg}deg) translate(-50%, -40px)`,
                transformOrigin: '50% 100%',
              }} />
            ))}

            {/* Play/pause center */}
            <button
              onClick={togglePlay}
              disabled={!ready}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 40, height: 40,
                borderRadius: '50%',
                border: '1px solid rgba(20,70,150,0.7)',
                cursor: ready ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: '#d0eaff',
                background: 'radial-gradient(circle at 42% 36%, #5898e0 0%, #1a5ab8 48%, #082e6e 100%)',
                boxShadow: [
                  'inset 0 -2px 5px rgba(0,0,0,0.75)',
                  'inset 0 1px 3px rgba(140,190,255,0.28)',
                  '0 0 12px rgba(30,110,230,0.6)',
                  '0 3px 6px rgba(0,0,0,0.55)',
                ].join(', '),
                opacity: ready ? 1 : 0.4,
                transition: 'opacity 0.15s',
              }}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing
                ? <span style={{ lineHeight: 1 }}>⏸</span>
                : <span style={{ lineHeight: 1, marginLeft: 2 }}>▶</span>}
            </button>
          </div>

          <EqBars playing={playing} mirror />
        </div>

        {/* ── Green LED progress bar ── */}
        <div
          style={{
            width: '78%', height: 5, position: 'relative',
            background: 'rgba(0,25,8,0.75)',
            borderRadius: 3,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9), inset 0 0 8px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            zIndex: 2,
          }}
          onClick={handleSeek}
          onTouchEnd={handleSeek}
          role="slider"
          aria-label="Seek"
          aria-valuenow={Math.round(progress.current)}
          aria-valuemin={0}
          aria-valuemax={Math.round(progress.duration)}
        >
          {[25, 50, 75].map(p => (
            <div key={p} style={{
              position: 'absolute', top: 0, bottom: 0,
              left: `${p}%`, width: 1,
              background: 'rgba(0,50,15,0.7)',
              pointerEvents: 'none',
            }} />
          ))}
          <div style={{
            position: 'absolute', inset: 0,
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #00bb44, #44ff88)',
            borderRadius: 3,
            boxShadow: '0 0 6px rgba(0,240,100,0.8), 0 0 12px rgba(0,200,70,0.45)',
            transition: 'width 0.5s linear',
          }} />
        </div>
      </div>
    </div>
  )
}
