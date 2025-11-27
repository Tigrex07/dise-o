import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Clock, AlertTriangle, Hammer } from 'lucide-react';
import ArchivosSolicitud from "../components/ArchivosSolicitud";
import { MOCK_SOLICITUDES } from "../data/solicitudesMock"; // ✅ Importa el mock compartido

export default function TrabajoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const solicitudEncontrada = MOCK_SOLICITUDES.find(s => s.id === id);

  const [solicitud, setSolicitud] = useState(solicitudEncontrada || {
    id,
    pieza: 'Desconocida',
    estado: 'Nueva',
    prioridad: 'Pendiente',
    detalles: 'No se encontró la solicitud.',
    tiempoMaquina: 0,
    observaciones: '',
  });

  const maquinistas = [{ id: 1, nombre: 'Javier Pérez' }, { id: 2, nombre: 'Ana López' }];
  const prioridades = ['Baja', 'Media', 'Alta', 'Crítica'];
  const maquinas = ['CNC 1', 'Torno 3', 'Fresadora 5'];

  const handleAsignacion = () => {
    alert('Asignación guardada. Estado: Asignada.');
    setSolicitud(prev => ({ ...prev, estado: 'Asignada' }));
  };

  const handleInicioTrabajo = () => {
    alert('Trabajo marcado como En Progreso.');
    setSolicitud(prev => ({ ...prev, estado: 'En progreso' }));
  };

  const handleRegistroAvance = () => {
    alert('Avance y tiempo registrado.');
  };

  const handleFinalizar = () => {
    alert('Trabajo finalizado. Enviando a Revisión de Calidad.');
    setSolicitud(prev => ({ ...prev, estado: 'Revision Calidad' }));
  };

  const isMachineShop = true;
  const isMaquinistaAsignado = true;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-indigo-700">Detalle de Solicitud #{id} – {solicitud.pieza}</h1>
      <StatusBadge estado={solicitud.estado} prioridad={solicitud.prioridad} />

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Detalles del Reporte</h2>
        <p className="text-gray-700 mb-4">{solicitud.detalles}</p>
        <ArchivosSolicitud solicitudId={solicitud.id} userRol={"TI"} />
        <button
  onClick={handleInicioTrabajo}
  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
>
  Iniciar Trabajo
</button>

        {/* Panel de Tiempos */}
{solicitud.estado === 'En progreso' && (
  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
    <h3 className="font-bold mb-3 text-lg text-green-800">Registro de Tiempos por Máquina</h3>
    <div className="space-y-4">
      {[
        "Fresadora",
        "Rectificadora",
        "Corte con Hilo",
        "Cortadora",
        "CNC",
        "Torno",
        "Erosionadora",
        "Soldadura Tic",
        "Soldadura Laser",
        "Set-Up",
        "Mantenimiento de moldes"
      ].map(maquina => (
        <div key={maquina} className="flex items-center gap-4">
          <label className="w-48 font-medium text-gray-700">{maquina}</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={solicitud.tiempos?.[maquina] || ""}
            onChange={(e) =>
              setSolicitud({
                ...solicitud,
                tiempos: {
                  ...solicitud.tiempos,
                  [maquina]: e.target.value
                }
              })
            }
            placeholder="Horas"
            className="w-32 border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      ))}
    </div>
    <div className="flex justify-between mt-6">
      <button
        onClick={handleRegistroAvance}
        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition"
      >
        Guardar Tiempos
      </button>
      <button
        onClick={handleFinalizar}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
      >
        Enviar a Revisión de Calidad
      </button>
    </div>
  </div>
)}

        {/* Panel de Comentarios */}
{solicitud.estado === 'En progreso' && (
  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <h3 className="font-bold mb-3 text-lg text-blue-800">Comentarios del Maquinista</h3>
    <textarea
      value={solicitud.observaciones}
      onChange={(e) => setSolicitud({ ...solicitud, observaciones: e.target.value })}
      placeholder="Escribe aquí tus comentarios sobre el trabajo realizado..."
      rows="4"
      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
    />
    <div className="flex justify-end">
      <button
        onClick={handleFinalizar}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
      >
        Cerrar Trabajo
      </button>
    </div>
  </div>
)}
      </div>
    </div>
  );
}

// Componente visual de estado y prioridad
function StatusBadge({ estado, prioridad }) {
  const statusClasses = {
    'Nueva': 'bg-red-100 text-red-700',
    'Asignada': 'bg-yellow-100 text-yellow-700',
    'En progreso': 'bg-blue-100 text-blue-700',
    'Revision Calidad': 'bg-purple-100 text-purple-700',
    'Completado': 'bg-green-100 text-green-700',
  };
  const priorityClasses = {
    'Baja': 'bg-gray-200 text-gray-700',
    'Media': 'bg-yellow-200 text-yellow-800',
    'Alta': 'bg-orange-200 text-orange-800',
    'Crítica': 'bg-red-200 text-red-800',
  };

  return (
    <div className="flex gap-3 text-sm font-semibold">
      <span className={`px-3 py-1 rounded-full ${statusClasses[estado] || 'bg-gray-200'}`}>{estado}</span>
      <span className={`px-3 py-1 rounded-full ${priorityClasses[prioridad] || 'bg-gray-200'}`}>Prioridad: {prioridad}</span>
    </div>
  );
}