import React, { useState, useMemo, useEffect } from "react";
import { PlusCircle, Eye, Search, Filter, Download, Component as ComponentIcon } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

// 🚨 Incluyendo el AuthContext
import { useAuth } from "../context/AuthContext";
// Asumiendo que esta es la ruta a su archivo de configuración de API
import API_BASE_URL from "../components/apiConfig";

// ----------------------------------------------------------------------
// DEFINICIÓN DE ENDPOINT Y CONSTANTES
// ----------------------------------------------------------------------
const API_SOLICITUDES_URL = `${API_BASE_URL}/Solicitudes`;

// Opciones de filtro: solo las activas, excluyendo historial
const ACTIVE_FILTER_OPTIONS = [
    { value: "all", label: "Todos los Estados Activos" },
    { value: "En Revisión", label: "En Revisión" },
    { value: "Aprobada", label: "Aprobada" },
    { value: "Iniciada", label: "Iniciada" },
    { value: "En Proceso", label: "En Proceso" },
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
        case "En Revisión": return "text-gray-700 bg-gray-200 font-medium";
        case "Completada": return "text-blue-700 bg-blue-100 font-medium";
        default: return "text-gray-700 bg-gray-100";
    }
};

// Cálculo de días de apertura
const calculateDaysOpen = (fechaCreacion) => {
    if (!fechaCreacion) return null;
    const today = new Date();
    const creationDate = new Date(fechaCreacion);
    const diffTime = Math.abs(today - creationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};


// ----------------------------------------------------------------------
// Componente de Fila de Tabla
// ----------------------------------------------------------------------
function SolicitudTableRow({ solicitud }) {
    const navigate = useNavigate();
    
    const { 
        id, 
        piezaNombre, 
        maquina,
        solicitanteNombre, 
        prioridadActual, // Prioridad asignada por el revisor (Alta, Media, etc.)
        estadoOperacional, // Estado de la fase del proceso (Viene del DTO de la API)
        fechaYHora, 
        responsable, 
        fechaCompromiso 
    } = solicitud;
    
    // 🚨 LÓGICA CLAVE: Separar Prioridad (Urgencia) de Estado (Fase) 🚨
    let displayEstado = estadoOperacional;

    // Si el estado no está definido o es un valor inicial
    if (!estadoOperacional || estadoOperacional === 'Pendiente' || prioridadActual === 'Pendiente' || !prioridadActual) {
        displayEstado = "En Revisión";
    } 
    // Si el DTO de la API repite la prioridad en el campo de estado (el problema reportado)
    // y la prioridad YA FUE ASIGNADA (o sea, es diferente de En Revisión/Pendiente)
    else if (['Baja', 'Media', 'Alta', 'Urgente', 'Crítica'].includes(estadoOperacional) && estadoOperacional === prioridadActual) {
        // Asumimos que si tiene prioridad asignada, ya fue Aprobada o está en cola.
        displayEstado = "Aprobada / En Cola";
    } 
    // Si el DTO viene con estados correctos, los mantenemos
    else {
        displayEstado = estadoOperacional;
    }


    // Cálculo de días abierto
    const diasAbierto = useMemo(() => calculateDaysOpen(fechaYHora), [fechaYHora]);

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition duration-150">
            <Td className="font-semibold text-indigo-600">{id}</Td>
            <Td>{piezaNombre} ({maquina})</Td>
            <Td className="text-gray-500">{solicitanteNombre}</Td>
            {/* COLUMNA DE PRIORIDAD: Muestra Urgencia */}
            <Td>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityClasses(prioridadActual)}`}>
                    {prioridadActual || 'Pendiente'}
                </span>
            </Td>
            
            {/* COLUMNA DE ESTADO: Muestra Fase del Proceso */}
            <Td className={`font-medium ${displayEstado === "En Revisión" ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                {displayEstado}
            </Td>

            {/* CAMPOS ADICIONALES */}
            <Td>{responsable || "—"}</Td> 
            <Td>{fechaCompromiso ? new Date(fechaCompromiso).toLocaleDateString() : "—"}</Td>
            <Td className={`font-medium ${diasAbierto > 20 ? 'text-red-600' : 'text-green-600'}`}>
                {diasAbierto ? `${diasAbierto} días` : '—'}
            </Td>
            
            {/* ACCIONES (Solo Ver Más) */}
            <Td>
                <div className="flex gap-2">
                    <button
                        title="Ver Detalles / Saber Más"
                        onClick={() => navigate(`/solicitud-detalles/${id}`)}
                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 transition"
                    >
                        <Eye size={18} /> {/* Ícono de Ver Más */}
                    </button>
                    {/* El botón de eliminar se ha removido según solicitud */}
                </div>
            </Td>
        </tr>
    );
}

// Componente Kpi (fuera de TableRow)
function Kpi({ title, value, color }) {
    const defaultColor = "bg-blue-100 text-blue-800";
    const colorClasses = {
        'red': 'bg-red-100 text-red-800',
        'green': 'bg-green-100 text-green-800',
        'yellow': 'bg-yellow-100 text-yellow-800',
        'blue': 'bg-blue-100 text-blue-800',
    };
    
    return (
        <div className="p-4 bg-white rounded-xl shadow-md border-t-4 border-gray-200">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className={`mt-1 inline-flex items-center text-xl font-bold rounded-full px-3 py-1 ${colorClasses[color] || defaultColor}`}>
                {value}
            </div>
        </div>
    );
}


// ----------------------------------------------------------------------
// Componente Principal
// ----------------------------------------------------------------------
export default function Dashboard() {
    // 🚨 Incluyendo el AuthContext
    const { user, isAuthenticated, loading: loadingUser } = useAuth();
    const navigate = useNavigate();

    const [solicitudes, setSolicitudes] = useState([]);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // LÓGICA DE CARGA DE SOLICITUDES
    const fetchSolicitudes = async () => {
        if (!isAuthenticated) return;
        
        setLoadingSolicitudes(true);
        try {
            // Usando fetch con la URL del controlador
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

    useEffect(() => {
        if (!loadingUser && isAuthenticated) {
            fetchSolicitudes();
        }
    }, [isAuthenticated, loadingUser]);


    // LÓGICA DE FILTRADO Y BÚSQUEDA
    const filteredSolicitudes = useMemo(() => {
        let temp = solicitudes;

        // 1. Filtrar por Estado (si aplica)
        if (filterStatus !== "all") {
            temp = temp.filter(s => s.estadoOperacional === filterStatus);
        } else {
             // FILTRO "TODAS LAS ACTIVAS": Excluye Completadas y Cerradas (Histórico)
            const estadosInactivos = ["Completada", "Cerrada"];
            temp = temp.filter(s => !estadosInactivos.includes(s.estadoOperacional));
        }


        // 2. Filtrar por término de búsqueda (ID, Pieza, Solicitante)
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            temp = temp.filter(s =>
                String(s.id).includes(lowerCaseSearch) ||
                (s.piezaNombre && s.piezaNombre.toLowerCase().includes(lowerCaseSearch)) ||
                (s.solicitanteNombre && s.solicitanteNombre.toLowerCase().includes(lowerCaseSearch))
            );
        }

        // Ordenar por ID o Fecha
        return temp.sort((a, b) => new Date(b.fechaYHora) - new Date(a.fechaYHora)); 
    }, [solicitudes, searchTerm, filterStatus]);


    // ----------------------------------------------------------------------
    // FUNCIÓN DE EXPORTACIÓN A CSV (EXCEL) - NORMALIZADA
    // ----------------------------------------------------------------------
    const handleExport = () => {
        if (filteredSolicitudes.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        // 🚨 ENCABEZADOS NORMALIZADOS Y MÁS DETALLADOS
        const exportHeaders = [
            "ID Solicitud", "Fecha Creación", "Hora Creación", "Solicitante", 
            "Pieza", "Máquina", "Tipo Solicitud", "Prioridad Asignada", "Estado Actual", 
            "Responsable Asignado", "Fecha Compromiso", "Días Abierto", "Descripción Completa"
        ];
        
        // 🚨 CLAVES DE DTO ASOCIADAS A LOS NUEVOS CAMPOS (incluyendo los calculados)
        const exportKeys = [
            "id", "fechaCreacion", "horaCreacion", "solicitanteNombre", 
            "piezaNombre", "maquina", "tipo", "prioridadActual", "estadoOperacional", 
            "responsable", "fechaCompromiso", "diasAbierto", "detalles"
        ];
        
        // 1. Preparar los datos, calculando y formateando los campos
        const csvData = filteredSolicitudes.map(solicitud => {
            const creationDate = solicitud.fechaYHora ? new Date(solicitud.fechaYHora) : null;
            
            // Separar Fecha y Hora (Normalización)
            const fechaCreacion = creationDate ? creationDate.toLocaleDateString('es-MX') : '';
            const horaCreacion = creationDate ? creationDate.toLocaleTimeString('es-MX') : '';

            // Calcular Días Abierto y Formatear Fecha Compromiso
            const diasAbierto = calculateDaysOpen(solicitud.fechaYHora);
            const fechaCompromiso = solicitud.fechaCompromiso 
                ? new Date(solicitud.fechaCompromiso).toLocaleDateString('es-MX') 
                : '';
            
            return {
                ...solicitud, // Copia los campos existentes
                fechaCreacion,
                horaCreacion,
                diasAbierto: diasAbierto ? `${diasAbierto}` : '0', 
                fechaCompromiso: fechaCompromiso,
            };
        });

        // 2. Construir el contenido CSV (usando ; como separador)
        let csvContent = exportHeaders.join(";") + "\n"; 

        csvData.forEach(item => {
            const row = exportKeys.map(key => {
                let value = item[key] || '';
                
                // Limpieza de texto: eliminar saltos de línea y escapar comillas
                value = String(value).replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/"/g, '""').trim();
                
                // Asegurarse de que los campos con texto largo o separadores vayan entre comillas
                if (value.includes(';') || key === 'detalles' || value.includes(',')) {
                    value = `"${value}"`;
                }
                return value;
            }).join(";");
            csvContent += row + "\n";
        });

        // 3. Crear el BLOB y forzar la descarga (con BOM para UTF-8 en Excel)
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.setAttribute('download', 'Solicitudes_Reporte_' + new Date().toISOString().split('T')[0] + '.csv');
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
    };
    // ----------------------------------------------------------------------


    // CÁLCULO DE KPIS
    const kpiData = useMemo(() => {
        const total = solicitudes.length;
        const pendientes = solicitudes.filter(s => s.estadoOperacional === "En Revisión" || s.prioridadActual === 'Pendiente' || !s.prioridadActual).length;
        const enProgreso = solicitudes.filter(s => s.estadoOperacional === "En Proceso" || s.estadoOperacional === "Iniciada" || s.estadoOperacional === "Aprobada").length;
        const completadas = solicitudes.filter(s => s.estadoOperacional === "Completada" || s.estadoOperacional === "Cerrada").length;

        return { total, pendientes, enProgreso, completadas };
    }, [solicitudes]);


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
                        // 🚨 RUTA CORREGIDA: /solicitar
                        onClick={() => navigate('/solicitar')}
                        className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-md"
                    >
                        <PlusCircle size={20} className="mr-2" />
                        Nueva Solicitud
                    </button>
                    <button
                        title="Exportar datos (CSV/Excel)"
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition shadow-md"
                    >
                        <Download size={20} className="mr-2" />
                        Exportar
                    </button>
                </div>
            </header>

            {/* KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Kpi title="Total Solicitudes Activas" value={kpiData.total - kpiData.completadas} color="blue" /> 
                <Kpi title="Pendientes de Revisión" value={kpiData.pendientes} color="red" />
                <Kpi title="Aprobadas / En Proceso" value={kpiData.enProgreso} color="yellow" />
                <Kpi title="Total Histórico (Completadas)" value={kpiData.completadas} color="green" />
            </div>

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

                    {/* Filtro de Estado */}
                    <div className="relative w-full md:w-auto">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="block w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                        >
                            {/* OPCIONES DE FILTRO AJUSTADAS */}
                            {ACTIVE_FILTER_OPTIONS.map(option => (
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
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">F. Compromiso</th>
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
                                filteredSolicitudes.map((s) => <SolicitudTableRow key={s.id} solicitud={s} />)
                            ) : (
                                <tr>
                                    <Td colSpan="9" className="text-center py-8 text-gray-500">
                                        No hay solicitudes que coincidan con los filtros.
                                    </Td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}