// src/pages/Series/Topic.jsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'
import { Play, FileText, CheckCircle, Tag, ExternalLink } from 'lucide-react'

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

        // Carregar thumbnails
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
              console.warn('Vimeo oEmbed falhou', err)
            }
          }

          try {
            const tRes = await api.get('/api/thumbnail', { params: { url } })
            if (tRes.data?.thumbnailUrl) {
              thumbsMap[cid] = tRes.data.thumbnailUrl
            } else if (tRes.data?.thumbnailDataUrl) {
              thumbsMap[cid] = tRes.data.thumbnailDataUrl
            }
          } catch (err) {}
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

  function mapTypeDisplay(typeRaw) {
    if (!typeRaw) return 'Material'
    const t = String(typeRaw).toLowerCase()
    if (t === 'video') return 'Vídeo'
    if (t === 'exercise') return 'Exercício'
    if (t === 'simulated') return 'Simulado'
    return String(typeRaw).charAt(0).toUpperCase() + String(typeRaw).slice(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="animate-pulse bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl h-20 border border-gray-700"></div>
          <div className="animate-pulse bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl h-64 border border-gray-700"></div>
          <div className="animate-pulse bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl h-64 border border-gray-700"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-red-900/20 border border-red-500/20 text-red-400">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-semibold">Erro</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 p-6 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <div className="text-xl font-bold text-white">Tópico não encontrado</div>
      </div>
    )
  }

  function getOpenUrl(raw) {
    const pdf = getAnyField(raw, ['pdfUrl','PdfUrl','pdf_url','pdf'])
    const link = getAnyField(raw, ['link','Link','url'])
    if (pdf) return pdf
    if (link) return link
    return null
  }

  const typeIcons = {
    video: Play,
    exercise: FileText,
    simulated: CheckCircle,
    material: FileText
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm font-bold text-purple-400 mb-4">
            <Tag className="w-4 h-4" />
            {getAnyField(topic, ['name','Name'])}
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Conteúdos do Tópico
          </h1>
          <p className="text-gray-400 text-lg">
            {contents.length} {contents.length === 1 ? 'conteúdo disponível' : 'conteúdos disponíveis'}
          </p>
        </header>

        {/* Content Grid */}
        <div className="space-y-6">
          {contents.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <div className="text-xl font-bold text-white mb-2">Nenhum conteúdo ainda</div>
              <p className="text-gray-400">Aguarde enquanto adicionamos materiais para este tópico.</p>
            </div>
          )}

          {contents.map(raw => {
            const cid = getAnyField(raw, ['id','Id']) ?? raw.id
            const title = getAnyField(raw, ['title','Title']) || ''
            const type = (getAnyField(raw, ['type','Type']) || '').toLowerCase()
            const isVideo = type === 'video'
            const openUrl = getOpenUrl(raw)
            const thumb = thumbs[cid]
            const IconComponent = typeIcons[type] || typeIcons.material

            if (isVideo) {
              return (
                <article key={cid} className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 transition-all overflow-hidden">
                  <div className="grid md:grid-cols-5 gap-6 p-6">
                    {/* Thumbnail */}
                    <div className="md:col-span-2">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800">
                        {thumb ? (
                          <>
                            <img 
                              src={thumb} 
                              alt={`Thumbnail - ${title}`} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              onError={(e) => { e.currentTarget.style.display = 'none' }} 
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                                <Play className="w-8 h-8 text-white ml-1" fill="white" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            🎥
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Info */}
                    <div className="md:col-span-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <h2 className="text-xl font-black text-white group-hover:text-purple-400 transition-colors flex-1">
                            {title}
                          </h2>
                          <span className="ml-3 flex-shrink-0 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold rounded-full flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {mapTypeDisplay(type)}
                          </span>
                        </div>
                        <p className="text-gray-400">
                          Assista ao vídeo explicativo completo sobre este tema.
                        </p>
                      </div>

                      <div className="mt-4">
                        {openUrl ? (
                          <a 
                            href={openUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg"
                          >
                            <Play className="w-5 h-5" />
                            Assistir Vídeo
                          </a>
                        ) : (
                          <div className="text-sm text-gray-500">Link indisponível no momento</div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              )
            }

            // Non-video content
            return (
              <article key={cid} className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 transition-all p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-lg font-black text-white group-hover:text-purple-400 transition-colors">
                      {title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold rounded">
                        {mapTypeDisplay(type)}
                      </span>
                    </div>
                  </div>
                </div>

                {openUrl ? (
                  <a 
                    href={openUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all"
                  >
                    Abrir
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <div className="text-sm text-gray-500">Indisponível</div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}