import { inputClass } from '../../lib/theme'
import { useT } from '../../lib/i18n'
import ImageUpload from '../ui/ImageUpload'

export default function ImageBlock({ block, isEditing, onChange }) {
  const { src, alt, caption } = block
  const { t } = useT()

  if (isEditing) {
    return (
      <div className="space-y-2">
        <ImageUpload
          value={src}
          onChange={url => onChange({ src: url })}
          previewClass="mt-1 rounded max-h-40 object-cover"
        />
        <input
          className={inputClass}
          placeholder={t('image.caption')}
          value={caption}
          onChange={e => onChange({ caption: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder={t('image.altText')}
          value={alt}
          onChange={e => onChange({ alt: e.target.value })}
        />
      </div>
    )
  }

  if (!src) {
    return (
      <div className="w-full h-40 bg-overlay rounded flex items-center justify-center text-fg-faint text-sm">
        {t('image.noImage')}
      </div>
    )
  }

  return (
    <figure className="w-full">
      <img src={src} alt={alt} className="w-full rounded object-cover" />
      {caption && (
        <figcaption className="text-center text-sm text-fg-muted mt-1">{caption}</figcaption>
      )}
    </figure>
  )
}
