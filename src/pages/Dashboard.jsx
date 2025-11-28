import React, { useState, useMemo, useEffect } from "react";
import { Eye, Search, Filter, ChevronLeft, ChevronRight, Component as ComponentIcon, AlertTriangle } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../components/apiConfig";

// ----------------------------------------------------------------------
// DEFINICIÓN DE ENDPOINT Y CONSTANTES
// ----------------------------------------------------------------------
const API_SOLICITUDES_URL = `${API_BASE_URL}/Solicitudes`;
// 🚨 NUEVO: Endpoint traído de Dashboard2 para las asignaciones
const API_ASSIGNMENTS_URL = `${API_BASE_URL}/EstadoTrabajo/Assignments`; 

// 💡 Opciones de filtro (Conservando las de tu Dashboard original)
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
// COMPONENTE PARA UNA FILA DE SOLICITUD
// ----------------------------------------------------------------------
// 🚨 MODIFICADO: Ahora recibe 'maquinistaMap' como prop
function SolicitudTableRow({ solicitud, maquinistaMap }) {
    const navigate = useNavigate();

    // 💡 Lógica para calcular Días Abiertos (Mantenida de TU archivo original)
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

    // 🚨 LÓGICA FUSIONADA: Obtener nombre del mapa o usar fallbacks
    const assignedMaquinistaName = maquinistaMap[solicitud.id];

    return (
        <tr className="hover:bg-gray-50 cursor-pointer border-b">
            <Td className="font-semibold text-indigo-600">{solicitud.id}</Td>
            <Td>{solicitud.piezaNombre} ({solicitud.maquina})</Td>
            <Td className="text-gray-500">{solicitud.solicitanteNombre}</Td>
            
            {/* Prioridad Actual */}
            <Td>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityClasses(solicitud.prioridadActual || 'Pendiente')}`}>
                    {solicitud.prioridadActual || 'Pendiente'}
                </span>
            </Td>
            
            <Td className={`font-medium ${solicitud.estadoOperacional === 'En Revisión' ? 'text-red-600' : 'text-green-600'}`}>
                {solicitud.estadoOperacional}
            </Td>
            <Td className="text-gray-500">{new Date(solicitud.fechaYHora).toLocaleDateString()}</Td>
            
            {/* 🚨 RESPONSABLE FUSIONADO: Prioridad al mapa, luego al DTO, luego N/A */}
            <Td className="font-medium text-gray-700">
                {assignedMaquinistaName || solicitud.maquinistaAsignadoNombre || solicitud.revisorNombre || 'N/A'}
            </Td>
            
            {/* DÍAS ABIERTOS */}
            <Td className="text-gray-500 font-medium">{daysOpen}</Td>
            
            <Td>
                <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/solicitudes/${solicitud.id}`); }}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100 transition duration-150"
                    title="Ver Detalles"
                >
                    <Eye size={18} />
                </button>
            </Td>
        </tr>
    );
}

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL: DASHBOARD
// ----------------------------------------------------------------------
export default function Dashboard() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [solicitudes, setSolicitudes] = useState([]);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);

    // 🚨 NUEVO ESTADO: Mapa para buscar el maquinista por ID de Solicitud (Traído de Dashboard2)
    const [maquinistaMap, setMaquinistaMap] = useState({}); 

    const [searchTerm, setSearchTerm] = useState("");
    const [filterPriority, setFilterPriority] = useState("active-only"); 
    
    // 💡 ESTADOS DE PAGINACIÓN (Mantenido en 25 ítems como en tu original)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25; 

    // --- MANEJADORES DE ESTADO ---
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); 
    }
    const handleFilterPriorityChange = (e) => {
        setFilterPriority(e.target.value);
        setCurrentPage(1); 
    }

    // --- LÓGICA DE CARGA DE ASIGNACIONES (Traído de Dashboard2) ---
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
            
            // Convertir la lista a un mapa para búsquedas rápidas
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

    // 🚨 EFECTO FUSIONADO: Llama a ambas APIs
    useEffect(() => {
        if (isAuthenticated) {
            fetchSolicitudes();
            fetchAssignments(); 
        }
    }, [isAuthenticated]);

    // ----------------------------------------------------------------------
    // --- LÓGICA DE FILTRADO (useMemo) ---
    // ----------------------------------------------------------------------
    const filteredSolicitudes = useMemo(() => {
        let filtered = solicitudes;

        // 1. Filtrar por Búsqueda
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.piezaNombre.toLowerCase().includes(lowerCaseSearchTerm) ||
                s.solicitanteNombre.toLowerCase().includes(lowerCaseSearchTerm) ||
                // 🚨 FUSIONADO: Buscar también en el mapa de maquinistas si ya cargó
                (maquinistaMap[s.id]?.toLowerCase().includes(lowerCaseSearchTerm)) || 
                (s.maquinistaAsignadoNombre?.toLowerCase().includes(lowerCaseSearchTerm)) || 
                s.id.toString().includes(lowerCaseSearchTerm)
            );
        }

        // 2. Aplicar Filtro de Prioridad/Vista
        if (filterPriority !== 'all') {
            filtered = filtered.filter(s => {
                const currentPriority = s.prioridadActual || 'Pendiente'; 
                
                if (filterPriority === 'active-only') {
                    return ['Baja', 'Media', 'Alta', 'Urgente'].includes(currentPriority);
                }
                
                return currentPriority === filterPriority;
            });
        }

        // Ordenar por ID descendente
        return filtered.sort((a, b) => b.id - a.id); 
    }, [solicitudes, searchTerm, filterPriority, maquinistaMap]);
    
    // ----------------------------------------------------------------------
    // --- LÓGICA DE PAGINACIÓN (useMemo) ---
    // ----------------------------------------------------------------------
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
    // RENDERIZADO (Diseño original TUYO conservado)
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
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loadingSolicitudes ? (
                                <tr>
                                    <Td colSpan="9" className="text-center py-8 text-indigo-500">Cargando solicitudes...</Td>
                                </tr>
                            ) : filteredSolicitudes.length > 0 ? (
                                // 🚨 AQUÍ PASAMOS 'maquinistaMap' A LA FILA
                                currentItems.map((s) => (
                                    <SolicitudTableRow 
                                        key={s.id} 
                                        solicitud={s} 
                                        maquinistaMap={maquinistaMap} 
                                    />
                                ))
                            ) : (
                                <tr>
                                    <Td colSpan="9" className="text-center py-8 text-gray-500">
                                        <AlertTriangle size={24} className="mx-auto mb-2 text-indigo-500" />
                                        No hay solicitudes que coincidan con los filtros.
                                    </Td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* CONTROLES DE PAGINACIÓN (Tu diseño original) */}
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
        </div>
    );
}