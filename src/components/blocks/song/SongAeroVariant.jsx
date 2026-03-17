import { formatTime } from './useSongPlayer'
import { useT } from '../../../lib/i18n'

// Frutiger Aero aesthetic — glassy sky-blue panel, aqua orb play button,
// white specular highlights, nature-meets-tech early-2000s digital feel.
export default function SongAeroVariant({ block, playing, ready, progress, togglePlay, handleSeek }) {
  const { title, artist, coverUrl } = block
  const { t } = useT()

  return (
    <div
      className="w-full relative overflow-hidden rounded-2xl px-4 py-3"
      style={{
        background: 'linear-gradient(160deg, rgba(186,230,255,0.72) 0%, rgba(125,211,252,0.45) 50%, rgba(56,189,248,0.55) 100%)',
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow: '0 4px 24px rgba(14,165,233,0.22), inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -1px 0 rgba(14,165,233,0.15)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Top-half gloss sheen */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none rounded-t-2xl"
        style={{
          height: '52%',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 100%)',
        }}
      />

      <div className="relative flex items-center gap-3">
        {/* Cover art */}
        <div
          className="shrink-0 w-14 h-14 rounded-xl overflow-hidden relative"
          style={{
            boxShadow: '0 2px 10px rgba(14,165,233,0.4), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          {coverUrl
            ? <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
            : (
              <div
                className="w-full h-full flex items-center justify-center text-3xl"
                style={{ background: 'linear-gradient(145deg, #bae6fd 0%, #38bdf8 60%, #0ea5e9 100%)' }}
              >
                🎵
              </div>
            )
          }
          {/* Gloss over cover */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(155deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 55%)' }}
          />
        </div>

        {/* Track info + progress */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate leading-tight"
            style={{ color: '#0c4a6e', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
          >
            {title || t('song.untitled')}
          </p>
          {artist && (
            <p
              className="text-xs truncate mt-0.5"
              style={{ color: '#0369a1', opacity: 0.85 }}
            >
              {artist}
            </p>
          )}
          {!ready && (
            <p className="text-xs mt-1" style={{ color: '#075985', opacity: 0.6 }}>{t('song.loading')}</p>
          )}
          {ready && (
            <div className="mt-2 space-y-0.5">
              {/* Glassy progress track */}
              <div
                className="py-2 -my-2 cursor-pointer"
                onClick={handleSeek}
                onTouchEnd={handleSeek}
                role="slider"
                aria-label="Seek"
                aria-valuenow={Math.round(progress.current)}
                aria-valuemin={0}
                aria-valuemax={Math.round(progress.duration)}
              >
                <div
                  className="h-2 rounded-full relative overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.5)',
                    boxShadow: 'inset 0 1px 3px rgba(14,165,233,0.25)',
                  }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
                    style={{
                      width: progress.duration > 0 ? `${(progress.current / progress.duration) * 100}%` : '0%',
                      background: 'linear-gradient(to right, #7dd3fc, #0ea5e9)',
                      boxShadow: '0 0 6px rgba(14,165,233,0.5)',
                    }}
                  />
                  {/* Gloss on fill */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-full"
                    style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 60%)' }}
                  />
                </div>
              </div>
              {/* Time */}
              <p className="text-right tabular-nums" style={{ fontSize: 10, color: '#0369a1', opacity: 0.75 }}>
                {formatTime(progress.current)}
                {progress.duration > 0 ? ` / ${formatTime(progress.duration)}` : ''}
              </p>
            </div>
          )}
        </div>

        {/* Aero orb play button */}
        <button
          onClick={togglePlay}
          disabled={!ready}
          className="shrink-0 w-12 h-12 rounded-full relative overflow-hidden flex items-center justify-center disabled:opacity-40 transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(160deg, #7dd3fc 0%, #0ea5e9 55%, #0284c7 100%)',
            boxShadow: '0 3px 14px rgba(14,165,233,0.55), inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {/* Specular highlight blob — top-center ellipse */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: 3,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 32,
              height: 16,
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 70%)',
            }}
          />
          <span
            className="relative text-white text-base leading-none drop-shadow"
            style={{ marginLeft: playing ? 0 : 2 }}
          >
            {playing ? '⏸' : '▶'}
          </span>
        </button>
      </div>
    </div>
  )
}
