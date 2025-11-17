import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Wrench, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import ArchivosSolicitud from "../components/ArchivosSolicitud";



export default function TrabajoDetail() {
    // Obtener el ID de la solicitud desde la URL (Ej: /trabajo/001)
    const { id } = useParams(); 
    
    // Estado y Mock Data (aquí iría la llamada GET /api/solicitudes/:id)
    const [solicitud, setSolicitud] = useState({
        id: id,
        pieza: 'Molde A1',
        estado: 'Nueva', // "Nueva", "Asignada", "En progreso", "Revision Calidad"
        prioridad: 'Pendiente', 
        maquinista: null,
        detalles: 'Grieta en la base que requiere soldadura especializada.',
        tiempoMaquina: 0,
        observaciones: '',
    });
    
    // Simulación de datos de catálogo (GET /api/usuarios?rol=MachineShop, GET /api/maquinas)
    const maquinistas = [{ id: 1, nombre: 'Javier Pérez' }, { id: 2, nombre: 'Ana López' }];
    const prioridades = ['Baja', 'Media', 'Alta', 'Crítica'];
    const maquinas = ['CNC 1', 'Torno 3', 'Fresadora 5'];

    const handleAsignacion = (e) => {
        // Lógica de PUT/PATCH a /api/solicitudes/:id para asignar maquinista y prioridad
        alert('Asignación guardada. Estado: Asignada.');
        setSolicitud(prev => ({ ...prev, estado: 'Asignada' }));
    };

    const handleInicioTrabajo = () => {
        // Lógica de PUT/PATCH (Tabla EstadoTrabajo: Fecha y Hora de Inicio)
        alert('Trabajo marcado como En Progreso.');
        setSolicitud(prev => ({ ...prev, estado: 'En progreso' }));
    };

    const handleRegistroAvance = () => {
        // Lógica de PUT/PATCH (Tabla EstadoTrabajo: TiempoMaquina, Observaciones)
        alert('Avance y tiempo registrado.');
    };

    const handleFinalizar = () => {
        // Lógica de PUT/PATCH (Actualiza estado a "Revision Calidad")
        alert('Trabajo finalizado. Enviando a Revisión de Calidad.');
        setSolicitud(prev => ({ ...prev, estado: 'Revision Calidad' }));
    };

    const isMachineShop = true; // Simular rol Machine Shop para ver opciones de asignación
    const isMaquinistaAsignado = solicitud.maquinista !== null;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Detalle de Solicitud #{id} - {solicitud.pieza}</h1>
            <StatusBadge estado={solicitud.estado} prioridad={solicitud.prioridad} />

            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Detalles del Reporte</h2>
                <p className="text-gray-700 mb-4">{solicitud.detalles}</p>
                <ArchivosSolicitud solicitudId={solicitud.id} userRol={"TI"} />


                {/* --- Panel de Asignación (Rol: Machine Shop) --- */}
                {solicitud.estado === 'Nueva' && isMachineShop && (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h3 className="font-bold mb-3 text-lg text-yellow-800">Acción Requerida: Asignar</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><User size={14} className="inline mr-1" /> Maquinista</label>
                                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option>Selecciona Maquinista...</option>
                                    {maquinistas.map(m => <option key={m.id}>{m.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><AlertTriangle size={14} className="inline mr-1" /> Prioridad</label>
                                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option>Selecciona Prioridad</option>
                                    {prioridades.map(p => <option key={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>
                        <button onClick={handleAsignacion} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">Guardar Asignación</button>
                    </div>
                )}
                
                {/* --- Panel de Trabajo (Rol: Maquinista) --- */}
                {solicitud.estado === 'Asignada' && isMaquinistaAsignado && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-bold mb-3 text-lg text-blue-800">Acción Requerida: Iniciar Trabajo</h3>
                        <button onClick={handleInicioTrabajo} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                            <Tool size={18} className="inline mr-2" /> Iniciar Trabajo Ahora
                        </button>
                    </div>
                )}
                
                {solicitud.estado === 'En progreso' && isMaquinistaAsignado && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h3 className="font-bold mb-3 text-lg text-green-800">Registro de Avance (Tabla EstadoTrabajo)</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><Clock size={14} className="inline mr-1" /> Tiempo Máquina (min)</label>
                                <input type="number" value={solicitud.tiempoMaquina} onChange={(e) => setSolicitud({...solicitud, tiempoMaquina: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><Tool size={14} className="inline mr-1" /> Máquina Usada</label>
                                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option>Selecciona Máquina</option>
                                    {maquinas.map(m => <option key={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                        <textarea value={solicitud.observaciones} onChange={(e) => setSolicitud({...solicitud, observaciones: e.target.value})} placeholder="Observaciones y avances realizados..." rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4" />
                        
                        <div className="flex justify-between">
                             <button onClick={handleRegistroAvance} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition">Guardar Avance</button>
                             <button onClick={handleFinalizar} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                                Enviar a Revisión de Calidad
                             </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Componente para mostrar el estado y la prioridad de forma visual
function StatusBadge({ estado, prioridad }) {
    const statusClasses = {
        'Nueva': 'bg-red-100 text-red-700',
        'Asignada': 'bg-yellow-100 text-yellow-700',
        'En progreso': 'bg-blue-100 text-blue-700',
        'Revision Calidad': 'bg-purple-100 text-purple-700',
        'Completado': 'bg-green-100 text-green-700',
    };
    const priorityClasses = {
        'Baja': 'bg-gray-200 text-gray-700',
        'Media': 'bg-yellow-200 text-yellow-800',
        'Alta': 'bg-orange-200 text-orange-800',
        'Crítica': 'bg-red-200 text-red-800',
    };
    
    return (
        <div className="flex gap-3 text-sm font-semibold">
            <span className={`px-3 py-1 rounded-full ${statusClasses[estado] || 'bg-gray-200'}`}>
                {estado}
            </span>
            <span className={`px-3 py-1 rounded-full ${priorityClasses[prioridad] || 'bg-gray-200'}`}>
                Prioridad: {prioridad}
            </span>
        </div>
    );
}