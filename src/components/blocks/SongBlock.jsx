import { colors, inputClass } from '../../lib/theme'
import { getYouTubeId } from '../../lib/blockDefaults'
import { useT } from '../../lib/i18n'
import ImageUpload from '../ui/ImageUpload'
import CollapsibleSection from '../ui/CollapsibleSection'
import { useSongPlayer } from './song/useSongPlayer'
import { ColorSwatch, HiddenPlayer } from './song/SongShared'
import SongBarVariant from './song/SongBarVariant'
import SongCoverVariant from './song/SongCoverVariant'
import SongVinylVariant from './song/SongVinylVariant'
import SongAeroVariant from './song/SongAeroVariant'
import SongXPVariant from './song/SongXPVariant'
import SongBubbleVariant from './song/SongBubbleVariant'

function VariantCard({ label, selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-overlay bg-surface hover:border-subtle'
      }`}
    >
      <div className="w-full h-24 overflow-hidden rounded">
        {children}
      </div>
      <span className={`text-xs leading-tight text-center w-full truncate ${
        selected ? 'text-primary-dim font-medium' : 'text-fg-muted'
      }`}>
        {label}
      </span>
    </button>
  )
}

function ScaledPreview({ children, scale = 0.45 }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        width: '260px',
        left: '50%',
        top: 0,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: 'top center',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        {children}
      </div>
    </div>
  )
}

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

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (isEditing) {
    const mockBlock = { ...block, title: title || 'Song Title', artist: artist || 'Artist' }
    const mockShared = { block: mockBlock, playing: false, ready: true, progress: 0.3, togglePlay: () => {}, handleSeek: () => {}, accent, textCol }

    const VARIANTS = [
      { value: 'default', label: t('song.variantBar'), preview: (
        <ScaledPreview><SongBarVariant {...mockShared} /></ScaledPreview>
      )},
      { value: 'cover', label: t('song.variantCover'), preview: (
        <ScaledPreview><SongCoverVariant {...mockShared} /></ScaledPreview>
      )},
      { value: 'vinyl', label: t('song.variantVinyl'), preview: (
        <ScaledPreview><SongVinylVariant {...mockShared} volume={70} setVolume={() => {}} /></ScaledPreview>
      )},
      { value: 'aero', label: t('song.variantAero'), preview: (
        <ScaledPreview><SongAeroVariant {...mockShared} /></ScaledPreview>
      )},
      { value: 'xp', label: t('song.variantXp'), preview: (
        <ScaledPreview><SongXPVariant {...mockShared} /></ScaledPreview>
      )},
      { value: 'bubble', label: t('song.variantBubble'), preview: (
        <ScaledPreview><SongBubbleVariant {...mockShared} /></ScaledPreview>
      )},
    ]

    return (
      <div className="space-y-3">
        {/* URL first */}
        <input
          className={inputClass}
          placeholder={t('song.pasteUrl')}
          value={embedUrl}
          onChange={e => onChange({ embedUrl: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className={inputClass}
            placeholder={t('song.title')}
            value={title}
            onChange={e => onChange({ title: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder={t('song.whoMadeThis')}
            value={artist}
            onChange={e => onChange({ artist: e.target.value })}
          />
        </div>

        {/* Player style */}
        <div>
          <p className="text-xs text-fg-muted mb-2">{t('song.playerStyle')}</p>
          <div className="grid grid-cols-3 gap-2">
            {VARIANTS.slice(0, 3).map(({ value, label: vLabel, preview }) => (
              <VariantCard key={value} label={vLabel} selected={variant === value} onClick={() => onChange({ variant: value })}>
                {preview}
              </VariantCard>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {VARIANTS.slice(3).map(({ value, label: vLabel, preview }) => (
              <VariantCard key={value} label={vLabel} selected={variant === value} onClick={() => onChange({ variant: value })}>
                {preview}
              </VariantCard>
            ))}
          </div>
        </div>

        {/* Cover art — only for variants that use it */}
        {(variant === 'cover' || variant === 'vinyl' || variant === 'xp' || variant === 'aero' || variant === 'bubble') && (
          <div className="space-y-1">
            <p className="text-xs text-fg-muted">{t('song.coverImage')}</p>
            <ImageUpload
              value={coverUrl}
              onChange={url => onChange({ coverUrl: url })}
              previewClass="mt-1 rounded w-16 h-16 object-cover"
            />
          </div>
        )}

        {/* Vinyl base color — only for vinyl */}
        {variant === 'vinyl' && (
          <div className="flex gap-1">
            {[{ value: 'wood', label: 'Wood' }, { value: 'metal', label: 'Metal' }, { value: 'beige', label: 'Beige' }].map(opt => (
              <button
                key={opt.value}
                onClick={() => onChange({ vinylBase: opt.value })}
                className={`flex-1 py-1.5 rounded text-xs transition ${
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

        {/* Colors — collapsed by default */}
        <CollapsibleSection title={t('song.colors')}>
          <div className="flex items-center gap-4">
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
        </CollapsibleSection>

        {/* Autoplay toggle */}
        <label className="flex items-center gap-2 text-sm text-fg-muted cursor-pointer">
          <input
            type="checkbox"
            checked={autoplay}
            onChange={e => onChange({ autoplay: e.target.checked })}
            className="accent-primary"
          />
          {t('song.autoplayLabel')}
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
  if (variant === 'xp')     return <><HiddenPlayer mountRef={mountRef} /><SongXPVariant     {...shared} /></>
  if (variant === 'bubble') return <><HiddenPlayer mountRef={mountRef} /><SongBubbleVariant {...shared} /></>
  return <><HiddenPlayer mountRef={mountRef} /><SongBarVariant {...shared} /></>
}
