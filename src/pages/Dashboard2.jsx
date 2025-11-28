import React, { useState, useMemo, useEffect } from "react";
import { Eye, Search, Filter, ChevronLeft, ChevronRight, Component as ComponentIcon, AlertTriangle, Download, PlusCircle } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../components/apiConfig";

// ----------------------------------------------------------------------
// DEFINICIÓN DE ENDPOINT Y CONSTANTES
// ----------------------------------------------------------------------
const API_SOLICITUDES_URL = `${API_BASE_URL}/Solicitudes`;
// 🚨 NUEVO ENDPOINT ASUMIDO para obtener asignaciones
const API_ASSIGNMENTS_URL = `${API_BASE_URL}/EstadoTrabajo/Assignments`; 


// 💡 Opciones de filtro ÚNICAS (Prioridad y Vistas de Historial)
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
        case "Completado": return "text-blue-700 bg-blue-100 font-medium";
        case "RECHAZADA": return "text-white bg-red-900 font-bold";
        default: return "text-gray-700 bg-gray-100";
    }
};

// Cálculo de días de apertura
const calculateDaysOpen = (fechaCreacion) => {
    if (!fechaCreacion) return null;
    const today = new Date();
    const creationDate = new Date(fechaCreacion);
    const diffTime = Math.abs(today - creationDate);
    const ONE_DAY_MS = 1000 * 60 * 60 * 24;
    
    if (diffTime < ONE_DAY_MS) {
        return 0;
    }
    
    const diffDays = Math.ceil(diffTime / ONE_DAY_MS);
    return diffDays;
};

// ----------------------------------------------------------------------
// Componente de Fila de Tabla
// ----------------------------------------------------------------------
// 🚨 MODIFICACIÓN: Aceptar maquinistaMap
function SolicitudTableRow({ solicitud, maquinistaMap }) { 
    const navigate = useNavigate();
    
    const { 
        id, 
        piezaNombre, 
        maquina,
        solicitanteNombre, 
        prioridadActual, // Prioridad asignada por el revisor (Urgente, Alta, etc.)
        estadoOperacional, // Estado de la fase del proceso (En Proceso, Iniciada, etc.)
        fechaYHora, 
        responsable, // Responsable que viene del DTO original (posiblemente el Revisor)
    } = solicitud;
    
    // 💡 PASO CLAVE: Obtener el nombre del Maquinista asignado desde el mapa
    const assignedMaquinistaName = maquinistaMap[id]; 

    // Lógica para mostrar Estado y Prioridad
    let displayEstado = estadoOperacional;

    if (!estadoOperacional || estadoOperacional === 'Pendiente' || prioridadActual === 'Pendiente' || !prioridadActual) {
        displayEstado = "En Revisión";
    } else if (estadoOperacional === 'Aprobada') {
        displayEstado = 'En Cola';
    } 

    const diasAbierto = useMemo(() => calculateDaysOpen(fechaYHora), [fechaYHora]);

    // Lógica para Días Abiertos
    const isClosedOrRejected = prioridadActual === 'Completado' || prioridadActual === 'RECHAZADA';
    
    const daysContent = isClosedOrRejected
        ? '—' 
        : (diasAbierto === 0 ? '< 1 Día' : `${diasAbierto} días`);
    
    const daysColorClass = isClosedOrRejected
        ? 'text-gray-500' 
        : (diasAbierto > 20 ? 'text-red-600' : 'text-green-600'); 

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition duration-150">
            <Td className="font-semibold text-indigo-600">{id}</Td>
            <Td>{piezaNombre} ({maquina})</Td>
            <Td className="text-gray-500">{solicitanteNombre}</Td>
            
            {/* COLUMNA DE PRIORIDAD */}
            <Td>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityClasses(prioridadActual)}`}>
                    {prioridadActual || 'Pendiente'}
                </span>
            </Td>
            
            {/* COLUMNA DE ESTADO */}
            <Td className={`font-medium ${displayEstado === "En Revisión" ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                {displayEstado}
            </Td>

            {/* 🚨 COLUMNA RESPONSABLE: Usa el Maquinista Asignado, si no, usa el responsable del DTO */}
            <Td className="font-medium text-gray-700">
                {assignedMaquinistaName || responsable || "—"}
            </Td> 
            
            {/* COLUMNA DÍAS ABIERTO */}
            <Td className={`font-medium ${daysColorClass}`}>
                {daysContent}
            </Td>
            
            {/* ACCIONES */}
            <Td>
                <button
                    title="Ver Detalles"
                    onClick={() => navigate(`/solicitud-detalles/${id}`)}
                    className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 transition"
                >
                    <Eye size={18} />
                </button>
            </Td>
        </tr>
    );
}

// ----------------------------------------------------------------------
// Componente Principal
// ----------------------------------------------------------------------
export default function Dashboard() {
    const { user, isAuthenticated, loading: loadingUser } = useAuth();
    const navigate = useNavigate();

    const [solicitudes, setSolicitudes] = useState([]);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPriority, setFilterPriority] = useState("active-only"); // Usamos prioridad como filtro principal
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 🚨 NUEVO ESTADO: Mapa para buscar el maquinista por ID de Solicitud
    const [maquinistaMap, setMaquinistaMap] = useState({}); 
    
    // --- LÓGICA DE CARGA DE ASIGNACIONES (DOBLE LLAMADA API) ---
    const fetchAssignments = async () => {
        if (!isAuthenticated) return;
        const token = localStorage.getItem("authToken");

        try {
            const response = await fetch(API_ASSIGNMENTS_URL, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                console.warn("Fallo al cargar las asignaciones de maquinistas. Revisar el endpoint C#.");
                return;
            }

            const data = await response.json();
            
            // Convertir la lista a un mapa para búsquedas rápidas O(1)
            const map = data.reduce((acc, item) => {
                acc[item.idSolicitud] = item.maquinistaAsignadoNombre;
                return acc;
            }, {});
            
            setMaquinistaMap(map);

        } catch (error) {
            console.error("Error al obtener asignaciones:", error);
        }
    };
    
    // LÓGICA DE CARGA DE SOLICITUDES
    const fetchSolicitudes = async () => {
        if (!isAuthenticated) return;
        
        setLoadingSolicitudes(true);
        try {
            const response = await fetch(API_SOLICITUDES_URL);

            if (!response.ok) {
                throw new Error(`Error ${response.status} al cargar solicitudes.`);
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

    // 🚨 MODIFICACIÓN: Llamar a ambas funciones en useEffect
    useEffect(() => {
        if (!loadingUser && isAuthenticated) {
            fetchSolicitudes();
            fetchAssignments(); // 💡 Llamar a la nueva función de asignaciones
        }
    }, [isAuthenticated, loadingUser]);


    // LÓGICA DE FILTRADO, BÚSQUEDA Y PAGINACIÓN (useMemo)
    const filteredSolicitudes = useMemo(() => {
        let temp = solicitudes;

        // 1. FILTRADO POR PRIORIDAD/ESTADO
        if (filterPriority !== "all") {
            if (filterPriority === "active-only") {
                 // Activas: No Completadas, No Rechazadas, No Pendientes de Revisión.
                const inactivePriorities = ["Completado", "RECHAZADA", "En Revisión"];
                temp = temp.filter(s => !inactivePriorities.includes(s.prioridadActual) && s.estadoOperacional !== 'En Revisión');
            } else {
                temp = temp.filter(s => s.prioridadActual === filterPriority);
            }
        }
        
        // 2. FILTRAR POR TÉRMINO DE BÚSQUEDA (ID, Pieza, Solicitante)
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            temp = temp.filter(s =>
                String(s.id).includes(lowerCaseSearch) ||
                (s.piezaNombre && s.piezaNombre.toLowerCase().includes(lowerCaseSearch)) ||
                (s.solicitanteNombre && s.solicitanteNombre.toLowerCase().includes(lowerCaseSearch))
            );
        }

        // 3. ORDENAR (Por ID descendente para el más reciente)
        return temp.sort((a, b) => b.id - a.id); 
    }, [solicitudes, searchTerm, filterPriority]);


    // CÁLCULO DE PAGINACIÓN
    const totalItems = filteredSolicitudes.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredSolicitudes.slice(startIndex, endIndex);
    }, [filteredSolicitudes, currentPage, itemsPerPage]);

    // Manejador de cambio de página
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Resetea la página al cambiar filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterPriority]);
    
    // Lógica para generar los números de página a mostrar
    const pageNumbers = useMemo(() => {
        const maxPagesToShow = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    }, [currentPage, totalPages]);


    // RENDERIZADO
    if (loadingUser || loadingSolicitudes) {
        return <div className="p-8 text-center text-xl text-indigo-600">Cargando Dashboard...</div>;
    }

    if (!isAuthenticated) {
        return <div className="p-8 text-center text-xl text-red-600">Acceso no autorizado. Por favor, inicie sesión.</div>;
    }

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">Panel de Solicitudes</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={() => navigate('/solicitar')}
                        className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-md"
                    >
                        <PlusCircle size={20} className="mr-2" />
                        Nueva Solicitud
                    </button>
                    <button
                        title="Exportar datos (CSV/Excel)"
                        // La función handleExport necesitaría implementarse, por ahora solo el botón
                        onClick={() => alert("Función de exportar pendiente de implementar.")}
                        className="flex items-center px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition shadow-md"
                    >
                        <Download size={20} className="mr-2" />
                        Exportar
                    </button>
                </div>
            </header>

            {/* CONTROLES DE TABLA */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    {/* Búsqueda */}
                    <div className="relative w-full md:w-1/3">
                        <input
                            type="text"
                            placeholder="Buscar por ID, Pieza o Solicitante"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Filtro de Prioridad */}
                    <div className="relative w-full md:w-auto">
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="block w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                        >
                            {PRIORITY_FILTER_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <Filter size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* TABLA DE SOLICITUDES */}
                <div className="overflow-x-auto border rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pieza (Máquina)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días Abierto</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loadingSolicitudes ? (
                                <tr>
                                    <Td colSpan="8" className="text-center py-8 text-indigo-500">Cargando solicitudes...</Td>
                                </tr>
                            ) : currentItems.length > 0 ? (
                                // 🚨 CAMBIO: Paginación usando currentItems y pasando la prop maquinistaMap
                                currentItems.map((s) => <SolicitudTableRow key={s.id} solicitud={s} maquinistaMap={maquinistaMap} />)
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

                {/* PAGINACIÓN */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Siguiente
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="font-medium">{totalItems}</span> resultados
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
                                    
                                    {pageNumbers.map((page) => (
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