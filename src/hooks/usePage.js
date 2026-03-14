import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePage(pageId) {
  const [blocks, setBlocks] = useState([])
  const [pageTitle, setPageTitle] = useState('My Love Page')
  const [pageSettings, setPageSettings] = useState({})
  const [pageSlug, setPageSlug] = useState('')
  const [pagePublished, setPagePublished] = useState(false)
  const [pageExpiresAt, setPageExpiresAt] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const loadPage = useCallback(async () => {
    if (!pageId) return
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .single()

    if (error) {
      console.error('Error loading page:', error.message)
      return
    }
    if (data) {
      setPageTitle(data.title || 'My Love Page')
      setBlocks(data.blocks || [])
      setPageSettings(data.settings || {})
      setPageSlug(data.slug || '')
      setPagePublished(data.published || false)
      setPageExpiresAt(data.expires_at || null)
    }
  }, [pageId])

  const savePage = useCallback(async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const payload = {
        title: pageTitle,
        blocks,
        settings: pageSettings,
        updated_at: new Date().toISOString(),
        user_id: user.id,
      }

      if (pageId) {
        const { error } = await supabase.from('pages').update(payload).eq('id', pageId)
        if (error) throw error
        return pageId
      } else {
        const { data, error } = await supabase.from('pages').insert(payload).select('id').single()
        if (error) throw error
        return data.id
      }
    } catch (err) {
      setSaveError(err.message)
      console.error('Save failed:', err.message)
      return null
    } finally {
      setSaving(false)
    }
  }, [pageId, pageTitle, blocks, pageSettings])

  const publishPage = useCallback(async (slug) => {
    setSaving(true)
    setSaveError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const payload = {
        title: pageTitle,
        blocks,
        settings: pageSettings,
        slug,
        published: true,
        updated_at: new Date().toISOString(),
        user_id: user.id,
      }

      let savedId = pageId
      if (pageId) {
        const { error } = await supabase.from('pages').update(payload).eq('id', pageId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('pages').insert(payload).select('id').single()
        if (error) throw error
        savedId = data.id
      }

      setPageSlug(slug)
      setPagePublished(true)
      return savedId
    } catch (err) {
      setSaveError(err.message)
      console.error('Publish failed:', err.message)
      return null
    } finally {
      setSaving(false)
    }
  }, [pageId, pageTitle, blocks, pageSettings])

  const unpublishPage = useCallback(async () => {
    if (!pageId) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('pages')
        .update({ published: false })
        .eq('id', pageId)
      if (error) throw error
      setPagePublished(false)
    } catch (err) {
      setSaveError(err.message)
      console.error('Unpublish failed:', err.message)
    } finally {
      setSaving(false)
    }
  }, [pageId])

  const checkSlugAvailable = useCallback(async (slug) => {
    let query = supabase.from('pages').select('id').eq('slug', slug)
    if (pageId) {
      query = query.neq('id', pageId)
    }
    const { data } = await query
    return !data || data.length === 0
  }, [pageId])

  return {
    blocks, setBlocks,
    pageTitle, setPageTitle,
    pageSettings, setPageSettings,
    pageSlug, pagePublished, pageExpiresAt,
    saving, saveError,
    loadPage, savePage,
    publishPage, unpublishPage,
    checkSlugAvailable,
  }
}
