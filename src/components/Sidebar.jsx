import React from 'react';
// Importa todos los iconos usados
import { Home, List, Settings, Users, Briefcase, CheckSquare } from 'lucide-react';

/**
 * Componente individual para cada elemento del menú en el Sidebar.
 */
function SidebarItem({ icon, label, pageKey, currentPage, onClick }) {
    const isActive = currentPage === pageKey;
    const activeClasses = isActive
        ? "bg-indigo-700 text-white font-semibold shadow-inner-lg"
        : "text-gray-300 hover:bg-gray-700 hover:text-white";

    return (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                onClick(pageKey);
            }}
            // Clases que aseguran que se muestra
            className={`flex items-center p-3 rounded-xl transition duration-150 ${activeClasses}`}
            title={`Ir a ${label}`}
        >
            {icon}
            <span className="ml-3 text-sm">{label}</span>
        </a>
    );
}

/**
 * Sidebar principal de navegación.
 */
export default function Sidebar({ currentPage, setCurrentPage }) {
    return (
        // El Sidebar tiene un ancho fijo (w-64) y un fondo oscuro (bg-gray-900)
        <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-20 min-h-screen">
            
            <div className="p-5 text-2xl font-extrabold text-center border-b border-gray-700 bg-gray-800">
                Molds Tracker
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
                
                {/* Ítems de Navegación Principal */}
                <div className="pt-4 space-y-2">
                    <SidebarItem 
                        icon={<Home size={18} />} 
                        label="Dashboard" 
                        pageKey="dashboard" 
                        currentPage={currentPage} 
                        onClick={setCurrentPage} 
                    />
                    <SidebarItem 
                        icon={<List size={18} />} 
                        label="Listado de Reportes" 
                        pageKey="reportes-listado" 
                        currentPage={currentPage} 
                        onClick={setCurrentPage} 
                    />
                </div>

                {/* Ítems del Flujo de Ingeniería / Tareas */}
                <div className="pt-2 border-t border-indigo-700/50 mt-4">
                    <p className="text-xs text-indigo-300 uppercase tracking-widest p-3">Flujo de Trabajo</p>
                    
                    {/* BOTÓN PARA REVISIÓN (Revision.jsx) */}
                    <SidebarItem 
                        icon={<Briefcase size={18} />} 
                        label="Revisar/Asignar" 
                        pageKey="revision-asignacion" 
                        currentPage={currentPage} 
                        onClick={setCurrentPage} 
                    />

                    <SidebarItem 
                        icon={<CheckSquare size={18} />} 
                        label="Verificación QC (Mock)" 
                        pageKey="revision-asignacion"
                        currentPage={currentPage} 
                        onClick={setCurrentPage} 
                    />
                </div>

                {/* Ítems de Administración */}
                <div className="pt-2 border-t border-indigo-700/50 mt-4">
                    <p className="text-xs text-indigo-300 uppercase tracking-widest p-3">Administración</p>
                    <SidebarItem 
                        icon={<Users size={18} />} 
                        label="Gestión de Usuarios" 
                        pageKey="gestion-usuarios" 
                        currentPage={currentPage} 
                        onClick={setCurrentPage} 
                    />
                    <SidebarItem 
                        icon={<Settings size={18} />} 
                        label="Configuración" 
                        pageKey="configuracion" 
                        currentPage={currentPage} 
                        onClick={setCurrentPage} 
                    />
                </div>

            </nav>
            
            <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-700 bg-gray-800">
                © 2025 | Tigrex Team
            </div>
        </aside>
    );
}