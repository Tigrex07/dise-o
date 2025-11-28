import React, { useState, useEffect, useMemo } from 'react';
import { Briefcase, Clock, Zap, AlertTriangle, Save, RefreshCw, X } from 'lucide-react'; 

// --- IMPORTS CRÍTICAS ---
import { useAuth } from '../context/AuthContext'; 
import API_BASE_URL from '../components/apiConfig'; 
// ------------------------

// URL de los Endpoints
const API_SOLICITUDES_URL = `${API_BASE_URL}/Solicitudes`;
const API_REVISION_URL = `${API_BASE_URL}/Revision`; 
// 💡 NUEVOS ENDPOINTS ASUMIDOS
const API_MAQUINISTAS_URL = `${API_BASE_URL}/Usuarios/Maquinistas`;


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
        case "RECHAZADA": 
            return "text-white bg-gray-600 font-bold"; 
        default: return "text-gray-700 bg-gray-100";
    }
};

// Item de Detalle (para el formulario)
function DetailItem({ label, value }) {
    return (
        <div>
            <p className="font-medium text-gray-700 text-xs uppercase">{label}:</p>
            <p className="text-sm text-gray-900 font-semibold">{value || 'N/A'}</p>
        </div>
    );
}


// --- COMPONENTE PRINCIPAL DE REVISIÓN ---
export default function Revision() {
    const { user, isAuthenticated } = useAuth(); 
    
    const [solicitudes, setSolicitudes] = useState([]);
    // 💡 NUEVO ESTADO: Listas de asignación
    const [maquinistas, setMaquinistas] = useState([]);

    
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
    const [loadingAssignmentData, setLoadingAssignmentData] = useState(true); // Nuevo estado de carga
    
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // 🚨 MODIFICACIÓN: Añadimos los campos de asignación al estado
    const [revisionData, setRevisionData] = useState({
        prioridad: 'Media',
        comentarios: '', 
        idMaquinistaAsignado: '', // 💡 ID del Maquinista seleccionado

    });

    // ----------------------------------------------------------------------
    // --- LÓGICA DE CARGA DE DATOS DE ASIGNACIÓN (NUEVA FUNCIÓN) ---
    // ----------------------------------------------------------------------
    const fetchAssignmentData = async () => {
        if (!isAuthenticated) return;
        const token = localStorage.getItem('authToken');
        const headers = { 'Authorization': `Bearer ${token}` };
        setLoadingAssignmentData(true);

        try {
            // Fetch Maquinistas and Máquinas en paralelo
            const [resMaquinistas] = await Promise.all([
                fetch(API_MAQUINISTAS_URL, { headers })
                
            ]);

            const dataMaquinistas = resMaquinistas.ok ? await resMaquinistas.json() : [];


            setMaquinistas(dataMaquinistas);

            
            // Establecer valores por defecto iniciales para los selects
            setRevisionData(prev => ({ 
                ...prev, 
                idMaquinistaAsignado: dataMaquinistas.length > 0 ? dataMaquinistas[0].id : ''

            }));

        } catch (error) {
            console.error("Error al obtener datos de asignación:", error);
        } finally {
            setLoadingAssignmentData(false);
        }
    };
    
    // ----------------------------------------------------------------------
    // --- LÓGICA DE CARGA DE SOLICITUDES (Incluye botón de recarga) ---
    // ----------------------------------------------------------------------
    const fetchSolicitudes = async () => {
        // ... (código existente) ...
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
        fetchAssignmentData(); // 💡 CARGA INICIAL DE DATOS DE ASIGNACIÓN
    }, [isAuthenticated]); 

    // ----------------------------------------------------------------------
    // --- LÓGICA DE FILTRADO (Por Prioridad Pendiente/En Revisión) ---
    // ----------------------------------------------------------------------
    const filteredSolicitudes = useMemo(() => {
        const PENDING_PRIORITY_VALUES = ["en revisión", "pendiente", null, undefined, ""]; 
        
        return solicitudes
            .filter(s => {
                const currentPriority = s.prioridadActual ? s.prioridadActual.toLowerCase().trim() : '';
                
                // Mantenemos el filtro para ver solo lo que necesita tu acción
                return PENDING_PRIORITY_VALUES.includes(currentPriority) && currentPriority !== "rechazada";
            }) 
            .sort((a, b) => new Date(a.fechaYHora) - new Date(b.fechaYHora)); 
    }, [solicitudes]);
    
    // ----------------------------------------------------------------------
    // --- MANEJO DE SELECCIÓN Y DATOS DEL FORMULARIO ---
    // ----------------------------------------------------------------------
    const handleSelectSolicitud = (solicitud) => {
        setSelectedSolicitud(solicitud);
        
        const initialPriority = (solicitud.prioridadActual === "En Revisión" || solicitud.prioridadActual === "Pendiente" || !solicitud.prioridadActual)
            ? 'Media' 
            : solicitud.prioridadActual; 
            
        // 🚨 MODIFICACIÓN: Inicializamos los campos de asignación a sus valores por defecto
        setRevisionData({
            prioridad: initialPriority, 
            comentarios: '',
            idMaquinistaAsignado: maquinistas.length > 0 ? maquinistas[0].id : '', 
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setRevisionData(prev => ({ ...prev, [name]: value }));
    };

    // ----------------------------------------------------------------------
    // --- FUNCIÓN AUXILIAR PARA LA PETICIÓN (USADA POR AMBOS: APROBAR y RECHAZAR) ---
    // ----------------------------------------------------------------------
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
    
    // ----------------------------------------------------------------------
    // --- LÓGICA DE APROBACIÓN (POST con Asignación + Manejo de 409 con PUT) ---
    // ----------------------------------------------------------------------
    const handleSaveRevision = async (e) => {
        e.preventDefault();
        if (!selectedSolicitud || isSaving || loadingAssignmentData) return;
        
        // 🚨 1. DTO BASE (RevisionCreationDto) para la actualización PUT (si ya existe)
        const baseDto = {
            idSolicitud: selectedSolicitud.id, 
            idRevisor: user.id, 
            prioridad: revisionData.prioridad,
            comentarios: revisionData.comentarios || null,
        };

        // 🚨 2. DTO COMPLETO (RevisionApprovalDto) para la creación POST (con asignación)
        const approvalDto = {
            ...baseDto,
            // Aseguramos que el ID sea numérico para el backend
            idMaquinistaAsignado: parseInt(revisionData.idMaquinistaAsignado), 
        };
        
        // 🚨 VALIDACIÓN MÍNIMA DE ASIGNACIÓN
        if (!approvalDto.idMaquinistaAsignado) {
             return alert("Error: Debe seleccionar un Maquinista para aprobar la solicitud.");
        }

        setIsSaving(true);
        let response;
        let methodToUse = 'POST'; 
        let dtoToSend = approvalDto; // Por defecto usamos el DTO completo

        try {
            // 1. --- Intento Inicial: POST (Crear la revisión y asignación) ---
            response = await executeRevisionRequest(methodToUse, API_REVISION_URL, dtoToSend);

            // 2. --- Manejo del 409 Conflict: Fallback a PUT (Actualizar) ---
            if (!response.ok && response.status === 409) {
                console.log("POST falló con 409. Intentando PUT (Actualización simple)...");
                
                methodToUse = 'PUT';
                const putUrl = `${API_REVISION_URL}/${selectedSolicitud.id}`; 
                
                // 🚨 Para PUT, usamos el DTO simple (RevisionCreationDto)
                dtoToSend = baseDto; 
                
                response = await executeRevisionRequest(methodToUse, putUrl, dtoToSend);
            }
            
            // --- Manejo de la Respuesta Final ---
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Fallo al ${methodToUse === 'POST' ? 'crear' : 'actualizar'} la revisión. Código: ${response.status}. Mensaje: ${errorText.substring(0, 100)}`);
            }

            alert(`Revisión de Solicitud #${selectedSolicitud.id} guardada/actualizada con éxito. Maquinista asignado.`);
            
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
    // --- LÓGICA: RECHAZAR SOLICITUD ---
    // ----------------------------------------------------------------------
    const handleRejectSolicitud = async () => {
        if (!selectedSolicitud || isSaving) return;

        const confirmRejection = window.confirm(
            `¿Estás seguro de que deseas RECHAZAR la Solicitud #${selectedSolicitud.id}? Esta acción marcará la prioridad como "RECHAZADA".`
        );

        if (!confirmRejection) return;

        setIsSaving(true);
        let methodToUse = 'PUT';
        const putUrl = `${API_REVISION_URL}/${selectedSolicitud.id}`; 
        
        // 🚨 DTO SIMPLE para el rechazo (RevisionCreationDto)
        const rejectionDto = {
            idSolicitud: selectedSolicitud.id, 
            idRevisor: user.id, 
            prioridad: 'RECHAZADA', 
            comentarios: revisionData.comentarios || "Solicitud marcada como Rechazada por Ingeniería.", 
        };
        
        // 🚨 DTO COMPLETO para el POST de Rechazo (para cumplir con el DTO del backend)
        const rejectionApprovalDto = {
             ...rejectionDto,
             idMaquinistaAsignado: maquinistas.length > 0 ? maquinistas[0].id : 1, // Usar un ID válido para el DTO
             maquinaAsignada: 'N/A' 
        };

        try {
            let response;
            // 1. Intento 1: PUT (Si ya existe una revisión)
            response = await executeRevisionRequest(methodToUse, putUrl, rejectionDto);

            // 2. Intento 2: POST (Si es la primera vez que se toca la solicitud)
            if (!response.ok) {
                 methodToUse = 'POST'; 
                 // Usamos el DTO de aprobación, pero con prioridad RECHAZADA
                 response = await executeRevisionRequest(methodToUse, API_REVISION_URL, rejectionApprovalDto);
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Fallo al rechazar la solicitud. Código: ${response.status}.`);
            }

            alert(`Solicitud #${selectedSolicitud.id} ha sido marcada como RECHAZADA.`);
            
            setSelectedSolicitud(null);
            await fetchSolicitudes(); 
            
        } catch (error) {
            console.error("[API Error] Rechazar Solicitud:", error);
            alert(`Error al rechazar la solicitud: ${error.message}`);
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
            <Td>{solicitud.piezaNombre} {solicitud.maquina ? `(${solicitud.maquina})` : ''}</Td> 
            <Td className="text-gray-500">{solicitud.solicitanteNombre}</Td> 
            <Td>
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
                {/* ... (encabezados de lista) ... */}
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Briefcase size={24} className="mr-2 text-indigo-600" />
                        Bandeja de Revisión
                    </h2>
                    {/* Botón de Recarga */}
                    <button
                        onClick={fetchSolicitudes}
                        disabled={loadingSolicitudes || isSaving || loadingAssignmentData}
                        className={`p-2 rounded-full transition duration-150 ${loadingSolicitudes || loadingAssignmentData ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'}`}
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
                        {/* ... (thead) ... */}
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
                    Asignación de Prioridad y Trabajo
                </h3>
                
                {loadingAssignmentData ? (
                    <div className="text-center py-10 text-gray-500">
                        <RefreshCw size={32} className="mx-auto mb-3 text-blue-500 animate-spin" />
                        <p>Cargando datos de asignación (Maquinistas/Máquinas)...</p>
                    </div>
                ) : !selectedSolicitud ? (
                    <div className="text-center py-10 text-gray-500">
                        <AlertTriangle size={32} className="mx-auto mb-3 text-blue-500" />
                        <p>Selecciona una solicitud de la lista para asignarle prioridad y finalizar la revisión.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSaveRevision} className="space-y-5">
                        
                        {/* ----------------------------------------------------------- */}
                        {/* SECCIÓN: DETALLES AMPLIADOS DE LA SOLICITUD */}
                        {/* ----------------------------------------------------------- */}
                        <div className="space-y-4">
                            <p className="font-semibold text-xl text-indigo-700 border-b pb-2">Solicitud ID: {selectedSolicitud.id}</p>
                            
                            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <DetailItem label="Solicitante" value={selectedSolicitud.solicitanteNombre} /> 
                                <DetailItem 
                                    label="Pieza (Máquina)" 
                                    value={`${selectedSolicitud.piezaNombre}${selectedSolicitud.maquina ? ` (${selectedSolicitud.maquina})` : ''}`} 
                                /> 
                                <DetailItem label="Turno" value={selectedSolicitud.turno} />
                                <DetailItem label="Tipo Trabajo" value={selectedSolicitud.tipo} /> 
                            </div>

                            <div className="border-t pt-3">
                                <p className="font-medium text-gray-700 mb-1">Detalles de la Solicitud:</p>
                                <p className="text-gray-600 italic text-sm border-b pb-3">{selectedSolicitud.detalles}</p>
                            </div>

                            {selectedSolicitud.dibujo && (
                                <div className="pb-3">
                                    <p className="font-medium text-gray-700 mb-1">Documentación / Dibujo:</p>
                                    <a 
                                        href={selectedSolicitud.dibujo} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-bold truncate block"
                                    >
                                        🔗 Abrir Enlace al Dibujo
                                    </a>
                                </div>
                            )}
                        </div>
                        {/* ----------------------------------------------------------- */}
                        
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
                        
                        {/* ----------------------------------------------------------- */}
                        {/* 💡 NUEVOS CAMPOS: ASIGNACIÓN DE MAQUINISTA Y MÁQUINA */}
                        {/* ----------------------------------------------------------- */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Asignar Maquinista */}
                            <div>
                                <label htmlFor="idMaquinistaAsignado" className="block text-sm font-medium text-gray-700 mb-1">
                                    Maquinista Asignado *
                                </label>
                                <select
                                    id="idMaquinistaAsignado"
                                    name="idMaquinistaAsignado"
                                    value={revisionData.idMaquinistaAsignado}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                    disabled={maquinistas.length === 0}
                                >
                                    {maquinistas.length === 0 ? (
                                        <option value="">Cargando Maquinistas...</option>
                                    ) : (
                                        maquinistas.map(m => (
                                            // Asumimos que los maquinistas tienen un campo 'id' y 'nombre'
                                            <option key={m.id} value={m.id}>
                                                {m.nombre} (ID: {m.id})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Asignar Máquina Inicial */}
                            
                        </div>
                        {/* ----------------------------------------------------------- */}
                        
                         {/* Comentarios de Ingeniería */}
                        <div>
                            <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-1">Comentarios de Ingeniería (Opcional)</label>
                            <textarea
                                id="comentarios"
                                name="comentarios"
                                value={revisionData.comentarios}
                                onChange={handleFormChange}
                                rows="3"
                                placeholder="Instrucciones para el operador, notas de material o motivo de rechazo..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            ></textarea>
                        </div>

                        <div className="flex justify-between pt-3">
                            {/* Botón de Rechazar Solicitud */}
                            <button
                                type="button" 
                                onClick={handleRejectSolicitud}
                                disabled={isSaving}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-md transition ${isSaving ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                            >
                                <X size={18} className="mr-2" />
                                Rechazar Solicitud
                            </button>

                            {/* Botón de Guardar Revisión (Aprobar) - type="submit" */}
                            <button
                                type="submit"
                                disabled={isSaving || !revisionData.idMaquinistaAsignado }
                                className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md transition ${isSaving || !revisionData.idMaquinistaAsignado ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                <Save size={18} className="mr-2" />
                                {isSaving ? 'Guardando...' : 'Aprobar y Asignar'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}