// src/pages/Topic.jsx
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
        await Promise.all((contentsRes.data || []).map(async raw => {
          const cid = getAnyField(raw, ['id','Id']) ?? raw.id
          const url = getAnyField(raw, ['link','Link','url']) || ''
          if (!cid || !url) return

          if ((getAnyField(raw, ['type','Type']) || '').toLowerCase() !== 'video') return

          const yt = extractYouTubeId(url)
          if (yt) {
            thumbsMap[cid] = `https://img.youtube.com/vi/${yt}/hqdefault.jpg`
            return
          }

          const vimeoId = extractVimeoId(url)
          if (vimeoId) {
            try {
              const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`
              const r = await fetch(oembedUrl)
              if (r.ok) {
                const j = await r.json()
                if (j && j.thumbnail_url) {
                  thumbsMap[cid] = j.thumbnail_url
                  return
                }
              }
            } catch (err) {
              console.warn('Vimeo oEmbed falhou para', url, err)
            }
          }

          try {
            const tRes = await api.get('/api/thumbnail', { params: { url } })
            if (tRes.data?.thumbnailUrl) {
              thumbsMap[cid] = tRes.data.thumbnailUrl
              return
            } else if (tRes.data?.thumbnailDataUrl) {
              thumbsMap[cid] = tRes.data.thumbnailDataUrl
              return
            }
          } catch (err) {
            // ignore
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

  function getAnyField(obj, names) {
    if (!obj) return null
    for (const n of names) {
      if (Object.prototype.hasOwnProperty.call(obj, n) && obj[n] != null) return obj[n]
    }
    return null
  }

  function extractYouTubeId(url) {
    if (!url) return null
    try {
      // regex corrigido: apenas uma barra invertida onde necessário
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
      // regex corrigido
      const vimeoRegex = /vimeo\.com\/(?:.*\/)?([0-9]+)/
      const m = url.match(vimeoRegex)
      if (m && m[1]) return m[1]
    } catch (_) {}
    return null
  }

  function mapTypeDisplay(typeRaw) {
    if (!typeRaw) return 'Material'
    const t = String(typeRaw).toLowerCase()
    if (t === 'video') return 'Vídeo'
    if (t === 'exercise') return 'Exercício'
    if (t === 'simulated') return 'Simulado'
    return String(typeRaw).charAt(0).toUpperCase() + String(typeRaw).slice(1)
  }

  function mapTypeSmall(typeRaw) {
    const mapped = mapTypeDisplay(typeRaw)
    if (mapped === 'Exercício') return 'exercício'
    return mapped.charAt(0).toLowerCase() + mapped.slice(1)
  }

  if (loading) return <div className="p-6">Carregando tópico e conteúdos...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!topic) return <div className="p-6">Tópico não encontrado.</div>

  function getOpenUrl(raw) {
    const pdf = getAnyField(raw, ['pdfUrl','PdfUrl','pdf_url','pdf'])
    const link = getAnyField(raw, ['link','Link','url'])
    if (pdf) return pdf
    if (link) return link
    return null
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <header className="mb-6">
        <div className="text-sm text-accent-700 font-medium">{getAnyField(topic, ['name','Name'])}</div>
        <h1 className="text-2xl font-semibold mt-1 text-slate-800">Conteúdos do tópico</h1>
      </header>

      <div className="grid gap-6">
        {contents.length === 0 && <div className="text-gray-500">Nenhum conteúdo cadastrado para este tópico.</div>}

        {contents.map(raw => {
          const cid = getAnyField(raw, ['id','Id']) ?? raw.id
          const title = getAnyField(raw, ['title','Title']) || ''
          const type = (getAnyField(raw, ['type','Type']) || '').toLowerCase()
          const isVideo = type === 'video'
          const openUrl = getOpenUrl(raw)
          const thumb = thumbs[cid]

          if (isVideo) {
            return (
              <article key={cid} className="border rounded p-4 shadow-sm bg-white">
                <div className="md:flex md:gap-4 items-start">
                  <div className="md:w-1/3 mb-4 md:mb-0">
                    {thumb ? (
                      <img src={thumb} alt={`Thumb - ${title}`} className="w-full h-44 object-cover rounded" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    ) : (
                      <div className="w-full h-44 bg-accent-50 rounded flex items-center justify-center text-accent-400">Sem imagem disponível</div>
                    )}
                  </div>

                  <div className="md:flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-medium text-slate-800">{title}</h2>
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-accent-100 text-accent-800">{mapTypeDisplay(type)}</span>
                      </div>
                      <p className="mb-3 text-gray-700">Para ver o material, use o botão abaixo.</p>
                    </div>

                    <div className="mt-3">
                      {openUrl ? (
                        <a href={openUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition">Abrir vídeo</a>
                      ) : (
                        <div className="text-sm text-gray-500">Nenhum link disponível para este conteúdo.</div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          }

          return (
            <article key={cid} className="border rounded p-4 shadow-sm bg-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-slate-800">{title}</h2>
                <div className="text-sm text-gray-500 mt-1">{mapTypeSmall(type)}</div>
              </div>

              {openUrl ? (
                <a href={openUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition">Abrir exercício</a>
              ) : (
                <div className="text-sm text-gray-500">Nenhum link disponível para este conteúdo.</div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
