// src/pages/admin/Vestibulares/VestibularesAdminLayout.jsx
import React, { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom'
import api from '../../../services/api'

export default function VestibularesAdminLayout() {
  const [vestibulares, setVestibulares] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const params = useParams()

  useEffect(() => {
    loadVestibulares()
  }, [])

  useEffect(() => {
    if (!params?.vestId) return
    const id = Number(params.vestId)
    const found = vestibulares.find(v => Number(v.id) === id)
    if (found) {
      setSelected(found)
    } else {
      ;(async () => {
        try {
          const res = await api.get(`/api/vestibulares/${id}`)
          setSelected(res.data)
        } catch (err) {
          console.error(err)
          setSelected(null)
        }
      })()
    }
  }, [params?.vestId, vestibulares])

  async function loadVestibulares() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/vestibulares')
      setVestibulares(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar vestibulares')
    } finally {
      setLoading(false)
    }
  }

  function openVest(v) {
    setSelected(v)
    navigate(`/admin/vestibulares/${v.id}/subjects`)
  }

  function handleCreateNew() {
    navigate('/admin/vestibulares/new')
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Vestibular Admin Dashboard</h1>
        <div>
          <Link to="/admin" className="text-sm text-blue-600 underline mr-4">Voltar ao Admin</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <aside className="col-span-1 bg-white border rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="font-medium">Vestibulares</div>
            <button onClick={handleCreateNew} className="text-sm px-2 py-1 bg-indigo-600 text-white rounded">Novo</button>
          </div>

          {loading && <div className="text-sm text-gray-500">Carregando...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}

          <ul className="space-y-2 max-h-[60vh] overflow-auto">
            {vestibulares.map(v => (
              <li key={v.id} className={`p-2 border rounded ${selected?.id === v.id ? 'bg-indigo-50' : 'bg-white'}`}>
                <div className="flex justify-between items-center">
                  <div className="cursor-pointer" onClick={() => openVest(v)}>
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-gray-500">ID: {v.id}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => openVest(v)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Abrir</button>
                    <Link to={`/admin/vestibulares/${v.id}/edit`} className="px-2 py-1 bg-gray-200 rounded text-xs text-center">Editar</Link>
                  </div>
                </div>
              </li>
            ))}
            {vestibulares.length === 0 && !loading && <li className="text-sm text-gray-500 p-2">Nenhum vestibular cadastrado.</li>}
          </ul>
        </aside>

        <main className="col-span-3">
          {!selected && (
            <div className="bg-white border rounded p-6">
              <div className="text-gray-600">Abra um vestibular à esquerda para ver o dashboard (Matérias / Tópicos / Conteúdos).</div>
            </div>
          )}

          {selected && (
            <div className="bg-white border rounded">
              <header className="p-4 border-b flex items-center justify-between">
                <div>
                  <div className="text-xl font-semibold">{selected.name}</div>
                  <div className="text-sm text-gray-500">ID: {selected.id}</div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/admin/vestibulares/${selected.id}/subjects`} className="px-3 py-1 rounded bg-gray-100">Dashboard</Link>
                  <Link to={`/admin/vestibulares/${selected.id}/edit`} className="px-3 py-1 rounded bg-gray-100">Editar</Link>
                </div>
              </header>

              <nav className="p-3 border-b flex gap-3">
                <Link to={`/admin/vestibulares/${selected.id}/subjects`} className="text-blue-600">Matérias</Link>
                <Link to={`/admin/vestibulares/${selected.id}/topics`} className="text-blue-600">Tópicos</Link>
                <Link to={`/admin/vestibulares/${selected.id}/contents`} className="text-blue-600">Conteúdos</Link>
              </nav>

              <div className="p-4">
                <Outlet />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
