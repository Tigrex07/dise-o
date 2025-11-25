import React, { useState } from "react";
import { Bell, CheckCircle } from "lucide-react";
import dayjs from "dayjs";

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([
    { id: 1, mensaje: "Te asignaron la orden #002", fecha: "2025-11-24", leido: false },
    { id: 2, mensaje: "Tu solicitud #001 fue completada", fecha: "2025-11-20", leido: true },
    { id: 3, mensaje: "Nuevo archivo agregado a la orden #003", fecha: "2025-11-15", leido: false },
    { id: 4, mensaje: "Se actualizó el estado de la orden #004", fecha: "2025-11-10", leido: false },
  ]);

  // Marcar una notificación como leída
  const marcarComoLeido = (id) =>
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
    );

  // Marcar todas como leídas
  const marcarTodas = () =>
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));

  // Agrupar por fecha
  const hoy = dayjs();
  const grupoHoy = notificaciones.filter((n) => dayjs(n.fecha).isSame(hoy, "day"));
  const grupoSemana = notificaciones.filter((n) =>
    dayjs(n.fecha).isSame(hoy, "week")
  );
  const grupoAntiguas = notificaciones.filter(
    (n) => !dayjs(n.fecha).isSame(hoy, "week")
  );

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Bell className="text-indigo-600" /> Historial de Notificaciones
        </h1>
        <button
          onClick={marcarTodas}
          className="flex items-center gap-2 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
        >
          <CheckCircle size={16} /> Marcar todas como leídas
        </button>
      </div>

      {/* Contador */}
      <div className="text-sm text-gray-500">
        Total: <span className="font-semibold">{notificaciones.length}</span> | No leídas:{" "}
        <span className="font-semibold text-red-500">
          {notificaciones.filter((n) => !n.leido).length}
        </span>
      </div>

      {/* Grupo Hoy */}
      {grupoHoy.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-indigo-700 mb-2">Hoy</h2>
          <ListaNotificaciones
            notificaciones={grupoHoy}
            marcarComoLeido={marcarComoLeido}
          />
        </div>
      )}

      {/* Grupo Semana */}
      {grupoSemana.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-indigo-700 mb-2">Esta semana</h2>
          <ListaNotificaciones
            notificaciones={grupoSemana}
            marcarComoLeido={marcarComoLeido}
          />
        </div>
      )}

      {/* Grupo Antiguas */}
      {grupoAntiguas.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-indigo-700 mb-2">Más antiguas</h2>
          <ListaNotificaciones
            notificaciones={grupoAntiguas}
            marcarComoLeido={marcarComoLeido}
          />
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para renderizar lista
function ListaNotificaciones({ notificaciones, marcarComoLeido }) {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-white">
      {notificaciones.map((n) => (
        <div
          key={n.id}
          onClick={() => marcarComoLeido(n.id)}
          className={`p-4 border-b last:border-none cursor-pointer transition ${
            n.leido
              ? "bg-white text-gray-500 hover:bg-gray-50"
              : "bg-blue-50 text-gray-800 hover:bg-blue-100"
          }`}
        >
          <div className="font-medium">{n.mensaje}</div>
          <div className="text-xs text-gray-400 mt-1">{n.fecha}</div>
        </div>
      ))}
    </div>
  );
}