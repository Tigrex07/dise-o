import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import {
  Home, AlertTriangle, Settings, Users, Factory, Tally5,
  UserCheck, UserCircle, LogOut
} from "lucide-react";

function SidebarItem({ icon, label, to, currentPath }) {
  const active = currentPath === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition duration-150 ease-in-out ${
        active ? "bg-blue-600 font-semibold" : "hover:bg-gray-800"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  );
}

export default function MainLayout() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar siempre visible */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold text-center border-b border-gray-700">
          Molds Tracker
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<Home size={18} />} label="Dashboard" to="/" currentPath={location.pathname} />
          <SidebarItem icon={<Factory size={18} />} label="Nueva Solicitud" to="/solicitar" currentPath={location.pathname} />
          <SidebarItem icon={<Tally5 size={18} />} label="Mi Trabajo" to="/trabajo/mis-asignaciones" currentPath={location.pathname} />
          <SidebarItem icon={<UserCheck size={18} />} label="Revisión" to="/revision" currentPath={location.pathname} />
          <SidebarItem icon={<AlertTriangle size={18} />} label="Reportes" to="/reportes" currentPath={location.pathname} />
          <SidebarItem icon={<Users size={18} />} label="Usuarios" to="/usuarios" currentPath={location.pathname} />
          <SidebarItem icon={<Settings size={18} />} label="Configuración" to="/configuracion" currentPath={location.pathname} />

          {/* 🔑 Botón de login fijo */}
          <SidebarItem icon={<UserCircle size={18} />} label="Iniciar Sesión" to="/login" currentPath={location.pathname} />
        </nav>

        {/* Info de usuario y logout solo si hay sesión */}
        {isAuthenticated && (
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex items-center space-x-3 mb-3 p-2 rounded-lg bg-gray-700/50">
              <UserCircle className="w-6 h-6 text-indigo-400" />
              <div>
                <p className="text-sm font-semibold text-white truncate" title={user.nombre}>
                  {user.nombre.split(' ')[0]}
                </p>
                <p className="text-xs text-gray-400">{user.rol}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center p-3 rounded-xl transition duration-150 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md"
              title="Cerrar sesión"
            >
              <LogOut size={18} className="mr-3" />
              Cerrar Sesión
            </button>
          </div>
        )}

        <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-700 bg-gray-800">
          © 2025 | Tigrex Team
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex justify-between items-center px-6 py-4 bg-slate-100 shadow-sm border-b border-gray-200">
          <h1 className="text-xl font-bold text-slate-700">Gestión Operacional</h1>
          {isAuthenticated && (
            <p className="text-sm text-indigo-600 font-medium">
              Bienvenido, {user?.nombre?.split(' ')[0]} — Rol: {user?.rol} en {user?.area}
            </p>
          )}
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
