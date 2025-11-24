import React, { useState, useCallback } from 'react';
import { Send, FileText, Component as ComponentIcon, AlertTriangle, MessageSquare, Clipboard, Upload, X, CheckSquare } from 'lucide-react';

// ======================================================================
// 🚨 ZONA DE MOCKING Y FIX DE IMPORTACIÓN (AJUSTADO A ID=1) 🚨
// ======================================================================

// --- MOCK TEMPORAL DE AUTENTICACIÓN ---
// Fija el Solicitante ID a 1, según tu requerimiento.
const useAuth = () => ({
    user: { id: 1, nombre: 'Usuario Fijo ID 1' }, 
    loading: false
});

// --- MOCK DE CONFIGURACIÓN API (Asegúrate que esta URL sea correcta) ---
// Si usas una importación real, puedes comentar estas líneas y descomentar tus imports originales.
const API_BASE_URL = 'http://localhost:5145/api'; 
// ----------------------------------------------------------------------

// --- FUNCIÓN HELPER PARA OBTENER ID DE PIEZA (MOCK) ---
// Fija el IdPieza a 1, según tu requerimiento.
const getPiezaId = async (piezaNombre) => {
    console.log(`[MOCK] Pieza solicitada: '${piezaNombre}'. Devolviendo ID fijo: 1.`);
    return 1; 
};

// ======================================================================

// ----------------------------------------------------------------------
// DEFINICIÓN DE ENDPOINT ESPECÍFICO
const API_SOLICITUDES_ENDPOINT = '/solicitudes';
const API_SOLICITUDES_URL = `${API_BASE_URL}${API_SOLICITUDES_ENDPOINT}`; 
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// OPCIONES DEL FORMULARIO
// ----------------------------------------------------------------------
const AREAS_OPTIONS = ['Extrusión', 'Plásticos', 'Moldeo', 'Tool Room', 'Ensamble', 'Mantenimiento'];
const TIPO_OPTIONS = ['Preventivo', 'Correctivo', 'Mejora', 'Inventario'];

// ----------------------------------------------------------------------
// Componente que muestra mensajes de éxito o error.
// ----------------------------------------------------------------------
function FeedbackMessage({ message, type, onClose }) {
    if (!message) return null;

    const baseClasses = "p-4 rounded-xl shadow-md flex items-start mt-6";
    const typeClasses = type === 'success'
        ? "bg-green-100 border-l-4 border-green-500 text-green-700"
        : "bg-red-100 border-l-4 border-red-500 text-red-700";

    return (
        <div className={`${baseClasses} ${typeClasses}`} role="alert">
            <AlertTriangle size={20} className="mt-1 mr-3 flex-shrink-0" />
            <div className="flex-grow">
                <p className="font-semibold">{type === 'success' ? 'Éxito en el Envío' : 'Error en el Envío'}</p>
                <p className="text-sm whitespace-pre-wrap">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="ml-4 text-gray-500 hover:text-gray-700"
                title="Cerrar mensaje"
            >
                <X size={16} />
            </button>
        </div>
    );
}

/**
 * Componente principal del formulario de solicitud.
 */
export default function SolicitudForm() {
    // 🚨 USAMOS EL CONTEXTO DE AUTENTICACIÓN (Ahora mockeado con ID: 1) 🚨
    const { user, loading: loadingUser } = useAuth();
    
    // El nombre del solicitante ahora se toma del usuario cargado, si existe.
    const solicitanteNombreDisplay = user?.nombre || 'Cargando...';

    const initialFormState = {
        pieza: '', 
        area: AREAS_OPTIONS[0],
        tipo: TIPO_OPTIONS[0],
        descripcion: '',
        dibujo: '', 
        fechaSolicitud: new Date().toISOString().split('T')[0] 
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // Deshabilitar el formulario si el usuario está cargando o no tiene un ID válido
    const isFormDisabled = loadingUser || !user || !user.id;

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    // Función para manejar la selección de archivos
    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        setFormData(prev => ({ ...prev, dibujo: file ? file.name : '' }));
    }, []);

    const handleBack = () => {
        setFormData(initialFormState);
        setFeedback(null);
    };

    /**
     * 🚨 Lógica de conexión al API usando fetch y JSON 🚨
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback(null);
        
        if (isFormDisabled) {
            setFeedback({ message: "No se puede enviar la solicitud. La información del usuario no se ha cargado correctamente.", type: 'error' });
            return;
        }

        setIsSubmitting(true);
        
        try {
            // 1. Obtener los IDs numéricos requeridos por el backend
            // Ambos IDs están fijos a 1, según tu requerimiento.
            const solicitanteId = user.id; // Siempre será 1 debido al mock de useAuth
            const idPieza = await getPiezaId(formData.pieza); // Siempre será 1 debido al mock de getPiezaId
            // Fecha y hora actual en formato ISO para el campo DATETIME
            const fechaYHora = new Date().toISOString(); 

            // 2. Crear el objeto JSON (payload)
            // Se usa Turno: "Mañana" como valor de ejemplo, ya que no tienes un campo de turno en el formulario.
            const payload = {
                SolicitanteId: solicitanteId, // ✅ CORREGIDO: Usamos SolicitanteId para que haga match con el DTO de C#
                IdPieza: idPieza,           
                FechaYHora: fechaYHora, 
                Turno: 'Mañana', // Fijo como ejemplo, puedes cambiarlo si tienes un campo de turno
                Tipo: formData.tipo,
                Detalles: formData.descripcion,
                Dibujo: formData.dibujo || null, 
            };

            console.log(`Enviando POST JSON a: ${API_SOLICITUDES_URL}`);
            console.log("Payload:", payload);
            
            const response = await fetch(API_SOLICITUDES_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), 
            });

            if (!response.ok) {
                const errorBody = await response.text();
                let errorMessage = `Error ${response.status}: Falló la creación de la solicitud.`;
                
                try {
                    const errorJson = JSON.parse(errorBody);
                    if (errorJson.errors) {
                        const validationErrors = Object.entries(errorJson.errors)
                            .map(([key, value]) => `${key}: ${value.join(', ')}`)
                            .join('\n- ');
                        errorMessage = `Errores de validación de la API:\n- ${validationErrors}`;
                    } else {
                        errorMessage = errorJson.detail || errorJson.title || errorJson.message || errorMessage;
                    }
                } catch {
                    errorMessage = `${errorMessage} (Respuesta del servidor: ${errorBody.substring(0, 100)}...)`;
                }
                throw new Error(errorMessage);
            }

            // Si es exitoso
            const result = response.status === 204 ? { id: 'Creada' } : await response.json();
            
            setFeedback({
                message: `Solicitud enviada exitosamente. ID asignado: ${result.id || 'N/A'}\nIDs Usados: Solicitante ID: ${solicitanteId}, Pieza ID: ${idPieza}`,
                type: 'success'
            });

            // Resetea los campos variables del formulario
            setFormData(initialFormState);

        } catch (error) {
            console.error("Fallo el envío de la solicitud (fetch):", error);
            setFeedback({
                message: `Fallo al conectar o enviar: ${error.message || 'Error desconocido del servidor.'}`,
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 bg-white rounded-xl shadow-2xl max-w-4xl mx-auto my-10">
            <header className="mb-8 border-b pb-4">
                <h2 className="text-3xl font-extrabold text-gray-800 flex items-center">
                    <FileText size={28} className="mr-3 text-indigo-600" />
                    Generar Nueva Solicitud
                </h2>
                <p className="text-gray-500 mt-1">Completa los campos para registrar una nueva necesidad o reporte.</p>
            </header>
            
            <div className="flex items-center mb-6 text-xs text-gray-500">
                <ComponentIcon size={14} className="mr-1 text-blue-500" />
                <span className="font-semibold text-blue-600">API Endpoint: {API_SOLICITUDES_URL}</span>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Metadatos (Campos de solo lectura para contexto) */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Solicitante (ID: {user?.id || 'Cargando...'})</label>
                        <p className="mt-1 text-sm font-bold text-indigo-800">
                            {loadingUser ? 'Cargando usuario...' : solicitanteNombreDisplay}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Fecha de Creación</label>
                        <p className="mt-1 text-sm font-semibold text-gray-700">{formData.fechaSolicitud}</p>
                    </div>
                </div>

                {isFormDisabled && !loadingUser && (
                    <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
                        <AlertTriangle size={18} className="inline mr-2" />
                        **Atención:** No se pudo cargar la información del usuario logueado. El formulario está deshabilitado.
                    </div>
                )}

                {/* Campos Principales */}
                <fieldset disabled={isFormDisabled} className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pieza */}
                        <div className="col-span-1">
                            <label htmlFor="pieza" className="block text-sm font-medium text-gray-700 mb-1">ID o Nombre de Pieza/Molde <span className="text-red-500">*</span></label>
                            <div className="mt-1 relative">
                                <input
                                    type="text"
                                    name="pieza"
                                    id="pieza"
                                    value={formData.pieza}
                                    onChange={handleChange}
                                    required
                                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                                    placeholder="Ej: PZA-45A o Molde #102"
                                />
                                <Clipboard size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">**Nota:** Solicitante ID y Pieza ID se envían fijos como **1**.</p>
                        </div>

                        {/* Área (Se mantiene para la UI, aunque no se envíe) */}
                        <div className="col-span-1">
                            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">Área o Departamento <span className="text-red-500">*</span></label>
                            <select
                                name="area"
                                id="area"
                                value={formData.area}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 bg-white disabled:bg-gray-100"
                            >
                                {AREAS_OPTIONS.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tipo de Solicitud */}
                        <div className="col-span-1">
                            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Solicitud</label>
                            <select
                                name="tipo"
                                id="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 bg-white disabled:bg-gray-100"
                            >
                                {TIPO_OPTIONS.map(tipo => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Se agrega el campo Dibujo en su lugar */}
                        <div className="col-span-1">
                            <label htmlFor="dibujo" className="block text-sm font-medium text-gray-700 mb-1">Dibujo/Archivo Adjunto (Opcional)</label>
                            <div className="mt-1 flex items-center">
                                <input
                                    type="file"
                                    name="dibujo"
                                    id="dibujo"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500
                                               file:mr-4 file:py-2 file:px-4
                                               file:rounded-lg file:border-0
                                               file:text-sm file:font-semibold
                                               file:bg-indigo-50 file:text-indigo-700
                                               hover:file:bg-indigo-100 disabled:bg-gray-100"
                                />
                                {formData.dibujo && (
                                    <span className="text-xs text-green-600 ml-2 flex items-center">
                                        <CheckSquare size={14} className="mr-1" /> Adjunto: {formData.dibujo.substring(0, 15)}...
                                    </span>
                                )}
                            </div>
                        </div>
                        
                    </div>

                    {/* Descripción Detallada */}
                    <div className="mt-0">
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción del Problema/Necesidad <span className="text-red-500">*</span></label>
                        <div className="mt-1 relative">
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                rows="4"
                                value={formData.descripcion}
                                onChange={handleChange}
                                required
                                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 resize-none disabled:bg-gray-100"
                                placeholder="Describe el problema, el impacto y las acciones inmediatas tomadas."
                            ></textarea>
                            <MessageSquare size={18} className="absolute right-3 top-3 text-gray-400" />
                        </div>
                    </div>
                </fieldset>

                {/* Mensaje de Feedback (Éxito/Error) */}
                <FeedbackMessage 
                    message={feedback?.message} 
                    type={feedback?.type} 
                    onClose={() => setFeedback(null)} 
                />

                {/* Botones de Acción */}
                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={isSubmitting || isFormDisabled}
                        className="flex items-center px-6 py-3 font-semibold rounded-xl shadow-md transition duration-200 text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        <X size={20} className="mr-2" />
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || isFormDisabled || !formData.pieza || !formData.descripcion}
                        className={`flex items-center px-6 py-3 font-semibold rounded-xl shadow-lg transition duration-200 ${
                            (isSubmitting || isFormDisabled || !formData.pieza || !formData.descripcion)
                                ? 'bg-indigo-400 cursor-not-allowed' 
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
