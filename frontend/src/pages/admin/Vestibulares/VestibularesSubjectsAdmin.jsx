// src/pages/admin/Vestibulares/VestibularesSubjectsAdmin.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../../services/api'

export default function VestibularesSubjectsAdmin() {
  const { vestId } = useParams()
  const [vestSubjects, setVestSubjects] = useState([])
  const [newSubjectName, setNewSubjectName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (vestId) loadVestSubjects(vestId)
  }, [vestId])

  async function loadVestSubjects(id) {
    setLoading(true)
    try {
      const res = await api.get(`/api/vestibulares/${id}/subjects`)
      setVestSubjects(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      setVestSubjects([])
      setError('Erro ao carregar matérias')
    } finally {
      setLoading(false)
    }
  }

  async function createAndLinkSubject(e) {
    e?.preventDefault()
    if (!vestId) return setError('Vestibular inválido')
    if (!newSubjectName || !newSubjectName.trim()) return setError('Nome da matéria é obrigatório')
    try {
      setError(null)
      await api.post(`/api/vestibulares/${vestId}/subjects`, { name: newSubjectName.trim() })
      setNewSubjectName('')
      await loadVestSubjects(vestId)
    } catch (err) {
      console.error(err)
      setError(err?.response?.data ?? 'Erro ao criar e vincular matéria')
    }
  }

  async function removeSubject(subjectId) {
    if (!confirm('Remover matéria do vestibular?')) return
    try {
      await api.delete(`/api/vestibulares/${vestId}/subjects/${subjectId}`)
      await loadVestSubjects(vestId)
    } catch (err) {
      console.error(err)
      setError('Erro ao remover matéria do vestibular')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Matérias do Vestibular</h2>

      <div className="mb-3">
        {loading && <div>Carregando...</div>}
        {error && <div className="text-red-600 mb-2">{String(error)}</div>}

        <ul className="space-y-2 mb-3">
          {vestSubjects.map(s => (
            <li key={s.id} className="flex justify-between items-center border p-2 rounded">
              <div>
                <div className="font-medium">{s.name}</div>
              </div>
              <div className="flex gap-2">
                {/* abrir tópicos desta matéria: usamos query param subjectId */}
                <Link to={`/admin/vestibulares/${vestId}/topics?subjectId=${s.id}`} className="px-2 py-1 bg-blue-600 text-white rounded">Abrir</Link>
                <button onClick={() => removeSubject(s.id)} className="px-2 py-1 bg-red-600 text-white rounded">Remover</button>
              </div>
            </li>
          ))}
          {vestSubjects.length === 0 && <li className="text-gray-500">Nenhuma matéria criada para este vestibular.</li>}
        </ul>
      </div>

      <form onSubmit={createAndLinkSubject} className="flex gap-2 items-center mb-2">
        <input value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="Criar nova matéria (somente criar)" className="border p-2 rounded flex-1" />
        <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded">Criar matéria</button>
      </form>
      <div className="text-xs text-gray-500">Ao criar a matéria ela será vinculada ao vestibular. Não há opção de vincular matérias existentes.</div>
    </div>
  )
}
