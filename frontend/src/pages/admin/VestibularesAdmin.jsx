import React, { useEffect, useState } from "react"

export default function VestibularesAdmin() {
  const [vestibulares, setVestibulares] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // formulário
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: "", date: "", description: "", url: "" })

  // carregar lista
  const loadVestibulares = async () => {
    try {
      setLoading(true)
      const res = await fetch("http://localhost:5000/api/vestibulares") // ajuste porta da sua API
      if (!res.ok) throw new Error("Erro ao carregar vestibulares")
      const data = await res.json()
      setVestibulares(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVestibulares()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const method = editing ? "PUT" : "POST"
      const url = editing
        ? `http://localhost:5000/api/vestibulares/${editing}`
        : "http://localhost:5000/api/vestibulares"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error("Erro ao salvar vestibular")

      setForm({ name: "", date: "", description: "", url: "" })
      setEditing(null)
      loadVestibulares()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEdit = (v) => {
    setEditing(v.id)
    setForm({
      name: v.name,
      date: v.date ? v.date.split("T")[0] : "",
      description: v.description || "",
      url: v.url || "",
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir?")) return
    await fetch(`http://localhost:5000/api/vestibulares/${id}`, { method: "DELETE" })
    loadVestibulares()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciar Vestibulares</h2>

      {/* formulário */}
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded bg-gray-50">
        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Data</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Descrição</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">URL</label>
          <input
            type="url"
            name="url"
            value={form.url}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editing ? "Salvar Alterações" : "Adicionar"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setForm({ name: "", date: "", description: "", url: "" })
            }}
            className="ml-2 px-4 py-2 rounded border"
          >
            Cancelar
          </button>
        )}
      </form>

      {/* lista */}
      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">Data</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {vestibulares.map((v) => (
              <tr key={v.id}>
                <td className="p-2 border">{v.name}</td>
                <td className="p-2 border">{v.date?.split("T")[0]}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleEdit(v)}
                    className="px-2 py-1 text-sm bg-yellow-500 text-white rounded mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="px-2 py-1 text-sm bg-red-600 text-white rounded"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
