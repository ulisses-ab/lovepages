import { colors, inputClass } from '../../lib/theme'
import { getYouTubeId } from '../../lib/blockDefaults'
import { useT } from '../../lib/i18n'
import ImageUpload from '../ui/ImageUpload'
import { useSongPlayer } from './song/useSongPlayer'
import { ColorSwatch, HiddenPlayer } from './song/SongShared'
import SongBarVariant from './song/SongBarVariant'
import SongCoverVariant from './song/SongCoverVariant'
import SongVinylVariant from './song/SongVinylVariant'
import SongAeroVariant from './song/SongAeroVariant'

export default function SongBlock({ block, isEditing, onChange }) {
  const {
    embedUrl = '', title, artist, autoplay = false,
    variant = 'default', coverUrl = '',
    accentColor = '', textColor = '', vinylBase = 'wood',
  } = block
  const accent = accentColor || colors.primary
  const textCol = textColor || colors.fg
  const { t } = useT()
  const ytId = getYouTubeId(embedUrl)

  const { playing, ready, progress, volume, setVolume, togglePlay, handleSeek, mountRef } =
    useSongPlayer(block)

  const VARIANTS = [
    { value: 'default', label: t('song.variantBar') },
    { value: 'cover',   label: t('song.variantCover') },
    { value: 'vinyl',   label: t('song.variantVinyl') },
    { value: 'aero',    label: t('song.variantAero') },
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

        {(variant === 'cover' || variant === 'vinyl' || variant === 'aero') && (
          <div className="space-y-1 pt-1">
            <p className="text-xs text-fg-muted">{t('song.coverImage')}</p>
            <ImageUpload
              value={coverUrl}
              onChange={url => onChange({ coverUrl: url })}
              previewClass="mt-1 rounded w-16 h-16 object-cover"
            />
          </div>
        )}

        {variant === 'vinyl' && (
          <div className="flex gap-1 pt-1">
            {[{ value: 'wood', label: 'Wood' }, { value: 'metal', label: 'Metal' }, { value: 'beige', label: 'Beige' }].map(opt => (
              <button
                key={opt.value}
                onClick={() => onChange({ vinylBase: opt.value })}
                className={`flex-1 py-1 rounded text-xs transition ${
                  vinylBase === opt.value
                    ? 'bg-primary text-white'
                    : 'bg-overlay text-fg-muted hover:bg-subtle'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Color pickers */}
        <div className="flex items-center gap-4 pt-0.5">
          <ColorSwatch label="Accent" value={accent} onChange={val => onChange({ accentColor: val })} />
          <ColorSwatch label="Text"   value={textCol} onChange={val => onChange({ textColor: val })} />
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

  // ── Variant dispatch ───────────────────────────────────────────────────────
  const shared = { block, playing, ready, progress, togglePlay, handleSeek, accent, textCol }

  if (variant === 'cover') return <><HiddenPlayer mountRef={mountRef} /><SongCoverVariant {...shared} /></>
  if (variant === 'vinyl') return <><HiddenPlayer mountRef={mountRef} /><SongVinylVariant {...shared} volume={volume} setVolume={setVolume} /></>
  if (variant === 'aero')  return <><HiddenPlayer mountRef={mountRef} /><SongAeroVariant  {...shared} /></>
  return <><HiddenPlayer mountRef={mountRef} /><SongBarVariant {...shared} /></>
}
