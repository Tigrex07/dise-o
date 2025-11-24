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
      setItems(items.map(i => i.id === editing.id ? { ...i, nombre, descripcion } : i));
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Administrar Tipos</h1>
        <div className="flex gap-2">
          <button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
            <PlusCircle size={18} /> Nuevo Tipo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Descripción</th>
              <th className="text-left px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{i.id}</td>
                <td className="px-4 py-3">{i.nombre}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{i.descripcion}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(i)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                      <Edit size={18}/>
                    </button>
                    <button onClick={() => remove(i.id)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-6 text-gray-500">No hay tipos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
            <h3 className="text-lg font-semibold mb-4">{editing ? "Editar Tipo" : "Nuevo Tipo"}</h3>
            <div className="grid grid-cols-1 gap-3">
              <label>
                <span className="text-sm text-gray-600">Nombre</span>
                <input value={nombre} onChange={e => setNombre(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2"/>
              </label>
              <label>
                <span className="text-sm text-gray-600">Descripción</span>
                <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" rows={3}/>
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded border">Cancelar</button>
              <button onClick={save} className="px-4 py-2 rounded bg-blue-600 text-white">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
