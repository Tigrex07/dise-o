import React, { useState, useCallback, useEffect } from 'react';
import { 
    Send, 
    FileText, 
    Component as ComponentIcon, 
    AlertTriangle, 
    X, 
    CheckSquare, 
    UserCheck,
    User, MapPin, Tag // Iconos para Solicitante
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext'; 
import API_BASE_URL from '../components/apiConfig'; 

// ----------------------------------------------------------------------
// DEFINICIÓN DE ENDPOINTS
// ----------------------------------------------------------------------
const API_SOLICITUDES_URL = `${API_BASE_URL}/Solicitudes`; 
const API_AREAS_URL = `${API_BASE_URL}/Areas`; 

// ----------------------------------------------------------------------
// OPCIONES DEL FORMULARIO
// ----------------------------------------------------------------------
const TIPO_OPTIONS = ['Reparacion', 'Modificacion', 'Fabricacion', 'Set-Up'];
const TURNO_OPTIONS = ['Mañana', 'Tarde', 'Noche'];

// ----------------------------------------------------------------------
// Componente que muestra mensajes de éxito o error.
// ----------------------------------------------------------------------
function FeedbackMessage({ message, type, onClose }) {
    if (!message) return null;

    const isError = type === 'error';
    const bgColor = isError ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';
    const Icon = isError ? AlertTriangle : CheckSquare;

    return (
        <div className={`p-4 mb-4 border rounded-xl flex justify-between items-center ${bgColor}`} role="alert">
            <div className="flex items-center">
                <Icon size={20} className="mr-3" />
                <span className="text-sm font-medium">{message}</span>
            </div>
            <button 
                onClick={onClose} 
                className={`text-sm font-semibold ${isError ? 'text-red-500' : 'text-green-500'} hover:opacity-75`}
            >
                <X size={16} />
            </button>
        </div>
    );
}

// ----------------------------------------------------------------------
// Componente principal: SolicitudForm
// ----------------------------------------------------------------------
export default function SolicitudForm() {
    const navigate = useNavigate();
    const { user, logOut } = useAuth(); // Obtiene el contexto de autenticación

    // ----------------------------------------------------------------------
    // --- ESTADO INICIAL DEL FORMULARIO ---
    // ----------------------------------------------------------------------
    const [formData, setFormData] = useState({
        // Inicializar SolicitanteId a null. Se actualizará en useEffect.
        SolicitanteId: null, 
        IdArea: '',
        NombrePieza: '',
        Maquina: '',
        // FechaYHora se inicializa automáticamente
        FechaYHora: new Date().toISOString().substring(0, 16), 
        Turno: '',
        Tipo: '',
        Detalles: '',
        Dibujo: '',
    });
    
    // ----------------------------------------------------------------------
    // --- ESTADOS PARA LOS CAMPOS AUTOCOMPLETADOS (Sólo Visualización) ---
    // Se inicializan con placeholders de "Cargando" para manejar la carga asíncrona.
    // ----------------------------------------------------------------------
    const [nombreSolicitante, setNombreSolicitante] = useState('Cargando...');
    const [areaSolicitante, setAreaSolicitante] = useState('Cargando...');
    const [rolSolicitante, setRolSolicitante] = useState('Cargando...');
    
    const [areas, setAreas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    // ----------------------------------------------------------------------
    // --- EFECTO CLAVE: SINCRONIZAR DATOS DEL USUARIO Y ÁREAS ---
    // ----------------------------------------------------------------------
    useEffect(() => {
        // --- A. Actualizar Datos del Solicitante ---
        if (user && user.id) {
            // Datos cargados exitosamente: Actualiza estados de visualización
            setNombreSolicitante(user.nombre || 'Desconocido');
            setAreaSolicitante(user.area || 'N/A');
            setRolSolicitante(user.rol || 'N/A');
            
            // Actualizar el ID en el formData (clave para el envío)
            setFormData(prev => ({
                ...prev,
                SolicitanteId: user.id
            }));
        } else {
            // Usuario no cargado o es invitado: Actualiza a placeholders
            setNombreSolicitante('Invitado / Cargando');
            setAreaSolicitante('N/A');
            setRolSolicitante('N/A');
            setFormData(prev => ({ ...prev, SolicitanteId: null }));
        }


        // --- B. Cargar la lista de Áreas ---
        const fetchAreas = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(API_AREAS_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setAreas(data);

                // Si el usuario tiene un área predefinida, intentar preseleccionar el IdArea
                if (user?.area && data.length > 0) {
                    const areaEncontrada = data.find(a => a.nombreArea === user.area);
                    if (areaEncontrada) {
                        setFormData(prev => ({
                            ...prev,
                            // Aseguramos que sea string para el select
                            IdArea: areaEncontrada.id.toString() 
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching areas:", error);
                setFeedback({ message: "Error al cargar las áreas disponibles.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };

        // Solo intentar cargar áreas si tenemos el objeto 'user'
        if (user) {
            fetchAreas();
        }
        
    }, [user]); // 🚨 CLAVE: Este efecto se ejecuta cada vez que el objeto 'user' cambia.

    // ----------------------------------------------------------------------
    // --- MANEJO DE CAMBIOS DEL FORMULARIO ---
    // ----------------------------------------------------------------------
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // ----------------------------------------------------------------------
    // --- MANEJO DEL ENVÍO DEL FORMULARIO ---
    // ----------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedback({ message: '', type: '' });

        // Antes de enviar, re-generar la fecha y hora para asegurar que sea lo más actual posible.
        const currentTime = new Date().toISOString().substring(0, 16);
        
        const dataToSend = {
            ...formData,
            SolicitanteId: parseInt(formData.SolicitanteId),
            IdArea: parseInt(formData.IdArea),
            Maquina: formData.Maquina.trim() || 'N/A', 
            Detalles: formData.Detalles.trim() || 'Sin detalles adicionales',
            FechaYHora: currentTime 
        };

        try {
            const response = await fetch(API_SOLICITUDES_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                let errorData = await response.text();
                try {
                    errorData = JSON.parse(errorData);
                } catch {
                    errorData = { message: `Error ${response.status}: ${errorData}` };
                }
                
                const errorMessage = errorData.message || errorData.title || `Error ${response.status}: Error interno del servidor o validación fallida.`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            setFeedback({ message: `Solicitud #${result.id} creada con éxito y enviada a revisión.`, type: 'success' });
            
        } catch (error) {
            console.error("Error en el POST:", error);
            setFeedback({ message: `Error al enviar la solicitud: ${error.message || 'Verifica la consola para más detalles.'}`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ----------------------------------------------------------------------
    // --- LÓGICA DE VALIDACIÓN ---
    // ----------------------------------------------------------------------
    // El formulario está deshabilitado si el SolicitanteId es null (no autenticado/cargando).
    const isSubmitDisabled = 
        isLoading ||
        isSubmitting ||
        !formData.IdArea || 
        !formData.NombrePieza.trim() || 
        !formData.Maquina.trim() || 
        !formData.Turno ||
        !formData.Tipo ||
        !formData.Detalles.trim() ||
        !formData.SolicitanteId; 

    // ----------------------------------------------------------------------
    // --- RENDERIZADO DEL FORMULARIO ---
    // ----------------------------------------------------------------------
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-2xl">
            <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 flex items-center">
                <FileText size={28} className="mr-3" />
                Nueva Solicitud
            </h1>
            
            <FeedbackMessage 
                message={feedback.message} 
                type={feedback.type} 
                onClose={() => setFeedback({ message: '', type: '' })} 
            />
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* ------------------------------------------------------- */}
                {/* --- BLOQUE DE INFORMACIÓN DEL SOLICITANTE (AUTOC.) --- */}
                {/* ------------------------------------------------------- */}
                <h2 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">
                    <UserCheck size={20} className="inline mr-2" />
                    Datos del Solicitante
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Nombre del Solicitante (No editable) */}
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Nombre
                        </label>
                        <div className="mt-1 flex items-center bg-gray-100 p-3 rounded-xl border border-gray-300">
                            <User size={20} className="text-gray-500 mr-2" />
                            <span className="text-gray-800 font-semibold truncate">
                                {nombreSolicitante}
                            </span>
                        </div>
                        {/* Campo oculto para enviar el ID del solicitante */}
                        <input type="hidden" name="SolicitanteId" value={formData.SolicitanteId || ''} />
                    </div>

                    {/* Área del Solicitante (No editable) */}
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Área
                        </label>
                        <div className="mt-1 flex items-center bg-gray-100 p-3 rounded-xl border border-gray-300">
                            <MapPin size={20} className="text-gray-500 mr-2" />
                            <span className="text-gray-800 font-semibold truncate">
                                {areaSolicitante}
                            </span>
                        </div>
                    </div>

                    {/* Rol del Solicitante (No editable) */}
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Rol
                        </label>
                        <div className="mt-1 flex items-center bg-gray-100 p-3 rounded-xl border border-gray-300">
                            <Tag size={20} className="text-gray-500 mr-2" />
                            <span className="text-gray-800 font-semibold truncate">
                                {rolSolicitante}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ------------------------------------------------------- */}
                {/* --- BLOQUE DE DETALLES DE LA PIEZA Y TRABAJO --- */}
                {/* ------------------------------------------------------- */}
                <h2 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4 mt-6">
                    <ComponentIcon size={20} className="inline mr-2" />
                    Detalles de la Pieza y el Trabajo
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Campo ID de Área (Select) */}
                    <div className="col-span-1">
                        <label htmlFor="IdArea" className="block text-sm font-medium text-gray-700">
                            Área de la Pieza (Ubicación) <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="IdArea"
                            name="IdArea"
                            value={formData.IdArea}
                            onChange={handleChange}
                            required
                            // Deshabilitar si está cargando la lista de áreas o no hay usuario autenticado
                            disabled={isLoading || !formData.SolicitanteId}
                            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border disabled:bg-gray-50 disabled:cursor-not-allowed"
                        >
                            <option value="">{isLoading ? 'Cargando Áreas...' : 'Seleccione un área...'}</option>
                            {areas.map(area => (
                                <option key={area.id} value={area.id}>
                                    {area.nombreArea}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Campo Nombre de la Pieza (Input) */}
                    <div className="col-span-1">
                        <label htmlFor="NombrePieza" className="block text-sm font-medium text-gray-700">
                            Nombre/Código de la Pieza <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="NombrePieza"
                            name="NombrePieza"
                            value={formData.NombrePieza}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-xl p-3 border"
                            placeholder="Ej: Inserto 101, Molde Cavidad A"
                        />
                    </div>

                    {/* Campo Máquina (Input) */}
                    <div className="col-span-1">
                        <label htmlFor="Maquina" className="block text-sm font-medium text-gray-700">
                            Máquina (Asignada/Origen) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="Maquina"
                            name="Maquina"
                            value={formData.Maquina}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-xl p-3 border"
                            placeholder="Ej: Prensa 1, Fresadora 5"
                        />
                    </div>
                </div>

                {/* Se ajusta el layout a 2 columnas para Turno y Tipo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Campo Turno (Select) */}
                    <div className="col-span-1">
                        <label htmlFor="Turno" className="block text-sm font-medium text-gray-700">
                            Turno <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="Turno"
                            name="Turno"
                            value={formData.Turno}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border"
                        >
                            <option value="">Seleccione un turno...</option>
                            {TURNO_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    {/* Campo Tipo (Select) */}
                    <div className="col-span-1">
                        <label htmlFor="Tipo" className="block text-sm font-medium text-gray-700">
                            Tipo de Trabajo <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="Tipo"
                            name="Tipo"
                            value={formData.Tipo}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border"
                        >
                            <option value="">Seleccione el tipo...</option>
                            {TIPO_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Campo Detalles (Textarea) */}
                <div>
                    <label htmlFor="Detalles" className="block text-sm font-medium text-gray-700">
                        Detalles / Descripción del Problema <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="Detalles"
                        name="Detalles"
                        rows="4"
                        value={formData.Detalles}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-xl p-3 border"
                        placeholder="Describa el problema, las dimensiones, tolerancias o el trabajo requerido."
                    />
                </div>
                
                {/* Campo Dibujo (Input de Texto para URL/Código) */}
                <div>
                    <label htmlFor="Dibujo" className="block text-sm font-medium text-gray-700">
                        Enlace o Código de Dibujo/Plano (Opcional)
                    </label>
                    <div className="mt-1 flex rounded-xl shadow-sm">
                        <input
                            type="text"
                            id="Dibujo"
                            name="Dibujo"
                            value={formData.Dibujo}
                            onChange={handleChange}
                            className="flex-1 block w-full rounded-xl p-3 sm:text-sm border-gray-300 border"
                            placeholder="Ej: \\servidor\dibujos\PLANO-1234.pdf"
                        />
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
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