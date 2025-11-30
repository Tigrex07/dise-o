import React, { useState, useEffect, useMemo } from 'react';
// 💥 Corrección de Imports (UserCheck y Search)
import { Briefcase, Clock, Zap, AlertTriangle, Save, RefreshCw, X, ChevronLeft, ChevronRight, UserCheck, Search, FileText } from 'lucide-react'; 

// --- IMPORTS CRÍTICAS ---
import { useAuth } from '../context/AuthContext'; 
import API_BASE_URL from '../components/apiConfig'; 
// ------------------------

// URL de los Endpoints
const API_SOLICITUDES_URL = `${API_BASE_URL}/Solicitudes`;
const API_REVISION_URL = `${API_BASE_URL}/Revision`; 
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

// Componente para mostrar detalles de la solicitud seleccionada
function DetailItem({ icon: Icon, label, value }) {
    return (
        <div className="p-3 bg-white rounded-lg shadow-sm border">
            <p className="text-xs font-medium text-gray-500 flex items-center mb-1">
                <Icon size={14} className="mr-1 text-blue-500" /> {label}
            </p>
            <p className="text-sm font-semibold text-gray-900">{value || 'N/A'}</p>
        </div>
    );
}

// ----------------------------------------------------------------------
// COMPONENTE PARA UNA FILA DE SOLICITUD
// ----------------------------------------------------------------------
function SolicitudTableRow({ solicitud, onRowClick }) {
    
    // ... Lógica daysOpen ... (se asume que es correcta)
    const daysOpen = useMemo(() => {
        if (!solicitud.fechaYHora || solicitud.prioridadActual === 'RECHAZADA' || solicitud.prioridadActual === 'Completado') {
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
    }, [solicitud.fechaYHora, solicitud.prioridadActual]);

    return (
        <tr 
            className="hover:bg-gray-50 cursor-pointer border-b transition duration-150 hover:bg-indigo-50/50"
            onClick={() => onRowClick(solicitud)}
        >
            <Td className="font-semibold text-indigo-600">{solicitud.id}</Td>
            
            {/* ✅ Pieza (Máquina) en la tabla */}
            <Td>
                {solicitud.piezaNombre} 
                <span className="text-gray-500 text-xs"> 
                    ({solicitud.maquina || 'N/A'})
                </span>
            </Td>

            <Td className="text-gray-500">{solicitud.solicitanteNombre}</Td>
            
            <Td>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityClasses(solicitud.prioridadActual || 'Pendiente')}`}>
                    {solicitud.prioridadActual || 'Pendiente'}
                </span>
            </Td>
            
            <Td className={`font-medium ${solicitud.prioridadActual === 'En Revisión' ? 'text-red-600' : 'text-green-600'}`}>
                {solicitud.estadoOperacional || 'N/A'}
            </Td>
            <Td className="text-gray-500">{new Date(solicitud.fechaYHora).toLocaleDateString()}</Td>
            <Td className="text-gray-500 font-medium">{daysOpen}</Td>
        </tr>
    );
}


// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL: REVISION
// ----------------------------------------------------------------------
export default function Revision() {
    const { isAuthenticated, user } = useAuth(); 
    
    // --- ESTADOS ---
    const [solicitudes, setSolicitudes] = useState([]);
    const [maquinistas, setMaquinistas] = useState([]); 
    const [selectedSolicitud, setSelectedSolicitud] = useState(null); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // --- ESTADOS DE UI/CARGA ---
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false); // Para detalles al abrir modal
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // --- ESTADOS DE PAGINACIÓN ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    

    // --- FETCH DE DATOS ---
    const fetchSolicitudes = async () => {
        if (!isAuthenticated) return;
        const token = localStorage.getItem("authToken");
        setLoadingSolicitudes(true);
        // setSelectedSolicitud(null); // No limpiar aquí para no cerrar el modal inesperadamente
        setIsModalOpen(false); // Asegurar que el modal se cierre al recargar la tabla

        try {
            const response = await fetch(API_SOLICITUDES_URL, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Fallo al cargar las solicitudes");
            }

            const data = await response.json();
            // Filtramos solo las que están "En Revisión" o no tienen prioridad asignada
            const pendientes = data.filter(s => 
                s.prioridadActual === 'En Revisión' || !s.prioridadActual
            );
            setSolicitudes(pendientes);

        } catch (error) {
            console.error("Error al obtener solicitudes:", error);
            setSolicitudes([]);
        } finally {
            setLoadingSolicitudes(false);
        }
    };
    
    // 💡 Nueva función para obtener los detalles completos al abrir el modal
    const fetchSolicitudDetails = async (solicitudId) => {
        const token = localStorage.getItem("authToken");
        setLoadingDetails(true);
        try {
            // Asumimos que podemos hacer un GET a /Solicitudes/{id} para detalles completos
            const response = await fetch(`${API_SOLICITUDES_URL}/${solicitudId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Fallo al cargar detalles de la solicitud");
            
            const detailData = await response.json();
            return detailData;
        } catch (error) {
            console.error("Error fetching solicitud details:", error);
            return null;
        } finally {
            setLoadingDetails(false);
        }
    };
    
    const fetchMaquinistas = async () => {
        if (!isAuthenticated) return;
        const token = localStorage.getItem("authToken");

        try {
            const response = await fetch(API_MAQUINISTAS_URL, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Fallo al cargar maquinistas");
            }

            const data = await response.json();
            setMaquinistas(data);

        } catch (error) {
            console.error("Error al obtener maquinistas:", error);
            setMaquinistas([]);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchSolicitudes();
            fetchMaquinistas();
        }
    }, [isAuthenticated]);

    // --- MANEJADORES DE UI ---
    // ✅ Lógica similar al Dashboard para abrir el Modal y obtener detalles
    const handleSelectSolicitud = async (solicitud) => {
        // Usamos la solicitud de la tabla como base, luego buscamos el detalle completo
        setSelectedSolicitud(solicitud);
        setIsModalOpen(true);
        
        const fullDetails = await fetchSolicitudDetails(solicitud.id);
        
        if (fullDetails) {
            // Si el detalle se cargó, actualizar con la info completa (incluyendo Máquina)
            setSelectedSolicitud(fullDetails);
        } else {
            // Si falla, al menos mostramos la info de la tabla
            console.warn("No se pudo obtener el detalle completo, mostrando datos de la tabla.");
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSolicitud(null);
    };

    // --- LÓGICA DE ENVÍO DE FORMULARIO ---
    const handleSubmitRevision = async (revisionData) => {
        if (!selectedSolicitud || isSaving) return;

        // Validar que se haya seleccionado un maquinista si la prioridad no es 'RECHAZADA'
        if (revisionData.prioridad !== 'RECHAZADA' && !revisionData.idMaquinistaAsignado) {
            alert('Por favor, asigne un maquinista antes de aprobar la solicitud.');
            return;
        }

        setIsSaving(true);
        const token = localStorage.getItem("authToken");
        
        const idRevisor = user?.id; 

        const revisionPayload = {
            idSolicitud: selectedSolicitud.id,
            idRevisor: idRevisor, 
            prioridad: revisionData.prioridad,
            comentarios: revisionData.comentarios,
            idMaquinistaAsignado: revisionData.prioridad !== 'RECHAZADA' ? revisionData.idMaquinistaAsignado : null,
            fechaHoraRevision: new Date().toISOString(),
        };
        
        try {
            const response = await fetch(API_REVISION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(revisionPayload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al guardar la revisión: ${errorText}`);
            }

            alert(`Solicitud #${selectedSolicitud.id} revisada y guardada correctamente.`);
            
            // Recargar la lista de solicitudes y cerrar el modal
            await fetchSolicitudes();
            closeModal();

        } catch (error) {
            console.error("Error en el envío de la revisión:", error);
            alert(`Fallo al guardar la revisión: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    

    // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
    const filteredSolicitudes = useMemo(() => {
        let filtered = solicitudes;
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.piezaNombre.toLowerCase().includes(lowerCaseSearchTerm) ||
                s.solicitanteNombre.toLowerCase().includes(lowerCaseSearchTerm) ||
                s.id.toString().includes(lowerCaseSearchTerm)
            );
        }
        return filtered.sort((a, b) => b.id - a.id); 
    }, [solicitudes, searchTerm]);
    
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
    if (!isAuthenticated) {
        return <div className="p-6 text-center text-red-500">Acceso denegado. Por favor, inicie sesión.</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                        <UserCheck size={30} className="mr-3 text-blue-600" />
                        Módulo de Revisión de Ingeniería
                    </h1>
                    <button
                        onClick={fetchSolicitudes}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 transition"
                    >
                        <RefreshCw size={18} className="mr-2" />
                        Recargar Solicitudes
                    </button>
                </div>

                {/* Tabla de Solicitudes Pendientes */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        {totalItems} Solicitudes Pendientes de Revisión
                    </h2>
                    
                    <div className="flex items-center space-x-2 mb-4">
                        <Search size={18} className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por Pieza o ID"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Resetear página al buscar
                            }}
                            className="p-2 border border-gray-300 rounded-lg text-sm w-64"
                        />
                    </div>
                    
                    <div className="overflow-x-auto border rounded-xl">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pieza (Máquina)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad Actual</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Operacional</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días Abierto</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loadingSolicitudes ? (
                                    <tr>
                                        <Td colSpan="7" className="text-center py-8 text-blue-500">Cargando solicitudes...</Td>
                                    </tr>
                                ) : currentItems.length > 0 ? (
                                    currentItems.map((s) => (
                                        <SolicitudTableRow 
                                            key={s.id} 
                                            solicitud={s} 
                                            onRowClick={handleSelectSolicitud}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <Td colSpan="7" className="text-center py-8 text-gray-500">
                                            <AlertTriangle size={24} className="mx-auto mb-2 text-blue-500" />
                                            No hay solicitudes pendientes de revisión.
                                        </Td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* ✅ CONTROLES DE PAGINACIÓN */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl mt-4">
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
                                                    ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
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
            
            {/* ✅ INTEGRACIÓN DEL MODAL */}
            <RevisionModal
                isOpen={isModalOpen}
                onClose={closeModal}
                solicitud={selectedSolicitud}
                maquinistas={maquinistas}
                onSave={handleSubmitRevision}
                isSaving={isSaving}
            />
            
        </div>
    );
}
// ----------------------------------------------------------------------
// COMPONENTE MODAL DE REVISIÓN
// ----------------------------------------------------------------------
function RevisionModal({ isOpen, onClose, solicitud, maquinistas, onSave, isSaving }) {
    
    // Si no hay solicitud o el modal está cerrado, no renderizar
    if (!isOpen || !solicitud) return null;
    
    // Estado local para los datos del formulario (se inicializa con datos al abrirse)
    const [revisionData, setRevisionData] = useState({
        prioridad: 'Media',
        comentarios: '',
        idMaquinistaAsignado: '',
    });

    useEffect(() => {
        // Reiniciar el formulario cuando la solicitud cambie (al abrirse)
        setRevisionData({
            prioridad: 'Media',
            comentarios: '',
            idMaquinistaAsignado: '',
        });
    }, [solicitud]);

    const handleRevisionChange = (e) => {
        const { name, value } = e.target;
        setRevisionData(prev => ({ ...prev, [name]: value }));
    };

    // Función para manejar el rechazo
    const handleRejectSolicitud = () => {
        setRevisionData(prev => ({ 
            ...prev, 
            prioridad: 'RECHAZADA', 
            idMaquinistaAsignado: '' // Asegurar que no se asigne maquinista
        }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(revisionData);
    };


    return (
        <div 
            // Fondo con efecto blur (como en Dashboard)
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900/60 p-4 transition-opacity" 
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div 
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
                >
                    {/* 🚨 CORRECCIÓN: Se añade la clase 'relative' a este div para anclar el botón de cerrar 'X' */}
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Revisión de Solicitud #{solicitud.id}
                                </h3>
                                <p className="text-sm text-gray-500">Asigne prioridad y maquinista para iniciar el trabajo.</p>
                            </div>
                        </div>
                        
                        {/* ✅ BOTÓN DE CERRAR MODAL SIN ACCIÓN (Ahora visible) */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                            title="Cerrar Modal"
                        >
                            <X size={20} />
                        </button>
                        
                        {/* 1. Detalles de la Solicitud Seleccionada */}
                        <div className="mt-5 border border-gray-200 p-4 rounded-lg mb-6 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Detalles de la Solicitud</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                                
                                <DetailItem 
                                    icon={Briefcase} 
                                    label="Pieza" 
                                    // ✅ Estructura Pieza (Máquina)
                                    value={`${solicitud.piezaNombre} (${solicitud.maquina || 'N/A'})`} 
                                />

                                <DetailItem icon={Clock} label="Turno" value={solicitud.turno} />
                                <DetailItem icon={Zap} label="Tipo de Trabajo" value={solicitud.tipo} />
                                <DetailItem icon={AlertTriangle} label="Prioridad Actual" value={solicitud.prioridadActual || 'En Revisión'} />
                            </div>
                            <div className="p-2 bg-white rounded-lg border">
                                <p className="text-xs font-medium text-gray-500 mb-1">Detalles/Descripción:</p>
                                <p className="text-sm text-gray-800 italic">{solicitud.detalles}</p>
                            </div>
                        </div>
                        
                        {/* 2. Formulario de Revisión */}
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Prioridad */}
                                <div>
                                    <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 mb-1">
                                        Prioridad de Trabajo
                                    </label>
                                    <select
                                        id="prioridad"
                                        name="prioridad"
                                        value={revisionData.prioridad}
                                        onChange={handleRevisionChange}
                                        required
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    >
                                        <option value="Baja">Baja</option>
                                        <option value="Media">Media</option>
                                        <option value="Alta">Alta</option>
                                        <option value="Urgente">Urgente</option>
                                        <option value="RECHAZADA">RECHAZADA</option>
                                    </select>
                                </div>
                                
                                {/* Asignación de Maquinista (solo si no es rechazada) */}
                                {revisionData.prioridad !== 'RECHAZADA' && (
                                    <div>
                                        <label htmlFor="idMaquinistaAsignado" className="block text-sm font-medium text-gray-700 mb-1">
                                            Asignar Maquinista Inicial
                                        </label>
                                        <select
                                            id="idMaquinistaAsignado"
                                            name="idMaquinistaAsignado"
                                            value={revisionData.idMaquinistaAsignado}
                                            onChange={handleRevisionChange}
                                            required={revisionData.prioridad !== 'RECHAZADA'}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        >
                                            <option value="">Seleccione un Maquinista</option>
                                            {maquinistas.map(m => (
                                                <option key={m.id} value={m.id}>{m.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Comentarios */}
                                <div className="md:col-span-2">
                                    <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-1">
                                        Comentarios y Notas de Ingeniería (Obligatorio)
                                    </label>
                                    <textarea
                                        id="comentarios"
                                        name="comentarios"
                                        rows="3"
                                        value={revisionData.comentarios}
                                        onChange={handleRevisionChange}
                                        required
                                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex justify-between pt-5 mt-4 border-t">
                                {/* Botón de Rechazar Solicitud */}
                                {revisionData.prioridad !== 'RECHAZADA' && (
                                    <button
                                        type="button" 
                                        onClick={handleRejectSolicitud}
                                        disabled={isSaving}
                                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-md transition ${isSaving ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                    >
                                        <X size={18} className="mr-2" />
                                        Marcar como Rechazada
                                    </button>
                                )}

                                {/* Botón de Guardar Revisión (Aprobar) - type="submit" */}
                                <button
                                    type="submit"
                                    // Deshabilita si está guardando O si no es RECHAZADA Y falta el Maquinista
                                    disabled={isSaving || (revisionData.prioridad !== 'RECHAZADA' && !revisionData.idMaquinistaAsignado) }
                                    className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md transition ${isSaving || (revisionData.prioridad !== 'RECHAZADA' && !revisionData.idMaquinistaAsignado) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    <Save size={18} className="mr-2" />
                                    {isSaving ? 'Guardando...' : (revisionData.prioridad === 'RECHAZADA' ? 'Confirmar Rechazo' : 'Aprobar y Asignar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}