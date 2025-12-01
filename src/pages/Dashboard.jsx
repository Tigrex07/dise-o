import React, { useState, useMemo, useEffect } from "react";
import { 
    Search, Filter, ChevronLeft, ChevronRight, Component as ComponentIcon, AlertTriangle, 
    // NUEVOS ICONOS PARA EL MODAL
    X, FileText, Settings, Clock, Clipboard, Zap, UserCheck, MapPin, Activity 
} from "lucide-react"; 

import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../components/apiConfig";
import { ClipboardList, CheckCircle, XCircle, Users } from "lucide-react";
// ----------------------------------------------------------------------
// DEFINICIÓN DE ENDPOINT Y CONSTANTES
// ----------------------------------------------------------------------
const API_SOLICITUDES_URL = `${API_BASE_URL}/Solicitudes`;
// Endpoint para asignaciones (usado para el mapa de maquinistas en la tabla)
const API_ASSIGNMENTS_URL = `${API_BASE_URL}/EstadoTrabajo/Assignments`; 
// 🚨 NUEVO ENDPOINT CONSOLIDADO para detalles del modal
const API_FULL_DETAILS_URL = `${API_BASE_URL}/Dashboard/FullDetails`; 


// 💡 Opciones de filtro
const PRIORITY_FILTER_OPTIONS = [
    { value: "active-only", label: "Activas (Baja, Media, Alta, Urgente)" }, 
    { value: "Urgente", label: "Urgente" },
    { value: "Alta", label: "Alta" },
    { value: "Media", label: "Media" },
    { value: "Baja", label: "Baja" },
    { value: "En Revisión", label: "Pendientes de Revisión" }, 
    { value: "Completado", label: "Completadas" },      
    { value: "RECHAZADA", label: "Rechazadas" },        
    { value: "all", label: "Mostrar Todo (Incluye Historial)" },
];

// Componente para una celda de tabla (reutilizado)
function Td({ children, className = "" }) {
    return (
        <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-800 ${className}`}>
            {children}
        </td>
    );
}

// Lógica de colores para Prioridad
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
        case "Completado": 
            return "text-white bg-green-600 font-bold";
        default: return "text-gray-700 bg-gray-100";
    }
};

// ----------------------------------------------------------------------
// COMPONENTE NUEVO: HISTORIAL DE ESTADO DE TRABAJO (TIMELINE)
// ----------------------------------------------------------------------

function EstadoTrabajoHistory({ history }) {
    if (!history || history.length === 0) {
        return <p className="text-sm text-gray-500 italic p-3">No hay registros de Estado de Trabajo aún.</p>;
    }

    return (
        <ol className="relative border-l border-gray-200 ml-4">                  
            {history.map((step, index) => {
                const isLatest = index === 0;
                
                // Propiedades según el DTO consolidado del backend
                const maquinista = step.maquinistaNombre || '—'; 
                const inicio = new Date(step.fechaYHoraDeInicio).toLocaleString();
                const fin = step.fechaYHoraDeFin ? new Date(step.fechaYHoraDeFin).toLocaleString() : 'En Proceso...';
                
                return (
                    <li key={index} className="mb-6 ml-6">
                        <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white ${isLatest ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                            <Activity size={12} className="text-white"/>
                        </span>
                        
                        <div className={`p-4 rounded-lg border shadow-md ${isLatest ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}`}>
                            <time className="mb-1 text-xs font-normal leading-none text-gray-400">
                                {isLatest ? `Última Actualización: ${inicio}` : `Iniciado: ${inicio}`}
                            </time>
                            
                            <h3 className={`text-md font-semibold ${isLatest ? 'text-indigo-800' : 'text-gray-900'}`}>
                                {step.descripcionOperacion}
                            </h3>
                            
                            <div className="mt-2 grid grid-cols-2 gap-x-4 text-sm text-gray-700">
                                <p className="flex items-center">
                                    <UserCheck size={14} className="mr-1 text-indigo-500" /> 
                                    <span className="font-medium">Maquinista:</span> {maquinista}
                                </p>
                                <p className="flex items-center">
                                    <Settings size={14} className="mr-1 text-indigo-500" /> 
                                    <span className="font-medium">Máquina:</span> {step.maquinaAsignada || 'N/A'}
                                </p>
                                
                                <p className="col-span-1">
                                    <span className="font-medium">Finalizado:</span> {fin}
                                </p>
                                <p className="col-span-1">
                                    <span className="font-medium">Tiempo Máquina:</span> {step.tiempoMaquina || '0.00'} hrs
                                </p>
                            </div>
                            
                            {step.observaciones && (
                                <p className="mt-2 text-xs italic text-gray-500">
                                    Obs: {step.observaciones}
                                </p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}


// ----------------------------------------------------------------------
// COMPONENTE: MODAL DE DETALLES DE SOLICITUD
// ----------------------------------------------------------------------

function PriorityBadge({ priority }) {
    const priorityText = priority || 'Pendiente';
    const classes = getPriorityClasses(priorityText);
    
    return (
        <div className={`p-3 bg-white rounded-lg shadow-sm border`}>
            <p className="text-xs font-medium text-gray-500 flex items-center mb-1">
                <Clipboard size={14} className="mr-1 text-indigo-500" /> Prioridad Actual
            </p>
            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${classes} border border-gray-500 shadow-sm`}>
                {priorityText}
            </span>
        </div>
    );
}


function SolicitudDetailModal({ solicitud, detailData, loadingDetails, onClose }) {
    if (!solicitud) return null;

    const DetailItem = ({ icon: Icon, label, value, className = "" }) => (
        <div className={`p-3 bg-white rounded-lg shadow-sm border ${className}`}>
            <p className="text-xs font-medium text-gray-500 flex items-center mb-1">
                <Icon size={14} className="mr-1 text-indigo-500" /> {label}
            </p>
            <p className="text-sm font-semibold text-gray-900">{value || 'N/A'}</p>
        </div>
    );
    
    const priority = solicitud.prioridadActual || 'Pendiente';
    
    // PROPIEDADES CONSOLIDADAS DEL NUEVO DTO (detailData)
    const revision = detailData.revision;
    const estadoTrabajoLatest = detailData.ultimoEstadoTrabajo; 
    const estadoTrabajoHistory = detailData.historialTrabajo; 
    
    // 🚨 CORRECCIÓN 2: OBTENER TODOS LOS DATOS CONSOLIDADOS DESDE detailData
    const maquinaNombre = detailData.maquina; 
    const piezaNombre = detailData.piezaNombre;
    const solicitanteNombre = detailData.solicitanteNombre;
    const estadoOperacional = detailData.estadoOperacional;
    const areaNombre = detailData.areaNombre; // Correcto, ya estaba en detailData

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800/70 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 lg:p-8">
            <div className="relative w-full max-w-4xl mt-10 mb-10 bg-white rounded-xl shadow-2xl transform transition-all">
                
                {/* Encabezado del Modal */}
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FileText size={24} className="mr-3 text-indigo-600" />
                        Detalles de Solicitud #{solicitud.id}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
                        title="Cerrar"
                    >
                        <X size={24} />
                    </button>
                </div>

                {loadingDetails ? (
                    <div className="p-10 text-center text-indigo-600">
                        <ComponentIcon size={32} className="mx-auto mb-3 animate-spin" />
                        Cargando detalles de Revisión y Estado de Trabajo...
                    </div>
                ) : (
                    <div className="p-6 space-y-8">
                        
                        {/* 1. SECCIÓN: DATOS GENERALES DE LA SOLICITUD */}
                        <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/50">
                            <h3 className="text-lg font-bold text-indigo-700 mb-4 flex items-center">
                                <FileText size={18} className="mr-2" />
                                Información de Creación
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {/* 🚨 Usamos las variables locales que apuntan a detailData */}
                                <DetailItem icon={Clipboard} label="Pieza" value={piezaNombre} />
                                <DetailItem icon={Settings} label="Máquina" value={maquinaNombre} /> 
                                <DetailItem icon={Clock} label="Turno" value={solicitud.turno} />
                                <DetailItem icon={Zap} label="Tipo de Trabajo" value={solicitud.tipo} />
                                
                                <PriorityBadge priority={priority} /> 
                                
                                <DetailItem icon={Settings} label="Estado Operacional" value={estadoOperacional} />
                                <DetailItem icon={Clock} label="Solicitante" value={solicitanteNombre} />
                                <DetailItem icon={MapPin} label="Área de la Pieza" value={areaNombre} /> 
                            </div>
                            
                            <div className="mt-4 p-3 bg-white rounded-lg border">
                                <p className="text-xs font-medium text-gray-500 mb-1">Detalles del Problema:</p>
                                <p className="text-sm text-gray-800 italic">{solicitud.detalles}</p>
                            </div>
                            {solicitud.dibujo && (
                                <div className="mt-2 text-sm">
                                    <a href={solicitud.dibujo} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
                                        Ver Enlace al Dibujo/Plano
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* 2. SECCIÓN: DETALLE DE REVISIÓN */}
                        <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/50">
                            <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center">
                                <Settings size={18} className="mr-2" />
                                Revisión de Ingeniería
                            </h3>
                            {revision ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Usando propiedades del DTO anidado */}
                                        <DetailItem icon={UserCheck} label="Revisor" value={revision.revisorNombre} /> 
                                        <DetailItem icon={Clipboard} label="Prioridad Asignada" value={revision.prioridad} /> 
                                        <DetailItem icon={Clock} label="Fecha de Revisión" value={new Date(revision.fechaHoraRevision).toLocaleString()} />
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Comentarios del Revisor:</p>
                                        <p className="text-sm text-gray-800 italic">{revision.comentarios || 'Sin comentarios.'}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-blue-600 italic">Pendiente de revisión por Ingeniería.</p>
                            )}
                        </div>
                        
                        {/* 3. SECCIÓN: ÚLTIMO ESTADO DE TRABAJO Y ASIGNACIÓN */}
                        <div className="border border-green-200 rounded-xl p-4 bg-green-50/50">
                            <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center">
                                <Clipboard size={18} className="mr-2" />
                                Último Estado y Asignación de Taller
                            </h3>
                            {estadoTrabajoLatest ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Usando propiedades del DTO anidado */}
                                        <DetailItem icon={UserCheck} label="Maquinista Asignado" value={estadoTrabajoLatest.maquinistaNombre || 'N/A'} /> 
                                        <DetailItem icon={Settings} label="Máquina Asignada" value={estadoTrabajoLatest.maquinaAsignada} />
                                        <DetailItem icon={Clipboard} label="Estado Actual" value={estadoTrabajoLatest.descripcionOperacion} />
                                        <DetailItem icon={Clock} label="Fecha de Inicio" value={new Date(estadoTrabajoLatest.fechaYHoraDeInicio).toLocaleString()} />
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Comentarios/Notas del Maquinista:</p>
                                        <p className="text-sm text-gray-800 italic">{estadoTrabajoLatest.observaciones || 'Sin notas del maquinista.'}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-green-600 italic">Aún no se ha iniciado el seguimiento del estado de trabajo.</p>
                            )}
                        </div>
                        
                        {/* 4. SECCIÓN: HISTORIAL DE TRABAJO (TIMELINE) */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                                <Activity size={18} className="mr-2" />
                                Historial de Taller (Timeline)
                            </h3>
                            <EstadoTrabajoHistory history={estadoTrabajoHistory} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// COMPONENTE PARA UNA FILA DE SOLICITUD (Mantenido)
// ----------------------------------------------------------------------
function SolicitudTableRow({ solicitud, maquinistaMap, onRowClick }) {
    const daysOpen = useMemo(() => {
        if (!solicitud.fechaYHora) return 'N/A';
        
        if (solicitud.prioridadActual === 'RECHAZADA' || solicitud.prioridadActual === 'Completado') {
            return 'N/A';
        }
        
        const start = new Date(solicitud.fechaYHora);
        const diffTime = Date.now() - start.getTime();
        const ONE_DAY_MS = 1000 * 60 * 60 * 24;

        if (diffTime < ONE_DAY_MS) {
            return '< 1 Día';
        }

        const diffDays = Math.ceil(diffTime / ONE_DAY_MS);
        return diffDays;
        
    }, [solicitud.fechaYHora, solicitud.prioridadActual, solicitud.estadoOperacional]);

    const assignedMaquinistaName = maquinistaMap[solicitud.id];

    return (
        <tr 
            className="hover:bg-gray-50 cursor-pointer border-b transition duration-150 hover:bg-indigo-50/50"
            onClick={() => onRowClick(solicitud)}
        >
            <Td className="font-semibold text-indigo-600">{solicitud.id}</Td>
            <Td>{solicitud.piezaNombre} ({solicitud.maquina})</Td>
            <Td className="text-gray-500">{solicitud.solicitanteNombre}</Td>
            
            <Td>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityClasses(solicitud.prioridadActual || 'Pendiente')}`}>
                    {solicitud.prioridadActual || 'Pendiente'}
                </span>
            </Td>
            
            <Td className={`font-medium ${solicitud.estadoOperacional === 'En Revisión' ? 'text-red-600' : 'text-green-600'}`}>
                {solicitud.estadoOperacional}
            </Td>
            <Td className="text-gray-500">{new Date(solicitud.fechaYHora).toLocaleDateString()}</Td>
            
            <Td className="font-medium text-gray-700">
                {assignedMaquinistaName || solicitud.maquinistaAsignadoNombre || solicitud.revisorNombre || 'N/A'}
            </Td>
            
            <Td className="text-gray-500 font-medium">{daysOpen}</Td>
            
        </tr>
    );
}

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL: DASHBOARD
// ----------------------------------------------------------------------
export default function Dashboard() {
    const { isAuthenticated } = useAuth();
    
    // --- ESTADOS DE DATOS ---
    const [solicitudes, setSolicitudes] = useState([]);
    const [maquinistaMap, setMaquinistaMap] = useState({}); 
 const [users, setUsers] = useState([]); 

    // --- ESTADOS DE CARGA ---
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPriority, setFilterPriority] = useState("active-only"); 
    
    // --- ESTADOS DE PAGINACIÓN ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25; // <--- DECLARACIÓN CORRECTA (Se usa en el ámbito de la función Dashboard)

    // ESTADOS PARA EL MODAL Y LOS DETALLES
    const [selectedSolicitud, setSelectedSolicitud] = useState(null); 
    const [detailData, setDetailData] = useState({ 
        revision: null, 
        ultimoEstadoTrabajo: null,      
        historialTrabajo: [],           
        areaNombre: null,
        maquina: null, // <-- Inicializar para el nuevo campo
        piezaNombre: null, // <-- Inicializar para el nuevo campo
        solicitanteNombre: null, // <-- Inicializar para el nuevo campo
        estadoOperacional: null, // <-- Inicializar para el nuevo campo
    });
    const [loadingDetails, setLoadingDetails] = useState(false);
    // --- KPIs calculados en tiempo real ---
// --- KPIs calculados en tiempo real ---
const solicitudesTotales = solicitudes.length;
const solicitudesEnProceso = solicitudes.filter(s => s.estadoOperacional === "En Proceso").length;
const solicitudesPendientes = solicitudes.filter(s => s.estadoOperacional === "Pendiente" || s.prioridadActual === "Urgente").length;
const promedioDias = solicitudesTotales > 0
  ? (solicitudes.reduce((acc, s) => acc + (s.diasHastaCompletado || 0), 0) / solicitudesTotales).toFixed(1)
  : 0;


    // --- MANEJADORES DE ESTADO (Sin cambios) ---
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); 
    }
    const handleFilterPriorityChange = (e) => {
        setFilterPriority(e.target.value);
        setCurrentPage(1); 
    }
    
    const closeModal = () => {
        setSelectedSolicitud(null);
        setDetailData({ 
            revision: null, 
            ultimoEstadoTrabajo: null, 
            historialTrabajo: [], 
            areaNombre: null,
            maquina: null,
            piezaNombre: null,
            solicitanteNombre: null,
            estadoOperacional: null
        });
    };
    
    // FUNCIÓN CRÍTICA: Ahora usa UNA SOLA LLAMADA API
    const fetchDetailData = async (solicitud) => {
        setLoadingDetails(true);
        const token = localStorage.getItem("authToken");
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const idSolicitud = solicitud.id; 

        try {
            // ÚNICA LLAMADA AL ENDPOINT CONSOLIDADO del DashboardController
            const response = await fetch(`${API_FULL_DETAILS_URL}/${idSolicitud}`, { headers });

            if (!response.ok) {
                throw new Error("Fallo al cargar los detalles completos de la solicitud desde el DashboardController.");
            }

            const data = await response.json(); 
            
            // 🚨 CORRECCIÓN 1: Mapeo directo de todos los campos consolidados al estado detailData
            setDetailData({
                // Propiedades anidadas
                revision: data.revision,
                ultimoEstadoTrabajo: data.ultimoEstadoTrabajo,
                historialTrabajo: data.historialTrabajo || [], 
                
                // Propiedades de nivel superior (consolidada) que se necesitan en el modal
                areaNombre: data.areaNombre,
                maquina: data.maquina, // <-- ¡Esto garantiza que la máquina esté aquí!
                piezaNombre: data.piezaNombre, 
                solicitanteNombre: data.solicitanteNombre,
                estadoOperacional: data.estadoOperacional,
            });

        } catch (error) {
            console.error("Error fetching detail data from DashboardController:", error);
            setDetailData({ 
                revision: null, 
                ultimoEstadoTrabajo: null, 
                historialTrabajo: [], 
                areaNombre: null, 
                maquina: null, 
                piezaNombre: null,
                solicitanteNombre: null,
                estadoOperacional: null
            });
        } finally {
            setLoadingDetails(false);
        }
    };
    
    const handleRowClick = (solicitud) => {
        setSelectedSolicitud(solicitud);
        fetchDetailData(solicitud); 
    };


    // --- LÓGICA DE CARGA DE DATOS PRINCIPALES (Mantenida) ---
    const fetchAssignments = async () => {
        if (!isAuthenticated) return;
        const token = localStorage.getItem("authToken");

        try {
            const response = await fetch(API_ASSIGNMENTS_URL, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                console.warn("Fallo al cargar las asignaciones de maquinistas.");
                return;
            }

            const data = await response.json();
            
            const map = data.reduce((acc, item) => {
                acc[item.idSolicitud] = item.maquinistaAsignadoNombre;
                return acc;
            }, {});
            
            setMaquinistaMap(map);

        } catch (error) {
            console.error("Error al obtener asignaciones:", error);
        }
    };

    const fetchSolicitudes = async () => {
        if (!isAuthenticated) return;
        const token = localStorage.getItem("authToken");
        setLoadingSolicitudes(true);
        closeModal(); 

        try {
            const response = await fetch(API_SOLICITUDES_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Fallo al cargar las solicitudes");
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

    // EFECTO: Llama a ambas APIs
    useEffect(() => {
        if (isAuthenticated) {
            fetchSolicitudes();
            fetchAssignments(); 
        }
    }, [isAuthenticated]);

    // ----------------------------------------------------------------------
    // --- LÓGICA DE FILTRADO Y PAGINACIÓN (Mantenida) ---
    // ----------------------------------------------------------------------
    const filteredSolicitudes = useMemo(() => {
        let filtered = solicitudes;
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.piezaNombre.toLowerCase().includes(lowerCaseSearchTerm) ||
                s.solicitanteNombre.toLowerCase().includes(lowerCaseSearchTerm) ||
                (maquinistaMap[s.id]?.toLowerCase().includes(lowerCaseSearchTerm)) || 
                (s.maquinistaAsignadoNombre?.toLowerCase().includes(lowerCaseSearchTerm)) || 
                s.id.toString().includes(lowerCaseSearchTerm)
            );
        }

        if (filterPriority !== 'all') {
            filtered = filtered.filter(s => {
                const currentPriority = s.prioridadActual || 'Pendiente'; 
                if (filterPriority === 'active-only') {
                    return ['Baja', 'Media', 'Alta', 'Urgente'].includes(currentPriority);
                }
                return currentPriority === filterPriority;
            });
        }
        return filtered.sort((a, b) => b.id - a.id); 
    }, [solicitudes, searchTerm, filterPriority, maquinistaMap]);
    
    const totalItems = filteredSolicitudes.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    const currentItems = useMemo(() => {
        return filteredSolicitudes.slice(startIndex, endIndex);
    }, [filteredSolicitudes, startIndex, endIndex]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    // ----------------------------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------------------------
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                        <ComponentIcon size={30} className="mr-3 text-indigo-600" />
                        Dashboard de Solicitudes
                    </h1>
                </div>
{/* 🔹 KPIs estilo profesional */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
  {/* Total Solicitudes */}
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
    <ClipboardList className="w-10 h-10 text-indigo-600" />
    <div>
      <p className="text-sm text-gray-500">Total Solicitudes</p>
      <p className="text-3xl font-bold text-gray-800">{solicitudesTotales}</p>
    </div>
  </div>

  {/* En Proceso */}
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
    <Clock className="w-10 h-10 text-blue-600" />
    <div>
      <p className="text-sm text-gray-500">En Proceso</p>
      <p className="text-3xl font-bold text-gray-800">{solicitudesEnProceso}</p>
    </div>
  </div>

  {/* Pendientes / Críticos */}
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
    <AlertTriangle className="w-10 h-10 text-red-600" />
    <div>
      <p className="text-sm text-gray-500">Pendientes / Críticos</p>
      <p className="text-3xl font-bold text-gray-800">{solicitudesPendientes}</p>
    </div>
  </div>

  {/* Días Promedio */}
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
    <Zap className="w-10 h-10 text-green-600" />
    <div>
      <p className="text-sm text-gray-500">Días promedio hasta completado</p>
      <p className="text-3xl font-bold text-green-700">{promedioDias}</p>
    </div>
  </div>
</div>
                {/* Área de Filtros y Búsqueda */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <Filter size={20} className="mr-2 text-indigo-500" />
                        Opciones de Filtrado
                    </h2>
                    <div className="flex flex-wrap items-center space-x-4 space-y-2">
                        
                        {/* FILTRO PRIORIDAD */}
                        <div className="flex items-center space-x-2">
                            <label htmlFor="filterPriority" className="text-sm font-medium text-gray-700">Filtrar por Prioridad/Vista:</label>
                            <select
                                id="filterPriority"
                                name="filterPriority"
                                value={filterPriority}
                                onChange={handleFilterPriorityChange}
                                className="p-2 border border-gray-300 rounded-lg text-sm"
                            >
                                {PRIORITY_FILTER_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
 

                        {/* Búsqueda por Texto */}
                        <div className="flex items-center space-x-2 ml-auto">
                            <Search size={18} className="text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar por Pieza, Solicitante o ID"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="p-2 border border-gray-300 rounded-lg text-sm w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Contenedor de la Tabla */}
                <div className="overflow-x-auto border rounded-xl shadow-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pieza (Máquina)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th> 
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Operacional</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th> 
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días Abierto</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loadingSolicitudes ? (
                                <tr>
                                    <Td colSpan="8" className="text-center py-8 text-indigo-500">Cargando solicitudes...</Td> 
                                </tr>
                            ) : filteredSolicitudes.length > 0 ? (
                                currentItems.map((s) => (
                                    <SolicitudTableRow 
                                        key={s.id} 
                                        solicitud={s} 
                                        maquinistaMap={maquinistaMap} 
                                        onRowClick={handleRowClick}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <Td colSpan="8" className="text-center py-8 text-gray-500">
                                        <AlertTriangle size={24} className="mx-auto mb-2 text-indigo-500" />
                                        No hay solicitudes que coincidan con los filtros.
                                    </Td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* CONTROLES DE PAGINACIÓN */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <ChevronLeft size={16} className="mr-1" /> Anterior
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Siguiente <ChevronRight size={16} className="ml-1" />
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">{Math.min(endIndex, totalItems)}</span> de{' '}
                                    <span className="font-medium">{totalItems}</span> resultados.
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    
                                    {getPageNumbers().map(page => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            aria-current={currentPage === page ? 'page' : undefined}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${currentPage === page 
                                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* INTEGRACIÓN DEL MODAL */}
            <SolicitudDetailModal
                solicitud={selectedSolicitud}
                detailData={detailData}
                loadingDetails={loadingDetails}
                onClose={closeModal}
            />
        </div>
    );
}
