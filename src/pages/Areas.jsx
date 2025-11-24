import React, { useState } from "react";
import { PlusCircle, Edit, Trash2, MapPin } from "lucide-react";

const MOCK = [
  { id: 1, nombre: "Producción" },
  { id: 2, nombre: "Mantenimiento" },
  { id: 3, nombre: "Calidad" },
];

export default function Areas() {
  const [items, setItems] = useState(MOCK);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [nombre, setNombre] = useState("");

  function openNew() { setEditing(null); setNombre(""); setShowModal(true); }
  function openEdit(i) { setEditing(i); setNombre(i.nombre); setShowModal(true); }
  function save() {
    if (!nombre.trim()) return alert("Escribe un nombre");
    if (editing) setItems(items.map(it => it.id === editing.id ? { ...it, nombre } : it));
    else setItems([{ id: Date.now(), nombre }, ...items]);
    setShowModal(false);
  }
  function remove(id) {
    if (!confirm("¿Eliminar área?")) return;
    setItems(items.filter(i => i.id !== id));
  }

  return (
    <div className="w-full">

      {/* ENCABEZADO */}
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
        <MapPin size={28} className="text-blue-600" />
        Administración de Áreas
      </h1>

      <p className="text-gray-600 mb-8 text-lg">
        Gestión del catálogo de áreas activas en la organización.
      </p>

      {/* CARD PRINCIPAL */}
      <div className="bg-white shadow-xl rounded-xl border border-gray-200 p-6">

        {/* BOTÓN SUPERIOR */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-800">Listado de Áreas</h2>

          <button
            onClick={openNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <PlusCircle size={18} /> Nueva Área
          </button>
        </div>

        {/* TABLA */}
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">ID</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Área</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {items.map(i => (
                <tr
                  key={i.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-gray-700">{i.id}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{i.nombre}</td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(i)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-50 transition"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => remove(i.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center p-6 text-gray-500">
                    No hay áreas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {editing ? "Editar Área" : "Nueva Área"}
            </h3>

            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Nombre del área"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancelar
              </button>

              <button
                onClick={save}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
