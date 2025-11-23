import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'
import HeroBanner from '../components/HeroBanner'
import SidebarCards from '../components/SidebarCards'
import { ChevronRight, Calendar } from 'lucide-react'

export default function Home() {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setVestLoading(true)
      try {
        const res = await api.get('/api/vestibulares')
        if (!mounted) return
        setVestibulares(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        if (!mounted) return
        setVestibulares([])
      } finally {
        if (mounted) setVestLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const seriesIcons = ['📚', '🎓', '📖', '✏️', '🔬', '🎨', '🌍', '💻', '🧮', '🏛️', '🎯', '🚀']

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <HeroBanner />

      {/* Main Content */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* grid with min-w-0 to avoid overflow from children */}
          <div className="grid lg:grid-cols-4 gap-8 min-w-0">
            
            {/* Content Area */}
            <div className="lg:col-span-3 space-y-12 min-w-0">
              
              {/* Séries Section */}
              <section id="series">
                <div className="mb-6">
                  <h2 className="text-3xl font-black text-white mb-1">Séries Educacionais</h2>
                  <p className="text-gray-400">Escolha sua série para começar</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/20 text-red-400 flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div className="font-semibold">Erro ao carregar</div>
                      <div className="text-sm mt-1">{error}</div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading && Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-800/50 rounded-xl h-40 border border-gray-700" />
                  ))}

                  {!loading && !error && series.length === 0 && (
                    <div className="col-span-full p-8 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-center">
                      <div className="text-5xl mb-3">📚</div>
                      <div className="text-yellow-400 font-black text-lg">Nenhuma série encontrada</div>
                      <p className="text-gray-400 text-sm mt-2">Aguarde enquanto adicionamos conteúdo.</p>
                    </div>
                  )}

                  {!loading && series.map((s, idx) => (
                    <Link
                      key={s.id}
                      to={`/series/${s.id}`}
                      className="group relative bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-700 hover:border-yellow-400 transition-all overflow-hidden min-w-0"
                    >
                      {/* Background subtle gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 pr-2 min-w-0">
                            <h3 className="text-base font-black text-white group-hover:text-yellow-400 transition-colors leading-tight truncate">
                              {s.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Matérias e conteúdos</p>
                          </div>
                          
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl shadow-md">
                            {seriesIcons[idx % seriesIcons.length]}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-700 flex items-center justify-between">
                          <span className="px-2.5 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded uppercase">
                            Ver Conteúdo
                          </span>
                          <ChevronRight className="w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Acessibilidade Banner */}
              <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border border-yellow-400/30">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-500/5 pointer-events-none" />
                
                <div className="relative p-4 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl md:text-3xl shadow-lg">
                    ♿
                  </div>
                  
                  <div className="flex-1 text-center md:text-left min-w-0">
                    <h3 className="text-lg md:text-xl font-black text-yellow-400 mb-1 truncate">
                      Recursos de Acessibilidade
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Materiais adaptados, guias de estudo e recursos especiais para alunos com necessidades específicas.
                    </p>
                  </div>

                  <Link
                    to="/auxilio"
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-black rounded-lg hover:scale-105 transition-all text-sm uppercase"
                  >
                    Acessar
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </section>

              {/* Vestibulares Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-white mb-2">Vestibulares</h2>
                    <p className="text-gray-400 text-sm">Prepare-se para os principais exames</p>
                  </div>
                  <Link 
                    to="/vestibulares" 
                    className="hidden sm:flex items-center gap-1 text-orange-400 hover:text-orange-300 font-semibold text-sm transition-colors"
                  >
                    Ver todos
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vestLoading && Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-800/50 rounded-xl h-24 border border-gray-700" />
                  ))}

                  {!vestLoading && vestibulares.length === 0 && (
                    <div className="col-span-full p-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
                      <div className="text-5xl mb-3">📝</div>
                      <div className="text-orange-400 font-black">Nenhum vestibular listado</div>
                    </div>
                  )}

                  {!vestLoading && vestibulares.map((v, idx) => (
                    <Link
                      key={v.id}
                      to={`/vestibulares/${v.id}`}
                      className="group bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-700 hover:border-orange-500 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xl shadow-md">
                          {idx === 0 ? '🎓' : '🏛️'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-white group-hover:text-orange-400 transition-colors text-base truncate">
                            {v.name}
                          </h3>
                          {v.date && (
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {v.date}
                            </p>
                          )}
                        </div>

                        <ChevronRight className="flex-shrink-0 w-5 h-5 text-orange-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 min-w-0">
              <div className="lg:sticky lg:top-24">
                <SidebarCards />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
