// === File: /frontend/src/pages/Content.jsx ===
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function ContentPage() {
  const { id } = useParams()
  const [content, setContent] = useState(null)
  const [topic, setTopic] = useState(null)
  const [thumb, setThumb] = useState(null) // string | null
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const res = await api.get(`/api/contents/${id}`)
        if (!mounted) return
        setContent(res.data)

        if (res.data?.topicId) {
          try {
            const t = await api.get(`/api/topics/${res.data.topicId}`)
            if (!mounted) return
            setTopic(t.data)
          } catch (errTopic) {
            console.warn('Não foi possível carregar o tópico:', errTopic)
          }
        }

        // build thumbnail using client-side heuristics first (YouTube -> Vimeo)
        const link = res.data?.link ?? ''
        let generatedThumb = null

        const ytId = extractYouTubeId(link)
        if (ytId) {
          generatedThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
          if (mounted) setThumb(generatedThumb)
          return
        }

        const vimeoId = extractVimeoId(link)
        if (vimeoId) {
          // try Vimeo oEmbed from browser (may be allowed)
          try {
            const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(link)}`
            const r = await fetch(oembedUrl)
            if (r.ok) {
              const j = await r.json()
              if (j && j.thumbnail_url) {
                generatedThumb = j.thumbnail_url
                if (mounted) setThumb(generatedThumb)
                return
              }
            }
          } catch (vErr) {
            console.warn('Vimeo oEmbed falhou:', vErr)
          }
        }

        // fallback: try backend endpoint if available
        try {
          const tRes = await api.get('/api/thumbnail', { params: { url: link } })
          if (!mounted) return
          if (tRes.data?.thumbnailUrl) setThumb(tRes.data.thumbnailUrl)
          else if (tRes.data?.thumbnailDataUrl) setThumb(tRes.data.thumbnailDataUrl)
        } catch (thumbErr) {
          // backend not available or returned error — ignore silently and leave thumb null
          console.warn('thumbnail fetch failed', thumbErr)
          if (mounted) setThumb(null)
        }
      } catch (err) {
        console.error('Erro ao carregar conteúdo:', err)
        setError(err?.response?.data ?? 'Erro ao carregar conteúdo')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  function extractYouTubeId(url) {
    if (!url) return null
    try {
      const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
      const m = url.match(ytRegex)
      if (m && m[1]) return m[1]
      const u = new URL(url)
      const v = u.searchParams.get('v')
      if (v && v.length === 11) return v
    } catch (_) {}
    return null
  }

  function extractVimeoId(url) {
    if (!url) return null
    try {
      const vimeoRegex = /vimeo\.com\/(?:.*\/)?([0-9]+)/
      const m = url.match(vimeoRegex)
      if (m && m[1]) return m[1]
    } catch (_) {}
    return null
  }

  if (loading) return <div className="p-6">Carregando conteúdo...</div>
  if (error) return <div className="p-6 text-red-600">Erro: {String(error)}</div>
  if (!content) return <div className="p-6">Conteúdo não encontrado.</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <div className="text-sm text-gray-500">{topic ? topic.name : 'Tópico'}</div>
        <h1 className="text-2xl font-semibold mt-1">{content.title}</h1>
        <div className="text-sm text-gray-400 mt-1">Tipo: {content.type}</div>
      </header>

      <div className="mb-6">
        {thumb ? (
          <img
            src={thumb}
            alt={`Thumbnail - ${content.title}`}
            className="w-full max-h-[480px] object-cover rounded shadow"
            onError={(e) => {
              // if the image fails to load, hide it (avoid infinite loops) and fallback to placeholder
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full max-h-[360px] bg-gray-100 rounded flex items-center justify-center text-gray-400">
            Sem imagem disponível
          </div>
        )}
      </div>

      <div className="mb-4 text-gray-700">Para ver o vídeo, clique no link abaixo.</div>

      <div>
        <a href={content.link} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Abrir vídeo
        </a>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        Link: <a href={content.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all">{content.link}</a>
      </div>
    </div>
  )
}
