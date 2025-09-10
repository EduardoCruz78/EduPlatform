import React from 'react'
import { Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../hooks/useAuth'

/**
 * parseJwt(token) - decodificador simples de JWT sem dependências externas.
 * Decodifica apenas o payload (útil para pegar name/email/picture).
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch (err) {
    console.error('parseJwt error', err)
    return null
  }
}

export default function Navbar() {
  const { user, setUser, setToken, logout } = useAuth()

  return (
    <nav className="bg-white shadow-sm">
      <div className="container flex items-center justify-between">
        <div className="py-4">
          <Link to="/" className="font-semibold text-lg text-gray-800">
            EduPlatform
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-gray-600">
            Home
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">{user.name}</span>
              <button onClick={logout} className="text-sm px-3 py-1 rounded bg-gray-100">
                Logout
              </button>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                const jwt = credentialResponse?.credential
                if (jwt) {
                  const profile = parseJwt(jwt)
                  if (profile) {
                    setUser({ name: profile.name, email: profile.email, picture: profile.picture })
                    setToken(jwt)
                  } else {
                    console.error('Failed to parse JWT payload')
                  }
                } else {
                  console.error('No credential returned from GoogleLogin')
                }
              }}
              onError={() => {
                console.log('Login Failed')
              }}
            />
          )}
        </div>
      </div>
    </nav>
  )
}
