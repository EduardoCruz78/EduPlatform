// === File: /frontend/src/App.jsx ===
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import SeriesPage from './pages/Series'
import SubjectPage from './pages/Subject'
import TopicPage from './pages/Topic'
import ContentPage from './pages/Content'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/series/:id" element={<SeriesPage />} />
          <Route path="/subjects/:id" element={<SubjectPage />} />
          <Route path="/topics/:id" element={<TopicPage />} />
          <Route path="/contents/:id" element={<ContentPage />} />
        </Routes>
      </main>
    </div>
  )
}
