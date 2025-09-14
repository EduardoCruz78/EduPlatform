// src/pages/Series.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function SeriesPage() {
  const { id } = useParams()
  const [series, setSeries] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const [sRes, subRes] = await Promise.all([
          api.get(`/api/series/${id}`),
          api.get(`/api/series/${id}/subjects`)
        ])
        if (!mounted) return
        setSeries(sRes.data)
        setSubjects(Array.isArray(subRes.data) ? subRes.data : [])
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="p-6">Carregando...</div>
  if (!series) return <div className="p-6">Série não encontrada.</div>

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{series.name}</h1>
        <p className="text-sm text-slate-500 mt-1">Matérias disponíveis</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subjects.map(sub => (
          <div key={sub.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-800">{sub.name}</div>
            </div>
            <Link to={`/subjects/${sub.id}`} className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700">Abrir</Link>
          </div>
        ))}

        {subjects.length === 0 && (
          <div className="col-span-full p-6 rounded bg-yellow-50 text-yellow-800">Nenhuma matéria nessa série.</div>
        )}
      </div>
    </div>
  )
}
