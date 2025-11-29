import React from 'react';
// Importa todos los iconos usados
import { Home, List, Settings, Users, Briefcase, CheckSquare, LogOut, UserCircle } from 'lucide-react';

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
 * @param {object} props - Propiedades.
 * @param {string} props.currentPage - La clave de la página actual.
 * @param {function} props.setCurrentPage - Función para cambiar la página actual.
 * @param {object} props.user - Objeto de usuario autenticado (nombre, rol, etc.).
 * @param {function} props.logout - Función para cerrar sesión.
 */
export default function Sidebar({ currentPage, setCurrentPage, user, logout }) {
    // Definimos el rol para la lógica de permisos
    const role = user?.rol;

    return (
        // El Sidebar tiene un ancho fijo (w-64) y un fondo oscuro (bg-gray-900)
        <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-20 min-h-screen">
            <div className="p-4 text-2xl font-bold text-center border-b border-gray-700 h-[64px] flex items-center justify-center">
                Molds Tracker
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {/* Ítems de Navegación Principal */}
                <SidebarItem 
                    icon={<Home size={18} />} 
                    label="Dashboard" 
                    pageKey="dashboard" 
                    currentPage={currentPage} 
                    onClick={setCurrentPage} 
                />

                {(role === "Operador" || role === "Maquinista") && (
                    <>
                        <SidebarItem 
                            icon={<Briefcase size={18} />} 
                            label="Mis Asignaciones" 
                            pageKey="mis-asignaciones"
                            currentPage={currentPage} 
                            onClick={setCurrentPage} 
                        />
                        <SidebarItem 
                            icon={<CheckSquare size={18} />} 
                            label="Verificación QC" 
                            pageKey="revision-qc"
                            currentPage={currentPage} 
                            onClick={setCurrentPage} 
                        />
                    </>
                )}
                
                {(role === "Ingeniero" || role === "Admin IT" || role === "Supervisor") && (
                    <>
                        <SidebarItem 
                            icon={<List size={18} />} 
                            label="Gestión de Solicitudes" 
                            pageKey="gestion-solicitudes" 
                            currentPage={currentPage} 
                            onClick={setCurrentPage} 
                        />
                         <SidebarItem 
                            icon={<CheckSquare size={18} />} 
                            label="Verificación QC" 
                            pageKey="revision-qc"
                            currentPage={currentPage} 
                            onClick={setCurrentPage} 
                        />
                        <SidebarItem 
                            icon={<Users size={18} />} 
                            label="Asignación Carga" 
                            pageKey="asignacion-carga" 
                            currentPage={currentPage} 
                            onClick={setCurrentPage} 
                        />
                    </>
                )}

                {/* Ítems de Administración (Visibles solo para Admin IT) */}
                {role === "Admin IT" && (
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
                )}
            </nav>
            
            {/* 4. Información de Usuario y Botón de Cerrar Sesión */}
            {user && (
                <div className="p-4 border-t border-gray-700 bg-gray-800">
                    <div className="flex items-center space-x-3 mb-3 p-2 rounded-lg bg-gray-700/50">
                        <UserCircle className="w-6 h-6 text-indigo-400" />
                        <div>
                            <p className="text-sm font-semibold text-white truncate" title={user.nombre}>{user.nombre.split(' ')[0]}</p>
                            <p className="text-xs text-gray-400">{user.rol}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout} // 5. Llama a la función de logout
                        className="w-full flex items-center justify-center p-3 rounded-xl transition duration-150 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md"
                        title="Cerrar la sesión actual"
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
    );
}