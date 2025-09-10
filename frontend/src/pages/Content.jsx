import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function ContentPage() {
  const { id } = useParams()
  const [content, setContent] = useState(null)
  const [marked, setMarked] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.get(`/api/contents/${id}`)
        if (!mounted) return
        setContent(res.data)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => { mounted = false }
  }, [id])

  async function toggleMark() {
    try {
      if (!marked) {
        await api.post('/api/checklist', { contentId: Number(id) })
        setMarked(true)
      } else {
        await api.delete(`/api/checklist/${id}`)
        setMarked(false)
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (!content) return <div className="card">Loading...</div>

  return (
    <section>
      <div className="card">
        <h1 className="text-2xl font-semibold mb-2">{content.title}</h1>
        <div className="mb-4 text-sm text-gray-600">Type: {content.type}</div>
        <div className="mb-4">
          <a href={content.link} target="_blank" rel="noreferrer" className="text-indigo-600">Open resource</a>
        </div>
        <div>
          <button onClick={toggleMark} className="px-4 py-2 rounded bg-indigo-600 text-white">
            {marked ? 'Unmark as completed' : 'Mark as completed'}
          </button>
        </div>
      </div>
    </section>
  )
}