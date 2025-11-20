import React, { useState, useMemo } from 'react';
import { Briefcase, Clock, Zap, UserCheck, AlertTriangle, MessageSquare, Save, ChevronDown, ListFilter } from 'lucide-react';
// Al inicio de Revision.jsx
const mockSolicitudes = [
  {
    id: 1,
    pieza: "Eje de transmisión",
    maquina: "Torno CNC",
    solicitante: "Juan Pérez",
    prioridad: "Media",
    estado: "Pendiente",
    fecha: "2025-11-17",
    detalles: "Requiere ajuste de tolerancia",
  },
  {
    id: 2,
    pieza: "Rodamiento",
    maquina: "Fresadora",
    solicitante: "Ana López",
    prioridad: "Alta",
    estado: "Asignado",
    fecha: "2025-11-16",
    detalles: "Desgaste visible en inspección",
  },
];

const mockOperadores = [
  { id: 1, nombre: "Carlos", area: "Torno", rol: "Operador", activo: true },
  { id: 2, nombre: "Luis", area: "Fresado", rol: "Operador", activo: true },
];
// Componente para una celda de tabla (reutilizado)
function Td({ children, className = "" }) {
    return (
        <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-800 ${className}`}>
            {children}
        </td>
    );
}

// Lógica de colores para Prioridad (reutilizado)
const getPriorityClasses = (priority) => {
    switch (priority) {
        case "Urgente": return "text-white bg-red-600 font-bold";
        case "Alta": return "text-red-700 bg-red-100 font-medium";
        case "Media": return "text-yellow-700 bg-yellow-100 font-medium";
        case "Baja": return "text-green-700 bg-green-100 font-medium";
        default: return "text-gray-700 bg-gray-100";
    }
};

// --- COMPONENTE PRINCIPAL DE REVISIÓN ---
// Acepta 'onUpdateSolicitud' como prop, el cual viene de App.jsx
export default function Revision() {
  const [solicitudes, setSolicitudes] = useState(mockSolicitudes);
  const [filterStatus, setFilterStatus] = useState("Pendiente");
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [revisionData, setRevisionData] = useState({
    prioridad: 'Media',
    asignadoA: '',
    notasIngenieria: '',
  });

  // ... resto del componente

  // ... el resto de tu código sigue igual

    const solicitudesPendientes = useMemo(() => {
        return solicitudes.filter(s => s.estado === "Pendiente" || s.estado === "Asignado" || s.estado === "En proceso")
                          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // Ordenar por fecha (más antigua primero)
    }, [solicitudes]);

    const filteredSolicitudes = solicitudesPendientes.filter(s => 
        filterStatus === "Todos" || s.estado === filterStatus
    );

    // Seleccionar una solicitud para revisión y precargar los datos
    const handleSelectSolicitud = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setRevisionData({
            prioridad: solicitud.prioridad,
            asignadoA: solicitud.asignadoA || mockOperadores[0].nombre, // Default a primer operador si no hay asignado
            notasIngenieria: solicitud.notasIngenieria || '',
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setRevisionData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveRevision = (e) => {
        e.preventDefault();
        if (!selectedSolicitud) return;

        // Si se asignó a alguien (y no es 'No Asignar'), el estado es 'Asignado'. Sino, es 'Pendiente'.
        const newEstado = revisionData.asignadoA && revisionData.asignadoA !== 'No Asignar' ? 'Asignado' : 'Pendiente';
        
        const updatedSolicitud = {
            ...selectedSolicitud,
            prioridad: revisionData.prioridad,
            asignadoA: revisionData.asignadoA === 'No Asignar' ? null : revisionData.asignadoA,
            notasIngenieria: revisionData.notasIngenieria,
            estado: newEstado,
        };

        onUpdateSolicitud(updatedSolicitud); // <-- Llamada a la función de manejo de App.jsx
        setSelectedSolicitud(null);
        console.log("[Revision] Solicitud actualizada:", updatedSolicitud);
    };

    // --- Card de Solicitud en lista ---
    const RevisionRow = ({ solicitud }) => (
        <tr 
            onClick={() => handleSelectSolicitud(solicitud)}
            className={`cursor-pointer border-b border-gray-100 transition duration-150 ${selectedSolicitud?.id === solicitud.id ? 'bg-indigo-50 border-indigo-400 shadow-inner' : 'hover:bg-gray-50'}`}
        >
            <Td className="font-semibold text-indigo-600">{solicitud.id}</Td>
            <Td>{solicitud.pieza} ({solicitud.maquina})</Td>
            <Td className="text-gray-500">{solicitud.solicitante}</Td>
            <Td>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityClasses(solicitud.prioridad)}`}>
                    {solicitud.prioridad}
                </span>
            </Td>
            <Td className={solicitud.asignadoA ? 'text-blue-700 font-medium' : 'text-red-500 italic'}>
                {solicitud.asignadoA || 'Sin Asignar'}
            </Td>
            <Td className="text-gray-500">{solicitud.fecha}</Td>
        </tr>
    );


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna de Lista de Pendientes (2/3) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-2xl border-t-4 border-indigo-600">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <Briefcase size={24} className="mr-2 text-indigo-600" />
                    Bandeja de Revisión
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    Lista de solicitudes que requieren tu validación, asignación de prioridad o de operador.
                </p>

                {/* Filtro de Estado */}
                <div className="flex justify-start mb-4 space-x-4">
                    <div className="relative">
                        <ListFilter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-8 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                        >
                            <option value="Pendiente">Solo Pendientes</option>
                            <option value="Asignado">Solo Asignadas</option>
                            <option value="En proceso">Solo En Proceso</option>
                            <option value="Todos">Todas Activas</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="text-sm self-center text-gray-500">Total en vista: {filteredSolicitudes.length}</p>
                </div>

                {/* Tabla de Pendientes */}
                <div className="overflow-x-auto border rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pieza (Máquina)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSolicitudes.length > 0 ? (
                                filteredSolicitudes.map((s) => <RevisionRow key={s.id} solicitud={s} />)
                            ) : (
                                <tr>
                                    <Td colSpan="6" className="text-center py-8 text-gray-500">
                                        <Clock size={24} className="mx-auto mb-2 text-green-500"/>
                                        ¡No hay solicitudes pendientes de revisión!
                                    </Td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Columna de Formulario de Revisión (1/3) */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-2xl border-t-4 border-blue-600 h-fit sticky top-0">
                <h3 className="text-xl font-bold text-blue-800 mb-4 border-b pb-2 flex items-center">
                    <Zap size={20} className="mr-2" />
                    Asignación y Prioridad
                </h3>
                
                {!selectedSolicitud ? (
                    <div className="text-center py-10 text-gray-500">
                        <AlertTriangle size={32} className="mx-auto mb-3 text-blue-500" />
                        <p>Selecciona una solicitud de la lista para gestionar su asignación y prioridad.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSaveRevision} className="space-y-5">
                        <p className="font-semibold text-lg text-indigo-700">ID: {selectedSolicitud.id}</p>
                        <p className="text-gray-700 text-sm italic border-b pb-3 mb-3">{selectedSolicitud.detalles}</p>

                        {/* Asignar Prioridad */}
                        <div>
                            <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 mb-1">Prioridad *</label>
                            <select
                                id="prioridad"
                                name="prioridad"
                                value={revisionData.prioridad}
                                onChange={handleFormChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                            >
                                <option value="Baja">Baja</option>
                                <option value="Media">Media</option>
                                <option value="Alta">Alta</option>
                                <option value="Urgente">Urgente</option>
                            </select>
                        </div>

                        {/* Asignar Operador */}
                        <div>
                            <label htmlFor="asignadoA" className="block text-sm font-medium text-gray-700 mb-1">Asignar Operador *</label>
                            <select
                                id="asignadoA"
                                name="asignadoA"
                                value={revisionData.asignadoA || 'No Asignar'}
                                onChange={handleFormChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                            >
                                <option value="No Asignar">-- Seleccionar Operador --</option>
                                {mockOperadores
                                    .filter(op => op.activo && op.rol === 'Operador')
                                    .map(op => (
                                        <option key={op.id} value={op.nombre}>{op.nombre} ({op.area})</option>
                                    ))
                                }
                            </select>
                        </div>

                         {/* Notas de Ingeniería */}
                        <div>
                            <label htmlFor="notasIngenieria" className="block text-sm font-medium text-gray-700 mb-1">Notas de Ingeniería (Opcional)</label>
                            <textarea
                                id="notasIngenieria"
                                name="notasIngenieria"
                                value={revisionData.notasIngenieria}
                                onChange={handleFormChange}
                                rows="3"
                                placeholder="Instrucciones para el operador..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            ></textarea>
                        </div>


                        <div className="flex justify-end pt-3">
                            <button
                                type="submit"
                                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md"
                            >
                                <Save size={18} className="mr-2" />
                                Guardar Revisión y Asignar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}