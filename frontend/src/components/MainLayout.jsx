// === File: /frontend/src/components/MainLayout.jsx ===
import React from 'react'
import MinimalNavbar from './MinimalNavbar'

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-slate-500">© {new Date().getFullYear()} EduPlatform — Design minimal</div>
      </footer>
    </div>
  )
}