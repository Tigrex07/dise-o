import React, { useState, useCallback, useEffect } from 'react';
import { 
    Send, 
    FileText, 
    Component as ComponentIcon, 
    AlertTriangle, 
    MessageSquare, 
    Upload, 
    X, 
    CheckSquare, 
    Briefcase,
    UserCheck,
    Clock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext'; 
import API_BASE_URL from '../components/apiConfig'; 
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// DEFINICIÓN DE ENDPOINTS
// ----------------------------------------------------------------------
const API_SOLICITUDES_URL = `${API_BASE_URL}/Solicitudes`; 
const API_PIEZAS_URL = `${API_BASE_URL}/Piezas`; 

// ----------------------------------------------------------------------
// OPCIONES DEL FORMULARIO
// ----------------------------------------------------------------------
const TIPO_OPTIONS = ['Preventivo', 'Correctivo', 'Mejora', 'Inventario'];
const TURNO_OPTIONS = ['Mañana', 'Tarde', 'Noche'];

// ----------------------------------------------------------------------
// Componente que muestra mensajes de éxito o error.
// ----------------------------------------------------------------------
function FeedbackMessage({ message, type, onClose }) {
    if (!message) return null;

    const isError = type === 'error';
    const bgColor = isError ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';
    const icon = isError ? <AlertTriangle size={20} className="mr-2" /> : <CheckSquare size={20} className="mr-2" />;

    return (
        <div className={`flex items-start p-4 mb-6 border-l-4 rounded shadow-md ${bgColor}`} role="alert">
            {icon}
            <p className="font-medium flex-grow">{message}</p>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 ml-4">
                <X size={18} />
            </button>
        </div>
    );
}

// ----------------------------------------------------------------------
// Componente Principal
// ----------------------------------------------------------------------
export default function SolicitudForm() {
    const navigate = useNavigate();
    
    const { user, loading: loadingUser } = useAuth();

    const [formData, setFormData] = useState({
        tipo: TIPO_OPTIONS[0],
        turno: TURNO_OPTIONS[0], 
        descripcion: '',
    });

    const [piezas, setPiezas] = useState([]);
    const [selectedPiezaId, setSelectedPiezaId] = useState(null);
    const [selectedPiezaInfo, setSelectedPiezaInfo] = useState({ nombre: '', maquina: '' });

    const [selectedFile, setSelectedFile] = useState(null); 

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [loadingPiezas, setLoadingPiezas] = useState(true);

    // ----------------------------------------------------------------------
    // CARGA DE PIEZAS (CATÁLOGO)
    // ----------------------------------------------------------------------
    const fetchPiezas = async () => {
        setLoadingPiezas(true);
        try {
            const response = await fetch(API_PIEZAS_URL);
            if (!response.ok) {
                throw new Error(`Error ${response.status} al cargar el catálogo de piezas.`);
            }
            const data = await response.json();
            setPiezas(data);
            
            if (data.length > 0) {
                // Selecciona la primera pieza automáticamente para que el formulario esté listo
                setSelectedPiezaId(data[0].id); 
                setSelectedPiezaInfo({
                    nombre: data[0].nombrePieza,
                    maquina: data[0].maquina,
                });
            } else {
                setSelectedPiezaId(null);
                setSelectedPiezaInfo({ nombre: '', maquina: '' });
            }
        } catch (error) {
            console.error("Error al obtener piezas:", error);
            setFeedback({ message: "No se pudo cargar el catálogo de piezas. Intente más tarde.", type: "error" });
            setPiezas([]);
        } finally {
            setLoadingPiezas(false);
        }
    };

    useEffect(() => {
        fetchPiezas();
    }, []);


    // ----------------------------------------------------------------------
    // MANEJO DE CAMBIOS
    // ----------------------------------------------------------------------

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePiezaChange = (e) => {
        const id = parseInt(e.target.value);
        setSelectedPiezaId(id);

        const selected = piezas.find(p => p.id === id);
        if (selected) {
            setSelectedPiezaInfo({
                nombre: selected.nombrePieza,
                maquina: selected.maquina,
            });
        } else {
            setSelectedPiezaInfo({ nombre: '', maquina: '' });
        }
    };
    
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files ? e.target.files[0] : null);
    };

    // ----------------------------------------------------------------------
    // ENVÍO DEL FORMULARIO
    // ----------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedback(null);

        if (loadingUser || !user || !user.id) {
            setFeedback({ message: "Error: No se ha podido cargar la información del solicitante. Por favor, vuelva a iniciar sesión.", type: "error" });
            setIsSubmitting(false);
            return;
        }

        const trimmedDescripcion = formData.descripcion.trim();

        if (!selectedPiezaId || selectedPiezaId <= 0 || !trimmedDescripcion || trimmedDescripcion.length < 5 || !formData.turno) {
            setFeedback({ message: "Por favor, complete la selección de Pieza, la Descripción (mínimo 5 caracteres) y el Turno.", type: "error" });
            setIsSubmitting(false);
            return;
        }

        // Los nombres de las propiedades deben coincidir exactamente con el DTO de C# (PascalCase)
        const solicitudPayload = {
            SolicitanteId: user.id, 
            IdPieza: selectedPiezaId, 
            Tipo: formData.tipo,
            Turno: formData.turno, 
            Detalles: trimmedDescripcion, 
        };

        let newSolicitudId = null;

        try {
            // 1. Enviar la Solicitud (POST /Solicitudes)
            const response = await fetch(API_SOLICITUDES_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(solicitudPayload),
            });

            if (!response.ok) {
                // FIX para el error 500: Intenta leer la respuesta como texto/JSON
                let serverMessage = `Error ${response.status}.`;
                try {
                    const errorJson = await response.json();
                    
                    serverMessage = errorJson.errors 
                        ? Object.values(errorJson.errors).flat().join('; ') 
                        : (errorJson.message || response.statusText);
                    
                } catch (e) {
                    // Si falla la lectura de JSON (ej: 500 Internal Server Error con texto/HTML)
                    serverMessage = await response.text();
                    
                    if (serverMessage.length > 500) {
                        serverMessage = `Error del Servidor (${response.status}). Detalles (Recortado): ${serverMessage.substring(0, 500)}...`;
                    } else if (serverMessage.length === 0) {
                         serverMessage = `Error del Servidor (${response.status}). No se recibió un cuerpo de respuesta.`;
                    }
                }
                
                const errorMessage = `Fallo en el servidor: ${serverMessage}`;
                throw new Error(errorMessage);
            }
            
            // Si la respuesta es OK (código 201), leer como JSON
            const result = await response.json();
            
            newSolicitudId = result.id || result.idSolicitud; 
            
            // 2. Manejo de Subida de Archivo (Si existe)
            if (selectedFile) {
                console.log(`[PENDIENTE] Iniciar subida del archivo '${selectedFile.name}' para Solicitud ID: ${newSolicitudId}`);
            }

            // Éxito: Limpiar el formulario y mostrar mensaje
            setFeedback({ message: `¡Solicitud ID ${newSolicitudId} enviada con éxito!${selectedFile ? ' Archivo adjunto pendiente de subir.' : ''}`, type: "success" });
            
            // Limpiar estado
            setFormData({ tipo: TIPO_OPTIONS[0], turno: TURNO_OPTIONS[0], descripcion: '' });
            setSelectedFile(null); 

        } catch (error) {
            console.error('Fallo en el envío:', error.message);
            setFeedback({ message: error.message, type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isReady = !loadingUser && !loadingPiezas;
    
    // --- NUEVAS VARIABLES PARA CLARIDAD Y FIX DEL BOTÓN ---
    const isPiezaSelected = selectedPiezaId && selectedPiezaId > 0;
    const isDescriptionValid = formData.descripcion.trim().length >= 5;

    // Condición de bloqueo final (simplificada)
    const isSubmitDisabled = isSubmitting || 
                           !isReady || 
                           !isPiezaSelected || 
                           !formData.turno || 
                           !isDescriptionValid;


    if (loadingUser) {
        return <div className="p-8 text-center text-xl text-indigo-600">Cargando datos de usuario...</div>;
    }


    return (
        <div className="p-6 max-w-4xl mx-auto">
            <header className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">Nueva Solicitud de Fabricación</h1>
                <p className="text-gray-500 mt-1">Llene los detalles para solicitar la fabricación o reparación de una pieza.</p>
            </header>

            <FeedbackMessage {...feedback} onClose={() => setFeedback(null)} />

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6 border border-gray-100">
                {/* ------------------- SECCIÓN DE DATOS DEL SOLICITANTE ------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center">
                        <UserCheck size={20} className="mr-3 text-indigo-600" />
                        <div>
                            <label className="text-xs font-medium text-gray-500 block">Solicitante</label>
                            <p className="font-semibold text-gray-800">{user?.nombre || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center">
                        <Briefcase size={20} className="mr-3 text-indigo-600" />
                        <div>
                            <label className="text-xs font-medium text-gray-500 block">Área/Departamento</label>
                            <p className="font-semibold text-gray-800">{user?.area || 'Sin especificar'}</p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <FileText size={20} className="mr-3 text-indigo-600" />
                        <div>
                            <label className="text-xs font-medium text-gray-500 block">Rol</label>
                            <p className="font-semibold text-gray-800">{user?.rol || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* ------------------- SECCIÓN DE DATOS DE LA PIEZA ------------------- */}
                
                {/* Selector de Pieza */}
                <div>
                    <label htmlFor="pieza" className="block text-sm font-medium text-gray-700 mb-1">
                        Pieza a Reparar / Fabricar <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="pieza"
                        name="pieza"
                        value={selectedPiezaId || ''}
                        onChange={handlePiezaChange}
                        disabled={!isReady || piezas.length === 0}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                        {loadingPiezas ? (
                            <option value="" disabled>Cargando catálogo...</option>
                        ) : piezas.length === 0 ? (
                            <option value="" disabled>No hay piezas disponibles</option>
                        ) : (
                            piezas.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.nombrePieza} (Máquina: {p.maquina})
                                </option>
                            ))
                        )}
                    </select>
                </div>
                
                {/* Información de Pieza Seleccionada y Selectores Secundarios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <label className="text-xs font-medium text-indigo-700 block">Máquina Asociada</label>
                        <p className="font-semibold text-indigo-800">{selectedPiezaInfo.maquina || '—'}</p>
                    </div>
                    {/* Selector de Tipo de Solicitud */}
                    <div>
                        <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Solicitud</label>
                        <select
                            id="tipo"
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleFormChange}
                            disabled={!isReady}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            {TIPO_OPTIONS.map(tipo => (
                                <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                        </select>
                    </div>
                    {/* Selector de Turno */}
                    <div>
                        <label htmlFor="turno" className="block text-sm font-medium text-gray-700 mb-1">
                            Turno <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="turno"
                            name="turno"
                            value={formData.turno}
                            onChange={handleFormChange}
                            disabled={!isReady}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            {TURNO_OPTIONS.map(turno => (
                                <option key={turno} value={turno}>{turno}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ------------------- SECCIÓN DE DESCRIPCIÓN ------------------- */}
                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción de la Falla / Requerimiento <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleFormChange}
                        rows="4"
                        placeholder="Detalle la falla, el tipo de material, o las especificaciones de fabricación. Sea lo más claro posible (mínimo 5 caracteres)."
                        disabled={!isReady}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    ></textarea>
                </div>

                {/* SECCIÓN: Adjuntar Archivos (Siempre visible) */}
                <div>
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
                        Adjuntar Archivo o Plano (Opcional)
                    </label>
                    <div className="flex items-center space-x-3 p-3 border border-dashed border-gray-300 rounded-lg">
                        <Upload size={20} className="text-indigo-600" />
                        <input
                            id="file-upload"
                            type="file"
                            onChange={handleFileChange}
                            disabled={!isReady || isSubmitting}
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {selectedFile && (
                             <span className="text-sm text-green-600 font-medium ml-4">
                                Archivo listo: {selectedFile.name}
                             </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        **Nota:** El archivo se asociará a la solicitud una vez que esta sea creada exitosamente.
                    </p>
                </div>

                {/* ------------------- BOTONES DE ACCIÓN ------------------- */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        disabled={isSubmitting}
                        className="flex items-center px-6 py-3 font-semibold rounded-xl shadow-md transition duration-200 text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        <X size={20} className="mr-2" />
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitDisabled} 
                        className={`flex items-center px-6 py-3 font-semibold rounded-xl shadow-lg transition duration-200 ${
                            isSubmitDisabled
                                ? 'bg-indigo-400 cursor-not-allowed opacity-70' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-[1.02]'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <ComponentIcon size={20} className="mr-2 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send size={20} className="mr-2" />
                                Enviar Solicitud
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}