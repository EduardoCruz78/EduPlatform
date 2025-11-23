// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/MinimalNavbar'
import Home from './pages/Home'

// páginas de series
import SeriesPage from './pages/Series/Series'
import SubjectPage from './pages/Series/Subject'
import TopicPage from './pages/Series/Topic'

// vestibulares públicos
import VestibularesList from './pages/Vestibulares/Vestibulares'
import VestibularPage from './pages/Vestibulares/VestibularPage'

// Admin geral (mantém AdminLayout)
import AdminLayout from './pages/admin/AdminLayout'
import SeriesAdmin from './pages/admin/Series/SeriesAdmin'
import SubjectsAdmin from './pages/admin/Series/SubjectsAdmin'
import TopicsAdmin from './pages/admin/Series/TopicsAdmin'
import ContentsAdmin from './pages/admin/Series/ContentsAdmin'
import AccessibilityAdmin from './pages/admin/Accessibility/AccessibilityAdmin'

// Vestibulares admin — layout próprio e subpages
import VestibularesAdminLayout from './pages/admin/Vestibulares/VestibularesAdminLayout'
import VestibularesAdmin from './pages/admin/Vestibulares/VestibularesAdmin'
import VestibularesSubjectsAdmin from './pages/admin/Vestibulares/VestibularesSubjectsAdmin'
import VestibularesTopicsAdmin from './pages/admin/Vestibulares/VestibularesTopicsAdmin'
import VestibularesContentsAdmin from './pages/admin/Vestibulares/VestibularesContentsAdmin'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 overflow-x-hidden">
      <Navbar />
      
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/series/:id" element={<SeriesPage />} />
          <Route path="/subjects/:id" element={<SubjectPage />} />
          <Route path="/topics/:id" element={<TopicPage />} />
          <Route path="/vestibulares" element={<VestibularesList />} />
          <Route path="/vestibulares/:id" element={<VestibularPage />} />

          {/* Admin geral */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="series" element={<SeriesAdmin />} />
            <Route path="subjects" element={<SubjectsAdmin />} />
            <Route path="topics" element={<TopicsAdmin />} />
            <Route path="contents" element={<ContentsAdmin />} />
            <Route path="accessibility" element={<AccessibilityAdmin />} />
            {/* observação: NÃO colocamos vestibulares aqui */}
          </Route>

          {/* Admin — Vestibulares (layout próprio, rota separada) */}
          <Route path="/admin/vestibulares/*" element={<VestibularesAdminLayout />}>
            <Route index element={<VestibularesAdmin />} />
            <Route path="new" element={<VestibularesAdmin />} />
            <Route path=":vestId/subjects" element={<VestibularesSubjectsAdmin />} />
            <Route path=":vestId/topics" element={<VestibularesTopicsAdmin />} />
            <Route path=":vestId/contents" element={<VestibularesContentsAdmin />} />
            <Route path=":vestId/edit" element={<VestibularesAdmin />} />
          </Route>
        </Routes>
      
    </div>
  )
}
