import React from 'react';
// Se eliminan los íconos de Tag y AlertTriangle ya que las tarjetas asociadas fueron removidas.
import { Settings, Factory, Code, Package, Users } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

export default function Configuracion() {
  const navigate = useNavigate();

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Settings size={28} className="text-gray-600"/> Módulo de Configuración del Sistema
      </h1>

      <p className="text-lg text-gray-700 mb-8">
        Gestión de catálogos y parámetros que rigen el flujo de trabajo de mantenimiento de Moldes.
      </p>

      {/* --- Contenedor de Opciones de Catálogo --- */}
      {/* Se mantienen las tarjetas de Máquinas, Áreas, Piezas y ahora también Usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Máquinas */}
        <ConfigCard 
          icon={<Factory size={24} />}
          title="Inventario de Máquinas"
          description="Gestiona la lista de Máquinas/Equipos disponibles en la planta para la asignación de trabajos."
          buttonText="Administrar Máquinas"
          onClick={() => navigate("/configuracion/maquinas")}
        />

        {/* Áreas */}
        <ConfigCard 
          icon={<Code size={24} />}
          title="Catálogo de Áreas"
          description="Gestiona los nombres de los departamentos que pueden generar o recibir solicitudes."
          buttonText="Administrar Áreas"
          onClick={() => navigate("/configuracion/areas")}
        />

        {/* Piezas */}
        <ConfigCard 
          icon={<Package size={24} />}
          title="Catálogo de Piezas"
          description="Administra las piezas asociadas a cada área y máquina del sistema."
          buttonText="Administrar Piezas"
          onClick={() => navigate("/configuracion/piezas")}
        />

        {/* Usuarios */}
        <ConfigCard 
          icon={<Users size={24} />}
          title="Gestión de Usuarios"
          description="Administra los usuarios del sistema y sus roles."
          buttonText="Administrar Usuarios"
          onClick={() => navigate("/usuarios")}
        />

      </div>
    </>
  );
}

// Componente Auxiliar (sin cambios)
function ConfigCard({ icon, title, description, buttonText, onClick }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-gray-500 hover:shadow-xl transition duration-200">
      <div className="text-gray-600 mb-3">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 text-sm h-12">{description}</p>
      <button
        onClick={onClick}
        className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium py-2 rounded-lg transition duration-150 mt-2"
      >
        {buttonText}
      </button>
    </div>
  );
}