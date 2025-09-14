// src/pages/Subject.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function SubjectPage() {
  const { id } = useParams()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.get(`/api/subjects/${id}/topics`)
        if (!mounted) return
        setTopics(Array.isArray(res.data) ? res.data : [])
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Tópicos</h1>
        <p className="text-sm text-slate-500 mt-1">Selecione um tópico para ver os conteúdos.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {topics.map(t => (
          <div key={t.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-800">{t.name}</div>
            </div>
            <Link to={`/topics/${t.id}`} className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700">Abrir</Link>
          </div>
        ))}

        {topics.length === 0 && (
          <div className="col-span-full p-6 rounded bg-yellow-50 text-yellow-800">Nenhum tópico encontrado.</div>
        )}
      </div>
    </div>
  )
}
