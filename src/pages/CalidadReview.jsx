import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, FileText, User } from 'lucide-react';

export default function CalidadReview() {
    const { id } = useParams();
    // Este estado simularía el GET de la solicitud + el trabajo realizado
    const [reviewData, setReviewData] = useState({
        solicitudId: id,
        pieza: 'Molde A1',
        maquinista: 'Javier Pérez',
        tiempoMaq: '120 min',
        observacionesMaquinista: 'Se reemplazó la cavidad dañada usando el torno 3 y material de alta resistencia. Se validaron las tolerancias con el vernier.',
        comentariosCalidad: '',
    });

    const handleAprobar = () => {
        // Lógica de PUT/PATCH (Tabla Revision: EstadoRevision='Aprobada', cierra la solicitud)
        alert('Pieza APROBADA. Solicitud CERRADA y lista para entrega.');
    };

    const handleRechazar = () => {
        // Lógica de PUT/PATCH (Tabla Revision: EstadoRevision='Devuelta', regresa el estado a "En proceso" o "Asignada")
        alert('Pieza RECHAZADA. Regresando a Machine Shop para correcciones.');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Revisión de Calidad - Solicitud #{id}</h1>
            <div className="bg-white p-8 rounded-xl shadow-lg">

                {/* Resumen del Trabajo Realizado */}
                <div className="border-b pb-4 mb-6">
                    <h2 className="text-xl font-semibold mb-3">Historial del Maquinista</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <p><User size={14} className="inline mr-2 text-blue-600" /> **Maquinista:** {reviewData.maquinista}</p>
                        <p><User size={14} className="inline mr-2 text-blue-600" /> **Pieza:** {reviewData.pieza}</p>
                        <p><CheckCircle size={14} className="inline mr-2 text-blue-600" /> **Tiempo Invertido:** {reviewData.tiempoMaq}</p>
                    </div>
                    <p className="p-3 bg-gray-50 rounded-lg text-sm italic">
                        <FileText size={16} className="inline mr-2 text-gray-500" /> 
                        {reviewData.observacionesMaquinista}
                    </p>
                </div>

                {/* Formulario de Decisión (Tabla Revision) */}
                <h2 className="text-xl font-semibold mb-3">Veredicto de Calidad</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios de Calidad</label>
                    <textarea
                        value={reviewData.comentariosCalidad}
                        onChange={(e) => setReviewData({...reviewData, comentariosCalidad: e.target.value})}
                        rows="4"
                        placeholder="Registra tu decisión y observaciones (requerido para rechazo)."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                </div>
                
                {/* Botones de Acción */}
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={handleRechazar}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition duration-150"
                    >
                        <XCircle size={18} /> Rechazar / Devolver
                    </button>
                    <button
                        onClick={handleAprobar}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition duration-150"
                    >
                        <CheckCircle size={18} /> Aprobar y Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}