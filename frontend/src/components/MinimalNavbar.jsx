import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../hooks/useAuth'
import { Menu, X, Search, BookOpen } from 'lucide-react'

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export default function MinimalNavbar() {
  const { user, setUser, setToken, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path) => location.pathname === path

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900/98 backdrop-blur-md shadow-xl border-b border-gray-800' : 'bg-gray-900/90 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-gray-900" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black text-white hidden sm:block">Missão</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link 
              to="/" 
              className={`px-3.5 py-2 rounded-lg font-bold text-sm transition-all ${isActive('/') ? 'bg-yellow-400 text-gray-900' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              Início
            </Link>
            <Link 
              to="/vestibulares" 
              className={`px-3.5 py-2 rounded-lg font-bold text-sm transition-all ${isActive('/vestibulares') ? 'bg-yellow-400 text-gray-900' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              Vestibulares
            </Link>
            <Link 
              to="/auxilio" 
              className={`px-3.5 py-2 rounded-lg font-bold text-sm transition-all ${isActive('/auxilio') ? 'bg-yellow-400 text-gray-900' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              Acessibilidade
            </Link>
          </nav>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-sm mx-0 md:mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                aria-label="Pesquisar"
                placeholder="Buscar séries, matérias, tópicos..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="hidden md:flex items-center gap-2.5">
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
                  <img 
                    src={user.picture} 
                    alt="avatar" 
                    className="h-7 w-7 rounded-full object-cover ring-2 ring-yellow-400" 
                  />
                  <div className="hidden lg:block">
                    <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                    <div className="text-xs text-gray-500 leading-tight">Estudante</div>
                  </div>
                </div>
                <button 
                  onClick={logout} 
                  className="px-3.5 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-all"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="hidden md:block">
                <GoogleLogin
                  onSuccess={(res) => {
                    const jwt = res?.credential
                    if (!jwt) return
                    const profile = parseJwt(jwt)
                    if (profile) {
                      setUser({
                        name: profile.name,
                        email: profile.email,
                        picture: profile.picture
                      })
                      setToken(jwt)
                    }
                  }}
                  onError={() => console.log('Login failed')}
                  theme="filled_black"
                  size="medium"
                  shape="pill"
                />
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              aria-label="Menu"
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {open ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="lg:hidden py-3 border-t border-gray-800">
            <nav className="flex flex-col gap-1.5">
              {/* Mobile Search */}
              <div className="mb-2 px-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    aria-label="Pesquisar"
                    placeholder="Buscar..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-700 focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <Link
                to="/"
                onClick={() => setOpen(false)}
                className={`mx-2 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all ${isActive('/') ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                🏠 Início
              </Link>
              
              <Link
                to="/vestibulares"
                onClick={() => setOpen(false)}
                className={`mx-2 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all ${isActive('/vestibulares') ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                📚 Vestibulares
              </Link>

              <Link
                to="/auxilio"
                onClick={() => setOpen(false)}
                className={`mx-2 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all ${isActive('/auxilio') ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                ♿ Acessibilidade
              </Link>
              
              <div className="mt-2 pt-2.5 border-t border-gray-800 mx-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
                      <img 
                        src={user.picture} 
                        alt="" 
                        className="w-8 h-8 rounded-full ring-2 ring-yellow-400" 
                      />
                      <div>
                        <div className="text-sm font-semibold text-white">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        setOpen(false)
                      }}
                      className="w-full px-3.5 py-2.5 bg-gray-800 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-all"
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <div>
                    <GoogleLogin
                      onSuccess={(res) => {
                        const jwt = res?.credential
                        if (!jwt) return
                        const profile = parseJwt(jwt)
                        if (profile) {
                          setUser({
                            name: profile.name,
                            email: profile.email,
                            picture: profile.picture
                          })
                          setToken(jwt)
                          setOpen(false)
                        }
                      }}
                      onError={() => console.log('Login failed')}
                      width="100%"
                    />
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
