// File: src/pages/PruebaConexion.jsx
import React, { useState, useEffect } from 'react';

export default function PruebaConexion() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // URL de la API (ajusta el puerto si es necesario, revisa la consola de dotnet)
    const API_URL = "http://localhost:5145/api/usuarios"; 

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await fetch(API_URL);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} - Verifica si la API está corriendo en ${API_URL}`);
                }
                
                const data = await response.json();
                setUsuarios(data);
                
            } catch (err) {
                setError(err.message);
                console.error("Error de conexión:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsuarios();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">🧪 Prueba de Conexión React ➡️ SQL Server</h1>
            
            {loading && <p className="text-blue-500">Cargando datos de la API...</p>}
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Error al conectar:</strong>
                    <span className="block sm:inline"> {error}</span>
                    <p className="mt-2 text-sm">Asegúrate de que la API de C# (`dotnet run`) esté activa y que tu cadena de conexión en `appsettings.json` sea correcta.</p>
                </div>
            )}

            {!loading && !error && (
                <div className="mt-4">
                    <p className="text-green-600 font-bold mb-2">¡CONEXIÓN EXITOSA! Usuarios leídos de SQL Server ({usuarios.length}):</p>
                    <ul className="list-disc pl-5">
                        {usuarios.map(user => (
                            <li key={user.idUsuario} className="bg-gray-50 p-2 rounded mb-1 text-sm">
                                <strong>ID: {user.idUsuario}</strong> | Nombre: {user.nombre} | Rol: {user.rol}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}