import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Users, PlusCircle, Edit, UserCheck, XCircle, 
    Loader2, RefreshCw, AlertTriangle, Search, X, Briefcase, 
    Tag, CheckSquare, Save, AlertCircle, User, MessageSquareWarning
} from 'lucide-react';

// Importa la URL base del API. Asumimos que esta constante ya contiene el prefijo base.
import API_BASE_URL from '../components/apiConfig'; 


// ----------------------------------------------------------------------
// DEFINICIÓN DE ENDPOINT ESPECÍFICO
// Se define la URL completa para el recurso de usuarios.
const API_USUARIOS_ENDPOINT = '/usuarios';
const API_USUARIOS_URL = `${API_BASE_URL}${API_USUARIOS_ENDPOINT}`; 
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// 1. ConfirmActionModal Componente (MODAL DE CONFIRMACIÓN)
// (Sin cambios, ya estaba correcto)
// ----------------------------------------------------------------------

/**
 * Modal genérico para confirmar acciones críticas (Componente local integrado)
 */
function ConfirmActionModal({ isOpen, title, message, actionButtonText, onConfirm, onCancel, data }) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(data);
        // onCancel(); // Se deja que el componente padre cierre el modal después de la acción.
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900/60 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-3xl w-full max-w-sm transform transition-transform duration-300 scale-100 opacity-100">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <AlertCircle className="text-red-500 w-6 h-6" />
                        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">{message}</p>
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-md transition"
                        >
                            {actionButtonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 2. UserFormModal Componente (MODAL DE CREACIÓN/EDICIÓN)
// (Sin cambios, ya estaba correcto)
// ----------------------------------------------------------------------

/**
 * Modal para crear o editar un usuario.
 */
function UserFormModal({ isOpen, userToEdit, onClose, onSave }) {
    const isEditing = !!userToEdit;
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        rol: 'Operador',
        area: 'Machine Shop',
        activo: true, // Por defecto, al crear es activo
    });
    const [formError, setFormError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setFormError(null);
            if (userToEdit) {
                // Si es edición, carga los datos del usuario
                setFormData({
                    nombre: userToEdit.nombre,
                    email: userToEdit.email,
                    rol: userToEdit.rol,
                    area: userToEdit.area,
                    activo: userToEdit.activo,
                });
            } else {
                // Si es creación, resetea a valores iniciales
                setFormData({
                    nombre: '',
                    email: '',
                    rol: 'Operador',
                    area: 'Machine Shop',
                    activo: true,
                });
            }
        }
    }, [isOpen, userToEdit]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError(null);

        // Validación simple
        if (!formData.nombre.trim() || !formData.email.trim() || !formData.rol.trim()) {
            setFormError('Por favor, completa todos los campos obligatorios.');
            return;
        }

        const userPayload = {
            // Si es edición, incluye el ID para el PUT
            ...(isEditing && { id: userToEdit.id }),
            ...formData,
        };

        onSave(userPayload, isEditing);
        onClose();
    };

    const ROLES = ["Admin IT", "Ingeniero", "Operador"];
    const AREAS = ["Machine Shop", "Inyección", "Extrusión", "Mantenimiento", "IT/Sistemas", "Otros"];


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900/60 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-3xl w-full max-w-lg transform transition-transform duration-300 scale-100 opacity-100">
                <div className="p-6">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center">
                            <User className="mr-2 w-5 h-5 text-indigo-600" />
                            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {formError && (
                            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center">
                                <AlertTriangle size={16} className="mr-2" />
                                {formError}
                            </div>
                        )}

                        {/* Campo Nombre */}
                        <div className="mb-4">
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><User size={14} className="mr-1"/> Nombre Completo</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>

                        {/* Campo Email */}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><MessageSquareWarning size={14} className="mr-1"/> Correo Electrónico</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                        
                        {/* Campo Rol */}
                        <div className="mb-4">
                            <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Tag size={14} className="mr-1"/> Rol</label>
                            <select
                                id="rol"
                                name="rol"
                                value={formData.rol}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white pr-8"
                                required
                            >
                                {ROLES.map(rol => (
                                    <option key={rol} value={rol}>{rol}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Campo Área */}
                        <div className="mb-4">
                            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Briefcase size={14} className="mr-1"/> Área/Departamento</label>
                            <select
                                id="area"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white pr-8"
                                required
                            >
                                {AREAS.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>

                        {/* Checkbox Activo (Solo visible en edición o si se desea controlar al crear) */}
                        <div className="flex items-center mb-6 pt-2 border-t border-gray-100">
                            <input
                                id="activo"
                                name="activo"
                                type="checkbox"
                                checked={formData.activo}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                                Usuario Activo
                            </label>
                        </div>

                        {/* Botón de Guardar */}
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg transition"
                            >
                                <Save size={16} className="mr-2" />
                                {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 3. UserTableRow Componente (Fila de la tabla)
// (Sin cambios, ya estaba correcto)
// ----------------------------------------------------------------------

/**
 * Fila individual de la tabla de usuarios.
 */
function UserTableRow({ user, handleEdit, handleToggleActive }) {
    const statusClasses = user.activo 
        ? "bg-green-100 text-green-700 border-green-200"
        : "bg-red-100 text-red-700 border-red-200";

    const Td = ({ children, className = "" }) => (
        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-800 ${className}`}>
            {children}
        </td>
    );

    return (
        <tr className="border-b border-gray-200 hover:bg-indigo-50 transition duration-100">
            <Td className="font-semibold text-indigo-600">{user.id}</Td>
            <Td className="font-medium text-gray-900">{user.nombre}</Td>
            <Td className="text-gray-500">{user.email}</Td>
            <Td>{user.rol}</Td>
            <Td>{user.area}</Td>
            <Td>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusClasses}`}>
                    {user.activo ? 'Activo' : 'Inactivo'}
                </span>
            </Td>
            <Td className="text-gray-500">{user.fechaCreacion || 'N/A'}</Td>
            <Td>
                <div className="flex gap-3">
                    <button
                        title="Editar Usuario"
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        title={user.activo ? "Inactivar Usuario" : "Activar Usuario"}
                        onClick={() => handleToggleActive(user)}
                        className={`${user.activo ? 'text-red-600 hover:text-red-800 hover:bg-red-100' : 'text-green-600 hover:text-green-800 hover:bg-green-100'} p-1 rounded transition`}
                    >
                        {user.activo ? <XCircle size={18} /> : <UserCheck size={18} />}
                    </button>
                </div>
            </Td>
        </tr>
    );
}


// ----------------------------------------------------------------------
// 4. Componente Principal: Usuarios
// ----------------------------------------------------------------------

export default function Usuarios() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estados para Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // Usuario a editar o null para crear

    // Estados para Confirmación (Activar/Inactivar)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [userToConfirm, setUserToConfirm] = useState(null);


    // --- LÓGICA DE LA API ---

    // 1. Obtener todos los usuarios
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Usa la URL completa definida arriba
            const response = await fetch(API_USUARIOS_URL); 
            
            if (!response.ok) {
                throw new Error(`Error al cargar usuarios: ${response.statusText}`);
            }

            const data = await response.json();
            // Asumiendo que la API devuelve un array de objetos de usuario
            setUsers(Array.isArray(data) ? data : []); 
        } catch (err) {
            console.error("Error al obtener usuarios:", err);
            setError(err.message || "No se pudieron cargar los usuarios. Revisa la consola.");
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);


    // 2. Crear o Editar un Usuario (POST o PUT)
    const handleSaveUser = async (userPayload, isEditing) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const method = isEditing ? 'PUT' : 'POST';
            // Construye la URL para edición con el ID, o usa la URL base para creación
            const url = isEditing ? `${API_USUARIOS_URL}/${userPayload.id}` : API_USUARIOS_URL; 

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer YOUR_TOKEN' 
                },
                body: JSON.stringify(userPayload),
            });

            if (!response.ok) {
                // Intenta leer el mensaje de error del cuerpo de la respuesta
                const errorBody = await response.text();
                throw new Error(`Error al ${isEditing ? 'editar' : 'crear'} usuario: ${response.statusText} - ${errorBody}`);
            }

            // Una vez completada la acción, recarga la lista de usuarios
            await fetchUsers();
            
        } catch (err) {
            console.error(`Error en la operación de ${isEditing ? 'edición' : 'creación'}:`, err);
            setError(err.message || `No se pudo ${isEditing ? 'guardar' : 'crear'} el usuario.`);
        } finally {
            setIsLoading(false);
        }
    };


    // 3. Activar o Inactivar Usuario (PUT)
    const confirmAction = async (user) => {
        setIsLoading(true);
        setError(null);
        
        const newActivoState = !user.activo;
        
        try {
            // Se asume el endpoint sugerido /usuarios/toggle-active/:id, 
            // sino, se puede usar /usuarios/:id con el objeto completo
            const url = `${API_USUARIOS_URL}/${user.id}`; 
            
            // Usamos el objeto completo con el nuevo estado 'activo' para un PUT
            const updatePayload = {...user, activo: newActivoState};
            // Nota: Si el backend tiene un endpoint específico como '/toggle-active/:id' solo necesitaría el {activo: newActivoState}

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePayload), 
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Error al cambiar estado del usuario: ${response.statusText} - ${errorBody}`);
            }

            // Recargar datos después de la acción
            await fetchUsers();
            
        } catch (err) {
            console.error("Error al confirmar la acción:", err);
            setError(err.message || "No se pudo cambiar el estado del usuario.");
        } finally {
            setIsConfirmModalOpen(false);
            setUserToConfirm(null);
            setIsLoading(false);
        }
    };


    // --- LÓGICA DE UI/FILTROS ---

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;

        const lowerCaseSearch = searchTerm.toLowerCase();
        
        return users.filter(user => 
            user.nombre.toLowerCase().includes(lowerCaseSearch) ||
            user.email.toLowerCase().includes(lowerCaseSearch) ||
            user.rol.toLowerCase().includes(lowerCaseSearch) ||
            user.area.toLowerCase().includes(lowerCaseSearch)
        );
    }, [users, searchTerm]);

    // --- MANEJO DE MODALS ---

    const handleOpenModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleToggleActive = (user) => {
        setUserToConfirm(user);
        setIsConfirmModalOpen(true);
    };
    
    // --- RENDERIZADO ---

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 min-h-full">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-extrabold text-slate-800 flex items-center mb-4 sm:mb-0">
                    <Users className="w-6 h-6 mr-3 text-indigo-600" />
                    Gestión de Usuarios
                </h2>
                <div className="flex space-x-3 w-full sm:w-auto">
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition duration-200"
                        title="Crear un nuevo usuario"
                    >
                        <PlusCircle size={20} className="mr-2" />
                        Nuevo Usuario
                    </button>
                    <button
                        onClick={fetchUsers}
                        disabled={isLoading}
                        className={`p-2 rounded-xl transition ${isLoading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                        title="Recargar usuarios"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            {/* BARRA DE BÚSQUEDA Y FILTRO */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email, rol o área..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl py-2 pl-10 pr-4 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>
            </div>

            {/* Mensajes de Estado */}
            {isLoading && (
                <div className="p-4 mb-4 text-center text-indigo-700 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Cargando usuarios...
                </div>
            )}
            {error && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-center">
                    <AlertTriangle size={20} className="mr-2" />
                    Error de Conexión: {error}
                </div>
            )}
            
            {/* TABLA DE USUARIOS */}
            <div className="overflow-x-auto shadow-md rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creación</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <UserTableRow 
                                    key={user.id} 
                                    user={user} 
                                    handleEdit={handleEdit}
                                    handleToggleActive={handleToggleActive}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                    <AlertTriangle size={24} className="mx-auto mb-2 text-yellow-500"/>
                                    {users.length > 0 && searchTerm ? "No se encontraron usuarios que coincidan con la búsqueda." : "No hay usuarios registrados en el sistema."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <footer className="mt-6 text-sm text-gray-600">
                <p>Total de usuarios: {users.length}</p>
                <p className="mt-2 text-xs text-indigo-700">Conectado a la API: <span className="font-mono bg-indigo-50 p-1 rounded-md">{API_USUARIOS_URL}</span></p>
                <p className="mt-2 text-xs text-gray-500">Las operaciones ahora intentan comunicarse con el backend. Revisa la consola para verificar las peticiones y respuestas.</p>
            </footer>

            {/* MODAL DE EDICIÓN/CREACIÓN */}
            <UserFormModal 
                isOpen={isModalOpen}
                userToEdit={editingUser}
                onClose={handleCloseModal}
                onSave={handleSaveUser}
            />

            {/* MODAL DE CONFIRMACIÓN DE ACCIÓN */}
            {userToConfirm && (
                <ConfirmActionModal 
                    isOpen={isConfirmModalOpen}
                    title={userToConfirm.activo ? "Confirmar Inactivación" : "Confirmar Activación"}
                    message={
                        userToConfirm.activo 
                            ? `¿Estás seguro de que deseas INACTIVAR al usuario ${userToConfirm.nombre} (${userToConfirm.email})? Esto limitará su acceso al sistema.`
                            : `¿Estás seguro de que deseas ACTIVAR al usuario ${userToConfirm.nombre} (${userToConfirm.email})? Esto restaurará su acceso al sistema.`
                    }
                    actionButtonText={userToConfirm.activo ? "Inactivar Usuario" : "Activar Usuario"}
                    onConfirm={confirmAction}
                    onCancel={() => { setIsConfirmModalOpen(false); setUserToConfirm(null); }}
                    data={userToConfirm}
                />
            )}
        </div>
    );
}