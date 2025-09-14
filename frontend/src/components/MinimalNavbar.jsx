// src/components/MinimalNavbar.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../hooks/useAuth'

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

  const logoUrl = 'https://camboriu.sc.gov.br/wp-content/uploads/2020/04/logo-horizontal-pref-camboriu.png'

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt="logo"
                className="h-8 sm:h-10 md:h-12 w-auto object-contain"
                loading="lazy"
                style={{ imageRendering: 'auto' }}
              />
            </Link>
          </div>

          {/* Desktop nav (mínimo) - 'Início' agora com caixa cinza igual ao botão Sair */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm inline-flex items-center px-3 py-1 bg-slate-100 text-slate-800 rounded-md hover:bg-slate-200 transition"
            >
              Início
            </Link>
          </nav>

          {/* Search (desktop only) */}
          <div className="hidden md:block md:flex-1 mx-8">
            <div className="relative">
              <input
                aria-label="Pesquisar"
                placeholder="Pesquisar série, matéria ou tópico..."
                className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <img src={user.picture} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                <span className="text-sm text-slate-700 hidden sm:inline">{user.name}</span>
                <button onClick={logout} className="text-sm px-3 py-1 rounded-md bg-slate-100">Sair</button>
              </div>
            ) : (
              <div className="hidden sm:block">
                <GoogleLogin
                  onSuccess={(res) => {
                    const jwt = res?.credential
                    if (!jwt) return
                    const profile = parseJwt(jwt)
                    if (profile) {
                      setUser({ name: profile.name, email: profile.email, picture: profile.picture })
                      setToken(jwt)
                    }
                  }}
                  onError={() => console.log('Login failed')}
                />
              </div>
            )}

            {/* mobile menu button */}
            <button
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden py-3">
            <nav className="flex flex-col gap-2">
              {/* Mobile: Início com caixa cinza também */}
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="px-3 py-2 inline-flex items-center bg-slate-100 text-slate-800 rounded-md hover:bg-slate-200 transition"
              >
                Início
              </Link>

              <div className="pt-2 border-t">
                {user ? (
                  <div className="flex items-center gap-2 px-3">
                    <img src={user.picture} alt="" className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <button onClick={() => { logout(); setOpen(false) }} className="text-xs px-2 py-1 bg-slate-100 rounded-md mt-0.5">Sair</button>
                    </div>
                  </div>
                ) : (
                  <div className="px-3">
                    <GoogleLogin
                      onSuccess={(res) => {
                        const jwt = res?.credential
                        if (!jwt) return
                        const profile = parseJwt(jwt)
                        if (profile) {
                          setUser({ name: profile.name, email: profile.email, picture: profile.picture })
                          setToken(jwt)
                          setOpen(false)
                        }
                      }}
                      onError={() => console.log('Login failed')}
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
