import React, { useState } from 'react';
import { Send, FileText, Component, AlertTriangle } from 'lucide-react';

export default function SolicitudForm() {
    const [formData, setFormData] = useState({
        piezaId: '',
        tipo: 'Daño físico', // Tipo: Mal funcionamiento, Daño físico, etc.
        detalles: '',
        dibujo: null, // Para manejar la subida de archivos (o URL)
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, dibujo: e.target.files[0] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica de envío a la API (POST /api/solicitudes)
        console.log("Enviando Solicitud:", formData);
        alert('Solicitud enviada a Machine Shop!');
        // Aquí se limpiaría el formulario y se redirigiría
    };
    
    // Simulación de datos de catálogo (deberían venir de GET /api/piezas)
    const piezas = [
        { id: 'A1', nombre: 'Molde A1 - 50x50' },
        { id: 'B5', nombre: 'Molde B5 - 100x100' },
        { id: 'C2', nombre: 'Molde C2 - Tapa' },
    ];
    
    // Simulación de tipos (deberían venir de una tabla de configuración)
    const tipos = ['Daño físico', 'Mal funcionamiento', 'Solicitud de mejora/modificación', 'Revisión preventiva'];

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Levantar Nueva Solicitud (Producción)</h1>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Sección 1: Datos Principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Component size={14} className="inline mr-1" /> Pieza Afectada
                            </label>
                            {/* Este debería ser un selector con búsqueda (SELECT2/React-Select) */}
                            <select
                                name="piezaId"
                                value={formData.piezaId}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="" disabled>Selecciona una pieza...</option>
                                {piezas.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <AlertTriangle size={14} className="inline mr-1" /> Tipo de Solicitud
                            </label>
                            <select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {tipos.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Sección 2: Detalles y Adjuntos (Tabla Solicitudes: Detalles, Dibujo) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FileText size={14} className="inline mr-1" /> Detalles del Daño/Modificación
                        </label>
                        <textarea
                            name="detalles"
                            value={formData.detalles}
                            onChange={handleChange}
                            rows="4"
                            required
                            placeholder="Describe claramente el problema o la modificación requerida. (Máximo 500 caracteres)"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dibujo o Documento de Referencia (Opcional)
                        </label>
                        <input
                            type="file"
                            name="dibujo"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                         {formData.dibujo && <p className="mt-2 text-xs text-gray-500">Archivo seleccionado: {formData.dibujo.name}</p>}
                    </div>

                    {/* Botón de Envío */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition duration-150"
                        >
                            <Send size={18} /> Enviar a Machine Shop
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}