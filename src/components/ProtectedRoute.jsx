import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 👈 ajusta la ruta según tu estructura

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  // 🚨 Si no hay sesión, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🚨 Master tiene acceso total
  if (user.rol === "Master") {
    return children;
  }

  // 🚨 Validación por rol
  if (!allowedRoles.includes(user.rol)) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold text-lg">
        Acceso denegado: No tienes permisos para ver esta página.
      </div>
    );
  }

  return children;
}