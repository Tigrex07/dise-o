import React, { useMemo, useState } from 'react';
import { MOCK_SOLICITUDES } from '../data/solicitudesMock';
import { CalendarCheck, User, PackageCheck, Clock, Search } from 'lucide-react';
import dayjs from 'dayjs';

export default function Historial() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar solo trabajos completados
  const trabajosCompletados = useMemo(() => {
    return MOCK_SOLICITUDES.filter(s => s.estado === 'Completado');
  }, []);

  // KPIs
  const kpis = useMemo(() => {
    const hoy = dayjs();
    const esteMes = trabajosCompletados.filter(s =>
      dayjs(s.fechaFinalizado).isSame(hoy, 'month')
    );
    const estaSemana = trabajosCompletados.filter(s =>
      dayjs(s.fechaFinalizado).isSame(hoy, 'week')
    );

    return {
      total: trabajosCompletados.length,
      mes: esteMes.length,
      semana: estaSemana.length,
    };
  }, [trabajosCompletados]);

  // Filtro por búsqueda
  const filtrados = useMemo(() => {
    if (!searchTerm) return trabajosCompletados;
    const lower = searchTerm.toLowerCase();
    return trabajosCompletados.filter(s =>
      s.piezaId?.toLowerCase().includes(lower) ||
      s.solicitante?.toLowerCase().includes(lower)
    );
  }, [searchTerm, trabajosCompletados]);

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-indigo-700">Historial de Trabajos Terminados</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard icon={<PackageCheck />} label="Total Completados" value={kpis.total} />
        <KpiCard icon={<CalendarCheck />} label="Este Mes" value={kpis.mes} />
        <KpiCard icon={<Clock />} label="Esta Semana" value={kpis.semana} />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por pieza o solicitante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            
              
  <tr>
    <Th>ID</Th>
    <Th>Pieza</Th>
    <Th>Solicitante</Th>
    <Th>Maquinista</Th> {/* ✅ Cuarta columna */}
    <Th>Fecha Creación</Th>
    <Th>Fecha Finalización</Th>
    <Th>Días desde Finalizado</Th> {/* ✅ Séptima columna */}
  </tr>
</thead>
            
         <tbody>
  {filtrados.map(s => (
    <tr key={s.id}>
      <Td>{s.id}</Td>
      <Td>{s.pieza}</Td>
      <Td>{s.solicitante}</Td>
      <Td>{s.trabajadoPor || '—'}</Td> {/* ✅ Maquinista */}
      <Td>{s.fecha}</Td>
      <Td>{s.fechaFinalizado || '—'}</Td>
      <Td>
        {s.fechaFinalizado
          ? dayjs().diff(dayjs(s.fechaFinalizado), 'day') + ' días'
          : '—'}
      </Td> {/* ✅ Días desde finalizado */}
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </div>
  );
}

// Componentes auxiliares
function KpiCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 border-l-4 border-indigo-500">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {React.cloneElement(icon, { size: 24, className: 'text-indigo-600' })}
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mt-2">{value}</h2>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
      {children}
    </td>
  );
}