import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Wrench, CheckCircle, Clock, Loader2, AlertTriangle, Search, RefreshCw
} from 'lucide-react';

// --- IMPORTS CRÍTICAS ---
// Asume que tienes un Contexto de Autenticación para obtener el ID del usuario
import { useAuth } from '../context/AuthContext'; 
import API_BASE_URL from '../components/apiConfig'; 
// ------------------------

// URL del nuevo Endpoint que acabamos de crear en C#
const API_ASIGNACIONES_URL = `${API_BASE_URL}/Solicitudes/AsignacionesPorMaquinista`;

// --- COMPONENTE PRINCIPAL ---
export default function MisAsignaciones() {
    const { isAuthenticated, user } = useAuth(); 
    const [asignaciones, setAsignaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    
    // ✅ NUEVO ESTADO: Para manejar el filtro activo (activo, completado, historial)
    const [currentFilter, setCurrentFilter] = useState("activo"); 
    
    // ID del Maquinista Logueado
    const maquinistaId = user?.id; 

    // 🛠️ FUNCIÓN PARA OBTENER LAS ASIGNACIONES REALES
    const fetchAsignaciones = async () => {
        if (!isAuthenticated || !maquinistaId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        const token = localStorage.getItem("authToken");

        try {
            // ✅ Llamada al endpoint de C# incluyendo el 'estadoFiltro'
            const url = `${API_ASIGNACIONES_URL}?id=${maquinistaId}&estadoFiltro=${currentFilter}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Fallo al cargar las asignaciones de trabajo.");
            }

            const data = await response.json();
            setAsignaciones(data);

        } catch (err) {
            console.error("Error al obtener asignaciones:", err);
            setError(err.message);
            setAsignaciones([]);
        } finally {
            setLoading(false);
        }
    };

    // 💡 FUNCIÓN PARA CAMBIAR EL FILTRO Y RECARGAR
    const handleFilterChange = (filterKey) => {
        setCurrentFilter(filterKey);
        setSearchTerm(""); // Limpiar búsqueda al cambiar de filtro
    }

    useEffect(() => {
        // ✅ La consulta se ejecuta cuando cambian el usuario, autenticación O el filtro activo
        fetchAsignaciones();
    }, [isAuthenticated, maquinistaId, currentFilter]); 

    // 🔎 LÓGICA DE FILTRADO Y BÚSQUEDA
    const filteredAsignaciones = useMemo(() => {
        let filtered = asignaciones;
        
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(a =>
                // Filtra por Id, Nombre de Pieza o Estado Operacional
                a.id.toString().includes(lowerCaseSearch) ||
                a.piezaNombre.toLowerCase().includes(lowerCaseSearch) ||
                a.estadoOperacional.toLowerCase().includes(lowerCaseSearch)
            );
        }
        
        // Se puede ordenar por Prioridad o Fecha, por ahora ordenamos por ID
        return filtered.sort((a, b) => b.id - a.id); 
    }, [asignaciones, searchTerm]);

    // Función de redirección centralizada
    const handleViewDetails = (id) => {
    // Redirige al Panel de Trabajo
    navigate(`/trabajo/${id}`); 
};

    // Los contadores 'pendientesCount' y 'enProgresoCount' han sido eliminados.
    // El contador de activas es el largo del arreglo actual: asignaciones.length

    // --- RENDERIZADO ---
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Wrench size={28} className="text-blue-600"/> Mis Asignaciones de Trabajo
            </h1>
            <p className="mb-6 text-gray-600">
                Lista de solicitudes asignadas para ser trabajadas.
            </p>

            {/* Búsqueda */}
            <div className="flex items-center gap-3 mb-6">
                <Search size={20} className="text-gray-500"/>
                <input
                    type="text"
                    placeholder="Buscar por ID, Pieza o Estado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm w-full md:w-96"
                />
                <button 
                    onClick={fetchAsignaciones}
                    className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition"
                    disabled={loading}
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""}/>
                </button>
            </div>
            
            {/* Botones de Filtro (funcionales) */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex gap-4 text-sm text-gray-700">
                    <span className="font-semibold">Filtros rápidos:</span>
                    
                    {/* Botón Activas */}
                    <button 
                        onClick={() => handleFilterChange("activo")}
                        className={`font-medium transition ${currentFilter === 'activo' ? 'text-blue-600 underline' : 'text-gray-600 hover:underline'}`}
                    >
                        Activas ({asignaciones.length})
                    </button>

                    <span className="text-gray-400">|</span>
                    
                    {/* Botón Completadas/Finalizadas */}
                    <button 
                        onClick={() => handleFilterChange("completado")}
                        className={`font-medium transition ${currentFilter === 'completado' ? 'text-blue-600 underline' : 'text-gray-600 hover:underline'}`}
                    >
                        Completadas
                    </button>

                    <span className="text-gray-400">|</span>
                    
                    {/* Botón Historial Completo */}
                    <button 
                        onClick={() => handleFilterChange("historial")}
                        className={`font-medium transition ${currentFilter === 'historial' ? 'text-blue-600 underline' : 'text-gray-600 hover:underline'}`}
                    >
                        Ver Historial Completo
                    </button>
                </div>
            </div>

            {loading && (
                <div className="p-8 text-center text-blue-600 flex items-center justify-center gap-2">
                    <Loader2 size={24} className="animate-spin" />
                    Cargando tus asignaciones...
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertTriangle size={20} /> Error al cargar: {error}
                </div>
            )}
            
            {/* Tarjetas de Tareas Asignadas */}
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAsignaciones.map((tarea) => (
                        <TareaCard 
                            key={tarea.id} 
                            tarea={tarea} 
                            onViewDetails={handleViewDetails} 
                        />
                    ))}
                    
                    {/* Mensaje de Asignaciones vacías */}
                    {filteredAsignaciones.length === 0 && (
                        <div className="col-span-full p-8 text-center bg-white rounded-xl shadow-lg border border-dashed border-gray-300">
                            <p className="text-gray-500 text-lg">
                                {currentFilter === 'activo' && "🎉 No tienes solicitudes asignadas o activas actualmente. ¡Buen trabajo!"}
                                {currentFilter === 'completado' && "No hay solicitudes completadas recientemente."}
                                {currentFilter === 'historial' && "No se encontraron solicitudes en el historial."}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


/* --- Componente Auxiliar: Tarjeta de Tarea --- */
function TareaCard({ tarea, onViewDetails }) {
    
    // Mapeo a las propiedades reales del SolicitudDto:
    const id = tarea.id;
    const pieza = `${tarea.piezaNombre} (${tarea.maquina || 'N/A'})`; // Incluye Máquina
    const tipo = tarea.tipo;
    const prioridad = tarea.prioridadActual; // Viene de la Revisión
    const estado = tarea.estadoOperacional; // Viene del cálculo en el DTO

    const statusClasses = {
        'Asignada': 'bg-yellow-100 text-yellow-800 border-yellow-500', 
        'En progreso': 'bg-blue-100 text-blue-800 border-blue-500', 
        'Pausada': 'bg-red-100 text-red-800 border-red-500',
        'Finalizada': 'bg-green-100 text-green-800 border-green-500',
        'Sin Estado Inicial': 'bg-gray-100 text-gray-700 border-gray-500',
    };

    const priorityColor = {
        'Urgente': 'text-red-600 font-bold',
        'Alta': 'text-orange-600 font-semibold',
        'Media': 'text-yellow-600 font-semibold',
        'Baja': 'text-green-600',
    };

    return (
        <div className={`bg-white p-5 rounded-xl shadow-lg border-l-4 ${statusClasses[estado] || 'border-gray-300'} transition transform hover:scale-[1.02] duration-200`}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-800">
                    {pieza} 
                    <span className="text-sm font-normal text-gray-500 block">ID: {id}</span>
                </h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[estado]}`}>
                    {estado}
                </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 border-t pt-3 mt-3">
                <p className="flex items-center gap-2">
                    <Clock size={16} className={`text-gray-500 ${priorityColor[prioridad]}`} /> 
                    **Prioridad:** <span className={priorityColor[prioridad]}>{prioridad}</span>
                </p>
                <p className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-gray-500" /> 
                    **Tipo de Trabajo:** {tipo}
                </p>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-end">
                <button
                    onClick={() => onViewDetails(id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition duration-150 shadow-md"
                >
                    <Wrench size={18}/>
                    {estado === 'Asignada' ? 'Iniciar Trabajo' : 'Ver Detalle'}
                </button>
            </div>
        </div>
    );
}