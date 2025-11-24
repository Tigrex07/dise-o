import React, { useState } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

const MOCK = [
  { id: 1, nombre: "Torno A1", ubicacion: "Planta 1" },
  { id: 2, nombre: "Fresadora B3", ubicacion: "Planta 2" },
];

export default function Maquinas() {
  const [items, setItems] = useState(MOCK);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  function openNew() { setEditing(null); setNombre(""); setUbicacion(""); setShowModal(true); }
  function openEdit(it) { setEditing(it); setNombre(it.nombre); setUbicacion(it.ubicacion || ""); setShowModal(true); }
  function save() {
    if (!nombre.trim()) return alert("Nombre requerido");
    if (editing) setItems(items.map(i=> i.id === editing.id ? {...i, nombre, ubicacion} : i));
    else setItems([{ id: Date.now(), nombre, ubicacion }, ...items]);
    setShowModal(false);
  }
  function remove(id) { if (!confirm("¿Eliminar máquina?")) return; setItems(items.filter(i => i.id !== id)); }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Administrar Máquinas</h1>
        <button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
          <PlusCircle size={18}/> Nueva Máquina
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Máquina</th>
              <th className="text-left px-4 py-3">Ubicación</th>
              <th className="text-left px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i=>(
              <tr key={i.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{i.id}</td>
                <td className="px-4 py-3">{i.nombre}</td>
                <td className="px-4 py-3">{i.ubicacion}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={()=>openEdit(i)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"><Edit size={18}/></button>
                    <button onClick={()=>remove(i.id)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{editing ? "Editar Máquina" : "Nueva Máquina"}</h3>
            <div className="grid grid-cols-1 gap-3">
              <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre" className="border rounded px-3 py-2"/>
              <input value={ubicacion} onChange={e=>setUbicacion(e.target.value)} placeholder="Ubicación" className="border rounded px-3 py-2"/>
            </div>
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
