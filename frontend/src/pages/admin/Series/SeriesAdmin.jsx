// === File: /frontend/src/pages/admin/SeriesAdmin.jsx ===
import { useEffect, useState } from "react";
import api from '../../../services/api'

export default function SeriesAdmin() {
  const [series, setSeries] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);

  const loadSeries = async () => {
    const res = await api.get("/api/series");
    setSeries(res.data);
  };

  useEffect(() => {
    loadSeries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/api/series/${editing.id}`, { id: editing.id, name });
    } else {
      await api.post("/api/series", { name });
    }
    setName("");
    setEditing(null);
    loadSeries();
  };

  const handleEdit = (s) => {
    setEditing(s);
    setName(s.name);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;
    await api.delete(`/api/series/${id}`);
    loadSeries();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Gerenciar Séries</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da série"
          className="flex-1 px-3 py-2 border rounded"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          {editing ? "Salvar" : "Adicionar"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setName("");
            }}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Cancelar
          </button>
        )}
      </form>

      {/* List */}
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">ID</th>
            <th className="p-2">Nome</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {series.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.id}</td>
              <td className="p-2">{s.name}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => handleEdit(s)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {series.length === 0 && (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-500">
                Nenhuma série cadastrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
