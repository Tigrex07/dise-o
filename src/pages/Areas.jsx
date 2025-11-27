// src/pages/Areas.jsx (Part 1)
import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin, PlusCircle, Edit, XCircle,
  Loader2, RefreshCw, AlertTriangle, Save, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../components/apiConfig";

const API_AREAS_URL = `${API_BASE_URL}/areas`;
const API_RESPONSABLES_URL = `${API_BASE_URL}/usuarios`; // ajusta si tu endpoint es distinto

// Normaliza datos del backend (camelCase)
function normalizeArea(a) {
  return {
    idArea: a.id ?? null,
    nombreArea: a.nombreArea ?? "",
    responsableAreaId: a.responsableAreaId ?? null,
    responsableAreaNombre: a.responsableArea?.nombre ?? null,
    responsableAreaDepto: a.responsableArea?.area ?? null,
  };
}

// Payload para crear/editar (camelCase que espera tu API)
function buildAreaPayload(formOrItem) {
  return {
    id: formOrItem.idArea ?? undefined, // incluir solo en PUT
    nombreArea: formOrItem.nombreArea,
    responsableAreaId: formOrItem.responsableAreaId,
  };
}
// src/pages/Areas.jsx (Part 2)
function AreasFormModal({ isOpen, areaToEdit, onClose, onSave }) {
  const isEditing = !!areaToEdit;
  const [formData, setFormData] = useState({ nombreArea: "" });
  const [responsables, setResponsables] = useState([]);
  const [selectedResponsable, setSelectedResponsable] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    // Reset y precarga de valores
    setFormError(null);
    setFormData({ nombreArea: isEditing && areaToEdit ? areaToEdit.nombreArea ?? "" : "" });
    setSelectedResponsable(
      isEditing && areaToEdit?.responsableAreaId ? String(areaToEdit.responsableAreaId) : ""
    );

    // Cargar responsables activos
    (async () => {
      try {
        const res = await fetch(API_RESPONSABLES_URL);
        const raw = await res.json();
        const list = Array.isArray(raw) ? raw.filter(u => u.activo) : [];
        setResponsables(list);
      } catch {
        setResponsables([]);
      }
    })();
  }, [isOpen, isEditing, areaToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombreArea.trim()) {
      setFormError("El nombre del área es obligatorio.");
      return;
    }
    if (!selectedResponsable) {
      setFormError("Debes seleccionar un responsable.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(
        {
          ...(isEditing && { idArea: areaToEdit.idArea }),
          nombreArea: formData.nombreArea.trim(),
          responsableAreaId: Number(selectedResponsable),
        },
        isEditing
      );
      onClose();
    } catch (err) {
      setFormError(err.message || "Error al guardar el área.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-3xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="text-blue-600" />
              {isEditing ? "Editar Área" : "Nueva Área"}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Área *</label>
              <input
                type="text"
                name="nombreArea"
                value={formData.nombreArea}
                onChange={(e) => setFormData({ nombreArea: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable *</label>
              <select
                value={selectedResponsable}
                onChange={(e) => setSelectedResponsable(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecciona un responsable</option>
                {responsables.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} {r.area ? `(${r.area})` : ""}
                  </option>
                ))}
              </select>
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
                className="flex items-center px-4 py-2 text-sm font-medium bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg text-white"
              >
                {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                {isEditing ? "Guardar Cambios" : "Crear Área"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
// src/pages/Areas.jsx (Part 3)
export default function Areas() {
  const { user } = useAuth();
  const [areas, setAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);

  const authHeader = user?.token ? { Authorization: `Bearer ${user.token}` } : {};

  const fetchAreas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_AREAS_URL, {
        headers: { "Content-Type": "application/json", ...authHeader },
      });
      if (!response.ok) throw new Error("Error al cargar áreas.");
      const raw = await response.json();
      const data = Array.isArray(raw) ? raw.map(normalizeArea) : [];
      setAreas(data);
    } catch (err) {
      setError(err.message);
      setAreas([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]);

  useEffect(() => { fetchAreas(); }, [fetchAreas]);

  const handleSaveArea = async (area, isEditing) => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_AREAS_URL}/${area.idArea}` : API_AREAS_URL;
    const payload = buildAreaPayload(area);

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let msg = "Error al guardar área.";
      if (response.status === 401) msg = "Sesión expirada. Inicia sesión de nuevo.";
      if (response.status === 400) {
        try {
          const body = await response.json();
          if (body?.message) msg = body.message;
        } catch {}
      }
      throw new Error(msg);
    }
    await fetchAreas();
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setIsModalOpen(true);
  };

  const handleDelete = async (area) => {
    if (!window.confirm(`¿Eliminar el área "${area.nombreArea}"?`)) return;
    const response = await fetch(`${API_AREAS_URL}/${area.idArea}`, {
      method: "DELETE",
      headers: authHeader,
    });
    if (!response.ok) {
      const msg = response.status === 401 ? "Sesión expirada. Inicia sesión de nuevo." : "Error al eliminar área.";
      setError(msg);
      return;
    }
    await fetchAreas();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 min-h-full">
      <header className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-extrabold text-slate-800 flex items-center">
          <MapPin className="w-6 h-6 mr-3 text-blue-600" />
          Catálogo de Áreas
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => { setEditingArea(null); setIsModalOpen(true); }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700"
          >
            <PlusCircle size={20} className="mr-2" /> Nueva Área
          </button>
          <button
            onClick={fetchAreas}
            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {isLoading && (
        <div className="p-4 mb-4 text-center text-blue-700 bg-blue-100 rounded-lg flex items-center justify-center">
          <Loader2 size={20} className="mr-2 animate-spin" />
          Cargando áreas...
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {areas.length > 0 ? (
              areas.map((area, idx) => (
                <tr
                  key={area.idArea ?? `${area.nombreArea}-${idx}`}
                  className="hover:bg-blue-50 transition"
                >
                  <td className="px-6 py-4 text-sm text-blue-600 font-semibold">
                    {area.idArea ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {area.nombreArea}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {area.responsableAreaNombre
                      ? `${area.responsableAreaNombre}${area.responsableAreaDepto ? ` (${area.responsableAreaDepto})` : ""}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(area)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(area)}
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
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  <AlertTriangle size={24} className="mx-auto mb-2 text-yellow-500" />
                  No hay áreas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AreasFormModal
        isOpen={isModalOpen}
        areaToEdit={editingArea}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveArea}
      />
    </div>
  );
}
