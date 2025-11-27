import React, { useState, useEffect, useCallback } from "react";
import { Package, PlusCircle, Edit, XCircle, Loader2, RefreshCw, AlertTriangle, Save, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../components/apiConfig";

const API_PIEZAS_URL = `${API_BASE_URL}/Piezas`;

// Normaliza nombres de campos del backend (IdPieza/NombrePieza -> idPieza/nombrePieza)
function normalizePieza(p) {
  return {
    idPieza: p.idPieza ?? p.IdPieza ?? p.id ?? null,
    nombrePieza: p.nombrePieza ?? p.NombrePieza ?? "",
    maquina: p.maquina ?? p.Maquina ?? "",
    idArea: p.idArea ?? p.IdArea ?? p.areaId ?? null,
  };
}

// Construye payload en PascalCase y tipos correctos para el backend (.NET)
function buildPiezaPayload(formOrItem) {
  return {
    IdPieza: formOrItem.idPieza ?? undefined, // solo en PUT
    NombrePieza: formOrItem.nombrePieza,
    Maquina: formOrItem.maquina || "",
    IdArea: formOrItem.idArea !== "" ? Number(formOrItem.idArea) : null,
  };
}function PiezasFormModal({ isOpen, piezaToEdit, onClose, onSave }) {
  const isEditing = !!piezaToEdit;
  const [formData, setFormData] = useState({
    nombrePieza: "",
    maquina: "",
    idArea: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (isOpen) {
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
    }
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
      setFormError("Área es obligatoria (usa un número válido).");
      return;
    }
    if (Number.isNaN(Number(formData.idArea))) {
      setFormError("El campo Área debe ser un número.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(
        {
          ...(isEditing && { idPieza: piezaToEdit.idPieza }),
          nombrePieza: formData.nombrePieza.trim(),
          maquina: formData.maquina.trim(),
          idArea: Number(formData.idArea),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-3xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center">
              <Package className="mr-2 w-5 h-5 text-indigo-600" />
              {isEditing ? "Editar Pieza" : "Nueva Pieza"}
            </h3>
            <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {formError && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center">
                <AlertTriangle size={16} className="mr-2" />
                {formError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Pieza *</label>
              <input
                type="text"
                name="nombrePieza"
                value={formData.nombrePieza}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Máquina</label>
              <input
                type="text"
                name="maquina"
                value={formData.maquina}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Área (ID numérico) *</label>
              <input
                type="number"
                name="idArea"
                value={formData.idArea}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center px-4 py-2 text-sm font-medium text.white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg text-white"
              >
                {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                {isEditing ? "Guardar Cambios" : "Crear Pieza"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default function Piezas() {
  const { user } = useAuth();
  const [piezas, setPiezas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPieza, setEditingPieza] = useState(null);

  const authHeader = user?.token ? { Authorization: `Bearer ${user.token}` } : {};

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
      // Debug para verificar IDs
      // console.log("Piezas normalizadas:", data);
    } catch (err) {
      setError(err.message);
      setPiezas([]);
    } finally {
      setIsLoading(false);
    }
  }, [API_PIEZAS_URL, user?.token]);

  useEffect(() => {
    fetchPiezas();
  }, [fetchPiezas]);

  const handleSavePieza = async (pieza, isEditing) => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_PIEZAS_URL}/${pieza.idPieza}` : API_PIEZAS_URL;
    const payload = buildPiezaPayload(pieza);

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 400) {
        // Intenta leer mensaje del backend si lo hay
        let msg = "Error al guardar pieza (400). Revisa nombres y tipos.";
        try {
          const errBody = await response.json();
          if (errBody?.message) msg = errBody.message;
        } catch {}
        throw new Error(msg);
      }
      if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión de nuevo.");
      throw new Error("Error al guardar pieza.");
    }
    await fetchPiezas();
  };

  const handleEdit = (pieza) => {
    setEditingPieza(pieza);
    setIsModalOpen(true);
  };

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
            onClick={() => { setEditingPieza(null); setIsModalOpen(true); }}
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
                  key={
                    pieza.idPieza ??
                    `${pieza.nombrePieza}-${pieza.maquina}-${idx}` // fallback seguro para evitar el warning de key
                  }
                  className="hover:bg-indigo-50 transition"
                >
                  <td className="px-6 py-4 text-sm text-indigo-600 font-semibold">
                    {pieza.idPieza ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{pieza.nombrePieza}</td>
                  <td className="px-6 py-4 text-sm text.gray-500">{pieza.maquina || "—"}</td>
                  <td className="px-6 py-4 text-sm text.gray-500">{pieza.idArea ?? "—"}</td>
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