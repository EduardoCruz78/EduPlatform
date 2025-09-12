// === File: /frontend/src/pages/Home.jsx ===
import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

export default function Home() {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.get('/api/series')
        if (!mounted) return
        setSeries(res.data)
      } catch (err) {
        if (err?.response) {
          setError(`Erro ${err.response.status}: ${err.response.data?.message || 'Erro no servidor'}`)
        } else if (err?.request) {
          setError('Nenhuma resposta do servidor. Verifique se o backend está rodando.')
        } else {
          setError(`Erro: ${err.message}`)
        }
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">DescompliqueOnline</h1>
        <p className="mt-2 text-slate-600">Aprenda com organização: séries, matérias, tópicos e conteúdos.</p>
      </header>

      <section className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Séries</h2>
        <div className="text-sm text-slate-500">{loading ? 'carregando...' : `${series.length} séries`}</div>
      </section>

      {error && (
        <div className="mb-4 p-4 rounded bg-red-50 text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg shadow p-6 h-28" />
        ))}

        {!loading && !error && series.length === 0 && (
          <div className="col-span-full p-6 rounded bg-yellow-50 text-yellow-800">Nenhuma série encontrada.</div>
        )}

        {!loading && series.map(s => (
          <Link key={s.id} to={`/series/${s.id}`} className="group block bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-800">{s.name}</div>
                <div className="mt-1 text-sm text-slate-500">Série ID: {s.id}</div>
              </div>

              <div className="ml-4 flex items-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold">{String(s.name).charAt(0)}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-slate-400">Clique para abrir a série</div>
              <div className="text-sm text-indigo-600 group-hover:underline">Abrir →</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}







