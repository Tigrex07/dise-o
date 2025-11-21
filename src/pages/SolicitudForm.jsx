import React, { useState, useCallback } from 'react';
import { Send, FileText, Component as ComponentIcon, AlertTriangle, MessageSquare, Clipboard, Upload, X, CheckSquare } from 'lucide-react';

// ----------------------------------------------------------------------
// 🚨 CONEXIÓN REAL: Importación de la URL Base del API (Preservado) 🚨
import API_BASE_URL from '../components/apiConfig'; 

// ----------------------------------------------------------------------
// DEFINICIÓN DE ENDPOINT ESPECÍFICO
const API_SOLICITUDES_ENDPOINT = '/solicitudes';
const API_SOLICITUDES_URL = `${API_BASE_URL}${API_SOLICITUDES_ENDPOINT}`; 
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// OPCIONES DEL FORMULARIO
// ----------------------------------------------------------------------
const AREAS_OPTIONS = ['Extrusión', 'Plásticos', 'Moldeo', 'Tool Room', 'Ensamble', 'Mantenimiento'];
const PRIORIDAD_OPTIONS = ['Urgente', 'Alta', 'Normal', 'Baja'];
const TIPO_OPTIONS = ['Preventivo', 'Correctivo', 'Mejora', 'Inventario'];

// ----------------------------------------------------------------------
// 🚨 FUNCIONES HELPER PARA OBTENER IDS (PLACEHOLDERS) 🚨
// NOTA: Estas funciones DEBEN ser reemplazadas por la lógica real de tu aplicación.
// En un sistema real, SolicitanteId vendría del contexto de autenticación,
// y el IdPieza se buscaría por nombre/código en tu API de Piezas.
// ----------------------------------------------------------------------

const getSolicitanteId = (nombreSolicitante) => {
    // Usamos el ID 1 como valor fijo para la prueba.
    return 1; 
};

const getPiezaId = async (piezaNombre) => {
    // Usamos el ID 1 como valor fijo para la prueba.
    return 1; 
};

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
                <p className="text-sm">{message}</p>
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
    const initialFormState = {
        pieza: '', 
        area: AREAS_OPTIONS[0],
        tipo: TIPO_OPTIONS[0],
        prioridad: PRIORIDAD_OPTIONS[2],
        descripcion: '',
        // ❌ ELIMINADO: archivoAdjunto
        nombreSolicitante: 'Usuario Demo (ID 1234)', // Nombre para mostrar
        fechaSolicitud: new Date().toISOString().split('T')[0] // Fecha para mostrar
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        setIsSubmitting(true);
        
        try {
            // 1. Obtener los IDs numéricos requeridos por el backend
            const solicitanteId = getSolicitanteId(formData.nombreSolicitante);
            const idPieza = await getPiezaId(formData.pieza); 

            // 2. Crear el objeto JSON (payload) que coincide con SolicitudCreationDto.cs
            const payload = {
                SolicitanteId: solicitanteId,
                IdPieza: idPieza,
                Turno: 'Turno Fijo', // Valor fijo o tomarlo de un campo de formulario
                Tipo: formData.tipo,
                Detalles: formData.descripcion,
                Prioridad: formData.prioridad,
            };

            console.log(`Enviando POST JSON a: ${API_SOLICITUDES_URL}`);
            console.log("Payload:", payload);
            
            const response = await fetch(API_SOLICITUDES_URL, {
                method: 'POST',
                // 🚨 CRUCIAL: Definir Content-Type para enviar JSON 🚨
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), // Convierte el objeto a string JSON
            });

            if (!response.ok) {
                 const errorBody = await response.text();
                 let errorMessage = `Error ${response.status}: Falló la creación de la solicitud.`;
                 
                 // Intentar parsear el error para un mejor mensaje
                 try {
                     const errorJson = JSON.parse(errorBody);
                     // ASP.NET Core puede devolver errores en diferentes formatos (detail, errors, title)
                     errorMessage = errorJson.errors ? JSON.stringify(errorJson.errors) : (errorJson.detail || errorJson.title || errorJson.message || errorMessage);
                 } catch {
                     errorMessage = `${errorMessage} Mensaje del API: ${errorBody.substring(0, 50)}...`;
                 }
                 throw new Error(errorMessage);
            }

            const result = await response.json();
            
            setFeedback({
                message: `Solicitud enviada exitosamente. ID asignado: ${result.id || 'N/A'}`,
                type: 'success'
            });

            // Resetea el formulario
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
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Solicitante</label>
                        <p className="mt-1 text-sm font-semibold text-gray-700">{formData.nombreSolicitante}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Fecha de Creación</label>
                        <p className="mt-1 text-sm font-semibold text-gray-700">{formData.fechaSolicitud}</p>
                    </div>
                </div>

                {/* Campos Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Ej: PZA-45A o Molde #102"
                            />
                            <Clipboard size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">Área o Departamento <span className="text-red-500">*</span></label>
                        <select
                            name="area"
                            id="area"
                            value={formData.area}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            {AREAS_OPTIONS.map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Solicitud</label>
                        <select
                            name="tipo"
                            id="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            {TIPO_OPTIONS.map(tipo => (
                                <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 mb-1">Prioridad Asignada</label>
                        <select
                            name="prioridad"
                            id="prioridad"
                            value={formData.prioridad}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            {PRIORIDAD_OPTIONS.map(prioridad => (
                                <option key={prioridad} value={prioridad}>{prioridad}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Descripción Detallada */}
                <div className="mt-6">
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción del Problema/Necesidad <span className="text-red-500">*</span></label>
                    <div className="mt-1 relative">
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            rows="4"
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                            className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            placeholder="Describe el problema, el impacto y las acciones inmediatas tomadas."
                        ></textarea>
                        <MessageSquare size={18} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                </div>

                {/* ❌ ELIMINADO: Se removió el bloque de Adjuntar Archivos */}

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
                        className="flex items-center px-6 py-3 font-semibold rounded-xl shadow-md transition duration-200 text-gray-700 bg-gray-200 hover:bg-gray-300"
                    >
                        <X size={20} className="mr-2" />
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex items-center px-6 py-3 font-semibold rounded-xl shadow-lg transition duration-200 ${
                            isSubmitting 
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