import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    User, Clock, AlertTriangle, Hammer, Loader2, Play, FastForward, Pause,
    Clipboard, CheckCircle, Save, X, Link // ✅ Link importado, Tool eliminado
} from 'lucide-react';
// --- IMPORTS CRÍTICAS ---
import { useAuth } from '../context/AuthContext'; 
import API_BASE_URL from '../components/apiConfig'; 
import ArchivosSolicitud from "../components/ArchivosSolicitud"; 
// ------------------------

// ENDPOINTS REQUERIDOS EN C#
// 1. GET /Solicitudes/FullDetails/{id}
// Se mantiene la URL del archivo original.
const API_FULL_DETAILS_URL = `${API_BASE_URL}/Dashboard/FullDetails`; 
// 2. POST /EstadoTrabajo
const API_ESTADO_TRABAJO_URL = `${API_BASE_URL}/EstadoTrabajo`; 


// Lista de tipos de máquina para el registro de tiempos (hardcodeado por diseño)
const TIPOS_MAQUINA = [
    "Fresadora", "Rectificadora", "Corte con Hilo", "Cortadora", "CNC", 
    "Torno", "Erosionadora", "Soldadura Tic", "Soldadura Laser", 
    "Set-Up", "Mantenimiento de moldes"
];

export default function TrabajoDetail() {
    // Renombrar 'id' para evitar conflictos con otras variables
    const { id: solicitudId } = useParams(); 
    const navigate = useNavigate();
    const { user } = useAuth(); // Maquinista logueado
    const token = localStorage.getItem("authToken");

    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Estado para el formulario de finalización
    const [observacionesFinales, setObservacionesFinales] = useState('');
    const [tiempos, setTiempos] = useState({}); // { Fresadora: 1.5, Torno: 2.0, ...}
    const [showFinalizeForm, setShowFinalizeForm] = useState(false);

    // ===============================================
    // 1. OBTENER DETALLES DE LA SOLICITUD
    // ===============================================
    const fetchSolicitudDetails = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_FULL_DETAILS_URL}/${solicitudId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("No se pudo cargar el detalle de la solicitud.");
            }

            const data = await response.json();
            setSolicitud(data);
            
            // Inicializar el estado de tiempos con datos existentes si los hay
            // (Esta lógica dependerá de cómo tu DTO maneje el historial de tiempos acumulados)
            // Por simplicidad, aquí iniciamos en vacío o mapeamos los últimos datos
            // setTiempos(mapearUltimosTiempos(data.operaciones)); 
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [solicitudId, token]);

    useEffect(() => {
        if (solicitudId) {
            fetchSolicitudDetails();
        }
    }, [solicitudId, fetchSolicitudDetails]);

    // ===============================================
    // 2. MANEJAR ACCIONES DEL MAQUINISTA (POST a EstadoTrabajo)
    // ===============================================
    const handleAction = async (actionType, maquinaAsignada = null) => {
        if (!user || !solicitud) return;

        let descripcion = "";
        let tiempoMaquina = 0;
        let finalizado = false;

        if (actionType === 'INICIO') {
            descripcion = "Trabajo iniciado/reanudado por Maquinista.";
        } else if (actionType === 'PAUSA') {
            descripcion = "Trabajo pausado por Maquinista.";
        } else if (actionType === 'FINALIZAR') {
            descripcion = "Trabajo finalizado, enviado a Revisión de Calidad.";
            finalizado = true;
            // Cálculo del tiempo total aquí (se requiere lógica compleja en el backend,
            // pero el frontend puede enviar los tiempos registrados)
        }
        
        // El MaquinistaID y MaquinaAsignada deben ser consistentes con el modelo EstadoTrabajo
        const estadoTrabajoDto = {
            idSolicitud: solicitudId,
            idMaquinista: user.id, 
            accion: actionType, // Usaremos el DTO de C# que recibe la acción y calcula el tiempo
            descripcionOperacion: descripcion,
            // Si es finalización, adjuntamos observaciones y tiempos
            observaciones: finalizado ? observacionesFinales : null, 
            tiemposRegistrados: finalizado ? tiempos : null, // Esto requiere un DTO anidado o un string JSON
        };

        setIsSaving(true);
        try {
            const response = await fetch(API_ESTADO_TRABAJO_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(estadoTrabajoDto),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Fallo al registrar acción: ${actionType}`);
            }

            // Si la acción es Finalizar, redirigimos
            if (finalizado) {
                 alert('✅ Trabajo finalizado y enviado a Revisión de Calidad.');
                 navigate('/mis-asignaciones');
            } else {
                 alert(`✅ Estado actualizado: ${actionType}`);
                 fetchSolicitudDetails(); // Recargar para ver el nuevo estado
            }

        } catch (err) {
            setError(err.message);
            alert(`Error: ${err.message}`);
        } finally {
            setIsSaving(false);
            setShowFinalizeForm(false); // Ocultar formulario de finalización
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
                    
                    {/* Fila de info rápida */}
                    <div className="grid grid-cols-2 gap-4 text-gray-700 border-b pb-4">
                        <div className="flex items-center gap-2"><User size={18} className="text-indigo-500"/> **Solicitante:** {solicitud.solicitanteNombre}</div>
                        <div className="flex items-center gap-2"><Clock size={18} className="text-orange-500"/> **Prioridad:** <span className={`font-bold ${revision.prioridad === 'Urgente' ? 'text-red-600' : ''}`}>{revision.prioridad}</span></div>
                        <div className="flex items-center gap-2"><Clipboard size={18} className="text-gray-500"/> **Tipo:** {solicitud.tipo}</div>
                        <div className="flex items-center gap-2"><Hammer size={18} className="text-blue-500"/> **Máquina Asignada:** {solicitud.maquina}</div>
                        
                        {/* ✅ ENLACE AL DIBUJO (solo si existe) */}
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
                        {/* -------------------------------------- */}
                    </div>

                    {/* Descripción y Comentarios de Revisión */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-lg">Reporte Inicial</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{solicitud.detalles}</p>
                        
                        <h4 className="font-semibold text-lg pt-2 border-t mt-4">Comentarios de Ingeniería</h4>
                        <p className="text-sm italic text-gray-600 bg-gray-50 p-3 rounded-lg">{revision.comentarios || "No hay comentarios adicionales de Ingeniería."}</p>
                    </div>

                   
                </div>

                {/* COLUMNA DERECHA: ESTADO Y ACCIONES */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Panel de Acciones */}
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

                    {/* Historial de Tiempos (Pendiente de implementación) */}
                    {/* <HistorialOperaciones solicitudId={solicitudId} operaciones={solicitud.operaciones} /> */}
                </div>
            </div>

            {/* FORMULARIO DE FINALIZACIÓN (Modal o sección colapsable) */}
            {showFinalizeForm && (
                // Contenedor del modal: Se corrigió para permitir scroll en el cuerpo si es necesario.
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-4 overflow-y-auto">
                    <FinalizarForm
                        solicitudId={solicitudId}
                        tiempos={tiempos}
                        setTiempos={setTiempos}
                        observacionesFinales={observacionesFinales}
                        setObservacionesFinales={setObservacionesFinales}
                        onFinalizar={handleAction}
                        onCancel={() => setShowFinalizeForm(false)}
                        isSaving={isSaving}
                    />
                </div>
            )}
        </div>
    );
}


// --- Componente Auxiliar: Tarjeta de Estado ---
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

// --- Componente Modal/Formulario de Finalización ---
function FinalizarForm({
    tiempos, setTiempos, observacionesFinales, setObservacionesFinales,
    onFinalizar, onCancel, isSaving
}) {
    
    // Calcula el total de horas registradas
    const totalHoras = useMemo(() => {
        return Object.values(tiempos).reduce((acc, current) => acc + parseFloat(current || 0), 0);
    }, [tiempos]);

    const handleTiemposChange = (maquina, value) => {
        // Asegurar que el valor sea un número o cadena vacía
        const parsedValue = value === '' ? '' : Math.max(0, parseFloat(value));
        setTiempos(prev => ({ ...prev, [maquina]: parsedValue }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (totalHoras === 0) {
            alert("Debes registrar el tiempo de al menos una máquina antes de finalizar.");
            return;
        }
        onFinalizar('FINALIZAR');
    };

    return (
        // ✅ Se añade max-h-[90vh] y overflow-y-auto para manejar el scroll del modal en pantallas pequeñas.
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 transform transition-all duration-300 max-h-[90vh] overflow-y-auto"> 
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="text-2xl font-bold text-red-600">
                    <FastForward size={24} className="inline mr-2"/> Finalizar Registro de Tarea
                </h3>
                {/* Botón de cierre (X) para salir del modal */}
                <button 
                    onClick={onCancel} 
                    className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition"
                    title="Cerrar formulario"
                >
                    <X size={24}/>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Registro de Tiempos */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-bold mb-3 text-lg text-green-800">
                        <Clock size={20} className="inline mr-2"/> Tiempos de Máquina (Horas)
                    </h4>
                    
                    {/* ✅ Eliminamos max-h-60 y overflow-y-auto para que la lista crezca y el DIV padre (modal) haga scroll si es necesario */}
                    <div className="grid grid-cols-2 gap-4 pr-2">
                        {TIPOS_MAQUINA.map(maquina => (
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
                        disabled={isSaving || totalHoras === 0}
                        className={`flex items-center font-bold py-2 px-4 rounded-lg transition ${isSaving || totalHoras === 0 ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                    >
                        <Save size={18} className="mr-2"/>
                        {isSaving ? 'Enviando...' : 'Finalizar y Enviar a Calidad'}
                    </button>
                </div>
            </form>
        </div>
    );
}