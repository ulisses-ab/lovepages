import { supabase } from '../../lib/supabase'
import { useState } from 'react'
import { inputClass } from '../../lib/theme'
import { getYouTubeId } from '../../lib/blockDefaults'
import { useT } from '../../lib/i18n'

function getYouTubeEmbedUrl(url) {
  const id = getYouTubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

export default function VideoBlock({ block, isEditing, onChange }) {
  const { src, embedUrl, title } = block
  const [uploading, setUploading] = useState(false)
  const { t } = useT()

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = `videos/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('lovepages').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('lovepages').getPublicUrl(path)
      onChange({ src: data.publicUrl, embedUrl: '' })
    } catch (err) {
      console.error('Upload failed:', err.message)
    } finally {
      setUploading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <input
          className={inputClass}
          placeholder={t('video.youtubeUrl')}
          value={embedUrl}
          onChange={e => onChange({ embedUrl: e.target.value, src: '' })}
        />
        <p className="text-xs text-fg-faint text-center">{t('video.orUpload')}</p>
        <input type="file" accept="video/*" onChange={handleUpload} className="text-sm text-fg-muted" />
        {uploading && <p className="text-xs text-fg-muted">{t('video.uploading')}</p>}
        <input
          className={inputClass}
          placeholder={t('video.title')}
          value={title}
          onChange={e => onChange({ title: e.target.value })}
        />
      </div>
    )
  }

  const embedSrc = embedUrl ? getYouTubeEmbedUrl(embedUrl) : null

  return (
    <div className="w-full">
      {title && <p className="text-sm font-medium text-center mb-2 text-fg-secondary">🎬 {title}</p>}
      {embedSrc ? (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedSrc}
            title={title || 'Video'}
            className="absolute top-0 left-0 w-full h-full rounded"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : src ? (
        <video controls className="w-full rounded">
          <source src={src} />
        </video>
      ) : (
        <div className="w-full h-40 bg-overlay rounded flex items-center justify-center text-fg-faint text-sm">
          {t('video.noVideo')}
        </div>
      )}
    </div>
  )
}
