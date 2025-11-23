import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

export default function VestibularPage() {
  const { id } = useParams()
  const [vest, setVest] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const [vRes, sRes] = await Promise.all([
          api.get(`/api/vestibulares/${id}`),
          api.get(`/api/vestibulares/${id}/subjects`)
        ])
        if (!mounted) return
        setVest(vRes.data)
        setSubjects(Array.isArray(sRes.data) ? sRes.data : [])
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar vestibular')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="p-6">Carregando...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!vest) return <div className="p-6">Vestibular não encontrado.</div>

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{vest.name}</h1>
        <p className="text-sm text-slate-500 mt-1">Matérias e tópicos disponíveis</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subjects.map(sub => (
          <div key={sub.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800">{sub.name}</div>
                <div className="text-sm text-slate-500 mt-1">Série: {sub.series?.name ?? '—'}</div>
              </div>
              <Link to={`/subjects/${sub.id}`} className="px-3 py-1 bg-primary-600 text-white rounded">Abrir</Link>
            </div>
            {/* Optionally: fetch topics here or leave link to subject page */}
          </div>
        ))}
        {subjects.length === 0 && <div className="col-span-full p-6 rounded bg-yellow-50 text-yellow-800">Nenhuma matéria vinculada a este vestibular.</div>}
      </div>
    </div>
  )
}
