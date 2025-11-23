import React, { useEffect, useState } from 'react'
import api from '../../../services/api'
import { Link } from 'react-router-dom'

export default function AccessibilityPage() {
  const [categories, setCategories] = useState([])
  const [needs, setNeeds] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await api.get('/api/accessibility/categories')
        setCategories(res.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function openCategory(cat) {
    setSelectedCategory(cat)
    try {
      const res = await api.get('/api/accessibility/needs', { params: { categoryId: cat.id } })
      setNeeds(res.data || [])
    } catch (err) {
      console.error(err)
      setNeeds([])
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Auxílio e Acessibilidade</h1>
        <p className="text-sm text-gray-600">Recursos organizados por categoria (ex.: Deficiência) e por necessidade.</p>
      </header>

      {loading && <div>Carregando...</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map(cat => (
          <button key={cat.id} onClick={() => openCategory(cat)} className="p-4 border rounded hover:bg-indigo-50 text-left">
            <div className="font-medium">{cat.name}</div>
          </button>
        ))}
      </div>

      {selectedCategory && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">{selectedCategory.name}</h2>
          <div className="mt-3 space-y-3">
            {needs.map(n => (
              <div key={n.id} className="border p-3 rounded">
                <div className="font-medium">{n.name}</div>
                <div className="mt-2">
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {(n.themes || []).map(t => <li key={t.id}><strong>{t.title}:</strong> {t.content}</li>)}
                  </ul>
                </div>
              </div>
            ))}
            {needs.length === 0 && <div className="text-gray-500">Nenhuma necessidade cadastrada nesta categoria.</div>}
          </div>
        </section>
      )}
    </div>
  )
}
