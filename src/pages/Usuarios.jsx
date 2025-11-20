import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Users, PlusCircle, Edit, UserCheck, XCircle, 
    Loader2, RefreshCw, AlertTriangle, Search, X, Briefcase, 
    Tag, CheckSquare, Save, AlertCircle, User, MessageSquareWarning
} from 'lucide-react';

// ----------------------------------------------------------------------
// DATOS MOCK (SIMULACIÓN DEL API)
// ----------------------------------------------------------------------
let MOCK_USERS = [
    { id: 1, nombre: "Juan Pérez", email: "juan.perez@molex.com", rol: "Ingeniero", area: "Machine Shop", activo: true, fechaCreacion: "2024-10-01" },
    { id: 2, nombre: "Maria Lopez", email: "maria.lopez@molex.com", rol: "Operador", area: "Extrusión", activo: true, fechaCreacion: "2024-10-05" },
    { id: 3, nombre: "Carlos García", email: "carlos.garcia@molex.com", rol: "Admin IT", area: "IT/Sistemas", activo: true, fechaCreacion: "2024-10-10" },
    { id: 4, nombre: "Ana Torres", email: "ana.torres@molex.com", rol: "Ingeniero", area: "Inyección", activo: false, fechaCreacion: "2024-10-15" },
    { id: 5, nombre: "Luis Vazquez", email: "luis.vazquez@molex.com", rol: "Operador", area: "Machine Shop", activo: true, fechaCreacion: "2024-10-20" },
];

const ROLES = ["Admin IT", "Ingeniero", "Operador"];
const AREAS = ["Machine Shop", "Inyección", "Extrusión", "Mantenimiento", "IT/Sistemas"];

// Función para simular un ID único
const getNextId = () => {
    return MOCK_USERS.length > 0 
        ? Math.max(...MOCK_USERS.map(u => u.id)) + 1 
        : 1;
};

// ----------------------------------------------------------------------
// COMPONENTES MODALES INTERNOS
// ----------------------------------------------------------------------

/**
 * Modal genérico para confirmar acciones críticas
 */
function ConfirmActionModal({ isOpen, title, message, actionButtonText, onConfirm, onCancel, data }) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900/60 p-4">
            <div className="bg-white rounded-2xl shadow-3xl w-full max-w-sm transform scale-100 transition-all duration-300">
                <div className="p-6">
                    <div className="flex flex-col items-center">
                        <AlertCircle size={36} className="text-red-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{title}</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
                    </div>
                    <div className="flex justify-end gap-3">
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
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                        >
                            {actionButtonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Modal para la creación o edición de usuarios
 */
function UserFormModal({ isOpen, userToEdit, onClose, onSave }) {
    if (!isOpen) return null;

    const isEditing = !!userToEdit;
    const [formData, setFormData] = useState({
        nombre: userToEdit?.nombre || '',
        email: userToEdit?.email || '',
        rol: userToEdit?.rol || ROLES[0],
        area: userToEdit?.area || AREAS[0],
        password: '',
    });

    // Resetear formulario cuando se abre/cambia el usuario
    useEffect(() => {
        if (isEditing) {
            setFormData({
                nombre: userToEdit.nombre,
                email: userToEdit.email,
                rol: userToEdit.rol,
                area: userToEdit.area,
                password: '',
            });
        } else {
             setFormData({ nombre: '', email: '', rol: ROLES[0], area: AREAS[0], password: '' });
        }
    }, [userToEdit, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            // Actualizar usuario
            onSave({ ...userToEdit, ...formData });
        } else {
            // Crear nuevo usuario (se generará ID en la función de onSave)
            onSave(formData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900/60 p-4">
            <div className="bg-white rounded-2xl shadow-3xl w-full max-w-lg transform scale-100 transition-all duration-300">
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
                        <User size={24} className="mr-2 text-indigo-600" />
                        {isEditing ? "Editar Usuario" : "Crear Nuevo Usuario"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nombre */}
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre *</label>
                            <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        {/* Rol */}
                        <div>
                            <label htmlFor="rol" className="block text-sm font-medium text-gray-700">Rol *</label>
                            <select id="rol" name="rol" value={formData.rol} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none">
                                {ROLES.map(rol => <option key={rol} value={rol}>{rol}</option>)}
                            </select>
                        </div>
                        {/* Área */}
                        <div>
                            <label htmlFor="area" className="block text-sm font-medium text-gray-700">Área/Departamento *</label>
                            <select id="area" name="area" value={formData.area} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none">
                                {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                            </select>
                        </div>
                        {/* Contraseña (Solo para creación, o para resetear en edición) */}
                        {!isEditing && (
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña *</label>
                                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required={!isEditing} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Mínimo 8 caracteres" />
                                {!isEditing && <p className='text-xs text-gray-500 mt-1'>Se requiere contraseña solo para crear el usuario.</p>}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                            >
                                <Save size={18} className="mr-2" />
                                {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL DE USUARIOS
// ----------------------------------------------------------------------

export default function Usuarios() {
    const [users, setUsers] = useState(MOCK_USERS);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("Todos");
    const [filterActive, setFilterActive] = useState("Todos");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [userToConfirm, setUserToConfirm] = useState(null);

    // --- MANEJO DE MODALES ---
    const handleCreateUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleConfirmAction = (user) => {
        setUserToConfirm(user);
        setIsConfirmModalOpen(true);
    };

    // --- ACCIONES DE DATOS (MOCK) ---
    const handleSaveUser = (user) => {
        setUsers(prevUsers => {
            if (user.id) { // Edición
                console.log(`[MOCK API] Editando usuario: ${user.id}`);
                return prevUsers.map(u => u.id === user.id ? { ...u, ...user } : u);
            } else { // Creación
                const newId = getNextId();
                const newUser = { 
                    ...user, 
                    id: newId, 
                    activo: true, 
                    fechaCreacion: new Date().toISOString().split('T')[0] 
                };
                console.log(`[MOCK API] Creando usuario: ${newId}`);
                return [...prevUsers, newUser];
            }
        });
    };

    const confirmAction = (user) => {
        const newStatus = !user.activo;
        setUsers(prevUsers => {
            console.log(`[MOCK API] Cambiando estado de usuario ${user.id} a ${newStatus}`);
            return prevUsers.map(u => u.id === user.id ? { ...u, activo: newStatus } : u);
        });
        setIsConfirmModalOpen(false);
        setUserToConfirm(null);
    };

    // --- FILTROS Y BÚSQUEDA ---
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesRole = filterRole === "Todos" || user.rol === filterRole;

            const matchesActive = filterActive === "Todos" || (filterActive === "Activo" ? user.activo : !user.activo);
            
            return matchesSearch && matchesRole && matchesActive;
        }).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [users, searchTerm, filterRole, filterActive]);

    // --- COMPONENTE FILA DE TABLA ---
    const UserRow = ({ user }) => (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition duration-100">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{user.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.nombre}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.rol === 'Admin IT' ? 'bg-indigo-100 text-indigo-800' :
                      user.rol === 'Ingeniero' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}`
                }>
                    {user.rol}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.area}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
                }>
                    {user.activo ? "Activo" : "Inactivo"}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.fechaCreacion}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex gap-2 justify-end">
                    <button
                        title="Editar"
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        title={user.activo ? "Inactivar" : "Activar"}
                        onClick={() => handleConfirmAction(user)}
                        className={`p-1 rounded transition ${user.activo ? 'text-red-600 hover:text-red-800 hover:bg-red-50' : 'text-green-600 hover:text-green-800 hover:bg-green-50'}`}
                    >
                        {user.activo ? <XCircle size={18} /> : <UserCheck size={18} />}
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow border-t-4 border-indigo-600">
                <div className="flex items-center space-x-4 w-full">
                    <div className="relative w-1/3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="p-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                    >
                        <option value="Todos">Todos los Roles</option>
                        {ROLES.map(rol => <option key={rol} value={rol}>{rol}</option>)}
                    </select>
                    
                    <select
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value)}
                        className="p-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                    >
                        <option value="Todos">Todos los Estados</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>

                    <button
                        onClick={() => { setSearchTerm(""); setFilterRole("Todos"); setFilterActive("Todos"); }}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full transition"
                        title="Limpiar filtros"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
                
                <button
                    onClick={handleCreateUser}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition duration-200"
                    title="Crear un nuevo usuario"
                >
                    <PlusCircle size={20} className="mr-2" />
                    Nuevo Usuario
                </button>
            </div>


            <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => <UserRow key={user.id} user={user} />)
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-8 text-gray-500">
                                    <MessageSquareWarning size={24} className="mx-auto mb-2 text-yellow-500"/>
                                    No se encontraron usuarios que coincidan con los filtros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <footer className="mt-4 text-sm text-gray-600 p-3 bg-white rounded-xl shadow">
                <p className="text-gray-700">Total de usuarios: {users.length}</p>
                <p className="mt-2 text-xs text-indigo-400">Las operaciones de Crear, Editar e Inactivar/Activar están simuladas en el cliente (usando datos MOCK).</p>
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
                            ? `¿Estás seguro de que deseas INACTIVAR al usuario ${userToConfirm.nombre}? Esto limitará su acceso al sistema.`
                            : `¿Estás seguro de que deseas ACTIVAR al usuario ${userToConfirm.nombre}? Esto restaurará su acceso al sistema.`
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