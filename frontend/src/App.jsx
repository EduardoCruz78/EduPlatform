// === File: /frontend/src/App.jsx ===
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import SeriesPage from './pages/Series'
import SubjectPage from './pages/Subject'
import TopicPage from './pages/Topic'
import ContentPage from './pages/Content'

// Admin
import AdminLayout from './pages/admin/AdminLayout'
import SeriesAdmin from './pages/admin/SeriesAdmin'
import SubjectsAdmin from './pages/admin/SubjectsAdmin'
import TopicsAdmin from './pages/admin/TopicsAdmin'
import ContentsAdmin from './pages/admin/ContentsAdmin'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto p-4">
        <Routes>
          {/* Rotas existentes */}
          <Route path="/" element={<Home />} />
          <Route path="/series/:id" element={<SeriesPage />} />
          <Route path="/subjects/:id" element={<SubjectPage />} />
          <Route path="/topics/:id" element={<TopicPage />} />
          <Route path="/contents/:id" element={<ContentPage />} />

          {/* Rotas de Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="series" element={<SeriesAdmin />} />
            <Route path="subjects" element={<SubjectsAdmin />} />
            <Route path="topics" element={<TopicsAdmin />} />
            <Route path="contents" element={<ContentsAdmin />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}
