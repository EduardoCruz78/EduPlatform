// === File: /frontend/src/pages/Subject.jsx ===
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function SubjectPage() {
  const { id } = useParams()
  const [topics, setTopics] = useState([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.get(`/api/subjects/${id}/topics`)
        if (!mounted) return
        setTopics(res.data)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => { mounted = false }
  }, [id])

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Topics</h1>
      <div className="grid gap-3">
        {topics.map(t => (
          <div key={t.id} className="card flex items-center justify-between">
            <div>{t.name}</div>
            <Link to={`/topics/${t.id}`} className="px-3 py-1 bg-indigo-600 text-white rounded">Open</Link>
          </div>
        ))}
      </div>
    </section>
  )
}