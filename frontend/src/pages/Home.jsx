// src/pages/Home.jsx
import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

export default function Home() {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // vestibulares
  const [vestibulares, setVestibulares] = useState([])
  const [vestLoading, setVestLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.get('/api/series')
        if (!mounted) return
        setSeries(res.data)
      } catch (err) {
        if (err?.response) {
          setError(`Erro ${err.response.status}: ${err.response.data?.message || 'Erro no servidor'}`)
        } else if (err?.request) {
          setError('Nenhuma resposta do servidor. Verifique se o backend está rodando.')
        } else {
          setError(`Erro: ${err.message}`)
        }
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setVestLoading(true)
      try {
        // tenta buscar do backend; se endpoint não existir, usamos fallback
        const res = await api.get('/api/vestibulares')
        if (!mounted) return
        setVestibulares(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        // fallback estático (você pode editar)
        if (!mounted) return
        setVestibulares([
          { id: 'enem', name: 'ENEM - Exame Nacional do Ensino Médio', date: 'Consultas por edição' },
          { id: 'vest-univ', name: 'Vestibular Prefeitura (simulado local)', date: 'Inscrições abertas' }
        ])
      } finally {
        if (mounted) setVestLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="px-4 py-10 max-w-6xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">DescompliqueOnline</h1>
        <p className="mt-2 text-slate-600">Aprenda com organização: séries, matérias, tópicos e conteúdos.</p>
      </header>

      <section className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Séries</h2>
      </section>

      {error && (
        <div className="mb-4 p-4 rounded bg-red-50 text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg shadow p-6 h-28" />
        ))}

        {!loading && !error && series.length === 0 && (
          <div className="col-span-full p-6 rounded bg-yellow-50 text-yellow-800">Nenhuma série encontrada.</div>
        )}

        {!loading && series.map(s => (
          <Link
            key={s.id}
            to={`/series/${s.id}`}
            className="group block bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-5 focus:outline-none focus:ring-2 focus:ring-primary-100"
            aria-label={`Abrir série ${s.name}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-800">{s.name}</div>
              </div>

              <div className="ml-4 flex items-center">
                <span
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 text-white font-bold"
                  aria-hidden
                >
                  {String(s.name).charAt(0)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              {/* Caixa cinza 'Abrir' (visual parecido com o botão 'Sair') */}
              <div className="text-sm">
                <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-800 rounded-md border border-transparent hover:bg-slate-200 transition">
                  Abrir
                </span>
              </div>

              {/* indicador à direita (opcional) */}
              <div className="text-sm text-primary-600 opacity-0 group-hover:opacity-100 transition">→</div>
            </div>
          </Link>
        ))}
      </div>

      {/* === Acessibilidade / Auxílio - colocado aqui entre Séries e Vestibulares === */}
      <section className="mt-8 mb-8">
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Auxílio para necessidades especiais</h3>
            <p className="mt-1 text-sm text-slate-600 max-w-xl">Recursos, adaptações e materiais para usuários com necessidades de acessibilidade. Contém instruções de leitura, navegação por teclado e materiais de guia de estudos para alunos e pais de alunos com necessidades especiais.</p>
          </div>

          <div className="flex-shrink-0">
            <Link
              to="/auxilio"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-100"
              aria-label="Abrir seção de auxilio e acessibilidade"
            >
              Acessibilidade — ver opções
            </Link>
          </div>
        </div>
      </section>

      {/* Vestibulares section */}
      <section className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Vestibulares</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vestLoading && Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow p-6 h-24" />
          ))}

          {!vestLoading && vestibulares.length === 0 && (
            <div className="col-span-full p-4 rounded bg-yellow-50 text-yellow-800">Nenhum vestibular listado.</div>
          )}

          {!vestLoading && vestibulares.map(v => (
            <article key={v.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800">{v.name}</div>
                {v.date && <div className="text-sm text-slate-500 mt-1">{v.date}</div>}
              </div>
              <div className="flex gap-2">
                {/* botão abrir — pode apontar para página de detalhes quando criar */}
                <a href={v.url || '#'} className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700">Detalhes</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
