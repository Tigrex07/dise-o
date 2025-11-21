import React, { useState } from 'react';
import { BarChart3, List, Settings, Users } from 'lucide-react';

export default function Reportes() {
  // Estados para mostrar reportes
  const [showProductividad, setShowProductividad] = useState(false);
  const [showUsoMaquinas, setShowUsoMaquinas] = useState(false);
  const [showCalidad, setShowCalidad] = useState(false);

  // Estados de búsqueda
  const [searchProductividad, setSearchProductividad] = useState("");
  const [searchUso, setSearchUso] = useState("");
  const [searchCalidad, setSearchCalidad] = useState("");

  // Estados de fechas por reporte
  const [fechaInicioProd, setFechaInicioProd] = useState("");
  const [fechaFinProd, setFechaFinProd] = useState("");

  const [fechaInicioUso, setFechaInicioUso] = useState("");
  const [fechaFinUso, setFechaFinUso] = useState("");

  const [fechaInicioCal, setFechaInicioCal] = useState("");
  const [fechaFinCal, setFechaFinCal] = useState("");

  // Datos de ejemplo
  const productividadData = [
    { maquinista: "Javier Pérez", horas: 35, piezas: 120, fecha: "2025-11-01" },
    { maquinista: "Ana López", horas: 28, piezas: 95, fecha: "2025-11-10" },
    { maquinista: "Carlos Ruiz", horas: 40, piezas: 140, fecha: "2025-11-15" },
  ];

  const usoMaquinasData = [
    { maquina: "CNC", horas: 120, fecha: "2025-11-05" },
    { maquina: "Torno", horas: 95, fecha: "2025-11-08" },
    { maquina: "Fresadora", horas: 80, fecha: "2025-11-12" },
    { maquina: "Soldadura Laser", horas: 60, fecha: "2025-11-18" },
  ];

  const calidadData = [
    { pieza: "Pieza A", aprobadas: 50, rechazadas: 5, fecha: "2025-11-03" },
    { pieza: "Pieza B", aprobadas: 40, rechazadas: 10, fecha: "2025-11-09" },
    { pieza: "Pieza C", aprobadas: 70, rechazadas: 3, fecha: "2025-11-14" },
  ];
  return (
    <>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <BarChart3 size={28} className="text-gray-600"/> Módulo de Reportes e Historial
      </h1>

      <p className="text-lg text-gray-700 mb-8">
        Visualización y análisis del desempeño de Machine Shop y del historial de mantenimiento de piezas.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard 
          icon={<Users size={24} />}
          title="Productividad por Maquinista"
          description="Horas trabajadas y piezas completadas por cada operador."
          buttonText="Ver Productividad"
          onClick={() => {
            setShowProductividad(true);
            setShowUsoMaquinas(false);
            setShowCalidad(false);
          }}
        />

        <ReportCard 
          icon={<Settings size={24} />}
          title="Uso de Máquinas"
          description="Distribución de tiempos por máquina y detección de sobrecarga."
          buttonText="Ver Uso"
          onClick={() => {
            setShowUsoMaquinas(true);
            setShowProductividad(false);
            setShowCalidad(false);
          }}
        />

        <ReportCard 
          icon={<List size={24} />}
          title="Reporte de Calidad"
          description="Historial de revisiones y métricas de rechazo/aprobación."
          buttonText="Ver Calidad"
          onClick={() => {
            setShowCalidad(true);
            setShowProductividad(false);
            setShowUsoMaquinas(false);
          }}
        />
      </div>
      {showProductividad && (() => {
        const productividadFiltrada = productividadData
          .filter(row => row.maquinista.toLowerCase().includes(searchProductividad.toLowerCase()))
          .filter(row => (!fechaInicioProd || row.fecha >= fechaInicioProd) && (!fechaFinProd || row.fecha <= fechaFinProd));

        return (
          <div className="mt-10 bg-white p-6 rounded-xl shadow-lg animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Reporte de Productividad</h2>

            {/* Filtros */}
            <div className="flex gap-4 mb-6">
              {/* Buscar */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Buscar maquinista</label>
                <input type="text" className="border px-3 py-2 rounded-lg"
                  value={searchProductividad}
                  onChange={(e) => setSearchProductividad(e.target.value)} />
              </div>
              {/* Fechas */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Fecha inicial</label>
                <input type="date" className="border px-3 py-2 rounded-lg"
                  value={fechaInicioProd}
                  onChange={(e) => setFechaInicioProd(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Fecha final</label>
                <input type="date" className="border px-3 py-2 rounded-lg"
                  value={fechaFinProd}
                  onChange={(e) => setFechaFinProd(e.target.value)} />
              </div>
            </div>

            {/* KPIs retroactivos */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Horas Totales</p>
                <p className="text-xl font-bold text-blue-700">
                  {productividadFiltrada.reduce((acc, row) => acc + row.horas, 0)}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Piezas Totales</p>
                <p className="text-xl font-bold text-green-700">
                  {productividadFiltrada.reduce((acc, row) => acc + row.piezas, 0)}
                </p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Top Maquinista</p>
                <p className="text-xl font-bold text-purple-700">
                  {productividadFiltrada.length > 0
                    ? productividadFiltrada.sort((a,b) => b.piezas - a.piezas)[0].maquinista
                    : "—"}
                </p>
              </div>
            </div>

            {/* Tabla filtrada */}
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Maquinista</th>
                  <th className="border px-4 py-2 text-left">Horas</th>
                  <th className="border px-4 py-2 text-left">Piezas</th>
                </tr>
              </thead>
              <tbody>
                {productividadFiltrada.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="border px-4 py-2">{row.maquinista}</td>
                    <td className="border px-4 py-2">{row.horas}</td>
                    <td className="border px-4 py-2">{row.piezas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
      {showUsoMaquinas && (() => {
        const usoFiltrado = usoMaquinasData
          .filter(row => row.maquina.toLowerCase().includes(searchUso.toLowerCase()))
          .filter(row => (!fechaInicioUso || row.fecha >= fechaInicioUso) && (!fechaFinUso || row.fecha <= fechaFinUso));

        return (
          <div className="mt-10 bg-white p-6 rounded-xl shadow-lg animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Reporte de Uso de Máquinas</h2>

            {/* Filtros */}
            <div className="flex gap-4 mb-6">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Buscar máquina</label>
                <input type="text" className="border px-3 py-2 rounded-lg"
                  value={searchUso}
                  onChange={(e) => setSearchUso(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Fecha inicial</label>
                <input type="date" className="border px-3 py-2 rounded-lg"
                  value={fechaInicioUso}
                  onChange={(e) => setFechaInicioUso(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Fecha final</label>
                <input type="date" className="border px-3 py-2 rounded-lg"
                  value={fechaFinUso}
                  onChange={(e) => setFechaFinUso(e.target.value)} />
              </div>
            </div>

            {/* KPIs retroactivos */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Horas Totales</p>
                <p className="text-xl font-bold text-green-700">
                  {usoFiltrado.reduce((acc, row) => acc + row.horas, 0)}
                </p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Máquina más usada</p>
                <p className="text-xl font-bold text-yellow-700">
                  {usoFiltrado.length > 0
                    ? usoFiltrado.sort((a,b) => b.horas - a.horas)[0].maquina
                    : "—"}
                </p>
              </div>
            </div>

            {/* Tabla filtrada */}
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Máquina</th>
                  <th className="border px-4 py-2 text-left">Horas Usadas</th>
                </tr>
              </thead>
              <tbody>
                {usoFiltrado.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="border px-4 py-2">{row.maquina}</td>
                    <td className="border px-4 py-2">{row.horas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
      {showCalidad && (() => {
        const calidadFiltrada = calidadData
          .filter(row => row.pieza.toLowerCase().includes(searchCalidad.toLowerCase()))
          .filter(row => (!fechaInicioCal || row.fecha >= fechaInicioCal) && (!fechaFinCal || row.fecha <= fechaFinCal));

        return (
          <div className="mt-10 bg-white p-6 rounded-xl shadow-lg animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-red-700">Reporte de Calidad</h2>

            {/* Filtros */}
            <div className="flex gap-4 mb-6">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Buscar pieza</label>
                <input type="text" className="border px-3 py-2 rounded-lg"
                  value={searchCalidad}
                  onChange={(e) => setSearchCalidad(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Fecha inicial</label>
                <input type="date" className="border px-3 py-2 rounded-lg"
                  value={fechaInicioCal}
                  onChange={(e) => setFechaInicioCal(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Fecha final</label>
                <input type="date" className="border px-3 py-2 rounded-lg"
                  value={fechaFinCal}
                  onChange={(e) => setFechaFinCal(e.target.value)} />
              </div>
            </div>

            {/* KPIs retroactivos */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">% Aprobación</p>
                <p className="text-xl font-bold text-red-700">
                  {calidadFiltrada.length > 0
                    ? Math.round(
                        (calidadFiltrada.reduce((acc, row) => acc + row.aprobadas, 0) /
                        (calidadFiltrada.reduce((acc, row) => acc + row.aprobadas + row.rechazadas, 0))) * 100
                      )
                    : 0}%
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Piezas evaluadas</p>
                <p className="text-xl font-bold text-gray-700">
                  {calidadFiltrada.reduce((acc, row) => acc + row.aprobadas + row.rechazadas, 0)}
                </p>
              </div>
            </div>

            {/* Tabla filtrada */}
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Pieza</th>
                  <th className="border px-4 py-2 text-left">Aprobadas</th>
                  <th className="border px-4 py-2 text-left">Rechazadas</th>
                </tr>
              </thead>
              <tbody>
                {calidadFiltrada.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="border px-4 py-2">{row.pieza}</td>
                    <td className="border px-4 py-2">{row.aprobadas}</td>
                    <td className="border px-4 py-2">{row.rechazadas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
    </>
  );
} // ⬅️ cierre del componente principal Reportes

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