import React from 'react'
import MinimalNavbar from './MinimalNavbar'

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 w-full overflow-x-hidden">
      <MinimalNavbar />
      <main className="pt-16 w-full">
        {children}
      </main>
      <footer className="w-full border-t border-gray-800 mt-12 md:mt-16 py-6 md:py-8 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm md:text-base">
            © {new Date().getFullYear()}{' '}
            <span className="font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Missão
            </span>
            {' '}— Plataforma Educacional
          </p>
        </div>
      </footer>
    </div>
  )
}
