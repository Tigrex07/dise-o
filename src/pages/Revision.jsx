import React, { useState, useEffect, useMemo } from 'react';
// Se elimina Hourglass, ChevronDown y ListFilter
import { Briefcase, Clock, Zap, AlertTriangle, Save, RefreshCw } from 'lucide-react'; 

// --- IMPORTS CRÍTICAS ---
import { useAuth } from '../context/AuthContext'; 
import API_BASE_URL from '../components/apiConfig'; 
// ------------------------

// URL de los Endpoints
const API_SOLICITUDES_URL = `${API_BASE_URL}/Solicitudes`;
// CAMBIO CRÍTICO: El endpoint POST es /api/Revision (según RevisionController.cs)
const API_REVISION_URL = `${API_BASE_URL}/Revision`; 

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
        case "En Revisión": return "text-gray-700 bg-gray-200 font-medium";
        default: return "text-gray-700 bg-gray-100";
    }
};

// --- COMPONENTE PRINCIPAL DE REVISIÓN ---
export default function Revision() {
    const { user, isAuthenticated } = useAuth(); 
    
    const [solicitudes, setSolicitudes] = useState([]);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    const [revisionData, setRevisionData] = useState({
        prioridad: 'Media',
        comentarios: '', 
    });

    // ----------------------------------------------------------------------
    // --- LÓGICA DE CARGA DE SOLICITUDES (Incluye botón de recarga) ---
    // ----------------------------------------------------------------------
    const fetchSolicitudes = async () => {
        if (!isAuthenticated) {
            console.error("Usuario no autenticado, no se pueden cargar solicitudes.");
            setLoadingSolicitudes(false);
            return;
        }

        const token = localStorage.getItem('authToken');
        setLoadingSolicitudes(true);
        setSelectedSolicitud(null); 
        
        try {
            const response = await fetch(API_SOLICITUDES_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Fallo al cargar las solicitudes');
            }

            const data = await response.json();
            setSolicitudes(data);
            
        } catch (error) {
            console.error("Error al obtener solicitudes:", error);
            setSolicitudes([]);
        } finally {
            setLoadingSolicitudes(false);
        }
    };

    useEffect(() => {
        fetchSolicitudes();
    }, [isAuthenticated]); 

    // ----------------------------------------------------------------------
    // --- LÓGICA DE FILTRADO (CORREGIDA) ---
    // ----------------------------------------------------------------------

    const filteredSolicitudes = useMemo(() => {
        // CAMBIO CRÍTICO: Filtrar por la propiedad correcta 'estadoOperacional'
        const PENDING_STATE = "En Revisión"; 
        return solicitudes
            .filter(s => s.estadoOperacional === PENDING_STATE)
            .sort((a, b) => new Date(a.fechaYHora) - new Date(b.fechaYHora)); 
    }, [solicitudes]);

    // Seleccionar una solicitud para revisión y precargar los datos
    const handleSelectSolicitud = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setRevisionData({
            // Usamos la prioridad actual o 'Media' como default
            prioridad: solicitud.prioridadActual === "En Revisión" ? 'Media' : solicitud.prioridadActual, 
            comentarios: '',
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        // No hay lógica especial para el tipo de campo ya que eliminamos el número
        setRevisionData(prev => ({ ...prev, [name]: value }));
    };

    // ----------------------------------------------------------------------
    // --- LÓGICA DE ENVÍO (POST /api/Revision) ---
    // ----------------------------------------------------------------------
    const handleSaveRevision = async (e) => {
        e.preventDefault();
        if (!selectedSolicitud || isSaving) return;

        // 1. Construir el DTO para el POST
        const revisionDto = {
            idSolicitud: selectedSolicitud.id, 
            idRevisor: user.id, // Obtenido del contexto
            prioridad: revisionData.prioridad,
            comentarios: revisionData.comentarios || null,
        };
        
        setIsSaving(true);
        const token = localStorage.getItem('authToken');

        try {
            // CAMBIO CRÍTICO: Usamos el endpoint /api/Revision
            const response = await fetch(API_REVISION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(revisionDto),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Fallo al registrar la revisión. Código: ${response.status}`);
            }

            // Éxito:
            alert(`Revisión de Solicitud #${selectedSolicitud.id} guardada exitosamente. El estado ha cambiado.`);
            
            // 2. Limpiar el estado y recargar la lista
            setSelectedSolicitud(null);
            await fetchSolicitudes(); 
            
        } catch (error) {
            console.error("[API Error] Revisar Solicitud:", error);
            alert(`Error al guardar la revisión: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Card de Solicitud en lista ---
    const RevisionRow = ({ solicitud }) => (
        <tr 
            onClick={() => handleSelectSolicitud(solicitud)}
            className={`cursor-pointer border-b border-gray-100 transition duration-150 ${selectedSolicitud?.id === solicitud.id ? 'bg-indigo-50 border-indigo-400 shadow-inner' : 'hover:bg-gray-50'}`}
        >
            <Td className="font-semibold text-indigo-600">{solicitud.id}</Td>
            {/* Acceso directo a propiedades planas del DTO */}
            <Td>{solicitud.piezaNombre} ({solicitud.maquina})</Td> 
            <Td className="text-gray-500">{solicitud.solicitanteNombre}</Td> 
            <Td>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityClasses(solicitud.prioridadActual)}`}>
                    {solicitud.prioridadActual || 'N/A'} 
                </span>
            </Td>
            {/* Uso de estadoOperacional para la columna de estado */}
            <Td className={`font-medium ${solicitud.estadoOperacional === 'En Revisión' ? 'text-red-600' : 'text-green-600'}`}>{solicitud.estadoOperacional}</Td>
            <Td className="text-gray-500">{new Date(solicitud.fechaYHora).toLocaleDateString()}</Td>
        </tr>
    );


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna de Lista de Pendientes (2/3) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-2xl border-t-4 border-indigo-600">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Briefcase size={24} className="mr-2 text-indigo-600" />
                        Bandeja de Revisión
                    </h2>
                    {/* Botón de Recarga */}
                    <button
                        onClick={fetchSolicitudes}
                        disabled={loadingSolicitudes || isSaving}
                        className={`p-2 rounded-full transition duration-150 ${loadingSolicitudes ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'}`}
                        title="Recargar Solicitudes"
                    >
                        <RefreshCw size={18} className={loadingSolicitudes ? 'animate-spin' : ''} />
                    </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                    Mostrando solo solicitudes con estado **"En Revisión"** que requieren tu validación.
                </p>

                {/* Info de cantidad */}
                <p className="text-base font-medium text-gray-700 mb-4">
                    <Clock size={16} className="inline mr-1 text-indigo-500" />
                    Solicitudes pendientes: **{filteredSolicitudes.length}**
                </p>

                {/* Tabla de Pendientes */}
                <div className="overflow-x-auto border rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pieza (Máquina)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Operacional</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Creación</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loadingSolicitudes ? (
                                <tr>
                                    <Td colSpan="6" className="text-center py-8 text-indigo-500">Cargando solicitudes...</Td>
                                </tr>
                            ) : filteredSolicitudes.length > 0 ? (
                                filteredSolicitudes.map((s) => <RevisionRow key={s.id} solicitud={s} />)
                            ) : (
                                <tr>
                                    <Td colSpan="6" className="text-center py-8 text-gray-500">
                                        <Clock size={24} className="mx-auto mb-2 text-green-500"/>
                                        ¡No hay solicitudes pendientes de revisión de Ingeniería!
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
                    Asignación de Prioridad
                </h3>
                
                {!selectedSolicitud ? (
                    <div className="text-center py-10 text-gray-500">
                        <AlertTriangle size={32} className="mx-auto mb-3 text-blue-500" />
                        <p>Selecciona una solicitud de la lista para asignarle prioridad y finalizar la revisión.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSaveRevision} className="space-y-5">
                        <p className="font-semibold text-lg text-indigo-700">ID Solicitud: {selectedSolicitud.id}</p>
                        <p className="text-gray-700 text-sm italic border-b pb-3 mb-3">Detalles: {selectedSolicitud.detalles}</p>

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
                        
                         {/* Comentarios de Ingeniería */}
                        <div>
                            <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-1">Comentarios de Ingeniería (Opcional)</label>
                            <textarea
                                id="comentarios"
                                name="comentarios"
                                value={revisionData.comentarios}
                                onChange={handleFormChange}
                                rows="3"
                                placeholder="Instrucciones para el operador, notas de material..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            ></textarea>
                        </div>


                        <div className="flex justify-end pt-3">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md transition ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                <Save size={18} className="mr-2" />
                                {isSaving ? 'Guardando...' : 'Guardar Revisión'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}