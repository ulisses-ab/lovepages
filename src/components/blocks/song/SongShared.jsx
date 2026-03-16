import { formatTime } from './useSongPlayer'
import ColorPicker from '../../ui/ColorPicker'

export function HiddenPlayer({ mountRef }) {
  return (
    <div style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
      <div ref={mountRef} />
    </div>
  )
}

export function PlayButton({ playing, ready, togglePlay, accent, textCol, size = 'md' }) {
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

export function ProgressBar({ progress, accent, handleSeek }) {
  return (
    <div className="relative w-full">
      <div className="absolute -top-5 left-0 w-full flex justify-end text-xs text-fg-faint tabular-nums">
        {formatTime(progress.current)}
        {progress.duration > 0 ? ` / ${formatTime(progress.duration)}` : ''}
      </div>
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
}

export function ColorSwatch({ label, value, onChange }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-fg-muted">{label}</span>
      <ColorPicker value={value} onChange={onChange} />
    </div>
  )
}
