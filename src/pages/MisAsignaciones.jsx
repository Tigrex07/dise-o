import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, CheckCircle, Clock } from 'lucide-react';

// --- MOCK DATA FILTRADA (Simula solo las tareas del maquinista logueado) ---
const MOCK_ASIGNACIONES = [
  { 
    id: "002", 
    pieza: "Molde B5 (Base)", 
    tipo: "Mal funcionamiento", 
    prioridad: "Media", 
    estado: "Asignada", 
    maquinista: "Juan Pérez",
    fechaAsignacion: "2025-11-03" 
  },
  { 
    id: "003", 
    pieza: "Molde C2 (Núcleo)", 
    tipo: "Falla de material", 
    prioridad: "Baja", 
    estado: "En progreso", 
    maquinista: "Juan Pérez",
    fechaAsignacion: "2025-11-02" 
  },
];

// --- COMPONENTE PRINCIPAL ---
export default function MisAsignaciones() {
  const [asignaciones, setAsignaciones] = useState(MOCK_ASIGNACIONES);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  // En una aplicación real, aquí usarías useEffect para llamar al endpoint:
  // (GET /api/solicitudes?maquinistaId=XX&estado=pendientes)

  const filteredAsignaciones = useMemo(() => {
    if (!searchTerm) return asignaciones;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return asignaciones.filter(a =>
      a.id.toLowerCase().includes(lowerCaseSearch) ||
      a.pieza.toLowerCase().includes(lowerCaseSearch) ||
      a.estado.toLowerCase().includes(lowerCaseSearch)
    );
  }, [asignaciones, searchTerm]);

  // Función de redirección centralizada
  const handleViewDetails = (id) => {
    // Redirige al Panel de Trabajo /trabajo/:id
    navigate(`/trabajo/${id}`);
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Wrench size={28} className="text-blue-600"/> Mis Asignaciones de Trabajo
      </h1>
      <p className="mb-6 text-gray-600">
        Lista de solicitudes asignadas para ser revisadas o trabajadas.
      </p>

      {/* Botones de Filtro y Búsqueda (simplificados) */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 text-sm text-gray-700">
            <span className="font-semibold">Filtros rápidos:</span>
            <button className="text-blue-600 hover:underline">Pendientes (2)</button>
            <span className="text-gray-400">|</span>
            <button className="text-gray-600 hover:underline">En progreso (1)</button>
            <span className="text-gray-400">|</span>
            <button className="text-gray-600 hover:underline">Ver Historial Completo</button>
        </div>
      </div>
      
      {/* Tarjetas de Tareas Asignadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAsignaciones.map((tarea) => (
          <TareaCard 
            key={tarea.id} 
            tarea={tarea} 
            onViewDetails={handleViewDetails} 
          />
        ))}
        
        {/* Mensaje de Asignaciones vacías */}
        {asignaciones.length === 0 && (
            <div className="col-span-full p-8 text-center bg-white rounded-xl shadow-lg border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">🎉 No tienes solicitudes asignadas actualmente. ¡Buen trabajo!</p>
            </div>
        )}
      </div>
    </>
  );
}


/* --- Componente Auxiliar: Tarjeta de Tarea --- */
function TareaCard({ tarea, onViewDetails }) {
  
  const statusClasses = {
      'Asignada': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'En progreso': 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <div className={`bg-white p-5 rounded-xl shadow-lg border-l-4 ${statusClasses[tarea.estado] || 'border-gray-300'}`}>
        <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-gray-800">
                {tarea.pieza} 
                <span className="text-sm font-normal text-gray-500 block">ID: {tarea.id}</span>
            </h3>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[tarea.estado]}`}>
                {tarea.estado}
            </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600 border-t pt-3 mt-3">
            <p className="flex items-center gap-2"><Clock size={16} className="text-gray-500" /> **Prioridad:** {tarea.prioridad}</p>
            <p className="flex items-center gap-2"><CheckCircle size={16} className="text-gray-500" /> **Tipo:** {tarea.tipo}</p>
        </div>

        <div className="mt-4 pt-4 border-t flex justify-end">
            <button
                onClick={() => onViewDetails(tarea.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition duration-150"
            >
                Iniciar / Ver Detalle
            </button>
        </div>
    </div>
  );
}