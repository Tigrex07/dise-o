import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  PlusCircle,
  Edit,
  XCircle,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../components/apiConfig";

const API_PIEZAS_URL = `${API_BASE_URL}/Piezas`;

/**
 * Normaliza la respuesta del backend para usar siempre las mismas claves en el frontend.
 */
function normalizePieza(p) {
  return {
    idPieza: p.idPieza ?? p.id ?? null,
    nombrePieza: p.nombrePieza ?? p.NombrePieza ?? "",
    maquina: p.maquina ?? p.Maquina ?? "",
    idArea: p.idArea ?? p.IdArea ?? null,
    nombreArea:
      p.nombreArea ??
      p.nombreArea ??
      p.Area?.nombreArea ??
      p.Area?.NombreArea ??
      "",
  };
}

/**
 * Construye el payload que se enviará al backend (camelCase).
 * Si tu backend espera PascalCase, reemplaza las claves aquí.
 */
function buildPiezaPayload(formOrItem) {
  return {
    nombrePieza: formOrItem.nombrePieza,
    maquina: formOrItem.maquina || "",
    idArea: Number(formOrItem.idArea),
  };
}

/* ------------------ PiezasFormModal ------------------ */
function PiezasFormModal({ isOpen, piezaToEdit, onClose, onSave }) {
  const isEditing = !!piezaToEdit;
  const [formData, setFormData] = useState({
    nombrePieza: "",
    maquina: "",
    idArea: "",
  });
  const [areas, setAreas] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    setFormError(null);
    if (isEditing && piezaToEdit) {
      setFormData({
        nombrePieza: piezaToEdit.nombrePieza ?? "",
        maquina: piezaToEdit.maquina ?? "",
        idArea: piezaToEdit.idArea?.toString?.() ?? "",
      });
    } else {
      setFormData({ nombrePieza: "", maquina: "", idArea: "" });
    }

    // Cargar áreas para el select
    fetch(`${API_BASE_URL}/Areas`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setAreas(list);
      })
      .catch(() => setAreas([]));
  }, [isOpen, isEditing, piezaToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nombrePieza.trim()) {
      setFormError("Nombre de la pieza es obligatorio.");
      return;
    }
    if (!formData.idArea.toString().trim()) {
      setFormError("Área es obligatoria.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(
        {
          nombrePieza: formData.nombrePieza.trim(),
          maquina: formData.maquina.trim(),
          idArea: Number(formData.idArea),
          idPieza: piezaToEdit?.idPieza ?? null,
        },
        isEditing
      );
      onClose();
    } catch (err) {
      setFormError(err.message || "Error al guardar la pieza.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <header className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-3">
    <div className="bg-indigo-50 text-indigo-600 rounded-lg p-2">
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M3 7h18M3 12h18M3 17h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-slate-800">{isEditing ? "Editar Pieza" : "Nueva Pieza"}</h3>
      <p className="text-sm text-slate-500">Agrega los datos de la pieza y asigna un área</p>
    </div>
  </div>
  <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
    <XCircle size={20} />
  </button>
</header>
        {formError && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 p-3 rounded">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              name="nombrePieza"
              value={formData.nombrePieza}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
              placeholder="Ej. Molde 45"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Máquina</label>
            <input
              name="maquina"
              value={formData.maquina}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
              placeholder="Ej. Maquinola"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Área</label>
            <select
              name="idArea"
              value={formData.idArea}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
              required
            >
              <option value="">Seleccione un área</option>
              {areas.map((a) => (
                <option key={a.id ?? a.idArea ?? a.Id} value={a.id ?? a.idArea ?? a.Id}>
                  {a.nombreArea ?? a.NombreArea ?? a.name ?? "Área"}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Guardando...
                </span>
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------ Componente principal Piezas ------------------ */
export default function Piezas() {
  const { user } = useAuth();
  const [piezas, setPiezas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPieza, setEditingPieza] = useState(null);

  const authHeader = user?.token ? { Authorization: `Bearer ${user.token}` } : {};

  // Cargar piezas
  const fetchPiezas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_PIEZAS_URL, {
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión de nuevo.");
        throw new Error("Error al cargar piezas.");
      }
      const raw = await response.json();
      const data = Array.isArray(raw) ? raw.map(normalizePieza) : [];
      setPiezas(data);
    } catch (err) {
      setError(err.message);
      setPiezas([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchPiezas();
  }, [fetchPiezas]);

  /* ------------------ handleSavePieza (intentos y logging) ------------------ */
  const handleSavePieza = async (pieza, isEditing) => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_PIEZAS_URL}/${pieza.idPieza}` : API_PIEZAS_URL;

    // Aseguramos tipos correctos
    const safePayload = {
      nombrePieza: (pieza.nombrePieza ?? "").toString().trim(),
      maquina: (pieza.maquina ?? "").toString().trim(),
      idArea: Number(pieza.idArea) || 0,
    };

    console.log("Intentando guardar pieza. Payload seguro:", safePayload);

    // Helper para intentar un POST/PUT y devolver texto de respuesta
    const tryPost = async (body) => {
      console.log("Enviando body:", body);
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(body),
      });
      const text = await resp.text();
      console.log("Status:", resp.status, "Respuesta:", text);
      return { ok: resp.ok, status: resp.status, text };
    };

    // 1) Intento directo (sin wrapper)
    const directBody = { ...safePayload };
    const directResult = await tryPost(directBody);
    if (directResult.ok) {
      await fetchPiezas();
      return;
    }

    // 2) Si falla, intentamos con wrapper piezaDto
    const wrappedBody = { piezaDto: { ...safePayload } };
    const wrappedResult = await tryPost(wrappedBody);
    if (wrappedResult.ok) {
      await fetchPiezas();
      return;
    }

    // 3) Si ambos fallan, lanzamos el error con el texto del backend (priorizamos el directo)
    const errorText = directResult.text || wrappedResult.text || "Error desconocido al guardar pieza.";
    console.error("Ambos intentos fallaron. Detalle:", { directResult, wrappedResult });
    throw new Error(errorText);
  };

  // Editar pieza
  const handleEdit = (pieza) => {
    setEditingPieza(pieza);
    setIsModalOpen(true);
  };

  // Eliminar pieza
  const handleDelete = async (pieza) => {
    if (!window.confirm(`¿Eliminar la pieza "${pieza.nombrePieza}"?`)) return;
    const response = await fetch(`${API_PIEZAS_URL}/${pieza.idPieza}`, {
      method: "DELETE",
      headers: {
        ...authHeader,
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        setError("Sesión expirada. Inicia sesión de nuevo.");
        return;
      }
      setError("Error al eliminar pieza.");
      return;
    }
    await fetchPiezas();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 min-h-full">
      <header className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-extrabold text-slate-800 flex items-center">
          <Package className="w-6 h-6 mr-3 text-indigo-600" />
          Catálogo de Piezas
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setEditingPieza(null);
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700"
          >
            <PlusCircle size={20} className="mr-2" /> Nueva Pieza
          </button>
          <button
            onClick={fetchPiezas}
            className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {isLoading && (
        <div className="p-4 mb-4 text-center text-indigo-700 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Loader2 size={20} className="mr-2 animate-spin" />
          Cargando piezas...
        </div>
      )}
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          Error: {error}
        </div>
      )}

      <div className="overflow-x-auto shadow-md rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Máquina</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {piezas.length > 0 ? (
              piezas.map((pieza, idx) => (
                <tr
                  key={pieza.idPieza ?? `${pieza.nombrePieza}-${idx}`}
                  className="hover:bg-indigo-50 transition"
                >
                  <td className="px-6 py-4 text-sm text-indigo-600 font-semibold">
                    {pieza.idPieza ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{pieza.nombrePieza}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{pieza.maquina || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {pieza.nombreArea || pieza.idArea || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(pieza)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(pieza)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <AlertTriangle size={24} className="mx-auto mb-2 text-yellow-500" />
                  No hay piezas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PiezasFormModal
        isOpen={isModalOpen}
        piezaToEdit={editingPieza}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePieza}
      />
    </div>
  );
}