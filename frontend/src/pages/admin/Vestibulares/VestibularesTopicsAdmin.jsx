// src/pages/admin/Vestibulares/VestibularesTopicsAdmin.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import api from '../../../services/api'

export default function VestibularesTopicsAdmin() {
  const { vestId } = useParams()
  const [searchParams] = useSearchParams()
  const subjectIdFromQuery = searchParams.get('subjectId') || ''

  const [vestSubjects, setVestSubjects] = useState([])            // matérias vinculadas ao vestibular
  const [openedSubjectId, setOpenedSubjectId] = useState(subjectIdFromQuery)
  const [subjectTopics, setSubjectTopics] = useState([])          // tópicos DA matéria do vestibular

  const [globalSubjects, setGlobalSubjects] = useState([])        // matérias do sistema (fonte)
  const [sourceTopicsForCopy, setSourceTopicsForCopy] = useState([])
  const [copySourceSubjectId, setCopySourceSubjectId] = useState('')

  const [newTopicName, setNewTopicName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [opLoading, setOpLoading] = useState(false)

  useEffect(() => { if (vestId) loadVestSubjects(vestId) }, [vestId])
  useEffect(() => { loadGlobalSubjects() }, [])

  useEffect(() => {
    if (openedSubjectId) loadTopicsForSubject(openedSubjectId)
    else setSubjectTopics([])
  }, [openedSubjectId])

  // --- loaders ---
  async function loadVestSubjects(id) {
    try {
      const res = await api.get(`/api/vestibulares/${id}/subjects`)
      setVestSubjects(Array.isArray(res.data) ? res.data : [])
      // auto-open query subjectId se aplicável
      if (subjectIdFromQuery && !openedSubjectId) {
        const found = (res.data || []).find(s => String(s.id) === String(subjectIdFromQuery))
        if (found) setOpenedSubjectId(String(found.id))
      }
    } catch (err) {
      console.error(err)
      setVestSubjects([])
      setError('Erro ao carregar matérias do vestibular')
    }
  }

  async function loadGlobalSubjects() {
    try {
      const res = await api.get('/api/subjects')
      setGlobalSubjects(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      setGlobalSubjects([])
    }
  }

  // tenta endpoint vestib-specific primeiro; se 404, usa global
  async function loadTopicsForSubject(subjId) {
    setLoading(true)
    setError(null)
    try {
      try {
        const r = await api.get(`/api/vestibulares/${vestId}/subjects/${subjId}/topics`)
        setSubjectTopics(Array.isArray(r.data) ? r.data : [])
        setLoading(false)
        return
      } catch (err) {
        if (!(err?.response?.status === 404)) throw err
        // else fallback
      }
      const r2 = await api.get(`/api/subjects/${subjId}/topics`)
      setSubjectTopics(Array.isArray(r2.data) ? r2.data.map(t => ({ ...t, __isVestibularTopic: false })) : [])
    } catch (err) {
      console.error(err)
      setSubjectTopics([])
      setError('Erro ao carregar tópicos')
    } finally {
      setLoading(false)
    }
  }

  // --- criar tópico (vestib-specific se possível) ---
  async function createTopic(e) {
    e?.preventDefault()
    setError(null)
    if (!openedSubjectId) return setError('Abra uma matéria do vestibular primeiro.')
    if (!newTopicName || !newTopicName.trim()) return setError('Nome do tópico é obrigatório.')
    setOpLoading(true)
    try {
      try {
        // tenta criar no escopo do vestibular
        const r = await api.post(`/api/vestibulares/${vestId}/subjects/${openedSubjectId}/topics`, { name: newTopicName.trim() })
        // se backend retornar um objeto, ok; refresh
      } catch (err) {
        if (err?.response?.status === 404) {
          // fallback: cria tópico global atrelado à subjectId
          await api.post('/api/topics', { name: newTopicName.trim(), subjectId: Number(openedSubjectId) })
        } else {
          throw err
        }
      }
      setNewTopicName('')
      await loadTopicsForSubject(openedSubjectId)
    } catch (err) {
      console.error(err)
      setError(err?.response?.data ?? 'Erro ao criar tópico')
    } finally {
      setOpLoading(false)
    }
  }

  // --- quando escolher matéria fonte para copiar tópicos (fonte global) ---
  async function onSourceSubjectChange(id) {
    setCopySourceSubjectId(id)
    setSourceTopicsForCopy([])
    if (!id) return
    try {
      const res = await api.get(`/api/subjects/${id}/topics`)
      setSourceTopicsForCopy(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      setSourceTopicsForCopy([])
      setError('Erro ao carregar tópicos da matéria fonte')
    }
  }

  // --- copiar tópico: copia tópico + conteúdos ---
  async function copyTopic(topicId) {
    if (!openedSubjectId) return setError('Abra uma matéria do vestibular primeiro')
    setOpLoading(true)
    setError(null)
    try {
      // pega dados do tópico fonte (nome)
      const tRes = await api.get(`/api/topics/${topicId}`)
      const topicName = tRes.data?.name ?? tRes.data?.Name ?? null
      if (!topicName) throw new Error('Tópico fonte inválido')

      // pega conteúdos do tópico fonte (tentativas em duas formas de endpoint)
      let sourceContents = []
      try {
        const c1 = await api.get(`/api/topics/${topicId}/contents`)
        sourceContents = Array.isArray(c1.data) ? c1.data : []
      } catch (err1) {
        // fallback para query param
        try {
          const c2 = await api.get('/api/contents', { params: { topicId } })
          sourceContents = Array.isArray(c2.data) ? c2.data : []
        } catch (err2) {
          // se ambos falharem, continuamos sem conteúdos (só copiamo nome)
          sourceContents = []
        }
      }

      // criar tópico destino: preferir vestib-specific endpoint
      let createdTopicId = null
      try {
        const createRes = await api.post(`/api/vestibulares/${vestId}/subjects/${openedSubjectId}/topics`, { name: topicName })
        // tenta achar id na resposta
        createdTopicId = createRes.data?.id ?? createRes.data?.Id ?? null
      } catch (err) {
        if (err?.response?.status === 404) {
          const createRes2 = await api.post('/api/topics', { name: topicName, subjectId: Number(openedSubjectId) })
          createdTopicId = createRes2.data?.id ?? createRes2.data?.Id ?? createRes2.data ?? null
        } else {
          throw err
        }
      }

      // se criou tópico e existem conteúdos na fonte, copiar conteúdos para o novo tópico
      if (createdTopicId && sourceContents.length > 0) {
        for (const sc of sourceContents) {
          try {
            // criar novo conteúdo global vinculado ao createdTopicId
            // adaptamos os campos esperados: Title/Type/Link/PdfUrl/TopicId
            const payload = {
              Title: sc.title ?? sc.Title ?? sc.name ?? '',
              Type: sc.type ?? sc.Type ?? 'Exercise',
              Link: sc.link ?? sc.Link ?? null,
              PdfUrl: sc.pdfUrl ?? sc.PdfUrl ?? null,
              TopicId: Number(createdTopicId)
            }
            await api.post('/api/contents', payload)
          } catch (err) {
            // se falhar criar algum conteúdo, continuamos com os próximos e logamos
            console.error('Falha ao copiar conteúdo do tópico fonte', sc, err)
          }
        }
      }

      await loadTopicsForSubject(openedSubjectId)
    } catch (err) {
      console.error(err)
      setError(err?.response?.data ?? 'Erro ao copiar tópico e conteúdos')
    } finally {
      setOpLoading(false)
    }
  }

  // --- remover tópico: preferimos endpoint vestib-specific (remove somente do vestibular).
  // Se não houver, existe a opção (potencialmente perigosa) de remover globalmente.
  async function removeTopic(topicId) {
    if (!openedSubjectId) return setError('Abra uma matéria do vestibular primeiro')
    if (!confirm('Remover este tópico? Isso pode excluir conteúdos se o backend remover globalmente.')) return
    setOpLoading(true)
    setError(null)
    try {
      // tenta deletar via vestib-specific (apenas desvincula/exclui do escopo do vestibular)
      try {
        await api.delete(`/api/vestibulares/${vestId}/subjects/${openedSubjectId}/topics/${topicId}`)
        // se funcionar, só recarrega
        await loadTopicsForSubject(openedSubjectId)
        setOpLoading(false)
        return
      } catch (err) {
        if (!(err?.response?.status === 404)) throw err
        // se 404, tentamos excluir global (atenção: afeta outras áreas)
      }

      // fallback: delete global topic
      await api.delete(`/api/topics/${topicId}`)
      await loadTopicsForSubject(openedSubjectId)
    } catch (err) {
      console.error(err)
      setError(err?.response?.data ?? 'Erro ao remover tópico')
    } finally {
      setOpLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Tópicos (matérias do vestibular)</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Matéria do vestibular (edite apenas essas)</label>
        <select value={openedSubjectId || ''} onChange={e => setOpenedSubjectId(e.target.value)} className="border p-2 rounded w-full max-w-md">
          <option value="">-- selecione a matéria vinculada ao vestibular --</option>
          {vestSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {openedSubjectId ? (
        <>
          <form onSubmit={createTopic} className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
            <input value={newTopicName} onChange={e => setNewTopicName(e.target.value)} placeholder="Nome do novo tópico (somente nesta matéria do vestibular)" className="border p-2 rounded md:col-span-2" />
            <div>
              <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded" disabled={opLoading}>
                {opLoading ? 'Processando...' : 'Criar tópico'}
              </button>
            </div>
          </form>

          <div className="mb-3">
            <div className="text-sm font-medium mb-1">Puxar tópico de outra matéria (fonte)</div>
            <div className="flex gap-2 items-center">
              <select value={copySourceSubjectId} onChange={e => onSourceSubjectChange(e.target.value)} className="border p-2 rounded">
                <option value="">-- selecionar matéria fonte (sistema) --</option>
                {globalSubjects.filter(s => String(s.id) !== String(openedSubjectId)).map(s => (
                  <option key={s.id} value={s.id}>{s.name}{s.series?.name ? ` — ${s.series.name}` : ''}</option>
                ))}
              </select>

              <div className="flex-1">
                {sourceTopicsForCopy.length === 0 && copySourceSubjectId && <div className="text-sm text-gray-500 mt-1">Nenhum tópico na matéria fonte.</div>}
                {sourceTopicsForCopy.length === 0 && !copySourceSubjectId && <div className="text-sm text-gray-500 mt-1">Escolha uma matéria fonte para ver tópicos.</div>}
                {sourceTopicsForCopy.length > 0 && (
                  <div className="grid gap-2 mt-2">
                    {sourceTopicsForCopy.map(t => (
                      <div key={t.id} className="flex items-center justify-between border p-2 rounded">
                        <div className="text-sm">{t.name}</div>
                        <div className="flex gap-2">
                          <button onClick={() => copyTopic(t.id)} className="px-2 py-1 bg-green-600 text-white rounded" disabled={opLoading}>Copiar (com conteúdos)</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="font-medium mb-2">Tópicos desta matéria</div>
            {loading && <div>Carregando tópicos...</div>}
            <ul className="space-y-2">
              {subjectTopics.map(t => (
                <li key={t.id} className="border p-2 rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.__isVestibularTopic ? 'Tópico (vestibular-specific)' : 'Tópico (sistema)'}</div>
                  </div>
                  <div className="flex gap-2">
                    {/* abre a aba Contents e passa topicId para facilitar adicionar conteúdos dentro do tópico */}
                    <Link to={`/admin/vestibulares/${vestId}/contents?topicId=${t.id}`} className="px-2 py-1 bg-blue-600 text-white rounded">Abrir conteúdos</Link>
                    <button onClick={() => removeTopic(t.id)} className="px-2 py-1 bg-red-600 text-white rounded" disabled={opLoading}>Remover</button>
                  </div>
                </li>
              ))}
              {subjectTopics.length === 0 && <li className="text-gray-500">Nenhum tópico.</li>}
            </ul>
          </div>
        </>
      ) : (
        <div className="text-gray-500">Abra uma matéria vinculada ao vestibular para começar a gerenciar tópicos.</div>
      )}

      {error && <div className="mt-3 text-red-600">{String(error)}</div>}
    </div>
  )
}
