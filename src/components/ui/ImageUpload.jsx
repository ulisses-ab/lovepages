import { useState } from 'react'
import { Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useT } from '../../lib/i18n'

/**
 * Reusable image upload widget.
 *
 * Props:
 *   value        — current image URL (string)
 *   onChange     — called with the new URL after a successful upload
 *   storagePath  — folder prefix inside the 'lovepages' bucket (default: "images")
 *   previewClass — Tailwind classes for the preview <img> (default: "mt-1 rounded max-h-40 object-cover")
 */
export default function ImageUpload({
  value = '',
  onChange,
  storagePath = 'images',
  previewClass = 'mt-1 rounded max-h-40 object-cover',
  label,
}) {
  const [uploading, setUploading] = useState(false)
  const { t } = useT()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${storagePath}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('lovepages').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('lovepages').getPublicUrl(path)
      onChange(data.publicUrl)
    } catch (err) {
      console.error('Image upload failed:', err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded bg-overlay border border-subtle text-sm text-fg-muted cursor-pointer hover:bg-subtle hover:text-fg-secondary transition select-none">
        <Upload size={12} />
        {uploading ? t('imageUpload.uploading') : (label ?? t('imageUpload.upload'))}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </label>
      {value && (
        <img src={value} alt="" className={previewClass} />
      )}
    </div>
  )
}
