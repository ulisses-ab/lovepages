import { useT } from '../../../lib/i18n'
import { PlayButton, ProgressBar } from './SongShared'

export default function SongBarVariant({ block, playing, ready, progress, togglePlay, handleSeek, accent, textCol }) {
  const { title, artist } = block
  const { t } = useT()

  return (
    <div className="w-full flex items-center gap-4 bg-overlay rounded-2xl px-5 py-4">
      <PlayButton playing={playing} ready={ready} togglePlay={togglePlay} accent={accent} textCol={textCol} size="md" />
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
        {ready && <ProgressBar progress={progress} accent={accent} handleSeek={handleSeek} />}
      </div>
    </div>
  )
}
