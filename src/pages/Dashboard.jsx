import React, { useState, useMemo, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- MOCK DATA (actualizado para Work Orders y con campo assignedTo) ---
const MOCK_REPORTS = [
  {
    id: "001",
    pieza: "Tapa A1",
    area: "Producción",
    tipo: "Daño físico",
    prioridad: "Alta",
    estado: "Nueva",
    assignedTo: "", // sin asignar
    fecha: "2025-11-04"
  },
  {
    id: "002",
    pieza: "Base B5",
    area: "Mantenimiento",
    tipo: "Mal funcionamiento",
    prioridad: "Media",
    estado: "Asignada",
    assignedTo: "Javier Pérez",
    fecha: "2025-11-03"
  },
  {
    id: "003",
    pieza: "Núcleo C2",
    area: "Calidad",
    tipo: "Falla de material",
    prioridad: "Baja",
    estado: "En progreso",
    assignedTo: "Ana López",
    fecha: "2025-11-02"
  },
  {
    id: "004",
    pieza: "Cavidad D9",
    area: "Producción",
    tipo: "Fractura",
    prioridad: "Crítica",
    estado: "Revision Calidad",
    assignedTo: "Carlos Salas",
    fecha: "2025-11-01"
  },
  {
    id: "005",
    pieza: "Guía E7",
    area: "Almacén",
    tipo: "Corrosión",
    prioridad: "Baja",
    estado: "Completado",
    assignedTo: "",
    fecha: "2025-10-31"
  },
];

// --- COMPONENTE PRINCIPAL ---
export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [personFilter, setPersonFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleNewReport = () => {
    navigate("/solicitar");
  };

  useEffect(() => {
    // Simulación de carga
    setTimeout(() => {
      setReports(MOCK_REPORTS);
      setIsLoading(false);
    }, 600);
  }, []);

  // Lista única de personas para sugerir en filtro (extraída de reports)
  const peopleOptions = useMemo(() => {
    const names = reports.map(r => (r.assignedTo || "").trim()).filter(Boolean);
    return Array.from(new Set(names));
  }, [reports]);

  const filteredReports = useMemo(() => {
    let result = reports.slice();

    const q = (searchTerm || "").trim().toLowerCase();
    if (q) {
      result = result.filter(report => {
        const id = (report.id || "").toLowerCase();
        const pieza = (report.pieza || "").toLowerCase();
        const area = (report.area || "").toLowerCase();
        const tipo = (report.tipo || "").toLowerCase();
        const estado = (report.estado || "").toLowerCase();
        const assigned = (report.assignedTo || "").toLowerCase();
        return (
          id.includes(q) ||
          pieza.includes(q) ||
          area.includes(q) ||
          tipo.includes(q) ||
          estado.includes(q) ||
          assigned.includes(q)
        );
      });
    }

    const p = (personFilter || "").trim().toLowerCase();
    if (p) {
      result = result.filter(r => (r.assignedTo || "").toLowerCase().includes(p));
    }

    return result;
  }, [reports, searchTerm, personFilter]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Work Orders Tracker — Gestión Operacional</h1>

      {/* Acciones y filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-150"
          >
            <PlusCircle size={18} /> Nueva Orden
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition duration-150">
            Exportar
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, pieza, área, estado o persona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg pl-10 pr-3 py-2 w-72 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
          </div>

          <select
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            className="border border-gray-300 rounded-lg pl-3 pr-3 py-2 w-56 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          >
            <option value="">Filtrar por persona (todas)</option>
            {peopleOptions.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
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
              <Th>Asignado</Th>
              <Th>Fecha</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-lg text-gray-500">
                  Cargando reportes...
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-lg text-gray-500">
                  No se encontraron reportes que coincidan con "{searchTerm || personFilter}".
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <TableRow
                  key={report.id}
                  {...report}
                  navigate={navigate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* --- COMPONENTES AUXILIARES --- */

function Th({ children }) {
  return (
    <th className="text-left px-4 py-3 text-sm font-semibold border-b border-gray-300">
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-4 py-3 text-sm border-b border-gray-200">{children}</td>;
}

function TableRow({ id, pieza, area, tipo, prioridad, estado, assignedTo, fecha, navigate }) {
  const handleAction = () => {
    if (estado === "Revision Calidad") {
      navigate(`/revision-calidad/${id}`);
    } else {
      navigate(`/trabajo/${id}`);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Nueva":
        return "bg-red-100 text-red-700 font-medium";
      case "Asignada":
        return "bg-orange-100 text-orange-700 font-medium";
      case "En progreso":
        return "bg-blue-100 text-blue-700 font-medium";
      case "Revision Calidad":
        return "bg-purple-100 text-purple-700 font-medium";
      case "Completado":
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
        <span className={`px-3 py-1 rounded-full text-xs tracking-wider ${getStatusClasses(estado)}`}>
          {estado}
        </span>
      </Td>
      <Td>{assignedTo || "—"}</Td>
      <Td>{fecha}</Td>
      <Td>
        <div className="flex gap-2">
          <button
            title="Ver/Editar Orden"
            onClick={handleAction}
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
          >
            <Edit size={18} />
          </button>
          <button
            title="Eliminar orden (Solo Admin)"
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </Td>
    </tr>
  );
}