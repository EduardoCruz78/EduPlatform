// src/pages/Series/Subject.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import { ChevronRight, FileText } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl h-24 border border-gray-700"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-sm font-bold text-orange-400 mb-4">
            <FileText className="w-4 h-4" />
            Matéria
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Tópicos</h1>
          <p className="text-gray-400 text-lg">Selecione um tópico para ver os conteúdos.</p>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {topics.map(t => (
            <div key={t.id} className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-black text-white text-lg group-hover:text-orange-400 transition-colors">
                    {t.name}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Clique para ver os conteúdos deste tópico</p>
                </div>
                <Link 
                  to={`/topics/${t.id}`} 
                  className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-lg font-bold hover:scale-105 transition-all flex items-center gap-2"
                >
                  Abrir
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}

          {topics.length === 0 && (
            <div className="p-8 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-center">
              <div className="text-5xl mb-3">📖</div>
              <div className="text-orange-400 font-black text-lg">Nenhum tópico encontrado.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}