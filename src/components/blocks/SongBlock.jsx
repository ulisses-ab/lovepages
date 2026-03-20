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
      <div className="w-full h-11 flex items-center justify-center overflow-hidden rounded">
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

function BarPreview() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, width: '90%', background: '#1a202a', borderRadius: 6, padding: '5px 8px' }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '6px solid #fff', marginLeft: 1 }} />
      </div>
      <div style={{ flex: 1, height: 3, background: '#3a4453', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: '40%', height: '100%', background: colors.primary, borderRadius: 999 }} />
      </div>
    </div>
  )
}

function CoverPreview() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', width: '90%' }}>
      <div style={{ width: 30, height: 30, background: '#3a4453', borderRadius: 3, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 12 }}>♪</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ height: 4, background: '#3a4453', borderRadius: 2, marginBottom: 4, width: '80%' }} />
        <div style={{ height: 3, background: '#3a4453', borderRadius: 2, marginBottom: 5, width: '55%' }} />
        <div style={{ height: 2, background: '#3a4453', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: '35%', height: '100%', background: colors.primary }} />
        </div>
      </div>
    </div>
  )
}

function VinylPreview() {
  return (
    <div style={{ position: 'relative', width: 36, height: 36 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'repeating-radial-gradient(circle at center, #1c1c1c 0px, #1c1c1c 3px, #0d0d0d 3px, #0d0d0d 6px)', border: '1px solid #333' }} />
      <div style={{ position: 'absolute', inset: '30%', borderRadius: '50%', background: '#2a2a2a', border: '1px solid #444' }} />
      <div style={{ position: 'absolute', inset: '44%', borderRadius: '50%', background: '#555' }} />
    </div>
  )
}

function AeroPreview() {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #ddf1ff 0%, #7ec5ee 100%)',
      borderRadius: 12, padding: '4px 8px', width: '90%',
      border: '1px solid rgba(255,255,255,0.7)',
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #0c3a88, #07235a)',
        borderRadius: 8, padding: '3px 5px',
        fontFamily: 'monospace', fontSize: 9, color: '#b4dcff',
        textShadow: '0 0 6px #4af',
        textAlign: 'center', letterSpacing: 1,
      }}>
        00:00
      </div>
    </div>
  )
}

function XPSongPreview() {
  return (
    <div style={{ border: '2px solid #999', borderRadius: 2, overflow: 'hidden', width: '100%' }}>
      <div style={{
        background: 'linear-gradient(180deg, #3a6ea5, #245cb5)',
        color: 'white', padding: '2px 5px', fontFamily: 'Tahoma, sans-serif', fontSize: 7, fontWeight: 700,
      }}>
        Windows Media Player
      </div>
      <div style={{ background: '#ece9d8', padding: '3px 5px', display: 'flex', alignItems: 'center', gap: 3 }}>
        <div style={{ width: 12, height: 12, background: '#c8d8e8', border: '1px solid #aaa' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 2, background: '#aaa', borderRadius: 999 }} />
        </div>
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

  const VARIANTS = [
    { value: 'default', label: t('song.variantBar'),   Preview: BarPreview },
    { value: 'cover',   label: t('song.variantCover'), Preview: CoverPreview },
    { value: 'vinyl',   label: t('song.variantVinyl'), Preview: VinylPreview },
    { value: 'aero',    label: t('song.variantAero'),  Preview: AeroPreview },
    { value: 'xp',      label: t('song.variantXp'),    Preview: XPSongPreview },
  ]

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (isEditing) {
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
            {VARIANTS.slice(0, 3).map(({ value, label: vLabel, Preview }) => (
              <VariantCard key={value} label={vLabel} selected={variant === value} onClick={() => onChange({ variant: value })}>
                <Preview />
              </VariantCard>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {VARIANTS.slice(3).map(({ value, label: vLabel, Preview }) => (
              <VariantCard key={value} label={vLabel} selected={variant === value} onClick={() => onChange({ variant: value })}>
                <Preview />
              </VariantCard>
            ))}
          </div>
        </div>

        {/* Cover art — only for variants that use it */}
        {(variant === 'cover' || variant === 'vinyl' || variant === 'xp') && (
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
  if (variant === 'xp')    return <><HiddenPlayer mountRef={mountRef} /><SongXPVariant    {...shared} /></>
  return <><HiddenPlayer mountRef={mountRef} /><SongBarVariant {...shared} /></>
}
