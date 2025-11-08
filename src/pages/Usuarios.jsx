import React, { useState } from 'react';
import { Users, PlusCircle, Edit, Trash2, Shield, UserCheck, XCircle } from 'lucide-react';

// Mock Data (Simula datos de la tabla Usuarios de tu BD)
const MOCK_USERS = [
    { id: 101, nombre: "Brayan Pérez", area: "Sistemas", rol: "Administrador", activo: true },
    { id: 102, nombre: "Ana López", area: "Machine Shop", rol: "Machine Shop", activo: true },
    { id: 103, nombre: "Juan García", area: "Producción", rol: "Operador", activo: true },
    { id: 104, nombre: "Carlos Salas", area: "Calidad", rol: "Calidad", activo: false },
];

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState(MOCK_USERS);
    
    // Función de ejemplo para abrir el formulario de creación/edición
    const handleAddUser = () => {
        alert("Abriendo formulario para crear nuevo usuario...");
    };

    return (
        <>
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Users size={28} className="text-blue-600"/> Gestión de Usuarios
            </h1>

            {/* Botón de Acción y Búsqueda (simplificado) */}
            <div className="flex justify-between items-center mb-4">
                <button 
                    onClick={handleAddUser}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-150"
                >
                    <PlusCircle size={18} /> Nuevo Usuario
                </button>
                <input
                    type="text"
                    placeholder="Buscar usuario..."
                    className="border border-gray-300 rounded-lg pl-3 pr-3 py-2 w-64"
                />
            </div>

            {/* Tabla de Usuarios */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full border-collapse">
                    <thead className="bg-gray-200">
                        <tr>
                            <Th>ID</Th>
                            <Th>Nombre</Th>
                            <Th>Área</Th>
                            <Th>Rol</Th>
                            <Th>Activo</Th>
                            <Th>Acciones</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((user) => (
                            <UserRow key={user.id} user={user} />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// Componente para el encabezado de la tabla (<th>)
function Th({ children }) {
    return (
        <th className="text-left px-4 py-3 text-sm font-semibold border-b border-gray-300">
            {children}
        </th>
    );
}

// Componente para la fila de usuario
function UserRow({ user }) {
    
    const getRoleBadge = (rol) => {
        switch (rol) {
            case "Administrador": return "bg-red-100 text-red-700";
            case "Machine Shop": return "bg-blue-100 text-blue-700";
            case "Calidad": return "bg-purple-100 text-purple-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50 transition duration-100">
            <td className="px-4 py-3 text-sm">{user.id}</td>
            <td className="px-4 py-3 text-sm font-medium">{user.nombre}</td>
            <td className="px-4 py-3 text-sm">{user.area}</td>
            <td className="px-4 py-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.rol)}`}>
                    {user.rol}
                </span>
            </td>
            <td className="px-4 py-3 text-sm">
                {user.activo ? (
                    <span className="flex items-center text-green-600 font-medium">
                        <UserCheck size={16} className="mr-1" /> Sí
                    </span>
                ) : (
                    <span className="flex items-center text-red-600 font-medium">
                        <XCircle size={16} className="mr-1" /> No
                    </span>
                )}
            </td>
            <td className="px-4 py-3 text-sm">
                <div className="flex gap-2">
                    <button
                        title="Editar Usuario"
                        onClick={() => alert(`Editando a ${user.nombre}`)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        title="Cambiar Estado / Eliminar"
                        className="text-gray-600 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
}