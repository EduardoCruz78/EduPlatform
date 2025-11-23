import React, { useEffect, useState } from 'react'
import api from '../../../services/api'

export default function AccessibilityAdmin() {
  const [categories, setCategories] = useState([])
  const [allTopics, setAllTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      setLoading(true)
      const [cRes, tRes] = await Promise.all([api.get('/api/accessibility/categories'), api.get('/api/topics')])
      setCategories(Array.isArray(cRes.data) ? cRes.data : [])
      setAllTopics(Array.isArray(tRes.data) ? tRes.data : [])
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  async function createCategory() {
    if (!newCatName.trim()) return setError('Nome é obrigatório')
    try {
      await api.post('/api/accessibility/categories', { name: newCatName.trim(), description: newCatDesc })
      setNewCatName(''); setNewCatDesc('')
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Erro ao criar categoria')
    }
  }

  async function deleteCategory(id) {
    if (!confirm('Excluir categoria e seus dados?')) return
    try {
      await api.delete(`/api/accessibility/categories/${id}`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Erro ao excluir categoria')
    }
  }

  // topics linking
  async function addTopicToCategory(catId, topicId) {
    try {
      await api.post(`/api/accessibility/categories/${catId}/topics`, { topicId: Number(topicId) })
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Erro ao vincular tópico')
    }
  }

  async function removeTopicFromCategory(catId, topicId) {
    try {
      await api.delete(`/api/accessibility/categories/${catId}/topics/${topicId}`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Erro ao remover vínculo')
    }
  }

  // themes management via /api/accessibility/themes
  async function loadThemesForCategory(catId) {
    try {
      const res = await api.get('/api/accessibility/themes', { params: { categoryId: catId } })
      return Array.isArray(res.data) ? res.data : []
    } catch (err) {
      console.error(err)
      return []
    }
  }

  async function createTheme(catId, title, content) {
    if (!title || !title.trim()) return setError('Título obrigatório')
    try {
      await api.post('/api/accessibility/themes', { accessibilityCategoryId: catId, title: title.trim(), content })
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Erro ao criar tema')
    }
  }

  async function deleteTheme(id) {
    if (!confirm('Excluir tema?')) return
    try {
      await api.delete(`/api/accessibility/themes/${id}`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Erro ao excluir tema')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin — Acessibilidade</h2>

      <div className="mb-6 grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <div className="font-medium mb-2">Criar categoria</div>
          <input className="w-full border p-2 rounded mb-2" placeholder="Nome" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
          <input className="w-full border p-2 rounded mb-2" placeholder="Descrição (opcional)" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} />
          <button onClick={createCategory} className="px-3 py-2 bg-indigo-600 text-white rounded">Criar</button>
        </div>

        <div className="md:col-span-2">
          <div className="font-medium mb-2">Categorias existentes</div>
          {loading ? <div>Carregando...</div> : (
            <ul className="space-y-3">
              {categories.map(cat => (
                <li key={cat.id} className="border p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{cat.name}</div>
                      {cat.description && <div className="text-sm text-gray-600 mt-1">{cat.description}</div>}
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-1">Tópicos vinculados</div>
                        <CategoryTopicsBox
                          cat={cat}
                          allTopics={allTopics}
                          onAdd={addTopicToCategory}
                          onRemove={removeTopicFromCategory}
                          loadThemesForCategory={loadThemesForCategory}
                          createTheme={createTheme}
                          deleteTheme={deleteTheme}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button onClick={() => deleteCategory(cat.id)} className="px-2 py-1 bg-red-600 text-white rounded">Excluir</button>
                    </div>
                  </div>
                </li>
              ))}

              {categories.length === 0 && <li className="text-gray-500">Nenhuma categoria.</li>}
            </ul>
          )}
        </div>
      </div>

      {error && <div className="text-red-600">{String(error)}</div>}
    </div>
  )
}

/* helper sub-component to show topics & themes for a category */
function CategoryTopicsBox({ cat, allTopics, onAdd, onRemove, loadThemesForCategory, createTheme, deleteTheme }) {
  const [selectedTopicToAdd, setSelectedTopicToAdd] = useState('')
  const [themes, setThemes] = useState([])
  const [newThemeTitle, setNewThemeTitle] = useState('')
  const [newThemeContent, setNewThemeContent] = useState('')

  useEffect(() => {
    (async () => {
      setThemes(await loadThemesForCategory(cat.id))
    })()
  }, [cat, loadThemesForCategory])

  return (
    <div>
      <div className="mb-2">
        <select value={selectedTopicToAdd} onChange={e => setSelectedTopicToAdd(e.target.value)} className="border p-2 rounded w-full">
          <option value="">-- selecionar tópico para vincular --</option>
          {allTopics.map(t => <option key={t.id} value={t.id}>{t.name} {t.subject?.name ? `— ${t.subject.name}` : ''}</option>)}
        </select>
        <div className="mt-2 flex gap-2">
          <button onClick={() => { if (selectedTopicToAdd) onAdd(cat.id, selectedTopicToAdd); setSelectedTopicToAdd('') }} className="px-3 py-1 bg-indigo-600 text-white rounded">Vincular</button>
        </div>
      </div>

      <div className="mb-2">
        <div className="text-sm font-medium mb-1">Tópicos vinculados</div>
        <div className="space-y-1">
          {cat.topics && cat.topics.length > 0 ? (
            cat.topics.map(t => (
              <div key={t.id} className="flex justify-between items-center p-1 border rounded">
                <div className="text-sm">{t.name}</div>
                <button onClick={() => onRemove(cat.id, t.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Remover</button>
              </div>
            ))
          ) : <div className="text-sm text-gray-500">Nenhum tópico vinculado.</div>}
        </div>
      </div>

      <div className="mb-2">
        <div className="text-sm font-medium mb-1">Temas / instruções (por categoria)</div>

        <div className="space-y-2 mb-2">
          {themes.length > 0 ? themes.map(t => (
            <div key={t.id} className="flex justify-between items-start border p-2 rounded">
              <div>
                <div className="font-medium">{t.title}</div>
                {t.content && <div className="text-xs text-gray-600 mt-1">{t.content}</div>}
              </div>
              <button onClick={() => deleteTheme(t.id)} className="px-2 py-1 bg-red-600 text-white rounded">Excluir</button>
            </div>
          )) : <div className="text-sm text-gray-500">Nenhum tema.</div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input value={newThemeTitle} onChange={e => setNewThemeTitle(e.target.value)} placeholder="Título do tema" className="border p-2 rounded md:col-span-2" />
          <input value={newThemeContent} onChange={e => setNewThemeContent(e.target.value)} placeholder="Conteúdo (opcional)" className="border p-2 rounded" />
          <div className="md:col-span-3">
            <button onClick={() => { createTheme(cat.id, newThemeTitle, newThemeContent); setNewThemeTitle(''); setNewThemeContent('') }} className="px-3 py-2 bg-indigo-600 text-white rounded">Adicionar tema</button>
          </div>
        </div>
      </div>
    </div>
  )
}
