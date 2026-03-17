import { colors } from '../../../lib/theme'
import { useT } from '../../../lib/i18n'
import { ProgressBar } from './SongShared'

export default function SongCoverVariant({ block, playing, ready, progress, togglePlay, handleSeek, accent, textCol }) {
  const { title, artist, coverUrl } = block
  const { t } = useT()

  return (
    <div className="w-full flex items-start gap-4">
      <button
        onClick={togglePlay}
        disabled={!ready}
        className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden group disabled:cursor-default shrink-0"
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity">
          <span className="text-white text-5xl leading-none drop-shadow-lg">
            {playing ? '⏸' : '▶'}
          </span>
        </div>
      </button>

      <div className="flex-1 min-w-0 flex flex-col justify-between h-36 sm:h-48">
        <div className="text-left">
          <p className="font-semibold text-xl" style={{ color: textCol }}>{title || t('song.untitled')}</p>
          {artist && <p className="text-base mt-0.5" style={{ color: textCol, opacity: 0.65 }}>{artist}</p>}
          {!ready && <p className="text-xs text-fg-faint mt-0.5">{t('song.loading')}</p>}
        </div>
        {ready && <ProgressBar progress={progress} accent={accent} handleSeek={handleSeek} />}
      </div>
    </div>
  )
}
