import React, { useState } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

const MOCK = [
  {
    id: 1,
    nombre: "Torno A1",
    prioridad: "Alta",
    descripcion: "Es la máquina principal y está detenida.",
  },
  {
    id: 2,
    nombre: "Fresadora B3",
    prioridad: "Media",
    descripcion: "Requiere ajuste pero aún puede operar.",
  },
];

export default function Prioridad() {
  const [items, setItems] = useState(MOCK);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [nombre, setNombre] = useState("");
  const [prioridad, setPrioridad] = useState("Media");
  const [descripcion, setDescripcion] = useState("");

  function openNew() {
    setEditing(null);
    setNombre("");
    setPrioridad("Media");
    setDescripcion("");
    setShowModal(true);
  }

  function openEdit(i) {
    setEditing(i);
    setNombre(i.nombre);
    setPrioridad(i.prioridad);
    setDescripcion(i.descripcion);
    setShowModal(true);
  }

  function save() {
    if (!nombre.trim()) return alert("Nombre requerido");

    const data = { nombre, prioridad, descripcion };

    if (editing) {
      setItems(items.map((i) => (i.id === editing.id ? { ...i, ...data } : i)));
    } else {
      setItems([{ id: Date.now(), ...data }, ...items]);
    }

    setShowModal(false);
  }

  function remove(id) {
    if (!confirm("¿Eliminar elemento?")) return;
    setItems(items.filter((i) => i.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Prioridad de Máquinas</h1>

        <button
          onClick={openNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2"
        >
          <PlusCircle size={18} /> Nueva Prioridad
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-5 py-3 text-left">ID</th>
              <th className="px-5 py-3 text-left">Máquina</th>
              <th className="px-5 py-3 text-left">Prioridad</th>
              <th className="px-5 py-3 text-left">Descripción</th>
              <th className="px-5 py-3 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-5 py-3">{i.id}</td>
                <td className="px-5 py-3 font-medium">{i.nombre}</td>

                <td className="px-5 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      i.prioridad === "Alta"
                        ? "bg-red-200 text-red-800"
                        : i.prioridad === "Media"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {i.prioridad}
                  </span>
                </td>

                <td className="px-5 py-3 text-gray-700">{i.descripcion}</td>

                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(i)}
                      className="p-2 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => remove(i.id)}
                      className="p-2 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-xl w-full shadow-xl">

            <h3 className="text-xl font-semibold mb-4">
              {editing ? "Editar Prioridad" : "Nueva Prioridad"}
            </h3>

            <div className="grid gap-4">

              <label>
                <span className="text-sm text-gray-600">Nombre</span>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="border rounded-lg px-4 py-2 w-full mt-1"
                />
              </label>

              <label>
                <span className="text-sm text-gray-600">Prioridad</span>
                <select
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value)}
                  className="border rounded-lg px-4 py-2 w-full mt-1"
                >
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
              </label>

              <label>
                <span className="text-sm text-gray-600">Descripción</span>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="border rounded-lg px-4 py-2 w-full mt-1"
                  rows={3}
                  placeholder="Explica por qué esta máquina tiene esta prioridad…"
                ></textarea>
              </label>

            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={save}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
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
