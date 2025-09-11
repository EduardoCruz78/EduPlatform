import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <nav className="flex gap-4 mb-6">
        <Link to="/admin/series" className="text-blue-600">Séries</Link>
        <Link to="/admin/subjects" className="text-blue-600">Matérias</Link>
        <Link to="/admin/topics" className="text-blue-600">Tópicos</Link>
        <Link to="/admin/contents" className="text-blue-600">Conteúdos</Link>
      </nav>
      <Outlet />
    </div>
  )
}
