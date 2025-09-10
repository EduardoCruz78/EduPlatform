// === File: /frontend/src/services/api.js ===
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5016'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// attach token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('edu_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
