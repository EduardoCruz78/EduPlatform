// === File: /frontend/src/pages/admin/ContentsAdmin.jsx ===
import React, { useEffect, useState } from 'react'
import api from '../../services/api'

export default function ContentsAdmin() {
  const [contents, setContents] = useState([])
  const [topics, setTopics] = useState([])
  const [form, setForm] = useState({ id: null, title: '', type: 'Video', link: '', topicId: '' })
  const [previewThumb, setPreviewThumb] = useState(null) // preview during form edit
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [cRes, tRes] = await Promise.all([api.get('/api/contents'), api.get('/api/topics')])
      setContents(cRes.data)
      setTopics(tRes.data)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(c) {
    setForm({ id: c.id, title: c.title ?? '', type: c.type ?? 'Video', link: c.link ?? '', topicId: c.topicId ?? '' })
    // preview from existing link
    const p = getPreviewFromLink(c.link)
    setPreviewThumb(p)
  }

  function resetForm() {
    setForm({ id: null, title: '', type: 'Video', link: '', topicId: '' })
    setPreviewThumb(null)
    setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const topicId = parseInt(form.topicId)
      if (isNaN(topicId) || topicId <= 0) return setError('Selecione um tópico válido.')

      const payload = {
        Title: form.title,
        Type: form.type,
        Link: form.link,
        TopicId: topicId
      }

      if (form.id) {
        await api.put(`/api/contents/${form.id}`, { Id: form.id, ...payload })
      } else {
        await api.post('/api/contents', payload)
      }

      resetForm()
      await loadData()
    } catch (err) {
      console.error(err)
      const serverMsg = err?.response?.data ?? err.message
      setError(serverMsg)
    }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Excluir conteúdo "${title}"?`)) return
    try {
      await api.delete(`/api/contents/${id}`)
      await loadData()
    } catch (err) {
      console.error(err)
      setError('Erro ao excluir conteúdo')
    }
  }

  // --- helpers for thumbnail generation (client-side) ---
  function extractYouTubeId(url) {
    if (!url) return null
    try {
      const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
      const m = url.match(ytRegex)
      if (m && m[1]) return m[1]
      const u = new URL(url)
      const v = u.searchParams.get('v')
      if (v && v.length === 11) return v
    } catch (err) { /* ignore */ }
    return null
  }

  function extractVimeoId(url) {
    if (!url) return null
    try {
      const vimeoRegex = /vimeo\.com\/(?:.*\/)?([0-9]+)/
      const m = url.match(vimeoRegex)
      if (m && m[1]) return m[1]
    } catch (err) { /* ignore */ }
    return null
  }

  // try sync preview (YouTube instant), else null — caller may try async vimeo/oembed
  function syncPreviewFromLink(url) {
    const yt = extractYouTubeId(url)
    if (yt) return `https://img.youtube.com/vi/${yt}/hqdefault.jpg`
    return null
  }

  // returns a preview URL or null (tries YouTube + Vimeo oEmbed)
  async function getPreviewFromLink(url) {
    if (!url) return null
    const yt = extractYouTubeId(url)
    if (yt) return `https://img.youtube.com/vi/${yt}/hqdefault.jpg`

    const vimeo = extractVimeoId(url)
    if (vimeo) {
      try {
        const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`
        const r = await fetch(oembedUrl)
        if (r.ok) {
          const j = await r.json()
          if (j && j.thumbnail_url) return j.thumbnail_url
        }
      } catch (err) {
        console.warn('Vimeo oEmbed falhou:', err)
      }
    }

    // fallback: return null (server-side ffmpeg endpoint could be used later)
    return null
  }

  // update link in form and preview
  async function onLinkChange(val) {
    setForm(f => ({ ...f, link: val }))
    setPreviewThumb(null)
    // quick synchronous preview (YouTube)
    const sync = syncPreviewFromLink(val)
    if (sync) {
      setPreviewThumb(sync)
      return
    }
    // async attempt (Vimeo oEmbed)
    try {
      const p = await getPreviewFromLink(val)
      setPreviewThumb(p)
    } catch (err) {
      setPreviewThumb(null)
    }
  }

  // small helper to compute preview for item list (non-blocking)
  function computePreviewForContentItem(link) {
    const sync = syncPreviewFromLink(link)
    if (sync) return sync
    // otherwise attempt to build vimeo oembed URL (but we won't await here)
    return null
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Gerenciar Conteúdos</h2>

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Título"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="border p-2 rounded">
          <option>Video</option>
          <option>Exercise</option>
          <option>Simulated</option>
        </select>

        <input
          type="url"
          placeholder="URL do vídeo"
          value={form.link}
          onChange={e => onLinkChange(e.target.value)}
          className="border p-2 rounded col-span-2"
          required
        />

        {/* preview box (col-span full) */}
        <div className="col-span-2">
          {previewThumb ? (
            <img src={previewThumb} alt="Preview thumbnail" className="w-full max-h-40 object-cover rounded shadow" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          ) : (
            <div className="w-full max-h-40 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              Preview da thumbnail (será gerada pelo link do vídeo)
            </div>
          )}
        </div>

        <select
          value={form.topicId}
          onChange={e => setForm({ ...form, topicId: e.target.value })}
          className="border p-2 rounded"
          required
        >
          <option value="">Selecione o tópico</option>
          {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <div className="col-span-2 flex gap-2">
          <button type="submit" className="bg-indigo-600 text-white px-4 rounded">{form.id ? 'Salvar' : 'Adicionar'}</button>
          {form.id && <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-3 rounded">Cancelar</button>}
        </div>
      </form>

      {error && <div className="mb-4 text-red-600 whitespace-pre-wrap">{String(error)}</div>}
      {loading && <div>Carregando...</div>}

      <ul className="space-y-2">
        {contents.map(c => {
          const preview = computePreviewForContentItem(c.link)
          return (
            <li key={c.id} className="border p-2 rounded flex justify-between items-center">
              <div className="flex gap-4 items-center">
                {preview ? (
                  <img src={preview} alt="" className="w-20 h-12 object-cover rounded" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                ) : (
                  <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">sem imagem</div>
                )}
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-sm text-gray-500">{c.type} — tópico: {c.topicId}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <a href={c.link} target="_blank" rel="noreferrer" className="px-2 py-1 bg-blue-600 text-white rounded">Abrir</a>
                <button onClick={() => startEdit(c)} className="px-2 py-1 bg-yellow-500 text-white rounded">Editar</button>
                <button onClick={() => handleDelete(c.id, c.title)} className="px-2 py-1 bg-red-600 text-white rounded">Excluir</button>
              </div>
            </li>
          )
        })}
        {contents.length === 0 && !loading && <li className="p-4 text-center text-gray-500">Nenhum conteúdo cadastrado.</li>}
      </ul>
    </div>
  )
}
