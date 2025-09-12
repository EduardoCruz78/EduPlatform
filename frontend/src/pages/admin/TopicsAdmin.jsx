import React, { useEffect, useState } from 'react'
import api from '../../services/api'

export default function TopicsAdmin() {
  const [topics, setTopics] = useState([])
  const [series, setSeries] = useState([])
  const [subjectsAll, setSubjectsAll] = useState([])
  const [subjectsFiltered, setSubjectsFiltered] = useState([])
  const [selectedSeries, setSelectedSeries] = useState('')
  const [form, setForm] = useState({ id: null, name: '', subjectId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [tRes, sRes, serRes] = await Promise.all([
        api.get('/api/topics'),
        api.get('/api/subjects'),
        api.get('/api/series')
      ])

      setTopics(Array.isArray(tRes.data) ? tRes.data : [])
      setSubjectsAll(Array.isArray(sRes.data) ? sRes.data : [])
      setSeries(Array.isArray(serRes.data) ? serRes.data : [])

      // se já tiver série selecionada (ex.: edição), filtra
      if (selectedSeries) {
        const sid = Number(selectedSeries)
        setSubjectsFiltered((sRes.data || []).filter(x => {
          const seriesIdVal = (x.seriesId ?? (x.series ? x.series.id : undefined))
          return Number(seriesIdVal) === sid
        }))
      } else {
        setSubjectsFiltered([])
      }
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  function onSeriesChange(value) {
    setSelectedSeries(value)
    setForm(f => ({ ...f, subjectId: '' }))
    if (!value) {
      setSubjectsFiltered([])
      return
    }
    const sid = Number(value)
    const filtered = subjectsAll.filter(s => {
      const seriesIdVal = (s.seriesId ?? (s.series ? s.series.id : undefined))
      return Number(seriesIdVal) === sid
    })
    setSubjectsFiltered(filtered)
  }

  function startEdit(t) {
    // determine subjectId (support multiple shapes)
    const subjId = t.subjectId ?? (t.subject ? t.subject.id : null)
    let seriesIdForSubject = ''
    if (subjId != null) {
      const subj = subjectsAll.find(s => Number(s.id) === Number(subjId))
      if (subj) {
        seriesIdForSubject = String(subj.seriesId ?? (subj.series ? subj.series.id : '')) || ''
      }
    }

    setSelectedSeries(seriesIdForSubject)

    if (seriesIdForSubject) {
      const sid = Number(seriesIdForSubject)
      setSubjectsFiltered(subjectsAll.filter(s => Number(s.seriesId ?? (s.series ? s.series.id : undefined)) === sid))
    } else {
      setSubjectsFiltered([])
    }

    setForm({
      id: t.id,
      name: t.name ?? '',
      subjectId: subjId != null ? String(subjId) : ''
    })
  }

  function resetForm() {
    setForm({ id: null, name: '', subjectId: '' })
    setSelectedSeries('')
    setSubjectsFiltered([])
    setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      if (!form.name || !form.name.trim()) return setError('Nome do tópico é obrigatório.')
      if (!form.subjectId) return setError('Selecione a matéria (após escolher a série).')

      const payload = {
        name: form.name.trim(),
        subjectId: Number(form.subjectId)
      }

      if (form.id) {
        await api.put(`/api/topics/${form.id}`, payload)
      } else {
        await api.post('/api/topics', payload)
      }

      resetForm()
      await loadData()
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data ?? 'Erro ao salvar tópico'
      setError(typeof msg === 'string' ? msg : 'Erro ao salvar tópico')
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Excluir tópico "${name}"? Isso removerá também os conteúdos deste tópico.`)) return
    try {
      await api.delete(`/api/topics/${id}`)
      await loadData()
    } catch (err) {
      console.error(err)
      setError('Erro ao excluir tópico')
    }
  }

  function getSubjectName(subjectId) {
    const s = subjectsAll.find(x => Number(x.id) === Number(subjectId))
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
      <h2 className="text-2xl font-semibold mb-4">Gerenciar Tópicos</h2>

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do tópico</label>
          <input
            type="text"
            placeholder="Nome do tópico"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
          <select
            value={selectedSeries}
            onChange={e => onSeriesChange(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">-- selecione a série --</option>
            {series.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Matéria (vincular)</label>
          <select
            value={form.subjectId}
            onChange={e => setForm({ ...form, subjectId: e.target.value })}
            className="w-full border p-2 rounded"
            required
            disabled={!selectedSeries}
          >
            <option value="">{selectedSeries ? 'Selecione a matéria' : 'Escolha a série primeiro'}</option>
            {subjectsFiltered.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex gap-2">
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">{form.id ? 'Salvar' : 'Adicionar'}</button>
          {form.id && <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-3 py-2 rounded">Cancelar</button>}
        </div>
      </form>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {loading && <div>Carregando...</div>}

      <ul className="space-y-2">
        {topics.map(t => (
          <li key={t.id} className="border p-2 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-gray-500">
                {getSubjectName(t.subjectId) ? `${getSubjectName(t.subjectId)} — ${getSeriesNameBySubject(t.subjectId)}` : 'Sem matéria vinculada'}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(t)} className="px-2 py-1 bg-yellow-500 text-white rounded">Editar</button>
              <button onClick={() => handleDelete(t.id, t.name)} className="px-2 py-1 bg-red-600 text-white rounded">Excluir</button>
            </div>
          </li>
        ))}
        {topics.length === 0 && !loading && <li className="p-4 text-center text-gray-500">Nenhum tópico cadastrado.</li>}
      </ul>
    </div>
  )
}
