import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Home, AlertTriangle, Settings, Users, Factory, Tally5, UserCheck, UserCog, Shield, Clock } from "lucide-react";
import NotificacionesPanel from './components/NotificacionesPanel'; // Asegúrate de que la ruta sea correcta
import { Archive, History, PackageCheck } from 'lucide-react';


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

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold text-center border-b border-gray-700">
          Work Orders Tracker
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<Home size={18} />} label="Dashboard" to="/" currentPath={location.pathname} />
          <SidebarItem icon={<Factory size={18} />} label="Nueva Solicitud" to="/solicitar" currentPath={location.pathname} />
          <SidebarItem
  icon={<UserCheck size={18} />}
  label="Revisión"
  to="/revision"
  currentPath={location.pathname}
/>

<SidebarItem
  icon={<Clock size={18} />}
  label="Historial"
  to="/historial"
  currentPath={location.pathname}
/>

          <SidebarItem icon={<Tally5 size={18} />} label="Mi Trabajo (Maquinista)" to="/trabajo/mis-asignaciones" currentPath={location.pathname} />
          <SidebarItem icon={<Shield size={18} />} label="Login Demo" to="/login" currentPath={location.pathname} />
          <SidebarItem icon={<UserCog size={18} />} label="Registro" to="/registro" currentPath={location.pathname} />
          <div className="pt-4 mt-4 border-t border-gray-700">
            <SidebarItem icon={<AlertTriangle size={18} />} label="Reportes" to="/reportes" currentPath={location.pathname} />
            <SidebarItem icon={<Users size={18} />} label="Usuarios" to="/usuarios" currentPath={location.pathname} />
            <SidebarItem icon={<Settings size={18} />} label="Configuración" to="/configuracion" currentPath={location.pathname} />

          </div>
        </nav>
        <div className="p-4 text-center text-sm text-gray-400 border-t border-gray-700">
          © 2025
        </div>
      </aside>

      {/* Contenido principal con Header + Outlet */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header con notificaciones */}
        <header className="flex justify-between items-center px-6 py-4 bg-slate-100 shadow-sm border-b border-gray-200">
          <h1 className="text-xl font-bold text-slate-700">Gestión Operacional</h1>
          <NotificacionesPanel />
        </header>

        {/* Vista actual */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}