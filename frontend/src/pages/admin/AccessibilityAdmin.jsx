// /frontend/src/pages/admin/AccessibilityAdmin.jsx
import React, { useEffect, useState } from 'react'
import api from '../../services/api'

export default function AccessibilityAdmin() {
  const [cats, setCats] = useState([])
  const [topics, setTopics] = useState([])
  const [newCat, setNewCat] = useState({ name: '', description: '' })
  const [selectedCat, setSelectedCat] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      const [cRes, tRes] = await Promise.all([api.get('/api/accessibility/categories'), api.get('/api/topics')])
      setCats(Array.isArray(cRes.data) ? cRes.data : [])
      setTopics(Array.isArray(tRes.data) ? tRes.data : [])
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar dados')
    }
  }

  async function createCategory(e) {
    e.preventDefault()
    try {
      await api.post('/api/accessibility/categories', newCat)
      setNewCat({ name: '', description: '' })
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Erro ao criar categoria')
    }
  }

  async function deleteCategory(id) {
    if (!confirm('Excluir categoria?')) return
    try {
      await api.delete(`/api/accessibility/categories/${id}`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Erro ao excluir categoria')
    }
  }

  async function addTopic(catId, topicId) {
    try {
      await api.post(`/api/accessibility/categories/${catId}/topics`, { topicId })
      // refresh topics for category
      await loadAll()
      setSelectedCat(catId) // keep selected
    } catch (err) {
      console.error(err)
      setError('Erro ao vincular tópico')
    }
  }

  async function removeTopic(catId, topicId) {
    try {
      await api.delete(`/api/accessibility/categories/${catId}/topics/${topicId}`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Erro ao remover vínculo')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Acessibilidade — Gerenciar categorias</h2>

      <form onSubmit={createCategory} className="mb-6 flex gap-2">
        <input value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} placeholder="Nome da categoria (ex: Deficiente Visual)" className="border p-2 rounded" required />
        <input value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})} placeholder="Descrição (opcional)" className="border p-2 rounded" />
        <button className="bg-green-600 text-white px-4 rounded">Adicionar</button>
      </form>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cats.map(cat => (
          <div key={cat.id} className="border rounded p-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{cat.name}</div>
                {cat.description && <div className="text-sm text-gray-500">{cat.description}</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)} className="px-2 py-1 bg-indigo-600 text-white rounded">Gerenciar temas</button>
                <button onClick={() => deleteCategory(cat.id)} className="px-2 py-1 bg-red-600 text-white rounded">Excluir</button>
              </div>
            </div>

            {selectedCat === cat.id && (
              <div className="mt-3">
                <CategoryTopicsList catId={cat.id} topics={topics} onAdd={addTopic} onRemove={removeTopic} api={api} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryTopicsList({ catId, topics, onAdd, onRemove, api }) {
  const [list, setList] = useState([])

  useEffect(() => {
    let mounted = true
    (async () => {
      try {
        const r = await api.get(`/api/accessibility/categories/${catId}/topics`)
        if (!mounted) return
        setList(Array.isArray(r.data) ? r.data : [])
      } catch (err) {
        console.error(err)
      }
    })()
    return () => mounted = false
  }, [catId])

  return (
    <div>
      <div className="flex gap-2 items-center">
        <select id={`addtopic-${catId}`} className="border p-2 rounded" defaultValue="">
          <option value="">-- selecionar tópico --</option>
          {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button onClick={() => {
          const sel = document.getElementById(`addtopic-${catId}`)
          const val = sel ? sel.value : null
          if (!val) return alert('Selecione um tópico')
          onAdd(catId, Number(val))
        }} className="px-3 py-1 bg-green-600 text-white rounded">Vincular</button>
      </div>

      <div className="mt-3 flex gap-2 flex-wrap">
        {list.map(t => (
          <span key={t.id} className="px-3 py-1 bg-slate-100 rounded flex items-center gap-2">
            <span>{t.name}</span>
            <button onClick={() => onRemove(catId, t.id)} className="ml-2 px-1 bg-red-500 text-white rounded text-sm">x</button>
          </span>
        ))}
        {list.length === 0 && <div className="text-sm text-gray-500 mt-2">Nenhum tema vinculado.</div>}
      </div>
    </div>
  )
}
