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
        if (err.response) {
          // Erro vindo do servidor
          setError(`Erro ${err.response.status}: ${err.response.data?.message || 'Erro interno no servidor'}`)
        } else if (err.request) {
          // Erro na requisição mas sem resposta
          setError('Nenhuma resposta do servidor. Verifique se o backend está rodando.')
        } else {
          // Erro inesperado no Axios ou JS
          setError(`Erro: ${err.message}`)
        }
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Series (school years)</h1>
      <div className="grid grid-cols-1 gap-4">
        {loading && <div className="card">Loading...</div>}
        {error && <div className="card bg-red-100 text-red-700 p-3 rounded">{error}</div>}
        {!loading && !error && series.length === 0 && <div className="card">No series found.</div>}
        {!loading && !error && series.map(s => (
          <div key={s.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-sm text-gray-500">Series ID: {s.id}</div>
            </div>
            <div>
              <Link to={`/series/${s.id}`} className="px-3 py-1 bg-indigo-600 text-white rounded">Open</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
