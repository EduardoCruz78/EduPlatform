// src/pages/admin/Vestibulares/VestibularesContentsAdmin.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import api from '../../../services/api'

export default function VestibularesContentsAdmin() {
  const { vestId } = useParams()
  const [searchParams] = useSearchParams()
  const topicIdFromQuery = searchParams.get('topicId') || ''

  const [vestContents, setVestContents] = useState([])
  const [newVestContent, setNewVestContent] = useState({ title: '', type: 'Exercise', link: '', pdfUrl: '' })
  const [newGlobalTitle, setNewGlobalTitle] = useState('')
  const [newGlobalType, setNewGlobalType] = useState('Video')
  const [newGlobalLink, setNewGlobalLink] = useState('')
  const [newGlobalPdf, setNewGlobalPdf] = useState('')
  const [shareContentId, setShareContentId] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (vestId) loadVestContents(vestId)
  }, [vestId])

  async function loadVestContents(id) {
    setLoading(true)
    try {
      const res = await api.get(`/api/vestibulares/${id}/contents`)
      setVestContents(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      setVestContents([])
    } finally {
      setLoading(false)
    }
  }

  // criar conteúdo exclusivo do vestibular (já existente)
  async function createVestContent(e) {
    e?.preventDefault()
    setError(null)
    if (!vestId) return setError('Vestibular inválido')
    if (!newVestContent.title || !newVestContent.title.trim()) return setError('Título obrigatório')
    try {
      await api.post(`/api/vestibulares/${vestId}/contents`, {
        title: newVestContent.title,
        type: newVestContent.type,
        link: newVestContent.link || null,
        pdfUrl: newVestContent.pdfUrl || null
      })
      setNewVestContent({ title: '', type: 'Exercise', link: '', pdfUrl: '' })
      await loadVestContents(vestId)
    } catch (err) {
      console.error(err)
      setError('Erro ao criar conteúdo do vestibular')
    }
  }

  // compartilhar conteúdo global por id (já existente)
  async function shareExistingContent(e) {
    e?.preventDefault()
    setError(null)
    if (!vestId) return setError('Vestibular inválido')
    const contentId = Number(shareContentId)
    if (!contentId || isNaN(contentId) || contentId <= 0) return setError('ContentId inválido')
    try {
      await api.post(`/api/vestibulares/${vestId}/shared-contents`, { contentId })
      setShareContentId('')
      await loadVestContents(vestId)
    } catch (err) {
      console.error(err)
      setError(err?.response?.data ?? 'Erro ao compartilhar conteúdo')
    }
  }

  // se houver topicId na query: criar conteúdo GLOBAL vinculado ao tópico e já compartilhar no vestibular
  async function createGlobalContentAndShare(e) {
    e?.preventDefault()
    setError(null)
    if (!vestId) return setError('Vestibular inválido')
    const topicId = Number(topicIdFromQuery)
    if (!topicId || isNaN(topicId) || topicId <= 0) return setError('topicId inválido na query')
    if (!newGlobalTitle || !newGlobalTitle.trim()) return setError('Título do conteúdo é obrigatório')
    try {
      // criar conteúdo global (topicId)
      const createRes = await api.post('/api/contents', {
        Title: newGlobalTitle,
        Type: newGlobalType,
        Link: newGlobalType === 'Video' ? (newGlobalLink || null) : null,
        PdfUrl: (newGlobalType === 'Exercise' || newGlobalType === 'Simulated') ? (newGlobalPdf || null) : null,
        TopicId: topicId
      })
      const createdId = createRes.data?.id ?? createRes.data?.Id ?? createRes.data
      // compartilhar no vestibular
      await api.post(`/api/vestibulares/${vestId}/shared-contents`, { contentId: createdId })
      // reset
      setNewGlobalTitle('')
      setNewGlobalType('Video')
      setNewGlobalLink('')
      setNewGlobalPdf('')
      await loadVestContents(vestId)
    } catch (err) {
      console.error(err)
      setError('Erro ao criar conteúdo global e compartilhar no vestibular')
    }
  }

  async function deleteVestContent(contentId) {
    if (!confirm('Excluir conteúdo do vestibular?')) return
    try {
      await api.delete(`/api/vestibulares/${vestId}/contents/${contentId}`)
      await loadVestContents(vestId)
    } catch (err) {
      console.error(err)
      setError('Erro ao excluir conteúdo')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Conteúdos do Vestibular</h2>

      {/* Se veio topicId, mostramos o formulário rápido para criar conteúdo global ligado ao tópico e já compartilhar */}
      {topicIdFromQuery && (
        <div className="mb-6 border p-4 rounded bg-gray-50">
          <div className="mb-2 font-medium">Adicionar conteúdo ao tópico (ID: {topicIdFromQuery})</div>
          <form onSubmit={createGlobalContentAndShare} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
            <input value={newGlobalTitle} onChange={e => setNewGlobalTitle(e.target.value)} placeholder="Título do conteúdo (global)" className="border p-2 rounded md:col-span-2" />
            <select value={newGlobalType} onChange={e => setNewGlobalType(e.target.value)} className="border p-2 rounded">
              <option value="Video">Video</option>
              <option value="Exercise">Exercise</option>
              <option value="Simulated">Simulated</option>
            </select>
            <input value={newGlobalLink} onChange={e => setNewGlobalLink(e.target.value)} placeholder="Link (opcional)" className="border p-2 rounded md:col-span-2" />
            <input value={newGlobalPdf} onChange={e => setNewGlobalPdf(e.target.value)} placeholder="PDF (opcional)" className="border p-2 rounded" />
            <div className="md:col-span-3">
              <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded">Criar conteúdo (global) e compartilhar no vestibular</button>
            </div>
          </form>
        </div>
      )}

      {/* Criar conteúdo exclusivo do vestibular */}
      <form onSubmit={createVestContent} className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
        <input value={newVestContent.title} onChange={e => setNewVestContent({ ...newVestContent, title: e.target.value })} placeholder="Título do conteúdo (somente vestibular)" className="border p-2 rounded md:col-span-2" />
        <select value={newVestContent.type} onChange={e => setNewVestContent({ ...newVestContent, type: e.target.value })} className="border p-2 rounded">
          <option value="Video">Video</option>
          <option value="Exercise">Exercise</option>
          <option value="Simulated">Simulated</option>
        </select>
        <input value={newVestContent.link} onChange={e => setNewVestContent({ ...newVestContent, link: e.target.value })} placeholder="Link (opcional)" className="border p-2 rounded md:col-span-2" />
        <input value={newVestContent.pdfUrl} onChange={e => setNewVestContent({ ...newVestContent, pdfUrl: e.target.value })} placeholder="PDF (opcional)" className="border p-2 rounded" />
        <div className="md:col-span-3">
          <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded">Adicionar conteúdo ao vestibular</button>
        </div>
      </form>

      {/* Compartilhar conteúdo existente por id */}
      <form onSubmit={shareExistingContent} className="mb-4 flex gap-2 items-center">
        <input placeholder="ID do conteúdo global para compartilhar" value={shareContentId} onChange={e => setShareContentId(e.target.value)} className="border p-2 rounded" />
        <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded">Compartilhar conteúdo existente</button>
      </form>

      {error && <div className="mb-3 text-red-600">{String(error)}</div>}

      <div>
        <ul className="space-y-2">
          {vestContents.map(c => (
            <li key={c.id} className="flex justify-between items-center border p-2 rounded">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-gray-500">{c.type} {c.isShared ? '— (compartilhado)' : ''}</div>
              </div>
              <div className="flex gap-2">
                {c.link && <a href={c.link} target="_blank" rel="noreferrer" className="px-2 py-1 bg-blue-600 text-white rounded">Abrir</a>}
                {c.pdfUrl && <a href={c.pdfUrl} target="_blank" rel="noreferrer" className="px-2 py-1 bg-slate-700 text-white rounded">PDF</a>}
                <button onClick={() => deleteVestContent(c.id)} className="px-2 py-1 bg-red-600 text-white rounded">Excluir</button>
              </div>
            </li>
          ))}
          {vestContents.length === 0 && <li className="text-gray-500">Nenhum conteúdo no vestibular.</li>}
        </ul>
      </div>
    </div>
  )
}
