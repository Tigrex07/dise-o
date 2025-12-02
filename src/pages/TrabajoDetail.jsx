import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    User, Clock, AlertTriangle, Hammer, Loader2, Play, FastForward, Pause,
    Clipboard, CheckCircle, Save, X, Link, ListChecks // ✅ ListChecks agregado
} from 'lucide-react';
// --- IMPORTS CRÍTICAS ---
import { useAuth } from '../context/AuthContext'; 
import API_BASE_URL from '../components/apiConfig'; 
import ArchivosSolicitud from "../components/ArchivosSolicitud"; 
// ------------------------

// ENDPOINTS
const API_FULL_DETAILS_URL = `${API_BASE_URL}/Dashboard/FullDetails`; 
const API_ESTADO_TRABAJO_URL = `${API_BASE_URL}/EstadoTrabajo`; 
const API_MAQUINAMS_URL = `${API_BASE_URL}/MaquinaMS`; 
// ✅ NUEVO ENDPOINT ASUMIDO: Para obtener el historial de una solicitud
const API_HISTORIAL_URL = `${API_BASE_URL}/EstadoTrabajo/Solicitud`; 


export default function TrabajoDetail() {
    const { id: solicitudId } = useParams(); 
    const navigate = useNavigate();
    const { user } = useAuth(); // Maquinista logueado
    const token = localStorage.getItem("authToken");

    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    const [maquinaTipos, setMaquinaTipos] = useState([]); 
    // ✅ NUEVO ESTADO: Para guardar el historial de EstadoTrabajo
    const [historial, setHistorial] = useState([]); 

    // Estado para el formulario de finalización
    const [observacionesFinales, setObservacionesFinales] = useState('');
    
    // Objeto para guardar múltiples tiempos: { Fresadora: 1.5, Torno: 2.0, ...} 
    const [tiempos, setTiempos] = useState({}); 
    
    const [showFinalizeForm, setShowFinalizeForm] = useState(false);

    // ===============================================
    // 1. OBTENER DETALLES, TIPOS DE MÁQUINA Y HISTORIAL
    // ===============================================
    
    const fetchSolicitudDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_FULL_DETAILS_URL}/${solicitudId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("No se pudo cargar el detalle de la solicitud.");
            const data = await response.json();
            setSolicitud(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [solicitudId, token]);
    
    const fetchMaquinaTipos = useCallback(async () => {
        try {
            const response = await fetch(API_MAQUINAMS_URL, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (!response.ok) {
                 throw new Error("Fallo al cargar tipos de máquina (API MaquinaMS).");
            }

            const data = await response.json();
            const nombres = data.map(m => m.nombre);
            setMaquinaTipos(nombres);
        } catch (err) {
            console.error("Error fetching machine types:", err);
        }
    }, [token]);

    // ✅ NUEVA FUNCIÓN: Fetch del Historial de Operaciones
    const fetchHistorial = useCallback(async () => {
        try {
            const response = await fetch(`${API_HISTORIAL_URL}/${solicitudId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                // Si falla, solo registramos el error, no bloqueamos la app
                console.error("Fallo al cargar el historial de EstadoTrabajo.");
                setHistorial([]); 
                return;
            }
            const data = await response.json();
            // Ordenamos del más reciente al más antiguo por FechaYHoraDeInicio
            const sortedData = data.sort((a, b) => new Date(b.fechaYHoraDeInicio) - new Date(a.fechaYHoraDeInicio));
            setHistorial(sortedData);
        } catch (err) {
            console.error("Error fetching historial:", err);
            setHistorial([]); 
        }
    }, [solicitudId, token]);


    useEffect(() => {
        if (solicitudId) {
            fetchSolicitudDetails();
            fetchMaquinaTipos(); 
            fetchHistorial(); // ✅ Llamada al nuevo fetch
        }
    }, [solicitudId, fetchSolicitudDetails, fetchMaquinaTipos, fetchHistorial]);

    // ===============================================
    // 2. MANEJAR ACCIONES DEL MAQUINISTA
    // ===============================================
    const handleAction = async (actionType) => {
        if (!user || !solicitud) return;

        let prioridadToSend = '';
        let descripcion = "";
        let isFinalizing = false;

        // Determinar la Prioridad y Descripción según el tipo de acción
        if (actionType === 'INICIO') {
            prioridadToSend = 'En progreso';
            descripcion = "Trabajo iniciado/reanudado por Maquinista.";
        } else if (actionType === 'PAUSA') {
            prioridadToSend = 'Pausada';
            descripcion = "Trabajo pausado por Maquinista.";
        } else if (actionType === 'FINALIZAR') {
            prioridadToSend = 'Completado'; // 🚨 Valor usado para cambiar el estado en el backend
            descripcion = "Trabajo Finalizado por el Maquinista";
            isFinalizing = true;
        } else {
            return; // Acción desconocida
        }
        
        // 1. Acciones de Finalización (FINALIZAR) - Envía Múltiples POSTs
        if (isFinalizing) {
            
            // Filtrar y validar las entradas de tiempo
            const timeEntries = Object.entries(tiempos).filter(([, tiempo]) => parseFloat(tiempo) > 0);

            if (timeEntries.length === 0) {
                alert("Debes registrar el tiempo de al menos una máquina antes de finalizar.");
                return;
            }

            setIsSaving(true);
            
            try {
                // Iterar sobre cada registro de tiempo y enviar un POST individual
                const postPromises = timeEntries.map(([maquina, tiempo]) => {
                    const tiempoPayload = {
                        idSolicitud: solicitudId,
                        idMaquinista: user.id, 
                        prioridad: prioridadToSend, 
                        descripcionOperacion: descripcion,
                        observaciones: observacionesFinales, 
                        
                        maquinaAsignada: maquina,
                        tiempoMaquina: parseFloat(tiempo),
                    };
                    
                    return fetch(API_ESTADO_TRABAJO_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify(tiempoPayload),
                    }).then(response => {
                        if (!response.ok) throw new Error(`Fallo al registrar tiempo para ${maquina}.`);
                        return response;
                    });
                });
                
                await Promise.all(postPromises);
                
                alert('✅ Tarea Finalizada. Tiempos registrados y estado de Solicitud actualizado a "Completado".');

                // 🚨 CORRECCIÓN DE RUTA
                navigate('/trabajo/mis-asignaciones'); 

            } catch (err) {
                setError(err.message);
                alert(`Error en la finalización: ${err.message}`);
            } finally {
                setIsSaving(false);
                setShowFinalizeForm(false); 
            }
        
        // 2. Acciones de Control (INICIO/PAUSA) - POST único
        } else {
            const estadoTrabajoDto = {
                idSolicitud: solicitudId,
                idMaquinista: user.id, 
                prioridad: prioridadToSend, 
                descripcionOperacion: descripcion,
                
                maquinaAsignada: solicitud.maquina || "N/A",
                tiempoMaquina: 0.00, // Siempre 0.00 para INICIO/PAUSA
            };

            setIsSaving(true);
            try {
                const response = await fetch(API_ESTADO_TRABAJO_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(estadoTrabajoDto),
                });

                if (!response.ok) throw new Error(`Fallo al registrar acción: ${actionType}`);

                alert(`✅ Estado actualizado: ${actionType}`);
                
                // Recargar detalles y historial después de la acción
                fetchSolicitudDetails(); 
                fetchHistorial(); // ✅ Recargar historial para ver el nuevo log

            } catch (err) {
                setError(err.message);
                alert(`Error: ${err.message}`);
            } finally {
                setIsSaving(false);
            }
        }
    };
    
    // ===============================================
    // 3. RENDERIZADO
    // ===============================================
    if (loading) return <div className="text-center py-10"><Loader2 className="animate-spin mx-auto" size={32}/> <p className="mt-2">Cargando detalles del trabajo...</p></div>;
    if (error) return <div className="text-center py-10 text-red-600"><AlertTriangle size={24} className="mx-auto mb-2"/> Error al cargar: {error}</div>;
    if (!solicitud) return <div className="text-center py-10 text-gray-500">Solicitud no encontrada.</div>;

    const revision = solicitud.revision || {}; 
    const currentStatus = solicitud.estadoOperacional;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-3">
                <Hammer size={32} /> Detalle de Solicitud #{solicitud.id} – {solicitud.piezaNombre}
            </h1>
            <StatusBadge estado={currentStatus} prioridad={revision.prioridad} />

            {/* GRID PRINCIPAL: DETALLES Y ACCIONES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMNA IZQUIERDA: DETALLES */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg space-y-6">
                    <h2 className="text-xl font-semibold border-b pb-2">Detalles del Trabajo</h2>
                    
                    {/* Fila de info rápida (sin cambios) */}
                    <div className="grid grid-cols-2 gap-4 text-gray-700 border-b pb-4">
                        <div className="flex items-center gap-2"><User size={18} className="text-indigo-500"/> **Solicitante:** {solicitud.solicitanteNombre}</div>
                        <div className="flex items-center gap-2"><Clock size={18} className="text-orange-500"/> **Prioridad:** <span className={`font-bold ${revision.prioridad === 'Urgente' ? 'text-red-600' : ''}`}>{revision.prioridad}</span></div>
                        <div className="flex items-center gap-2"><Clipboard size={18} className="text-gray-500"/> **Tipo:** {solicitud.tipo}</div>
                        <div className="flex items-center gap-2"><Hammer size={18} className="text-blue-500"/> **Máquina Asignada:** {solicitud.maquina}</div>
                        
                        {solicitud.dibujo && (
                            <div className="col-span-2 flex items-center gap-2">
                                <Link size={18} className="text-red-500"/> 
                                **Dibujo/Plano:** <a 
                                    href={solicitud.dibujo} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline font-medium truncate"
                                >
                                    Ver Dibujo
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Descripción y Comentarios de Revisión (sin cambios) */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-lg">Reporte Inicial</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{solicitud.detalles}</p>
                        
                        <h4 className="font-semibold text-lg pt-2 border-t mt-4">Comentarios de Ingeniería</h4>
                        <p className="text-sm italic text-gray-600 bg-gray-50 p-3 rounded-lg">{revision.comentarios || "No hay comentarios adicionales de Ingeniería."}</p>
                    </div>

                    {/* ✅ NUEVA SECCIÓN: Historial de Operaciones */}
                    <HistorialOperaciones historial={historial} />
                   
                </div>

                {/* COLUMNA DERECHA: ESTADO Y ACCIONES (sin cambios en la lógica de visibilidad) */}
                <div className="lg:col-span-1 space-y-6">

                    {revision.prioridad !== 'Completado' ? (
                        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
                            <h3 className="text-xl font-bold mb-4">Control de Trabajo</h3>
                            
                            <div className="space-y-3">
                                {/* INICIAR / REANUDAR */}
                                {(currentStatus === 'Asignada' || currentStatus === 'Pausada') && (
                                    <button 
                                        onClick={() => handleAction('INICIO')}
                                        disabled={isSaving}
                                        className={`w-full flex items-center justify-center font-bold py-3 rounded-lg transition ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                    >
                                        <Play size={20} className="mr-2"/> Iniciar / Reanudar Trabajo
                                    </button>
                                )}
                                
                                {/* PAUSAR */}
                                {currentStatus === 'En progreso' && (
                                    <button 
                                        onClick={() => handleAction('PAUSA')}
                                        disabled={isSaving}
                                        className={`w-full flex items-center justify-center font-bold py-3 rounded-lg transition ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}
                                    >
                                        <Pause size={20} className="mr-2"/> Pausar Trabajo
                                    </button>
                                )}
                                
                                {/* PRE-FINALIZAR (Activa el formulario) */}
                                {currentStatus !== 'Finalizada' && currentStatus !== 'Completado' && currentStatus !== 'Asignada' && (
                                    <button 
                                        onClick={() => setShowFinalizeForm(true)}
                                        disabled={isSaving}
                                        className={`w-full flex items-center justify-center font-bold py-3 rounded-lg transition ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                                    >
                                        <FastForward size={20} className="mr-2"/> Finalizar Tarea
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Panel de Visualización para estado Completado
                        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500 text-center">
                            <CheckCircle size={32} className="mx-auto text-green-600 mb-2"/>
                            <h3 className="text-xl font-bold text-green-700">Tarea Completada</h3>
                            <p className="text-gray-600 mt-1">Esta solicitud ha sido finalizada y los tiempos han sido registrados.</p>
                        </div>
                    )}

                </div>
            </div>

            {/* FORMULARIO DE FINALIZACIÓN (Modal o sección colapsable) */}
            {showFinalizeForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-4 overflow-y-auto">
                    <FinalizarForm
                        tiempos={tiempos}
                        setTiempos={setTiempos}
                        observacionesFinales={observacionesFinales}
                        setObservacionesFinales={setObservacionesFinales}
                        onFinalizar={handleAction}
                        onCancel={() => setShowFinalizeForm(false)}
                        isSaving={isSaving}
                        tiposMaquina={maquinaTipos} 
                    />
                </div>
            )}
            
            {solicitud && solicitud.archivos && solicitud.archivos.length > 0 && (
                <ArchivosSolicitud archivos={solicitud.archivos} />
            )}

        </div>
    );
}


// --- Componente Auxiliar: Historial de Operaciones ---
function HistorialOperaciones({ historial }) {
    
    // Función de ayuda para formatear el tiempo
    const formatTime = (time) => {
        if (!time || time === 0) return '0.00h';
        return `${parseFloat(time).toFixed(2)}h`;
    };

    if (!historial || historial.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                <ListChecks size={20} className="inline mr-2"/> No hay registros de operaciones aún.
            </div>
        );
    }

    // Calcular el tiempo total registrado en logs de FINALIZACIÓN
    const totalTiempoFinalizado = historial
        .filter(log => log.tiempoMaquina > 0 && log.fechaYHoraDeFin && log.descripcionOperacion.includes("Finalizado"))
        .reduce((sum, log) => sum + parseFloat(log.tiempoMaquina || 0), 0);

    return (
        <div className="space-y-4 pt-6 border-t mt-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-700">
                <ListChecks size={24} /> Historial de Operaciones ({historial.length} registros)
            </h2>
            
            {/* Resumen del Total de Tiempos Finalizados */}
            {totalTiempoFinalizado > 0 && (
                <div className="p-3 bg-indigo-50 border-l-4 border-indigo-400 font-bold text-indigo-800">
                    Tiempo Total Registrado (Finalización): {formatTime(totalTiempoFinalizado)}
                </div>
            )}

            {/* Lista de Eventos */}
            <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                {historial.map((log) => (
                    <div 
                        key={log.id} 
                        className="p-3 border rounded-lg shadow-sm flex justify-between items-start text-sm bg-white hover:bg-gray-50"
                    >
                        <div className="flex-1 space-y-1">
                            {/* Descripción y Hora */}
                            <div className="font-semibold text-gray-800">
                                {new Date(log.fechaYHoraDeInicio).toLocaleString()} - {log.descripcionOperacion}
                            </div>
                            
                            {/* Detalle de Máquina y Tiempo */}
                            <div className="flex items-center gap-3 text-gray-600">
                                {log.maquinaAsignada && log.maquinaAsignada !== "N/A" && (
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium border">
                                        Máquina: {log.maquinaAsignada}
                                    </span>
                                )}
                                
                                {/* Mostrar tiempo solo si es > 0, o si es un log de duración (cierre) */}
                                {log.tiempoMaquina > 0 && (
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${log.descripcionOperacion.includes("Finalizado") ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        Duración: {formatTime(log.tiempoMaquina)}
                                    </span>
                                )}
                            </div>

                            {/* Observaciones */}
                            {log.observaciones && (
                                <p className="text-xs italic text-gray-500 mt-1">
                                    Notas: {log.observaciones}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Componente Auxiliar: StatusBadge (sin cambios) ---
function StatusBadge({ estado, prioridad }) {
    const statusClasses = useMemo(() => {
        return {
            'Nueva': 'bg-red-100 text-red-700',
            'Asignada': 'bg-yellow-100 text-yellow-700',
            'En progreso': 'bg-blue-100 text-blue-700',
            'Pausada': 'bg-orange-100 text-orange-700',
            'Revision Calidad': 'bg-purple-100 text-purple-700',
            'Completado': 'bg-green-100 text-green-700',
            'Finalizada': 'bg-green-100 text-green-700', // Alias
        };
    }, []);
    
    const priorityClasses = useMemo(() => {
        return {
            'Baja': 'bg-gray-200 text-gray-700',
            'Media': 'bg-yellow-200 text-yellow-800',
            'Alta': 'bg-orange-200 text-orange-800',
            'Urgente': 'bg-red-200 text-red-800',
            'Completado': 'bg-green-200 text-green-800', // Clase para el nuevo estado
        };
    }, []);

    return (
        <div className="flex gap-3 text-sm font-semibold mb-4">
            <span className={`px-3 py-1 rounded-full ${statusClasses[estado] || 'bg-gray-200'}`}>
                <CheckCircle size={16} className="inline mr-1" /> {estado}
            </span>
            <span className={`px-3 py-1 rounded-full ${priorityClasses[prioridad] || 'bg-gray-200'}`}>
                <Clock size={16} className="inline mr-1" /> Prioridad: {prioridad}
            </span>
        </div>
    );
}

// --- Componente Modal/Formulario de Finalización (FinalizarForm - sin cambios) ---
function FinalizarForm({
    tiempos, setTiempos, 
    observacionesFinales, setObservacionesFinales,
    onFinalizar, onCancel, isSaving, 
    tiposMaquina 
}) {
    
    const totalHoras = useMemo(() => {
        return Object.values(tiempos).reduce((acc, current) => acc + parseFloat(current || 0), 0);
    }, [tiempos]);

    const handleTiemposChange = (maquina, value) => {
        const parsedValue = value === '' ? '' : Math.max(0, parseFloat(value));
        setTiempos(prev => ({ ...prev, [maquina]: parsedValue }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (totalHoras <= 0) {
            alert("Debes registrar tiempo (mayor a cero) en al menos una máquina antes de finalizar.");
            return;
        }
        onFinalizar('FINALIZAR');
    };
    
    if (tiposMaquina.length === 0) {
        return (
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 text-center">
                <Loader2 className="animate-spin mx-auto text-blue-500" size={32}/>
                <p className="mt-4 text-gray-700">Cargando tipos de máquina para el registro de tiempos...</p>
                <button 
                    onClick={onCancel} 
                    className="mt-6 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition hover:bg-gray-300"
                >
                    Cancelar
                </button>
             </div>
        );
    }


    return (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 transform transition-all duration-300 max-h-[90vh] overflow-y-auto"> 
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="text-2xl font-bold text-red-600">
                    <FastForward size={24} className="inline mr-2"/> Finalizar Tarea y Registrar Tiempos
                </h3>
                <button 
                    onClick={onCancel} 
                    className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition"
                    title="Cerrar formulario"
                >
                    <X size={24}/>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Registro de Tiempos (Múltiple) */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-bold mb-3 text-lg text-green-800">
                        <Clock size={20} className="inline mr-2"/> Tiempos de Máquina (Horas)
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 pr-2">
                        {tiposMaquina.map(maquina => (
                            <div key={maquina} className="flex items-center gap-2">
                                <label className="w-40 text-sm font-medium text-gray-700">{maquina}</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={tiempos[maquina] || ""}
                                    onChange={(e) => handleTiemposChange(maquina, e.target.value)}
                                    placeholder="0.0 horas"
                                    className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500"
                                />
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 font-bold text-lg text-green-700">Total de Horas Registradas: {totalHoras.toFixed(1)}</p>
                </div>

                {/* Observaciones Finales */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-bold mb-3 text-lg text-blue-800">
                        <Clipboard size={20} className="inline mr-2"/> Observaciones del Maquinista
                    </h4>
                    <textarea
                        value={observacionesFinales}
                        onChange={(e) => setObservacionesFinales(e.target.value)}
                        placeholder="Escribe tus observaciones finales, problemas o soluciones clave..."
                        rows="4"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500"
                    />
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition hover:bg-gray-300 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving || totalHoras <= 0}
                        className={`flex items-center font-bold py-2 px-4 rounded-lg transition ${isSaving || totalHoras <= 0 ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                    >
                        <Save size={18} className="mr-2"/>
                        {isSaving ? 'Enviando...' : 'Finalizar y Completar'}
                    </button>
                </div>
            </form>
        </div>
    );
}