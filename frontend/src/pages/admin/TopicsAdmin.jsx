// === File: /frontend/src/pages/admin/TopicsAdmin.jsx ===
import React, { useEffect, useState } from 'react'
import api from '../../services/api'

export default function TopicsAdmin() {
  const [topics, setTopics] = useState([])
  const [subjects, setSubjects] = useState([])
  const [form, setForm] = useState({ id: null, name: '', subjectId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [tRes, sRes] = await Promise.all([api.get('/api/topics'), api.get('/api/subjects')])
      setTopics(tRes.data)
      setSubjects(sRes.data)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(t) {
    setForm({ id: t.id, name: t.name, subjectId: (t.subjectId ?? '') })
  }

  function resetForm() {
    setForm({ id: null, name: '', subjectId: '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const payload = {
        name: form.name,
        subjectId: form.subjectId ? parseInt(form.subjectId) : null
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
      setError('Erro ao salvar tópico')
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

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Gerenciar Tópicos</h2>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input type="text" placeholder="Nome do tópico" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-2 rounded flex-1" required />
        <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} className="border p-2 rounded" required>
          <option value="">Selecione a matéria (vincular)</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button type="submit" className="bg-indigo-600 text-white px-4 rounded">{form.id ? 'Salvar' : 'Adicionar'}</button>
        {form.id && <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-3 rounded">Cancelar</button>}
      </form>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {loading && <div>Carregando...</div>}

      <ul className="space-y-2">
        {topics.map(t => (
          <li key={t.id} className="border p-2 rounded flex justify-between items-center">
            <div>{t.name}</div>
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
