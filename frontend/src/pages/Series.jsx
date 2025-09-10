// === File: /frontend/src/pages/Series.jsx ===
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function SeriesPage() {
  const { id } = useParams()
  const [series, setSeries] = useState(null)
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.get(`/api/series/${id}`)
        if (!mounted) return
        setSeries(res.data)
      } catch (e) {
        console.error(e)
      }

      try {
        const res2 = await api.get(`/api/series/${id}/subjects`)
        if (!mounted) return
        setSubjects(res2.data)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => { mounted = false }
  }, [id])

  if (!series) return <div className="card">Loading...</div>

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-2">{series.name}</h1>
      <div className="grid gap-3">
        {subjects.map(sub => (
          <div key={sub.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{sub.name}</div>
            </div>
            <div>
              <Link to={`/subjects/${sub.id}`} className="px-3 py-1 bg-indigo-600 text-white rounded">Open</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}