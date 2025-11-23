import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { Link } from 'react-router-dom'

export default function VestibularesList() {
  const [vests, setVests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const res = await api.get('/api/vestibulares')
        setVests(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error(err)
        setError('Falha ao carregar vestibulares')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="p-6">Carregando...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Vestibulares</h1>
        <p className="text-sm text-gray-600 mt-1">Selecione um vestibular para ver matérias e tópicos.</p>
      </header>

      <div className="grid gap-4">
        {vests.map(v => (
          <article key={v.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-800">{v.name}</div>
            </div>
            <Link to={`/vestibulares/${v.id}`} className="px-3 py-1 bg-primary-600 text-white rounded">Abrir</Link>
          </article>
        ))}

        {vests.length === 0 && <div className="p-4 rounded bg-yellow-50 text-yellow-800">Nenhum vestibular registrado.</div>}
      </div>
    </div>
  )
}
