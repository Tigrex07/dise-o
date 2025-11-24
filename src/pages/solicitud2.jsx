import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Send, FileText, Component as ComponentIcon, AlertCircle, Loader2, 
    Search, User, Zap, X, CheckCircle, MessageSquareWarning 
} from 'lucide-react';
// IMPORTACIÓN DE CONFIGURACIÓN DE ENDPOINTS
import API_BASE_URL from '../components/apiConfig'; 


// ======================================================================
// 1. COMPONENTES MODALES PERSONALIZADOS (Reemplazo de SweetAlert2)
// ======================================================================

/**
 * Modal genérico para alertas y errores (Sustituye Swal.fire(error/warning))
 */
function AlertModal({ isOpen, title, message, type, onClose }) {
    if (!isOpen) return null;

    const iconClasses = {
        error: "text-red-600 bg-red-100",
        warning: "text-yellow-600 bg-yellow-100",
        info: "text-indigo-600 bg-indigo-100",
    };

    const buttonColor = type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900/60 p-4 transition-opacity">
            <div className="bg-white rounded-2xl shadow-3xl w-full max-w-md transform transition-transform">
                <div className="p-6">
                    <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full ${iconClasses[type]}`}>
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                            <p className="text-sm text-gray-500 whitespace-pre-wrap">{message}</p>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4 border-t mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md transition ${buttonColor}`}
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Modal para mensaje de éxito después del envío (Sustituye Swal.fire(success))
 */
function SuccessModal({ isOpen, title, message, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900/60 p-4 transition-opacity">
            <div className="bg-white rounded-2xl shadow-3xl w-full max-w-sm transform transition-transform">
                <div className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 mb-6">{message}</p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full px-4 py-2 text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md transition"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Modal de confirmación para cancelar la operación (Sustituye el modal de confirmación de Swal)
 */
function ConfirmBackModal({ isOpen, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900/60 p-4 transition-opacity">
            <div className="bg-white rounded-2xl shadow-3xl w-full max-w-sm transform transition-transform">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <MessageSquareWarning className="text-blue-500 w-6 h-6" />
                        <h3 className="text-xl font-semibold text-gray-900">Confirmar Cancelación</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">¿Estás seguro de que deseas **cancelar** la creación de la solicitud? Los datos no guardados se perderán.</p>
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            Continuar Editando
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition"
                        >
                            Sí, Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ======================================================================
// CONFIGURACIÓN Y FUNCIONES HELPER
// ======================================================================

const getApiUrls = (baseUrl) => ({
    SOLICITUDES: `${baseUrl}/Solicitudes`,
    CATALOGO_PIEZAS: `${baseUrl}/Piezas`, 
    CATALOGO_USUARIOS: `${baseUrl}/Usuarios`, 
    CATALOGO_TURNOS: `${baseUrl}/Turnos`, 
    CATALOGO_TIPOS: `${baseUrl}/TiposSolicitud`,
    CATALOGO_PRIORIDADES: `${baseUrl}/Prioridades`,
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const executeWithRetry = async (fn, maxRetries = 5, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error; 
            }
            const delay = baseDelay * Math.pow(2, i);
            console.warn(`Intento ${i + 1} fallido. Reintentando en ${delay}ms...`, error);
            await sleep(delay);
        }
    }
};

// ======================================================================
// COMPONENTE PRINCIPAL
// ======================================================================

export default function SolicitudForm() {
    const API_URLS = useMemo(() => getApiUrls(API_BASE_URL), []);

    const initialFormData = {
        solicitanteId: '', 
        idPieza: '', 
        turno: '',
        tipo: '',
        prioridad: '', 
        detalles: '',
        dibujo: '', 
    };

    const [formData, setFormData] = useState(initialFormData);

    const [catalogs, setCatalogs] = useState({
        piezas: [],
        usuarios: [],
        turnos: [],
        tipos: [],
        prioridades: [],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Estados para Modales Personalizados
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertModalContent, setAlertModalContent] = useState({ title: '', message: '', type: 'error' });
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isConfirmBackModalOpen, setIsConfirmBackModalOpen] = useState(false);


    // ----------------------------------------------------------------------
    // 1. OBTENCIÓN DE DATOS (Catálogos)
    // ----------------------------------------------------------------------

    const fetchCatalogs = useCallback(async () => {
        setIsLoadingCatalogs(true);
        // Reiniciar el error antes de empezar
        setAlertModalContent({ title: '', message: '', type: 'error' }); 
        setIsAlertModalOpen(false);

        const catalogPromises = [
            { key: 'piezas', url: API_URLS.CATALOGO_PIEZAS },
            { key: 'usuarios', url: API_URLS.CATALOGO_USUARIOS },
            { key: 'turnos', url: API_URLS.CATALOGO_TURNOS },
            { key: 'tipos', url: API_URLS.CATALOGO_TIPOS },
            { key: 'prioridades', url: API_URLS.CATALOGO_PRIORIDADES },
        ].map(async ({ key, url }) => {
            try {
                const data = await executeWithRetry(async () => {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`Error ${response.status} al cargar ${key}`);
                    return response.json();
                });
                return { key, data };
            } catch (error) {
                console.error(`Error al cargar el catálogo de ${key}:`, error.message);
                throw new Error(`Fallo al cargar el catálogo de **${key}**. Revisa la conexión.`);
            }
        });

        try {
            const results = await Promise.all(catalogPromises);
            const newCatalogs = {};

            results.forEach(({ key, data }) => {
                // Lógica de mapeo de datos original
                if (key === 'piezas') {
                    newCatalogs[key] = data.map(p => ({
                        id: p.id,
                        nombre: p.nombrePieza, 
                        maquina: p.maquina || 'N/A'
                    }));
                } else if (key === 'usuarios') {
                    newCatalogs[key] = data.map(u => ({
                        id: u.id,
                        nombre: u.nombre 
                    }));
                } else {
                    newCatalogs[key] = data.map(item => typeof item === 'object' && item !== null ? { id: item.id, nombre: item.nombre } : item);
                }
            });

            setCatalogs(prev => ({ ...prev, ...newCatalogs }));

        } catch (error) {
            // Mostrar modal de error crítico de carga
            setAlertModalContent({
                title: "Error de Conexión Crítico",
                message: `No se pudo cargar uno o más catálogos. Detalle: ${error.message}`,
                type: "error"
            });
            setIsAlertModalOpen(true);
            setCatalogs({
                piezas: [], usuarios: [], turnos: [], tipos: [], prioridades: [],
            });
        } finally {
            setIsLoadingCatalogs(false);
        }
    }, [API_URLS]);

    useEffect(() => {
        fetchCatalogs();
    }, [fetchCatalogs]);

    // ----------------------------------------------------------------------
    // 2. MANEJO DE ESTADO Y SUBMIT
    // ----------------------------------------------------------------------

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        
        // Lógica para actualizar el ID basado en el nombre seleccionado
        if (name === 'solicitanteNombre') {
            const selectedUser = catalogs.usuarios.find(u => u.nombre === value);
            setFormData(prev => ({
                ...prev,
                solicitanteId: selectedUser ? selectedUser.id : '',
            }));
        } else if (name === 'piezaNombre') {
            const selectedPieza = catalogs.piezas.find(p => p.nombre === value);
            setFormData(prev => ({
                ...prev,
                idPieza: selectedPieza ? selectedPieza.id : '',
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleBack = () => {
        // Abre el modal de confirmación en lugar de usar Swal.fire
        setIsConfirmBackModalOpen(true);
    };

    const handleConfirmBack = () => {
        setIsConfirmBackModalOpen(false);
        // Se puede añadir aquí la navegación si el componente está en un Router
        setAlertModalContent({
            title: "Operación Cancelada",
            message: "La creación de la solicitud ha sido abortada.",
            type: "info"
        });
        setIsAlertModalOpen(true);
        // Opcional: limpiar el formulario al cancelar
        // setFormData(initialFormData); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🚨 Validación de campos obligatorios
        const requiredFields = ['solicitanteId', 'idPieza', 'turno', 'tipo', 'prioridad', 'detalles'];
        const isValid = requiredFields.every(field => !!formData[field]);

        if (!isValid) {
            setAlertModalContent({
                title: "Campos Incompletos",
                message: "Por favor, selecciona o completa todos los campos obligatorios (*).",
                type: "warning"
            });
            setIsAlertModalOpen(true);
            return;
        }

        setIsSubmitting(true);

        try {
            // Estructura del DTO de Creación (SolicitudCreationDto)
            const submissionData = {
                solicitanteId: parseInt(formData.solicitanteId), 
                idPieza: parseInt(formData.idPieza), 
                turno: formData.turno,
                tipo: formData.tipo,
                prioridad: formData.prioridad,
                detalles: formData.detalles,
                dibujo: formData.dibujo || null 
            };
            
            await executeWithRetry(async () => {
                const response = await fetch(API_URLS.SOLICITUDES, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(submissionData),
                });

                if (response.status === 400) {
                    const errorData = await response.json();
                    let errorText = "Errores de validación en el servidor.";
                    if (errorData.errors) {
                        errorText += "\n\nDetalles:\n" + Object.values(errorData.errors).flat().join('\n- ');
                    }
                    throw new Error(errorText);
                }

                if (!response.ok) {
                    throw new Error(`Fallo en el envío: ${response.status} ${response.statusText}`);
                }
                
                return response.status === 204 ? null : response.json(); 
            });
            
            // Éxito - Mostrar modal de éxito
            setIsSuccessModalOpen(true);
            
            // Resetear el formulario 
            setFormData(initialFormData);
            setSearchQuery(''); 

        } catch (error) {
            console.error("Error al enviar la solicitud:", error);
            // Error - Mostrar modal de alerta
            setAlertModalContent({
                title: "Error al Enviar",
                message: `Ocurrió un error al procesar tu solicitud. Detalle: ${error.message}`,
                type: "error"
            });
            setIsAlertModalOpen(true);

        } finally {
            setIsSubmitting(false);
        }
    };

    // ----------------------------------------------------------------------
    // 3. DATOS DERIVADOS Y FILTRADO
    // ----------------------------------------------------------------------

    const filteredPiezas = useMemo(() => {
        if (!searchQuery) return catalogs.piezas;
        const query = searchQuery.toLowerCase();
        return catalogs.piezas.filter(pieza =>
            pieza.nombre.toLowerCase().includes(query) ||
            pieza.maquina.toLowerCase().includes(query)
        );
    }, [searchQuery, catalogs.piezas]);

    const selectedPieza = useMemo(() => {
        const id = parseInt(formData.idPieza);
        return catalogs.piezas.find(p => p.id === id);
    }, [formData.idPieza, catalogs.piezas]);

    const selectedSolicitante = useMemo(() => {
        const id = parseInt(formData.solicitanteId);
        return catalogs.usuarios.find(u => u.id === id);
    }, [formData.solicitanteId, catalogs.usuarios]);


    // Manejo del estado de carga inicial y errores de catálogo (Se mantiene inalterado)
    if (isLoadingCatalogs) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
                <p className="ml-3 text-lg text-gray-600">Cargando catálogos de la API...</p>
            </div>
        );
    }
    
    // Si hay un error de carga crítico, se muestra el botón de reintento.
    if (alertModalContent.type === 'error' && isAlertModalOpen) {
        return (
            <div className="max-w-4xl mx-auto p-8 bg-red-50 rounded-2xl shadow-xl border border-red-300 mt-8 text-center">
                <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-800">Error Crítico de Carga</h1>
                <p className="text-red-700 mt-2">No se pudo inicializar el formulario. Por favor, verifica que la API esté activa en **{API_BASE_URL}**</p>
                <p className="mt-4 text-sm font-mono text-red-600 bg-red-100 p-2 rounded-lg whitespace-pre-wrap">{alertModalContent.message}</p>
                <button 
                    onClick={() => { setIsAlertModalOpen(false); fetchCatalogs(); }} 
                    className="mt-6 flex items-center mx-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition shadow-md"
                >
                    <Loader2 size={18} className="mr-2" />
                    Reintentar Carga
                </button>
            </div>
        );
    }


    // ----------------------------------------------------------------------
    // 4. RENDERIZADO DEL FORMULARIO Y MODALES
    // ----------------------------------------------------------------------

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl shadow-2xl border border-gray-100 mt-8">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-extrabold text-indigo-800">
                    <FileText className="inline-block w-8 h-8 mr-3 text-indigo-600" />
                    Nueva Solicitud de Maquinado
                </h1>
                <p className="text-gray-500 mt-2">Completa los datos para iniciar un proceso de trabajo. Los campos con (<span className="text-red-500">*</span>) son obligatorios.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* ----------------- SECCIÓN DE DATOS DEL SOLICITANTE ----------------- */}
                <div className="p-5 bg-indigo-50 rounded-xl shadow-inner border border-indigo-200">
                    <h2 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
                        <User size={20} className="mr-2" />
                        1. Información del Solicitante
                    </h2>

                    <label htmlFor="solicitante" className="block text-sm font-medium text-gray-700 mb-1">
                        Solicitante <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="solicitante"
                        name="solicitanteNombre"
                        value={selectedSolicitante ? selectedSolicitante.nombre : ''}
                        onChange={handleFormChange}
                        required
                        className="w-full border border-indigo-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm bg-white"
                    >
                        <option value="">Selecciona tu Nombre/ID de Usuario</option>
                        {catalogs.usuarios.map((user) => (
                            <option key={user.id} value={user.nombre}>{user.nombre} (ID: {user.id})</option>
                        ))}
                    </select>

                    <div className="mt-4 p-3 bg-indigo-200 border-l-4 border-indigo-500 rounded-lg text-sm text-indigo-900 font-medium">
                        Tu ID de Solicitante es: **{formData.solicitanteId || 'No Seleccionado'}**
                    </div>
                </div>

                {/* ----------------- SECCIÓN DE SELECCIÓN DE PIEZA (FK) ----------------- */}
                <div className="p-5 bg-gray-50 rounded-xl shadow-inner border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                        <ComponentIcon size={20} className="mr-2 text-indigo-600" />
                        2. Selecciona la Pieza Requerida <span className="text-red-500">*</span>
                    </h2>

                    {/* Campo de búsqueda */}
                    <div className="relative mb-4">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Busca por Nombre de Pieza o Máquina..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                        />
                    </div>
                    
                    {/* Lista de Piezas Filtradas */}
                    <div className="h-60 overflow-y-auto border border-indigo-300 bg-white rounded-xl shadow-md p-2">
                        {filteredPiezas.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No se encontraron piezas con el filtro "{searchQuery}".</p>
                        ) : (
                            <ul className="space-y-1">
                                {filteredPiezas.map((pieza) => (
                                    <li key={pieza.id}>
                                        <label 
                                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition duration-150 ${
                                                selectedPieza && selectedPieza.id === pieza.id 
                                                ? 'bg-indigo-100 border-l-4 border-indigo-600 font-semibold text-indigo-800 shadow-inner'
                                                : 'hover:bg-gray-100 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="piezaNombre"
                                                    value={pieza.nombre}
                                                    checked={selectedPieza && selectedPieza.id === pieza.id}
                                                    onChange={handleFormChange}
                                                    required
                                                    className="form-radio text-indigo-600 h-4 w-4"
                                                />
                                                <span className="ml-3 text-sm">{pieza.nombre}</span>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-indigo-200 text-indigo-700 rounded-full font-medium">
                                                {pieza.maquina}
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    {/* Resumen de la Pieza Seleccionada */}
                    <div className="mt-4 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg">
                        <p className="font-semibold text-indigo-700">Pieza Seleccionada:</p>
                        {selectedPieza ? (
                            <p className="text-gray-800 text-sm mt-1">
                                **{selectedPieza.nombre}** (ID: {selectedPieza.id})
                                <span className="ml-3 text-gray-600">| Máquina: {selectedPieza.maquina}</span>
                            </p>
                        ) : (
                            <p className="text-gray-600 text-sm mt-1">Por favor, selecciona una pieza de la lista.</p>
                        )}
                    </div>

                </div>

                {/* ----------------- SECCIÓN DE DATOS CLAVE DE LA SOLICITUD ----------------- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Turno */}
                    <div>
                        <label htmlFor="turno" className="block text-sm font-medium text-gray-700 mb-1">Turno <span className="text-red-500">*</span></label>
                        <select
                            id="turno"
                            name="turno"
                            value={formData.turno}
                            onChange={handleFormChange}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm bg-white"
                        >
                            <option value="">Selecciona el turno</option>
                            {catalogs.turnos.map((t, index) => (
                                <option key={t.id || index} value={t.nombre || t}>{t.nombre || t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tipo de Solicitud */}
                    <div>
                        <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Solicitud <span className="text-red-500">*</span></label>
                        <select
                            id="tipo"
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleFormChange}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm bg-white"
                        >
                            <option value="">Selecciona el tipo</option>
                            {catalogs.tipos.map((t, index) => (
                                <option key={t.id || index} value={t.nombre || t}>{t.nombre || t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Prioridad */}
                    <div>
                        <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Zap size={16} className="mr-1 text-gray-500" />
                            Prioridad Inicial <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="prioridad"
                            name="prioridad"
                            value={formData.prioridad}
                            onChange={handleFormChange}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-red-500 focus:border-red-500 transition shadow-sm bg-white"
                        >
                            <option value="">Selecciona la prioridad</option>
                            {catalogs.prioridades.map((p, index) => (
                                <option key={p.id || index} value={p.nombre || p}>{p.nombre || p}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ----------------- DETALLES Y DIBUJO ----------------- */}
                
                {/* Detalles / Descripción */}
                <div>
                    <label htmlFor="detalles" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FileText size={16} className="mr-1 text-gray-500" />
                        Detalles y Diagnóstico (Descripción del Trabajo) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="detalles"
                        name="detalles"
                        value={formData.detalles}
                        onChange={handleFormChange}
                        rows="4"
                        placeholder="Describe el problema, el tipo de daño o la mejora requerida. Sé lo más específico posible."
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm resize-none"
                    ></textarea>
                </div>

                {/* Dibujo (Referencia) */}
                <div>
                    <label htmlFor="dibujo" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <User size={16} className="mr-1 text-gray-500" />
                        Referencia del Dibujo (Opcional)
                    </label>
                    <input
                        type="text"
                        id="dibujo"
                        name="dibujo"
                        value={formData.dibujo}
                        onChange={handleFormChange}
                        placeholder="Introduce la URL, el código o la referencia del plano/dibujo."
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                    />
                </div>

                {/* ----------------- BOTONES DE ACCIÓN ----------------- */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        className="flex items-center px-6 py-3 font-semibold rounded-xl shadow-md transition duration-200 text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        <X size={20} className="mr-2" />
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !formData.solicitanteId || !formData.idPieza || !formData.turno || !formData.tipo || !formData.detalles || !formData.prioridad}
                        className={`flex items-center px-6 py-3 font-semibold rounded-xl shadow-lg transition duration-200 ${
                            (isSubmitting || !formData.solicitanteId || !formData.idPieza || !formData.turno || !formData.tipo || !formData.detalles || !formData.prioridad)
                                ? 'bg-indigo-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-[1.02] active:scale-[1.01]'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="mr-2 animate-spin" />
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

            {/* MODALES PERSONALIZADOS */}
            <AlertModal 
                isOpen={isAlertModalOpen && alertModalContent.title !== 'Error Crítico de Carga'}
                title={alertModalContent.title}
                message={alertModalContent.message}
                type={alertModalContent.type}
                onClose={() => setIsAlertModalOpen(false)}
            />

            <SuccessModal
                isOpen={isSuccessModalOpen}
                title="¡Solicitud Creada!"
                message="La solicitud ha sido enviada y registrada con éxito. El formulario ha sido limpiado para un nuevo ingreso."
                onClose={() => setIsSuccessModalOpen(false)}
            />

            <ConfirmBackModal
                isOpen={isConfirmBackModalOpen}
                onConfirm={handleConfirmBack}
                onCancel={() => setIsConfirmBackModalOpen(false)}
            />

        </div>
    );
}