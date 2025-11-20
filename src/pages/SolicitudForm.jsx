import React, { useState } from 'react';
import { Send, FileText, Component, AlertTriangle, MessageSquare, Clipboard, Upload, X } from 'lucide-react';

const mockAreas = ['Extrusión', 'Plásticos', 'Moldeo', 'Tool Room', 'Ensamble', 'Mantenimiento'];

/**
 * Componente que muestra mensajes de éxito o error.
 */
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
                <X size={18} />
            </button>
        </div>
    );
}


/**
 * Formulario principal para crear nuevas solicitudes.
 * Recibe:
 * - handleSubmit: Función para manejar el envío de datos al componente padre (App.jsx).
 * - handleBack: Función para regresar al dashboard.
 * - initialData: Datos iniciales del solicitante (ej: { area: 'Extrusión', solicitante: 'John Doe' }).
 */
export default function SolicitudForm({ handleSubmit, handleBack, initialData = {} }) {
    const [formData, setFormData] = useState({
        piezaId: '',
        maquina: '',
        tipo: 'Daño físico',
        detalles: '',
        // Se inicializa con los datos del usuario logueado (pasados desde App.jsx)
        area: initialData.area || mockAreas[0], 
        solicitante: initialData.solicitante || 'Usuario Solicitante Mock',
        dibujo: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'piezaId') {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, dibujo: e.target.files[0] }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage(null);

        // Crear un payload simulado para el API
        const newSolicitud = {
            id: 'T-TEMP-001', // ID temporal, se reemplazará en App.jsx
            ...formData,
            // Simular fecha de hoy
            fecha: new Date().toISOString().split('T')[0],
            // Valores iniciales
            prioridad: 'Baja', // Baja por default, el ingeniero la sube
            estado: 'Pendiente',
            asignadoA: null,
            notasIngenieria: '',
            // No enviar el objeto File completo al estado global, solo el nombre si existe
            dibujo: formData.dibujo ? formData.dibujo.name : null, 
        };

        try {
            // *** ESTA ES LA CLAVE: Llamar a la función handleSubmit de App.jsx ***
            await handleSubmit(newSolicitud); 
            
            // Simular el tiempo de respuesta del API
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            setMessageType('success');
            setSubmitMessage(`Solicitud enviada con éxito. ID temporal de prueba.`);
            
            // Opcional: limpiar el formulario después del éxito
            setFormData(prev => ({
                piezaId: '', maquina: '', tipo: 'Daño físico', detalles: '', dibujo: null,
                area: prev.area, // Mantener área y solicitante
                solicitante: prev.solicitante,
            }));

        } catch (error) {
            setMessageType('error');
            setSubmitMessage('Error al enviar la solicitud. Inténtalo de nuevo. Detalles: ' + error.message);
            console.error("Error al simular envío:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Función para cerrar el mensaje de feedback
    const closeMessage = () => {
        setSubmitMessage(null);
        setMessageType(null);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-extrabold text-indigo-700 flex items-center">
                    <Clipboard size={24} className="mr-3 text-indigo-500" />
                    Nueva Solicitud de Servicio a Machine Shop
                </h2>
                <button
                    onClick={handleBack}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition"
                    title="Regresar al Dashboard"
                >
                    <X size={24} />
                </button>
            </div>

            <FeedbackMessage message={submitMessage} type={messageType} onClose={closeMessage} />

            <form onSubmit={handleFormSubmit} className="space-y-6 mt-6">
                
                {/* Solicitante y Área (Solo lectura para el usuario logueado) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Solicitante (Área Origen)
                        </label>
                        <input
                            type="text"
                            value={formData.solicitante}
                            disabled
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-600 cursor-not-allowed"
                        />
                         <p className="mt-1 text-xs text-gray-400">Tu nombre de usuario registrado.</p>
                    </div>
                    <div>
                        <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                            Área de la Solicitud
                        </label>
                        <select
                            id="area"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            {mockAreas.map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                         <p className="mt-1 text-xs text-gray-400">Departamento al que pertenece el componente.</p>
                    </div>
                </div>

                {/* Pieza y Máquina */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="piezaId" className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción / Identificador de Pieza (Molde/Componente)
                        </label>
                        <input
                            type="text"
                            id="piezaId"
                            name="piezaId"
                            value={formData.piezaId}
                            onChange={handleChange}
                            maxLength="50"
                            required
                            placeholder="Ej: MOLDE INY-05 INSERT, GABARIT-C45"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                        />
                    </div>
                    <div>
                        <label htmlFor="maquina" className="block text-sm font-medium text-gray-700 mb-1">
                            Máquina o Equipo Afectado (Opcional)
                        </label>
                        <input
                            type="text"
                            id="maquina"
                            name="maquina"
                            value={formData.maquina}
                            onChange={handleChange}
                            maxLength="30"
                            placeholder="Ej: INJ-05, Extrusora B"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
                
                {/* Tipo de Trabajo */}
                <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <MessageSquare size={16} className="mr-1 text-indigo-500" />
                        Tipo de Trabajo Requerido
                    </label>
                    <select
                        id="tipo"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                        <option value="Daño físico">Daño físico / Reparación urgente</option>
                        <option value="Modificación">Modificación / Mejora</option>
                        <option value="Mantenimiento preventivo">Mantenimiento preventivo</option>
                        <option value="Fabricación">Fabricación de pieza nueva</option>
                    </select>
                </div>

                {/* Detalles */}
                <div>
                    <label htmlFor="detalles" className="block text-sm font-medium text-gray-700 mb-1">
                        Detalles del Requerimiento <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="detalles"
                        name="detalles"
                        value={formData.detalles}
                        onChange={handleChange}
                        rows="4"
                        maxLength="500"
                        required
                        placeholder="Describe claramente el problema o la modificación requerida. (Máximo 500 caracteres)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
                    ></textarea>
                     <p className="mt-1 text-xs text-gray-400">Caracteres restantes: {500 - formData.detalles.length}</p>
                </div>

                {/* Archivo Adjunto */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dibujo o Documento de Referencia (Opcional)
                    </label>
                    <input
                        type="file"
                        name="dibujo"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {formData.dibujo && <p className="mt-2 text-xs text-gray-500 flex items-center"><Upload size={14} className="mr-1"/> Archivo seleccionado: {formData.dibujo.name}</p>}
                </div>

                {/* Botón de Envío y Cancelar */}
                <div className="flex justify-end pt-4 gap-4">
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
                                <Component size={20} className="mr-2 animate-spin" />
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