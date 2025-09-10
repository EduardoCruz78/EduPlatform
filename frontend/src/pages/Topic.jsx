// === File: /frontend/src/pages/Topic.jsx ===
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function TopicPage() {
  const { id } = useParams()
  const [contents, setContents] = useState([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.get(`/api/topics/${id}/contents`)
        if (!mounted) return
        setContents(res.data)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => { mounted = false }
  }, [id])

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Contents</h1>
      <div className="grid gap-3">
        {contents.map(c => (
          <div key={c.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{c.title}</div>
              <div className="text-sm text-gray-500">{c.type}</div>
            </div>
            <Link to={`/contents/${c.id}`} className="px-3 py-1 bg-indigo-600 text-white rounded">Open</Link>
          </div>
        ))}
      </div>
    </section>
  )
}