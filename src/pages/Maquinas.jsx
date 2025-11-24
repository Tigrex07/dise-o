import React, { useState } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

const MOCK = [
  { id: 1, nombre: "Torno A1", ubicacion: "Planta 1", enUso: true, asignadoA: "Juan Pérez" },
  { id: 2, nombre: "Fresadora B3", ubicacion: "Planta 2", enUso: false, asignadoA: "" },
];

export default function Maquinas() {
  const [items, setItems] = useState(MOCK);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [enUso, setEnUso] = useState(false);
  const [asignadoA, setAsignadoA] = useState("");

  function openNew() {
    setEditing(null);
    setNombre("");
    setUbicacion("");
    setEnUso(false);
    setAsignadoA("");
    setShowModal(true);
  }

  function openEdit(i) {
    setEditing(i);
    setNombre(i.nombre);
    setUbicacion(i.ubicacion);
    setEnUso(i.enUso);
    setAsignadoA(i.asignadoA || "");
    setShowModal(true);
  }

  function save() {
    if (!nombre.trim()) return alert("Nombre requerido");

    const data = { nombre, ubicacion, enUso, asignadoA };

    if (editing) {
      setItems(items.map(i => (i.id === editing.id ? { ...i, ...data } : i)));
    } else {
      setItems([{ id: Date.now(), ...data }, ...items]);
    }

    setShowModal(false);
  }

  function remove(id) {
    if (!confirm("¿Eliminar máquina?")) return;
    setItems(items.filter(i => i.id !== id));
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Inventario de Máquinas</h1>

        <button
          onClick={openNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
        >
          <PlusCircle size={18} /> Nueva Máquina
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-5 py-3 text-left">ID</th>
              <th className="px-5 py-3 text-left">Máquina</th>
              <th className="px-5 py-3 text-left">Ubicación</th>
              <th className="px-5 py-3 text-left">En uso</th>
              <th className="px-5 py-3 text-left">Asignado a</th>
              <th className="px-5 py-3 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {items.map(i => (
              <tr key={i.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-5 py-3">{i.id}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{i.nombre}</td>
                <td className="px-5 py-3">{i.ubicacion}</td>
                <td className="px-5 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      i.enUso
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {i.enUso ? "En uso" : "Disponible"}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-700">
                  {i.enUso ? i.asignadoA : "—"}
                </td>

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
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 bg-black/40 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">

            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {editing ? "Editar Máquina" : "Nueva Máquina"}
            </h3>

            <div className="grid grid-cols-1 gap-4">

              <label>
                <span className="text-sm text-gray-600">Nombre</span>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="border rounded-lg w-full px-4 py-2 mt-1"
                />
              </label>

              <label>
                <span className="text-sm text-gray-600">Ubicación</span>
                <input
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="border rounded-lg w-full px-4 py-2 mt-1"
                />
              </label>

              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={enUso}
                  onChange={(e) => setEnUso(e.target.checked)}
                />
                <span className="text-gray-700">¿Está en uso?</span>
              </label>

              {enUso && (
                <label>
                  <span className="text-sm text-gray-600">Asignado a</span>
                  <input
                    value={asignadoA}
                    onChange={(e) => setAsignadoA(e.target.value)}
                    className="border rounded-lg w-full px-4 py-2 mt-1"
                  />
                </label>
              )}

            </div>

            <div className="mt-6 flex justify-end gap-3">
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
