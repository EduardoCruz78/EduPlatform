// === File: /frontend/src/components/HeroBanner.jsx ===
import React from 'react'

export default function HeroBanner({ title = 'Aprenda com organização', subtitle = 'Conteúdos curtos, objetivos e direcionados por série, matéria e tópico.' }) {
  return (
    <section className="bg-gradient-to-r from-white to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8 md:flex md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">{title}</h1>
            <p className="mt-2 text-slate-600">{subtitle}</p>
            <div className="mt-4 flex gap-3">
              <a href="#series" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700">Ver séries</a>
              <a href="/admin" className="inline-block px-4 py-2 border rounded-md text-sm text-slate-700">Entrar (professor)</a>
            </div>
          </div>

          <div className="hidden md:block md:w-1/3">
            <div className="w-full h-40 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">Imagem / destaque</div>
          </div>
        </div>
      </div>
    </section>
  )
}