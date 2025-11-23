// === File: /frontend/src/pages/admin/SubjectsAdmin.jsx ===
import React, { useEffect, useState } from 'react'
import api from '../../../services/api'

export default function SubjectsAdmin() {
  const [subjects, setSubjects] = useState([])
  const [series, setSeries] = useState([])
  const [form, setForm] = useState({ id: null, name: '', seriesId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [subsRes, seriesRes] = await Promise.all([
        api.get('/api/subjects'),
        api.get('/api/series')
      ])
      setSubjects(subsRes.data)
      setSeries(seriesRes.data)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(s) {
    setForm({ id: s.id, name: s.name, seriesId: s.seriesId ?? '' })
  }

  function resetForm() {
    setForm({ id: null, name: '', seriesId: '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const payload = {
        name: form.name,
        seriesId: form.seriesId ? parseInt(form.seriesId) : null
      }
      if (form.id) {
        // update
        await api.put(`/api/subjects/${form.id}`, { id: form.id, ...payload })
      } else {
        // create
        await api.post('/api/subjects', payload)
      }
      resetForm()
      await loadData()
    } catch (err) {
      console.error(err)
      setError('Erro ao salvar matéria')
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Excluir "${name}"? Isso removerá tópicos que estiverem vinculados apenas a essa matéria.`)) return
    try {
      await api.delete(`/api/subjects/${id}`)
      await loadData()
    } catch (err) {
      console.error(err)
      setError('Erro ao excluir matéria')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Gerenciar Matérias</h2>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Nome da matéria"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded flex-1"
          required
        />
        <select
          value={form.seriesId}
          onChange={e => setForm({ ...form, seriesId: e.target.value })}
          className="border p-2 rounded"
          required
        >
          <option value="">Selecione a série</option>
          {series.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button type="submit" className="bg-indigo-600 text-white px-4 rounded">
          {form.id ? 'Salvar' : 'Adicionar'}
        </button>
        {form.id && (
          <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-3 rounded">
            Cancelar
          </button>
        )}
      </form>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {loading && <div>Carregando...</div>}

      <ul className="space-y-2">
        {subjects.map(sub => (
          <li key={sub.id} className="border p-2 rounded flex justify-between items-center">
            <div>
              <div className="font-medium">{sub.name}</div>
              <div className="text-sm text-gray-500">{sub.series?.name ?? 'Sem série'}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(sub)} className="px-2 py-1 bg-yellow-500 text-white rounded">Editar</button>
              <button onClick={() => handleDelete(sub.id, sub.name)} className="px-2 py-1 bg-red-600 text-white rounded">Excluir</button>
            </div>
          </li>
        ))}
        {subjects.length === 0 && !loading && (
          <li className="p-4 text-center text-gray-500">Nenhuma matéria cadastrada.</li>
        )}
      </ul>
    </div>
  )
}
