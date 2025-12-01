import React from "react";
import { Edit, UserCheck, XCircle, Trash2 } from "lucide-react";

export default function UserTableRow({ user, handleEdit, handleToggleActive, handleDelete }) {
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
        <span
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusClasses}`}
        >
          {user.activo ? "Activo" : "Inactivo"}
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
            title={user.activo ? "Inactivar Usuario" : "Activar Usuario"}
            onClick={() => handleToggleActive(user)}
            className={`${
              user.activo
                ? "text-red-600 hover:text-red-800 hover:bg-red-100"
                : "text-green-600 hover:text-green-800 hover:bg-green-100"
            } p-1 rounded transition`}
          >
            {user.activo ? <XCircle size={18} /> : <UserCheck size={18} />}
          </button>

         
        </div>
      </Td>
    </tr>
  );
}