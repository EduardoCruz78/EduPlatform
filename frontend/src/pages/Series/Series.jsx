// src/pages/Series/Series.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import { ChevronRight, BookOpen } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="animate-pulse bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl h-24 border border-gray-700"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl h-32 border border-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 p-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-5xl mb-4">🔍</div>
          <div className="text-xl font-bold text-white">Série não encontrada.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-sm font-bold text-yellow-400 mb-4">
            <BookOpen className="w-4 h-4" />
            Série Educacional
          </div>
          <h1 className="text-4xl font-black text-white mb-3">{series.name}</h1>
          <p className="text-gray-400 text-lg">Matérias disponíveis nesta série</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {subjects.map(sub => (
            <div key={sub.id} className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/10 hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-black text-white text-lg group-hover:text-yellow-400 transition-colors">
                    {sub.name}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Clique para ver os tópicos</p>
                </div>
                <Link 
                  to={`/subjects/${sub.id}`} 
                  className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:scale-105 transition-all flex items-center gap-2"
                >
                  Abrir
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}

          {subjects.length === 0 && (
            <div className="col-span-full p-8 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-center">
              <div className="text-5xl mb-3">📚</div>
              <div className="text-yellow-400 font-black text-lg">Nenhuma matéria nessa série.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}