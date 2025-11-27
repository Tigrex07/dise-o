import React, { useState, useEffect, useMemo } from 'react';
import { Briefcase, Clock, Zap, AlertTriangle, Save, RefreshCw } from 'lucide-react'; 

// --- IMPORTS CRÍTICAS ---
import { useAuth } from '../context/AuthContext'; 
import API_BASE_URL from '../components/apiConfig'; 
// ------------------------

// URL de los Endpoints
const API_SOLICITUDES_URL = `${API_BASE_URL}/Solicitudes`;
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
        case "En Revisión": 
        case "Pendiente": 
            return "text-gray-700 bg-gray-200 font-medium";
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
    // --- LÓGICA DE FILTRADO (Por Prioridad Pendiente/En Revisión) ---
    // ----------------------------------------------------------------------
    const filteredSolicitudes = useMemo(() => {
        // Valores que indican que la solicitud aún no ha sido revisada por Ingeniería
        const PENDING_PRIORITY_VALUES = ["en revisión", "pendiente", null, undefined, ""]; 
        
        return solicitudes
            .filter(s => {
                const currentPriority = s.prioridadActual ? s.prioridadActual.toLowerCase().trim() : '';
                
                // Si la prioridad es 'null', 'undefined', o '""' (vacío), o si es "en revisión"/"pendiente"
                return PENDING_PRIORITY_VALUES.includes(currentPriority);
            }) 
            .sort((a, b) => new Date(a.fechaYHora) - new Date(b.fechaYHora)); 
    }, [solicitudes]);
    
    // ----------------------------------------------------------------------
    // --- MANEJO DE SELECCIÓN Y DATOS DEL FORMULARIO ---
    // ----------------------------------------------------------------------
    const handleSelectSolicitud = (solicitud) => {
        setSelectedSolicitud(solicitud);
        
        // Determinar la prioridad inicial para el formulario
        const initialPriority = (solicitud.prioridadActual === "En Revisión" || solicitud.prioridadActual === "Pendiente" || !solicitud.prioridadActual)
            ? 'Media' // Sugerencia inicial
            : solicitud.prioridadActual; 
            
        setRevisionData({
            prioridad: initialPriority, 
            comentarios: '',
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setRevisionData(prev => ({ ...prev, [name]: value }));
    };

    // ----------------------------------------------------------------------
    // --- LÓGICA DE ENVÍO Y UPSERT (POST + Manejo de 409 con PUT) ---
    // ----------------------------------------------------------------------
    
    // Función auxiliar para realizar la petición
    const executeRevisionRequest = async (method, url, dto) => {
        const token = localStorage.getItem('authToken');
        return fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(dto),
        });
    };
    
    const handleSaveRevision = async (e) => {
        e.preventDefault();
        if (!selectedSolicitud || isSaving) return;

        const revisionDto = {
            idSolicitud: selectedSolicitud.id, 
            idRevisor: user.id, 
            prioridad: revisionData.prioridad,
            comentarios: revisionData.comentarios || null,
        };
        
        setIsSaving(true);
        let response;
        let methodToUse = 'POST'; // Inicialmente intentamos crear (POST)
        
        try {
            // 1. --- Intento Inicial: POST (Crear la revisión inicial) ---
            response = await executeRevisionRequest(methodToUse, API_REVISION_URL, revisionDto);

            // 2. --- Manejo del 409 Conflict: Fallback a PUT (Actualizar) ---
            if (!response.ok && response.status === 409) {
                console.log("POST falló con 409. Intentando PUT (Actualización)...");
                
                methodToUse = 'PUT';
                // En PUT, la URL debe incluir el ID de la solicitud a actualizar
                const putUrl = `${API_REVISION_URL}/${selectedSolicitud.id}`; 
                
                // --- Intento 2: PUT (Actualizar la revisión existente) ---
                response = await executeRevisionRequest(methodToUse, putUrl, revisionDto);
            }
            
            // --- Manejo de la Respuesta Final (éxito o error después del fallback) ---
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Fallo al ${methodToUse === 'POST' ? 'crear' : 'actualizar'} la revisión. Código: ${response.status}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.title || errorMessage;
                } catch {
                    errorMessage = `${errorMessage}. Detalles: ${errorText.substring(0, 100)}...`;
                }
                throw new Error(errorMessage);
            }

            // --- Éxito ---
            alert(`Revisión de Solicitud #${selectedSolicitud.id} guardada/actualizada con éxito. El estado ha cambiado a Aprobada.`);
            
            // 3. Limpiar el estado y recargar la lista
            setSelectedSolicitud(null);
            await fetchSolicitudes(); 
            
        } catch (error) {
            console.error("[API Error] Revisar Solicitud:", error);
            alert(`Error al guardar la revisión: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    // ----------------------------------------------------------------------


    // --- Card de Solicitud en lista ---
    const RevisionRow = ({ solicitud }) => (
        <tr 
            onClick={() => handleSelectSolicitud(solicitud)}
            className={`cursor-pointer border-b border-gray-100 transition duration-150 ${selectedSolicitud?.id === solicitud.id ? 'bg-indigo-50 border-indigo-400 shadow-inner' : 'hover:bg-gray-50'}`}
        >
            <Td className="font-semibold text-indigo-600">{solicitud.id}</Td>
            <Td>{solicitud.piezaNombre} ({solicitud.maquina})</Td> 
            <Td className="text-gray-500">{solicitud.solicitanteNombre}</Td> 
            <Td>
                {/* Mostramos la prioridad actual, que será "En Revisión" o "Pendiente" */}
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityClasses(solicitud.prioridadActual || 'Pendiente')}`}>
                    {solicitud.prioridadActual || 'Pendiente'} 
                </span>
            </Td>
            <Td className={`font-medium ${(solicitud.estadoOperacional === 'En Revisión' || solicitud.estadoOperacional === 'Pendiente') ? 'text-red-600' : 'text-green-600'}`}>
                {solicitud.estadoOperacional}
            </Td>
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
                    Mostrando solo solicitudes con prioridad **"En Revisión"** o **"Pendiente"** que requieren tu validación y asignación de prioridad.
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
                                        <Clock size={24} className="mx-auto mb-3 text-green-500"/>
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