import React from 'react';
import { BarChart3, List, Settings } from 'lucide-react';

export default function Reportes() {
  
  return (
    <>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <BarChart3 size={28} className="text-gray-600"/> Módulo de Reportes e Historial
      </h1>

      <p className="text-lg text-gray-700 mb-8">
        Visualización y análisis del desempeño de Machine Shop y del historial de mantenimiento de piezas.
      </p>

      {/* --- Contenedor de Opciones de Reporte --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Tarjeta 1: Dashboard de KPIs */}
        <ReportCard 
            icon={<BarChart3 size={24} />}
            title="Dashboard Operacional"
            description="Tiempos promedio de ciclo, solicitudes por prioridad y volumen por área."
            buttonText="Ver Dashboard"
            onClick={() => alert("Función: Mostrar Dashboard de KPIs")}
        />

        {/* Tarjeta 2: Historial por Pieza */}
        <ReportCard 
            icon={<List size={24} />}
            title="Historial de Piezas"
            description="Consulta el historial completo de trabajo, rechazos y calidad por ID de Pieza."
            buttonText="Consultar Historial"
            onClick={() => alert("Función: Ir a la consulta de historial")}
        />

        {/* Tarjeta 3: Configuración y Catálogos */}
        <ReportCard 
            icon={<Settings size={24} />}
            title="Administración de Catálogos"
            description="Gestiona listas maestras: tipos de trabajo, prioridades, máquinas y usuarios. (Catálogo usado por formularios y filtros.)"
            buttonText="Administrar"
            onClick={() => alert("Función: Ir a la gestión de catálogos")}
        />

      </div>
    </>
  );
}

// Componente Auxiliar para las Tarjetas
function ReportCard({ icon, title, description, buttonText, onClick }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 hover:shadow-xl transition duration-200">
            <div className="text-blue-600 mb-3">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4 text-sm">{description}</p>
            <button
                onClick={onClick}
                className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium py-2 rounded-lg transition duration-150"
            >
                {buttonText}
            </button>
        </div>
    );
}