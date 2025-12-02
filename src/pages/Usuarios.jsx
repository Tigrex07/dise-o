import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, PlusCircle, Edit, UserCheck, XCircle,
  Loader2, RefreshCw, AlertTriangle, Search, X,
  AlertCircle, User, ChevronLeft, ChevronRight, Briefcase,
} from 'lucide-react';
import API_BASE_URL from '../components/apiConfig';
import { Trash } from 'lucide-react';


const API_USUARIOS_URL = `${API_BASE_URL}/usuarios`;
const API_AREAS_URL = `${API_BASE_URL}/Areas`;

// 👇 Aquí pegas el ConfirmActionModal completo
function ConfirmActionModal({ isOpen, title, message, actionButtonText, onConfirm, onCancel, data }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-3xl w-full max-w-sm">
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
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
// MODAL DE CREACIÓN/EDICIÓN DE USUARIO (con corrección de áreas)
// ----------------------------------------------------------------------
function UserFormModal({ isOpen, userToEdit, onClose, onSave, areas }) {
  const isEditing = !!userToEdit;
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'Operador',
    area: '',
    activo: true,
    password: ''
  });

  const [formError, setFormError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      
      // ✅ CORRECCIÓN 1: Definir área por defecto usando nombreArea
      const firstArea = areas[0];
      const defaultArea = areas.length > 0 
        ? (firstArea.nombreArea || firstArea.nombre || (typeof firstArea === 'string' ? firstArea : ''))
        : '';

      if (userToEdit) {
        setFormData({
          nombre: userToEdit.nombre,
          email: userToEdit.email,
          rol: userToEdit.rol,
          area: userToEdit.area,
          activo: userToEdit.activo,
          password: ''
        });
      } else {
        setFormData({
          nombre: '',
          email: '',
          rol: 'Operador',
          area: defaultArea, // Establecer área por defecto de la API
          activo: true,
          password: ''
        });
      }
    }
  }, [isOpen, userToEdit, areas]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validar Contraseña (solo si no estamos editando O si se ha escrito algo)
    if (!formData.nombre.trim() ||
      !formData.email.trim() ||
      !formData.rol.trim() ||
      !formData.area.trim() ||
      (!isEditing && !formData.password.trim())
    ) {
      setFormError('Por favor, completa todos los campos obligatorios (incluyendo el Área y Contraseña en modo creación).');
      return;
    }

    const userPayload = {
      nombre: formData.nombre,
      email: formData.email,
      rol: formData.rol,
      area: formData.area,
      activo: formData.activo,
    };

    if (isEditing) {
      userPayload.id = userToEdit.id;
    }

    if (formData.password.trim()) {
      userPayload.password = formData.password;
    }

    setIsSaving(true);
    try {
      await onSave(userPayload, isEditing);
      onClose();
    } catch (e) {
      setFormError(e.message || 'Error al guardar el usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  const ROLES = ["Admin IT", "Ingeniero", "Operador", "Maquinista", "Master"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-3xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center">
              <User className="mr-2 w-5 h-5 text-indigo-600" />
              {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600">
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

            {/* Nombre */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                disabled={isSaving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isEditing || isSaving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              {isEditing && <p className="text-xs text-gray-500 mt-1">El Email no se puede modificar.</p>}
            </div>

            {/* Contraseña */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSaving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder={isEditing ? 'Dejar vacío para no cambiarla' : '••••••••'}
                required={!isEditing}
              />
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1">
                  Si no deseas cambiar la contraseña, deja este campo vacío.
                </p>
              )}
            </div>

            {/* Rol */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                required
                disabled={isSaving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Área (Dinámica) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Área/Departamento</label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                disabled={isSaving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {areas.length === 0 ? (
                  <option value="">Cargando áreas...</option>
                ) : (
                  // ✅ CORRECCIÓN 2: Usamos 'nombreArea' o 'nombre' para obtener el string
                  areas.map((a, index) => {
                    const areaName = a.nombreArea || a.nombre || (typeof a === 'string' ? a : '');

                    if (!areaName) return null; // Evitar renderizar opciones si no tienen nombre/nombreArea

                    return (
                        <option 
                            key={a.id || areaName || index} 
                            value={areaName}
                        >
                          {areaName}
                        </option>
                    );
                  })
                )}
              </select>
              {areas.length === 0 && !isSaving && <p className="text-xs text-red-500 mt-1">No se pudieron cargar las áreas. Revise la consola.</p>}
            </div>

            {/* Activo */}
            <div className="flex items-center mb-6">
              <input
                id="activo"
                name="activo"
                type="checkbox"
                checked={formData.activo}
                onChange={handleChange}
                disabled={isSaving}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 text-sm text-gray-900">Usuario Activo</label>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  isEditing ? 'Guardar Cambios' : 'Crear Usuario'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// FILA DE USUARIO (SIN CAMBIOS)
// ----------------------------------------------------------------------
function UserTableRow({ user, handleEdit, handleToggleActive, handleDelete }) {
  const statusClasses = user.activo
    ? 'bg-green-100 text-green-700 border-green-200'
    : 'bg-red-100 text-red-700 border-red-200';

  const Td = ({ children, className = '' }) => (
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
      <Td>
        <div className="flex gap-3">
          {/* Editar */}
          <button
            title="Editar Usuario"
            onClick={() => handleEdit(user)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition"
          >
            <Edit size={18} />
          </button>

          {/* Activar/Inactivar */}
          <button
            title={user.activo ? 'Inactivar Usuario' : 'Activar Usuario'}
            onClick={() => handleToggleActive(user)}
            className={`${user.activo
              ? 'text-red-600 hover:text-red-800 hover:bg-red-100'
              : 'text-green-600 hover:text-green-800 hover:bg-green-100'} p-1 rounded transition`}
          >
            {user.activo ? <XCircle size={18} /> : <UserCheck size={18} />}
          </button>
        </div>
      </Td>
    </tr>
  );
}

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL: USUARIOS
// ----------------------------------------------------------------------
export default function Usuarios() {
  // Estado
  const [users, setUsers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [areaError, setAreaError] = useState(null); // Nuevo estado para errores de área

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToConfirm, setUserToConfirm] = useState(null);

  // ESTADOS DE PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // API: listar usuarios
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_USUARIOS_URL);
      if (!response.ok) throw new Error('Error al cargar usuarios.');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // API: listar Áreas
  const fetchAreas = useCallback(async () => {
    setAreaError(null);
    try {
      const response = await fetch(API_AREAS_URL);
      if (!response.ok) throw new Error('Error al cargar áreas.');
      const data = await response.json();
      setAreas(data);
    } catch (err) {
      console.error("Error al obtener áreas:", err);
      setAreaError("Error al cargar la lista de áreas.");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchAreas();
  }, [fetchUsers, fetchAreas]);

  // Guardar (crear/editar)
  const handleSaveUser = useCallback(async (user, isEditing) => {
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_USUARIOS_URL}/${user.id}` : API_USUARIOS_URL;

    const payload = { ...user };
    if (isEditing && !payload.password?.trim()) {
      delete payload.password;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(`Error ${response.status}: La API no devolvió un formato de error legible.`);
        }

        if (errorData.errors) {
          const validationErrors = Object.values(errorData.errors).flat();
          throw new Error(validationErrors[0] || 'Error de validación desconocido.');
        }

        throw new Error('Error al guardar usuario. Revise la consola para más detalles.');
      }

      await fetchUsers();
    } catch (err) {
      throw new Error(err.message || 'No se pudo guardar el usuario.');
    }
  }, [fetchUsers]);

  // Activar/Inactivar usando PUT
  const confirmAction = useCallback(async (user) => {
    setIsConfirmModalOpen(false);
    setUserToConfirm(null);
    setIsLoading(true);
    setError(null);

    const updatedUser = {
      Id: user.id,
      Nombre: user.nombre,
      Email: user.email,
      Rol: user.rol,
      Area: user.area,
      Activo: !user.activo,
      Contrasena: ""
    };


    try {
      const response = await fetch(`${API_USUARIOS_URL}/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) throw new Error('Error al cambiar estado.');
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }

  }, [fetchUsers]);
  
  // Eliminar usuario
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`¿Seguro que quieres eliminar al usuario ${user.nombre}?`)) return;

    try {
      const response = await fetch(`${API_USUARIOS_URL}/${user.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar usuario.');
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Filtro combinado (SIN CAMBIOS)
  const filteredUsers = useMemo(() => {
    let result = users.slice();

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(u =>
        u.nombre.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower) ||
        u.rol.toLowerCase().includes(lower) ||
        u.area.toLowerCase().includes(lower)
      );
    }

    if (statusFilter === 'activos') {
      result = result.filter(u => u.activo);
    } else if (statusFilter === 'inactivos') {
      result = result.filter(u => !u.activo);
    }

    result.sort((a, b) => b.id - a.id);

    return result;
  }, [users, searchTerm, statusFilter]);

  // LÓGICA DE PAGINACIÓN (SIN CAMBIOS)
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentItems = useMemo(() => {
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, startIndex, endIndex]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Handlers de modales (Sin cambios)
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

  // Render
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 min-h-full">
      {/* Encabezado */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-extrabold text-slate-800 flex items-center mb-4 sm:mb-0">
          <Users className="w-6 h-6 mr-3 text-indigo-600" />
          Gestión de Usuarios
        </h2>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button
            onClick={handleOpenModal}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
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

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email, rol o área..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-300 rounded-xl py-2 pl-10 pr-4 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Filtro de estado */}
      <div className="mb-6 flex gap-3 items-center">
        <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </div>

      {/* Mensajes de estado */}
      {isLoading && (
        <div className="p-4 mb-4 text-center text-indigo-700 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Loader2 size={20} className="mr-2 animate-spin" />
          Cargando usuarios...
        </div>
      )}
      {(error || areaError) && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          Error de Conexión: {error || areaError}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto shadow-md rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              currentItems.map(user => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  handleEdit={handleEdit}
                  handleToggleActive={handleToggleActive}
                  handleDelete={handleDeleteUser}
                />
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  <AlertTriangle size={24} className="mx-auto mb-2 text-yellow-500" />
                  {users.length > 0 && searchTerm
                    ? 'No se encontraron usuarios que coincidan con la búsqueda.'
                    : 'No hay usuarios registrados en el sistema.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CONTROLES DE PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl mt-4 shadow-md border">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} className="mr-1" /> Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">{Math.min(endIndex, totalItems)}</span> de{' '}
                <span className="font-medium">{totalItems}</span> resultados.
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${currentPage === page
                      ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-6 text-sm text-gray-600">
        <p>Total de usuarios: {users.length}</p>
        <p className="mt-2 text-xs text-indigo-700">
          Conectado a la API: <span className="font-mono bg-indigo-50 p-1 rounded-md">{API_USUARIOS_URL}</span>
        </p>
      </footer>

      {/* Modales */}
      <UserFormModal
        isOpen={isModalOpen}
        userToEdit={editingUser}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        areas={areas}
      />

      {userToConfirm && (
        <ConfirmActionModal
          isOpen={isConfirmModalOpen}
          title={userToConfirm.activo ? 'Confirmar Inactivación' : 'Confirmar Activación'}
          message={
            userToConfirm.activo
              ? `¿Estás seguro de que deseas INACTIVAR al usuario ${userToConfirm.nombre}?`
              : `¿Estás seguro de que deseas ACTIVAR al usuario ${userToConfirm.nombre}?`
          }
          actionButtonText={userToConfirm.activo ? 'Inactivar Usuario' : 'Activar Usuario'}
          onConfirm={confirmAction}
          onCancel={() => { setIsConfirmModalOpen(false); setUserToConfirm(null); }}
          data={userToConfirm}
        />
      )}
    </div>
  );
}
