import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePages(userId) {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPages = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('pages')
        .select('id, title, created_at, updated_at, published, expires_at, slug, settings, blocks')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError
      setPages(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const deletePage = useCallback(async (pageId) => {
    const { error: deleteError } = await supabase
      .from('pages')
      .delete()
      .eq('id', pageId)

    if (deleteError) throw deleteError
    setPages(prev => prev.filter(p => p.id !== pageId))
  }, [])

  return { pages, loading, error, loadPages, deletePage }
}
