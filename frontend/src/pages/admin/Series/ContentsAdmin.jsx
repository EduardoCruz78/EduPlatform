import React, { useEffect, useState } from 'react'
import api from '../../../services/api'

export default function ContentsAdmin() {
  const [contents, setContents] = useState([])
  const [series, setSeries] = useState([])
  const [subjectsAll, setSubjectsAll] = useState([])
  const [subjectsFiltered, setSubjectsFiltered] = useState([])
  const [topicsAll, setTopicsAll] = useState([])
  const [topicsFiltered, setTopicsFiltered] = useState([])

  const [form, setForm] = useState({
    id: null,
    title: '',
    type: 'Video',
    link: '',
    pdfUrl: '',
    seriesId: '',
    subjectId: '',
    topicId: ''
  })

  const [previewThumb, setPreviewThumb] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [cRes, serRes, subjRes, topRes] = await Promise.all([
        api.get('/api/contents'),
        api.get('/api/series'),
        api.get('/api/subjects'),
        api.get('/api/topics')
      ])

      setContents(Array.isArray(cRes.data) ? cRes.data : [])
      setSeries(Array.isArray(serRes.data) ? serRes.data : [])
      setSubjectsAll(Array.isArray(subjRes.data) ? subjRes.data : [])
      setTopicsAll(Array.isArray(topRes.data) ? topRes.data : [])
      setSubjectsFiltered([])
      setTopicsFiltered([])
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  function onSeriesChange(value) {
    setForm(f => ({ ...f, seriesId: value, subjectId: '', topicId: '' }))
    if (!value) {
      setSubjectsFiltered([])
      setTopicsFiltered([])
      return
    }
    const sid = Number(value)
    const filtered = subjectsAll.filter(s => Number(s.seriesId ?? (s.series ? s.series.id : -1)) === sid)
    setSubjectsFiltered(filtered)
    setTopicsFiltered([])
  }

  function onSubjectChange(value) {
    setForm(f => ({ ...f, subjectId: value, topicId: '' }))
    if (!value) {
      setTopicsFiltered([])
      return
    }
    const subjId = Number(value)
    const filtered = topicsAll.filter(t => Number(t.subjectId ?? (t.subject ? t.subject.id : -1)) === subjId)
    setTopicsFiltered(filtered)
  }

  function startEdit(c) {
    const topicId = c.topicId ?? (c.topic ? c.topic.id : null)
    let subjectId = ''
    let seriesId = ''

    if (topicId) {
      const topicObj = topicsAll.find(t => Number(t.id) === Number(topicId))
      if (topicObj) {
        subjectId = String(topicObj.subjectId ?? (topicObj.subject ? topicObj.subject.id : '')) || ''
        if (subjectId) {
          const subj = subjectsAll.find(s => Number(s.id) === Number(subjectId))
          if (subj) {
            seriesId = String(subj.seriesId ?? (subj.series ? subj.series.id : '')) || ''
          }
        }
      }
    }

    if (seriesId) {
      const sid = Number(seriesId)
      setSubjectsFiltered(subjectsAll.filter(s => Number(s.seriesId ?? (s.series ? s.series.id : -1)) === sid))
    } else {
      setSubjectsFiltered([])
    }

    if (subjectId) {
      const subid = Number(subjectId)
      setTopicsFiltered(topicsAll.filter(t => Number(t.subjectId ?? (t.subject ? t.subject.id : -1)) === subid))
    } else {
      setTopicsFiltered([])
    }

    setForm({
      id: c.id,
      title: c.title ?? '',
      type: c.type ?? 'Video',
      link: c.link ?? '',
      pdfUrl: c.pdfUrl ?? '',
      seriesId,
      subjectId,
      topicId: topicId ? String(topicId) : ''
    })

    if (c.type === 'Video') {
      const sync = syncPreviewFromLink(c.link)
      setPreviewThumb(sync || null)
    } else {
      setPreviewThumb(null)
    }
  }

  function resetForm() {
    setForm({ id: null, title: '', type: 'Video', link: '', pdfUrl: '', seriesId: '', subjectId: '', topicId: '' })
    setPreviewThumb(null)
    setError(null)
    setSubjectsFiltered([])
    setTopicsFiltered([])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const topicId = Number(form.topicId)
      if (!topicId || isNaN(topicId) || topicId <= 0) return setError('Selecione um tópico válido.')

      if (form.type === 'Video' && (!form.link || !form.link.trim())) {
        return setError('Preencha o URL do vídeo para o tipo "Video".')
      }

      const payload = {
        Title: form.title,
        Type: form.type,
        Link: form.type === 'Video' ? form.link : null,
        PdfUrl: form.pdfUrl || null,
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
      setError(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg))
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

  // Helpers de preview
  function extractYouTubeId(url) {
    if (!url) return null
    try {
      const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
      const m = url.match(ytRegex)
      if (m && m[1]) return m[1]
      const u = new URL(url)
      const v = u.searchParams.get('v')
      if (v && v.length === 11) return v
    } catch (err) {}
    return null
  }

  function syncPreviewFromLink(url) {
    const yt = extractYouTubeId(url)
    if (yt) return `https://img.youtube.com/vi/${yt}/hqdefault.jpg`
    return null
  }

  async function onLinkChange(val) {
    setForm(f => ({ ...f, link: val }))
    setPreviewThumb(null)
    if (form.type === 'Video') {
      const sync = syncPreviewFromLink(val)
      if (sync) setPreviewThumb(sync)
    }
  }

  function getSubjectName(id) {
    const s = subjectsAll.find(x => Number(x.id) === Number(id))
    return s ? s.name : ''
  }

  function getSeriesNameBySubject(subjectId) {
    const s = subjectsAll.find(x => Number(x.id) === Number(subjectId))
    if (!s) return ''
    const serId = s.seriesId ?? (s.series ? s.series.id : undefined)
    const ser = series.find(x => Number(x.id) === Number(serId))
    return ser ? ser.name : ''
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Gerenciar Conteúdos</h2>

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            placeholder="Título"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={form.type}
            onChange={e => {
              const newType = e.target.value
              setForm({ ...form, type: newType, link: newType === 'Video' ? form.link : '', pdfUrl: form.pdfUrl })
              if (newType !== 'Video') setPreviewThumb(null)
            }}
            className="w-full border p-2 rounded"
          >
            <option>Video</option>
            <option>Exercise</option>
            <option>Simulated</option>
          </select>
        </div>

        {form.type === 'Video' && (
          <>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL do Vídeo</label>
              <input
                type="url"
                placeholder="URL do vídeo"
                value={form.link}
                onChange={e => onLinkChange(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div className="md:col-span-3">
              {previewThumb ? (
                <img src={previewThumb} alt="Preview thumbnail" className="w-full max-h-40 object-cover rounded shadow" />
              ) : (
                <div className="w-full max-h-40 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                  Preview da thumbnail (será gerada pelo link do vídeo)
                </div>
              )}
            </div>
          </>
        )}

        {(form.type === 'Exercise' || form.type === 'Simulated') && (
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">URL do PDF</label>
            <input
              type="url"
              placeholder="URL do PDF"
              value={form.pdfUrl}
              onChange={e => setForm({ ...form, pdfUrl: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
          <select value={form.seriesId} onChange={e => onSeriesChange(e.target.value)} className="w-full border p-2 rounded">
            <option value="">-- selecione a série --</option>
            {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
          <select value={form.subjectId} onChange={e => onSubjectChange(e.target.value)} className="w-full border p-2 rounded" disabled={!form.seriesId}>
            <option value="">{form.seriesId ? 'Selecione a matéria' : 'Escolha a série primeiro'}</option>
            {subjectsFiltered.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tópico</label>
          <select value={form.topicId} onChange={e => setForm({ ...form, topicId: e.target.value })} className="w-full border p-2 rounded" required disabled={!form.subjectId}>
            <option value="">{form.subjectId ? 'Selecione o tópico' : 'Escolha a matéria primeiro'}</option>
            {topicsFiltered.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="md:col-span-3 flex gap-2">
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">{form.id ? 'Salvar' : 'Adicionar'}</button>
          {form.id && <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-3 py-2 rounded">Cancelar</button>}
        </div>
      </form>

      {error && <div className="mb-4 text-red-600">{String(error)}</div>}
      {loading && <div>Carregando...</div>}

      <ul className="space-y-2">
        {contents.map(c => {
          const topicObj = topicsAll.find(t => Number(t.id) === Number(c.topicId)) || {}
          const subjId = topicObj.subjectId ?? (topicObj.subject ? topicObj.subject.id : undefined)
          const subjName = getSubjectName(subjId)
          const seriesName = getSeriesNameBySubject(subjId)
          const preview = c.type === 'Video' ? syncPreviewFromLink(c.link) : null
          return (
            <li key={c.id} className="border p-2 rounded flex justify-between items-center">
              <div className="flex gap-4 items-center">
                {c.type === 'Video' && preview ? (
                  <img src={preview} alt="" className="w-20 h-12 object-cover rounded" />
                ) : (
                  <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                    {c.type}
                  </div>
                )}
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-sm text-gray-500">{c.type} — {subjName ? `${subjName} — ${seriesName}` : `tópico: ${c.topicId}`}</div>
                </div>
              </div>

              <div className="flex gap-2">
                {c.link && <a href={c.link} target="_blank" rel="noreferrer" className="px-2 py-1 bg-blue-600 text-white rounded">Abrir vídeo</a>}
                {c.pdfUrl && <a href={c.pdfUrl} target="_blank" rel="noreferrer" className="px-2 py-1 bg-slate-700 text-white rounded">PDF</a>}
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
