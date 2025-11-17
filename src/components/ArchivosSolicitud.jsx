import React, { useState } from "react";

export default function ArchivosSolicitud({ solicitudId, userRol }) {
  const [archivos, setArchivos] = useState([]);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const nuevos = files.map((file) => ({
      nombre: file.name,
      url: URL.createObjectURL(file),
    }));
    setArchivos((prev) => [...prev, ...nuevos]);
  };

  const handleDelete = (nombre) => {
    setArchivos((prev) => prev.filter((a) => a.nombre !== nombre));
  };

  return (
    <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">Archivos / Dibujos</h2>

      {userRol !== "Usuario" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Subir archivos</label>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.svg"
            onChange={handleUpload}
            className="block w-full text-sm text-gray-700"
          />
        </div>
      )}

      {archivos.length === 0 ? (
        <div className="text-sm text-gray-500">No hay archivos adjuntos.</div>
      ) : (
        <ul className="space-y-3">
          {archivos.map((a) => (
            <li key={a.nombre} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
              <div>
                <div className="text-sm font-medium text-gray-800">{a.nombre}</div>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Ver / Descargar
                </a>
              </div>
              {userRol === "TI" && (
                <button
                  onClick={() => handleDelete(a.nombre)}
                  className="text-red-500 hover:underline text-sm"
                >
                  Eliminar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}