import React, { useState, useMemo } from "react";
// Importamos los componentes de página y el Sidebar
import Dashboard from "./Dashboard";
import SolicitudForm from "./SolicitudForm";
import Usuarios from "./Usuarios";
import Revision from "./Revision";
import Sidebar from "./Sidebar";

// Importaciones de iconos de Lucide
import { AlertTriangle, PlusCircle, CheckCircle, FileText } from "lucide-react";

// ----------------------------------------------------------------------
// MOCK DATA GLOBAL (Simula la información que vendría de Firestore/API)
// ----------------------------------------------------------------------

// Lista Única de Usuarios/Operadores con diferentes roles
const mockUsers = [
    { id: 'usr-101', nombre: 'Ana López', rol: 'Ingeniero', area: 'Inyección', activo: true },
    { id: 'usr-102', nombre: 'Luis Gámez', rol: 'Ingeniero', area: 'Mantenimiento', activo: true },
    { id: 'usr-201', nombre: 'Juan Perez', rol: 'Operador', area: 'Machine Shop A1', activo: true },
    { id: 'usr-202', nombre: 'Maria Gomez', rol: 'Operador', area: 'Machine Shop A2', activo: true },
    { id: 'usr-301', nombre: 'Carlos Ruiz', rol: 'Operador', area: 'Machine Shop A1', activo: false },
    { id: 'usr-901', nombre: 'Admin IT', rol: 'Admin IT', area: 'IT/Sistemas', activo: true },
];

let lastSolicitudId = 10;
const generateNextId = () => {
    lastSolicitudId += 1;
    // Generar un ID con formato de ejemplo
    return `2025-${String(lastSolicitudId).padStart(3, '0')}`;
}

// Actualizamos Solicitudes para usar IDs de usuario/operador
let initialSolicitudes = [
    { id: '2025-001', pieza: 'Molde Inyección #45', maquina: 'INJ-03', area: 'Plásticos', tipo: 'Daño físico', detalles: 'Grieta en el inserto guía.', prioridad: 'Media', estado: 'En proceso', solicitanteId: 'usr-101', fecha: '2025-10-25', asignadoAId: 'usr-201', notasIngenieria: 'Requiere soldadura y rectificado.' },
    { id: '2025-002', pieza: 'Troquel Estampado T-8', maquina: 'EST-12', area: 'Metalurgia', tipo: 'Mejora de proceso', detalles: 'Cambio de radio en esquina de corte.', prioridad: 'Alta', estado: 'Pendiente', solicitanteId: 'usr-102', fecha: '2025-10-26', asignadoAId: null, notasIngenieria: '' },
    { id: '2025-003', pieza: 'Eje de Engranaje', maquina: 'CNC-05', area: 'Tornos', tipo: 'Fabricación', detalles: 'Creación de 5 piezas nuevas según plano R-2025.', prioridad: 'Urgente', estado: 'Pendiente', solicitanteId: 'usr-101', fecha: '2025-10-27', asignadoAId: null, notasIngenieria: 'Entregable crítico para línea L-5.' },
    { id: '2025-004', pieza: 'Prensa Neumática P-9', maquina: 'PN-09', area: 'Ensamble', tipo: 'Reparación de equipo', detalles: 'Reemplazo de pistón hidráulico y ajuste de presión.', prioridad: 'Baja', estado: 'Completado', solicitanteId: 'usr-102', fecha: '2025-10-28', asignadoAId: 'usr-202', notasIngenieria: 'Finalizado y validado.' },
];

// --- COMPONENTE PRINCIPAL ---
export default function App() {
    // Estado para la navegación
    const [currentPage, setCurrentPage] = useState("dashboard");
    // Estado para los datos centrales
    const [solicitudes, setSolicitudes] = useState(initialSolicitudes);
    const [users, setUsers] = useState(mockUsers); // Usaremos 'users' aquí

    // Lógica para guardar o actualizar una solicitud
    const handleSaveSolicitud = (newSolicitud) => {
        // En un entorno real, aquí se llamaría al API o Firestore
        if (newSolicitud.isEdit) {
            setSolicitudes(prev => prev.map(s => s.id === newSolicitud.id ? { ...s, ...newSolicitud } : s));
        } else {
            const id = generateNextId();
            const solicitanteId = 'usr-101'; // Simulamos que el usuario logueado es Ana López por defecto
            const fecha = new Date().toISOString().split('T')[0];

            setSolicitudes(prev => [
                { ...newSolicitud, id, estado: 'Pendiente', prioridad: 'Media', solicitanteId, asignadoAId: null, fecha, notasIngenieria: '' },
                ...prev
            ]);
            // Después de guardar, navegamos al dashboard
            setCurrentPage('dashboard');
        }
    };

    // Función para obtener el título de la página
    const getPageTitle = () => {
        switch (currentPage) {
            case "dashboard": return "Dashboard General y Solicitudes";
            case "revision": return "Revisión y Asignación de Trabajos";
            case "nueva-solicitud": return "Crear Nueva Solicitud de Taller";
            case "gestion-usuarios": return "Administración de Usuarios del Sistema";
            case "configuracion": return "Configuración del Sistema";
            default: return "Molds Tracker";
        }
    };

    // Función que renderiza el componente de contenido activo
    const renderContent = () => {
        switch (currentPage) {
            case "dashboard":
                // Pasamos solicitudes y users al Dashboard
                return <Dashboard solicitudes={solicitudes} users={users} />;
            case "revision":
                // Pasar datos para la revisión (solo Ingenieros/Admin)
                return <Revision solicitudes={solicitudes} users={users} setSolicitudes={setSolicitudes} />;
            case "nueva-solicitud":
                // Pasamos la función de guardado
                return <SolicitudForm handleSubmit={handleSaveSolicitud} handleBack={() => setCurrentPage('dashboard')} />;
            case "gestion-usuarios":
                // Aquí iría el componente Usuarios, usando setUsers para simular la gestión
                return <Usuarios users={users} setUsers={setUsers} />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <AlertTriangle size={48} className="text-yellow-500 mb-4" />
                        <h1 className="text-xl font-semibold">Página no encontrada o en desarrollo.</h1>
                        <p>Selecciona una opción del menú lateral.</p>
                    </div>
                );
        }
    };


    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            
            {/* Sidebar (Ahora importado y pasa el control de navegación) */}
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

            {/* Main content */}
            <main className="flex-1 p-8 overflow-y-auto">
                
                {/* Encabezado del Contenido Principal */}
                <div className="flex items-center justify-between mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-slate-800">{getPageTitle()}</h1>
                    
                    {/* Botón flotante para Nueva Solicitud */}
                    {(currentPage === 'dashboard' || currentPage === 'revision') && (
                        <button 
                            onClick={() => setCurrentPage('nueva-solicitud')}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition duration-200 transform hover:scale-[1.02]"
                            title="Crear un nuevo reporte"
                        >
                            <PlusCircle size={20} className="mr-2" />
                            Nueva Solicitud
                        </button>
                    )}
                </div>

                {/* Contenido de la Página Activa */}
                <div className="max-w-full">
                    {renderContent()}
                </div>

            </main>
        </div>
    );
}