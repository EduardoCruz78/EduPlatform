// src/pages/admin/Vestibulares/VestibularesAdmin.jsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'

export default function VestibularesAdmin() {
  const { vestId } = useParams()

  if (!vestId) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-2">Painel de Vestibulares</h2>
        <div>Selecione um vestibular à esquerda para começar a gerenciar Matérias, Tópicos e Conteúdos.</div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Dashboard do Vestibular</h2>
      <div className="mb-4">Use as abas acima para gerenciar Matérias, Tópicos e Conteúdos do vestibular selecionado.</div>
      <div className="flex gap-2">
        <Link to={`/admin/vestibulares/${vestId}/subjects`} className="px-3 py-2 bg-blue-600 text-white rounded">Matérias</Link>
        <Link to={`/admin/vestibulares/${vestId}/topics`} className="px-3 py-2 bg-blue-600 text-white rounded">Tópicos</Link>
        <Link to={`/admin/vestibulares/${vestId}/contents`} className="px-3 py-2 bg-blue-600 text-white rounded">Conteúdos</Link>
      </div>
    </div>
  )
}
