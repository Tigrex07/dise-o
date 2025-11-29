import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 👈 ajusta la ruta según tu estructura

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  // 🔑 En fase de pruebas: si no hay sesión, deja pasar
  if (!isAuthenticated) {
    return children;
  }

  // Si hay sesión, sí aplica roles
  if (!allowedRoles.includes(user.rol)) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold text-lg">
        Acceso denegado: No tienes permisos para ver esta página.
      </div>
    );
  }

  return children;
}