import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function NotificacionesPanel() {
  const [abierto, setAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState([
    { id: 1, mensaje: "Te asignaron la orden #002", fecha: "2025-11-15", leido: false },
    { id: 2, mensaje: "Tu solicitud #001 fue completada", fecha: "2025-11-14", leido: true },
    { id: 3, mensaje: "Nuevo archivo agregado a la orden #003", fecha: "2025-11-13", leido: false },
  ]);

  const togglePanel = () => setAbierto(!abierto);
  const marcarComoLeido = (id) =>
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
    );

  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  return (
    <div className="relative">
      <button onClick={togglePanel} className="relative text-slate-700 hover:text-blue-600">
        🔔
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
            {noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="p-3 font-bold border-b text-slate-700">Notificaciones</div>
          <ul className="max-h-64 overflow-y-auto divide-y">
            {notificaciones.map((n) => (
              <li
                key={n.id}
                onClick={() => marcarComoLeido(n.id)}
                className={`p-3 text-sm cursor-pointer ${
                  n.leido ? "text-gray-500" : "bg-blue-50 text-gray-800"
                }`}
              >
                <div>{n.mensaje}</div>
                <div className="text-xs text-gray-400">{n.fecha}</div>
              </li>
            ))}
          </ul>

          {/* Enlace al historial */}
          <Link
            to="/notificaciones"
            className="block text-center text-sm text-blue-600 hover:underline py-3 border-t"
          >
            Ver todas las notificaciones
          </Link>
        </div>
      )}
    </div>
  );
}