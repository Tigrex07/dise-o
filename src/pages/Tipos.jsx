import React, { useState } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

const MOCK = [
  { id: 1, nombre: "Daño físico", descripcion: "Daños visibles en la pieza" },
  { id: 2, nombre: "Mal funcionamiento", descripcion: "Operación irregular" },
];

export default function Tipos() {
  const [items, setItems] = useState(MOCK);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  function openNew() {
    setEditing(null);
    setNombre("");
    setDescripcion("");
    setShowModal(true);
  }

  function openEdit(it) {
    setEditing(it);
    setNombre(it.nombre);
    setDescripcion(it.descripcion || "");
    setShowModal(true);
  }

  function save() {
    if (!nombre.trim()) return alert("Ingresa un nombre");

    if (editing) {
      setItems(items.map(i => 
        i.id === editing.id ? { ...i, nombre, descripcion } : i
      ));
    } else {
      setItems([{ id: Date.now(), nombre, descripcion }, ...items]);
    }

    setShowModal(false);
  }

  function remove(id) {
    if (!confirm("¿Eliminar tipo?")) return;
    setItems(items.filter(i => i.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Administrar Tipos</h1>

        <button
          onClick={openNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
        >
          <PlusCircle size={18} /> Nuevo Tipo
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-5 py-3">ID</th>
              <th className="text-left px-5 py-3">Nombre</th>
              <th className="text-left px-5 py-3">Descripción</th>
              <th className="text-left px-5 py-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {items.map(i => (
              <tr key={i.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-5 py-3">{i.id}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{i.nombre}</td>
                <td className="px-5 py-3 text-gray-600 text-sm">{i.descripcion}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">

                    <button
                      onClick={() => openEdit(i)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => remove(i.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-6 text-gray-500 italic">
                  No hay tipos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 animate-fadeIn">

            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {editing ? "Editar Tipo" : "Nuevo Tipo"}
            </h3>

            <div className="grid grid-cols-1 gap-4">

              <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Nombre</span>
                <input
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Descripción</span>
                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  rows={3}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </label>

            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
              >
                Cancelar
              </button>

              <button
                onClick={save}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
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
