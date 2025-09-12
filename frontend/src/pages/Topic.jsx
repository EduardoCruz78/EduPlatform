// === File: /frontend/src/pages/Topic.jsx ===
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function TopicPage() {
  const { id } = useParams()
  const [topic, setTopic] = useState(null)
  const [contents, setContents] = useState([])
  const [thumbs, setThumbs] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [topicRes, contentsRes] = await Promise.all([
          api.get(`/api/topics/${id}`),
          api.get(`/api/topics/${id}/contents`)
        ])

        if (!mounted) return
        setTopic(topicRes.data)
        setContents(contentsRes.data || [])

        const thumbsMap = {}
        await Promise.all((contentsRes.data || []).map(async c => {
          const url = c.link || ''
          // try YouTube sync
          const yt = extractYouTubeId(url)
          if (yt) {
            thumbsMap[c.id] = `https://img.youtube.com/vi/${yt}/hqdefault.jpg`
            return
          }
          // try Vimeo oEmbed
          const vimeoId = extractVimeoId(url)
          if (vimeoId) {
            try {
              const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`
              const r = await fetch(oembedUrl)
              if (r.ok) {
                const j = await r.json()
                if (j && j.thumbnail_url) {
                  thumbsMap[c.id] = j.thumbnail_url
                  return
                }
              }
            } catch (err) {
              console.warn('Vimeo oEmbed falhou para', url, err)
            }
          }
          // backend fallback (if controller exists)
          try {
            const tRes = await api.get('/api/thumbnail', { params: { url } })
            if (tRes.data?.thumbnailUrl) {
              thumbsMap[c.id] = tRes.data.thumbnailUrl
              return
            } else if (tRes.data?.thumbnailDataUrl) {
              thumbsMap[c.id] = tRes.data.thumbnailDataUrl
              return
            }
          } catch (err) {
            // leave undefined
          }
        }))

        if (!mounted) return
        setThumbs(thumbsMap)
      } catch (err) {
        console.error(err)
        if (mounted) setError('Falha ao carregar tópico / conteúdos')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
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

  if (loading) return <div className="p-6">Carregando tópico e conteúdos...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!topic) return <div className="p-6">Tópico não encontrado.</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-6">
        <div className="text-sm text-gray-500">{topic.name}</div>
        <h1 className="text-2xl font-semibold mt-1">Conteúdos do tópico</h1>
      </header>

      <div className="grid gap-6">
        {contents.length === 0 && <div className="text-gray-500">Nenhum conteúdo cadastrado para este tópico.</div>}

        {contents.map(c => (
          <article key={c.id} className="border rounded p-4 shadow-sm bg-white">
            <div className="md:flex md:gap-4">
              <div className="md:w-1/3 mb-4 md:mb-0">
                {thumbs[c.id] ? (
                  <img
                    src={thumbs[c.id]}
                    alt={`Thumb - ${c.title}`}
                    className="w-full h-44 object-cover rounded"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-44 bg-gray-100 rounded flex items-center justify-center text-gray-400">Sem imagem</div>
                )}
              </div>

              <div className="md:flex-1">
                <h2 className="text-lg font-medium">{c.title}</h2>
                <div className="text-sm text-gray-500 mb-2">Tipo: {c.type}</div>
                <p className="mb-3 text-gray-700">Para ver o material, use os links abaixo.</p>

                <div className="flex gap-3 items-center mb-3">
                  {c.link && (
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Abrir vídeo
                    </a>
                  )}

                  {c.pdfUrl && (
                    <a
                      href={c.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800"
                    >
                      Abrir PDF dos exercícios
                    </a>
                  )}
                </div>

                {c.pdfUrl && (
                  <div className="mt-2 p-3 bg-gray-50 rounded border">
                    <div className="text-sm font-medium text-slate-700 mb-1">Exercícios / Material para download</div>
                    <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
                      {c.pdfUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
