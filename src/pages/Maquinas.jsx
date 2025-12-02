import React, { useState, useEffect } from "react";
import axios from "axios"; // Importamos axios para las llamadas API
import { PlusCircle, Edit, Trash2, Loader2, RefreshCw } from "lucide-react"; // Añadimos iconos de carga

const API_URL = "http://localhost:5145/api/MaquinaMS"; // 🚨 URL base de tu API

export default function Maquinas() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // Máquina en edición
  const [loading, setLoading] = useState(true); // Estado de carga inicial
  const [isSaving, setIsSaving] = useState(false); // Estado para el botón Guardar

  // 1. Estados solo para los campos del API
  const [nombre, setNombre] = useState("");
  // Eliminamos: ubicacion, enUso, asignadoA

  // =======================================================
  // Funciones de Lógica del API
  // =======================================================

  // GET: Cargar datos iniciales
  async function fetchData() {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setItems(response.data);
    } catch (error) {
      console.error("Error al cargar las máquinas:", error);
      alert("Error al cargar las máquinas.");
    } finally {
      setLoading(false);
    }
  }

  // Se ejecuta al cargar el componente
  useEffect(() => {
    fetchData();
  }, []);

  // Función para abrir modal (Nuevo o Edición)
  function openNew() {
    setEditing(null);
    setNombre("");
    setShowModal(true);
  }

  function openEdit(i) {
    setEditing(i);
    setNombre(i.nombre);
    setShowModal(true);
  }

  // POST o PUT: Guardar/Actualizar
  async function save() {
    if (!nombre.trim()) return alert("El Nombre es requerido");

    setIsSaving(true);
    
    // Solo necesitamos enviar el Nombre
    const data = { nombre };

    try {
      if (editing) {
        // PUT (Actualizar)
        await axios.put(`${API_URL}/${editing.id}`, { id: editing.id, ...data });
        alert(`Máquina "${nombre}" actualizada con éxito.`);
      } else {
        // POST (Crear)
        await axios.post(API_URL, data);
        alert(`Máquina "${nombre}" creada con éxito.`);
      }
      
      // Actualizar la lista después de guardar y cerrar el modal
      await fetchData(); 
      setShowModal(false);

    } catch (error) {
      console.error("Error al guardar la máquina:", error);
      alert("Error al guardar la máquina. Verifique el servidor.");
    } finally {
      setIsSaving(false);
    }
  }

  // DELETE: Eliminar
  async function remove(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar la máquina "${nombre}"?`)) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      alert(`Máquina "${nombre}" eliminada con éxito.`);
      
      // Quitar de la lista local o recargar
      setItems(items.filter(i => i.id !== id));
      
    } catch (error) {
      console.error("Error al eliminar la máquina:", error);
      alert("Error al eliminar la máquina. Puede que esté siendo usada.");
    }
  }

  // =======================================================
  // Renderizado
  // =======================================================

  // Indicador de Carga
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="ml-3 text-lg text-gray-600">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Inventario de Máquinas</h1>

        <div className="flex gap-3">
            <button
                onClick={fetchData}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
                title="Recargar datos"
            >
                <RefreshCw size={18} />
            </button>

            <button
                onClick={openNew}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
            >
                <PlusCircle size={18} /> Nueva Máquina
            </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-5 py-3 text-left w-20">ID</th>
              <th className="px-5 py-3 text-left">Máquina</th>
              {/* Eliminadas: Ubicación, En uso, Asignado a */}
              <th className="px-5 py-3 text-left w-28">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
                <tr>
                    <td colSpan="3" className="text-center py-6 text-gray-500">No hay máquinas registradas.</td>
                </tr>
            ) : (
                items.map(i => (
                    <tr key={i.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-5 py-3">{i.id}</td>
                        <td className="px-5 py-3 font-medium text-gray-800">{i.nombre}</td>
                        
                        <td className="px-5 py-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEdit(i)}
                                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition"
                                    title="Editar"
                                >
                                    <Edit size={18} />
                                </button>

                                <button
                                    onClick={() => remove(i.id, i.nombre)}
                                    className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition"
                                    title="Eliminar"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 bg-black/40 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">

            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {editing ? `Editar: ${editing.nombre}` : "Nueva Máquina"}
            </h3>

            <div className="grid grid-cols-1 gap-4">

              <label>
                <span className="text-sm text-gray-600">Nombre de la Máquina</span>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="border rounded-lg w-full px-4 py-2 mt-1"
                  disabled={isSaving}
                />
              </label>

              {/* Eliminados: Ubicación, En uso, Asignado a */}

            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                disabled={isSaving}
              >
                Cancelar
              </button>

              <button
                onClick={save}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                    <Loader2 className="animate-spin" size={18} />
                ) : (
                    "Guardar"
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}