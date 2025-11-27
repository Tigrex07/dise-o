import React from "react";
import { PlusCircle, Edit, Trash2, AlertTriangle, Settings, Home, Users } from "lucide-react";
export default function App() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold text-center border-b border-gray-700">
          Molds Tracker
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<Home size={18} />} label="Dashboard" active />
          <SidebarItem icon={<AlertTriangle size={18} />} label="Reportes" />
          <SidebarItem icon={<Settings size={18} />} label="Configuración" />
          <SidebarItem icon={<Users size={18} />} label="Usuarios" />
        </nav>
        <div className="p-4 text-center text-sm text-gray-400 border-t border-gray-700">
          © 2025
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-slate-700 mb-6">Gestión de Reportes de Piezas Dañadas</h1>

{/* Panel de notificaciones como tarjeta visible */}
<div className="mb-6">

</div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <PlusCircle size={18} /> Nuevo Reporte
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg">
              Exportar
            </button>
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Tabla de reportes */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <Th>ID</Th>
                <Th>Pieza</Th>
                <Th>Área</Th>
                <Th>Tipo</Th>
                <Th>Prioridad</Th>
                <Th>Estado</Th>
                <Th>Fecha</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              <TableRow
                id="001"
                pieza="Molde A1"
                area="Producción"
                tipo="Daño físico"
                prioridad="Alta"
                estado="Pendiente"
                fecha="2025-11-03"
              />
              <TableRow
                id="002"
                pieza="Molde B5"
                area="Mantenimiento"
                tipo="Mal funcionamiento"
                prioridad="Media"
                estado="En proceso"
                fecha="2025-11-02"
              />
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

/* --- COMPONENTES --- */
function SidebarItem({ icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${
        active ? "bg-blue-600" : "hover:bg-gray-800"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="text-left px-4 py-3 text-sm font-semibold border-b border-gray-300">
      {children}
    </th>
  );
}

function TableRow({ id, pieza, area, tipo, prioridad, estado, fecha }) {
  return (
    <tr className="hover:bg-gray-50">
      <Td>{id}</Td>
      <Td>{pieza}</Td>
      <Td>{area}</Td>
      <Td>{tipo}</Td>
      <Td>{prioridad}</Td>
      <Td>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            estado === "Pendiente"
              ? "bg-red-100 text-red-700"
              : estado === "En proceso"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {estado}
        </span>
      </Td>
      <Td>{fecha}</Td>
      <Td>
        <div className="flex gap-2">
          <button className="text-blue-600 hover:text-blue-800">
            <Edit size={18} />
          </button>
          <button className="text-red-600 hover:text-red-800">
            <Trash2 size={18} />
          </button>
        </div>
      </Td>
    </tr>
  );
}

function Td({ children }) {
  return <td className="px-4 py-3 text-sm border-b border-gray-200">{children}</td>;
}
