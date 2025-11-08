import React, { useState, useMemo, useEffect } from "react";
// Usamos los iconos de Lucide
import { PlusCircle, Edit, Trash2, Search, AlertTriangle } from "lucide-react";

import { useNavigate } from "react-router-dom";


// --- MOCK DATA (Datos simulados basados en tu BD) ---
const MOCK_REPORTS = [
  { 
    id: "001", 
    pieza: "Molde A1 (Tapa)", 
    area: "Producción", 
    tipo: "Daño físico", 
    prioridad: "Alta", 
    estado: "Nueva", // Esperando revisión de Machine Shop
    fecha: "2025-11-04" 
  },
  { 
    id: "002", 
    pieza: "Molde B5 (Base)", 
    area: "Mantenimiento", 
    tipo: "Mal funcionamiento", 
    prioridad: "Media", 
    estado: "Asignada", // Revisada y asignada a maquinista
    fecha: "2025-11-03" 
  },
  { 
    id: "003", 
    pieza: "Molde C2 (Núcleo)", 
    area: "Calidad", 
    tipo: "Falla de material", 
    prioridad: "Baja", 
    estado: "En progreso", // Maquinista trabajando
    fecha: "2025-11-02" 
  },
  { 
    id: "004", 
    pieza: "Molde D9 (Cavidad)", 
    area: "Producción", 
    tipo: "Fractura", 
    prioridad: "Crítica", 
    estado: "Revision Calidad", // Esperando aprobación de Calidad
    fecha: "2025-11-01" 
  },
  { 
    id: "005", 
    pieza: "Molde E7 (Guía)", 
    area: "Almacén", 
    tipo: "Corrosión", 
    prioridad: "Baja", 
    estado: "Completado", // Ciclo cerrado
    fecha: "2025-10-31" 
  },
];


// --- COMPONENTE PRINCIPAL (La vista de la tabla) ---
export default function Dashboard() {
  // Estado para almacenar los reportes, el término de búsqueda y el estado de carga
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleNewReport = () => {
    navigate("/solicitar"); // 👈 Redirige a la ruta del formulario
  };

  // Simula la carga de datos de la API (solo se ejecuta al montar el componente)
  useEffect(() => {
    // Aquí es donde harías la llamada real a tu API C# (GET /api/solicitudes)
    setTimeout(() => {
      setReports(MOCK_REPORTS);
      setIsLoading(false);
    }, 1000); 
  }, []); 


  // Lógica de filtrado optimizada con useMemo
  const filteredReports = useMemo(() => {
    if (!searchTerm) {
      return reports;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();

    // Filtra en base a múltiples campos (pieza, ID, área, estado, etc.)
    return reports.filter(report =>
      report.id.toLowerCase().includes(lowerCaseSearch) ||
      report.pieza.toLowerCase().includes(lowerCaseSearch) ||
      report.area.toLowerCase().includes(lowerCaseSearch) ||
      report.tipo.toLowerCase().includes(lowerCaseSearch) ||
      report.estado.toLowerCase().includes(lowerCaseSearch)
    );
  }, [reports, searchTerm]);


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  


  return (
    // Dashboard Content (el contenido principal de tu layout)
    <> 
        <h1 className="text-2xl font-bold mb-6">Gestión de Reportes de Piezas Dañadas</h1>

        {/* Botones de acción y Búsqueda */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button 
                onClick={handleNewReport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-150"
            >
              <PlusCircle size={18} /> Nuevo Reporte
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition duration-150">
              Exportar
            </button>
          </div>
          
          {/* Campo de Búsqueda */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, pieza, área o estado..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="border border-gray-300 rounded-lg pl-10 pr-3 py-2 w-72 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
          </div>
        </div>

        {/* Tabla de reportes */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <Th>ID</Th>
                <Th>Pieza</Th>
                <Th>Área</Th>
                <Th>Tipo</Th>
                <Th>Prioridad</Th>
                <Th>Estado</Th>
                <Th>Fecha</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Muestra el estado de carga
                <tr>
                  <td colSpan="8" className="text-center py-8 text-lg text-gray-500">
                    Cargando reportes...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                // Muestra un mensaje si no hay resultados
                <tr>
                  <td colSpan="8" className="text-center py-8 text-lg text-gray-500">
                    No se encontraron reportes que coincidan con "{searchTerm}".
                  </td>
                </tr>
              ) : (
                // Mapea y renderiza las filas de la tabla
                filteredReports.map((report) => (
                  <TableRow
                    key={report.id}
                    {...report}
                    navigate={navigate} // Pasa todas las propiedades del objeto 'report'
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
    </>
  );
}


/* --- COMPONENTES AUXILIARES (Idealmente estos irían en una carpeta 'components') --- */

// Componente para el encabezado de la tabla (<th>)
function Th({ children }) {
  return (
    <th className="text-left px-4 py-3 text-sm font-semibold border-b border-gray-300">
      {children}
    </th>
  );
}

// Componente para una celda de la tabla (<td>)
function Td({ children }) {
  return <td className="px-4 py-3 text-sm border-b border-gray-200">{children}</td>;
}

// Componente para una fila completa de la tabla (<tr>)
function TableRow({ id, pieza, area, tipo, prioridad, estado, fecha, navigate }) {
    // Hook para la navegación (necesario para la acción)
    // const navigate = useNavigate(); 
    
    // Función para manejar la acción de ver/editar (depende del estado y rol)
    const handleAction = () => {
        // Redirecciona basándose en el estado, como habíamos planeado:
        if (estado === 'Revision Calidad') {
            navigate(`/revision-calidad/${id}`);
        } else {
            navigate(`/trabajo/${id}`);
        }
    };

    // Asigna clases de color basadas en el estado
    const getStatusClasses = (status) => {
        switch (status) {
            case "Nueva": // Recién creado (Esperando Revisión)
                return "bg-red-100 text-red-700 font-medium";
            case "Asignada": // Revisada y asignada
                return "bg-orange-100 text-orange-700 font-medium";
            case "En progreso": // Maquinista trabajando
                return "bg-blue-100 text-blue-700 font-medium";
            case "Revision Calidad": // En espera de Calidad
                return "bg-purple-100 text-purple-700 font-medium";
            case "Completado": // Ciclo cerrado
                return "bg-green-100 text-green-700 font-medium";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    


    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50 transition duration-100">
            <Td>{id}</Td>
            <Td>{pieza}</Td>
            <Td>{area}</Td>
            <Td>{tipo}</Td>
            <Td>{prioridad}</Td>
            <Td>
                <span
                    className={`px-3 py-1 rounded-full text-xs tracking-wider ${getStatusClasses(estado)}`}
                >
                    {estado}
                </span>
            </Td>
            <Td>{fecha}</Td>
            <Td>
                <div className="flex gap-2">
                    <button
                        title="Ver/Editar Solicitud"
                        onClick={handleAction}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        title="Eliminar reporte (Solo Admin/Machine Shop en estado 'Nueva')"
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </Td>
        </tr>
    );
}