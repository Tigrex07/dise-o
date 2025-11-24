import React, { useState } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

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
    if (editing) setItems(items.map(it => it.id === editing.id ? {...it, nombre} : it));
    else setItems([{ id: Date.now(), nombre }, ...items]);
    setShowModal(false);
  }
  function remove(id) { if (!confirm("¿Eliminar área?")) return; setItems(items.filter(i => i.id !== id)); }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Administrar Áreas</h1>
        <button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
          <PlusCircle size={18}/> Nueva Área
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Área</th>
              <th className="text-left px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i=>(
              <tr key={i.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{i.id}</td>
                <td className="px-4 py-3">{i.nombre}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={()=>openEdit(i)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"><Edit size={18}/></button>
                    <button onClick={()=>remove(i.id)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={3} className="text-center p-6 text-gray-500">No hay áreas.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">{editing ? "Editar Área" : "Nueva Área"}</h3>
            <input value={nombre} onChange={e=>setNombre(e.target.value)} className="border rounded w-full px-3 py-2"/>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 border rounded">Cancelar</button>
              <button onClick={save} className="px-4 py-2 rounded bg-blue-600 text-white">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
