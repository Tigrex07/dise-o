import React, { useState } from 'react';
import { Send, FileText, Component, AlertTriangle } from 'lucide-react';

export default function SolicitudForm() {
  const [formData, setFormData] = useState({
    piezaId: '', // ahora es texto libre (DESCRIPCION / PIEZA)
    tipo: 'Daño físico',
    detalles: '',
    dibujo: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Forzar uppercase para el campo piezaId
    if (name === 'piezaId') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, dibujo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ejemplo: usar FormData para enviar texto + archivo
    const payload = new FormData();
    payload.append('piezaDescripcion', formData.piezaId);
    payload.append('tipo', formData.tipo);
    payload.append('detalles', formData.detalles);
    if (formData.dibujo) payload.append('dibujo', formData.dibujo);

    try {
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        body: payload,
      });
      if (!res.ok) throw new Error('Error al enviar');
      // Reemplaza alert por toast si tienes una librería instalada
      alert('Orden enviada correctamente!');
      setFormData({ piezaId: '', tipo: 'Daño físico', detalles: '', dibujo: null });
    } catch (err) {
      console.error(err);
      alert('No se pudo enviar la orden. Intenta de nuevo.');
    }
  };

  const tipos = ['Daño físico', 'Mal funcionamiento', 'Solicitud de mejora/modificación', 'Revisión preventiva'];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Levantar Nueva Orden de Trabajo</h1>

      <div className="bg-white p-8 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Sección 1: Datos Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-4">
            <div>
              <label htmlFor="piezaId" className="block text-sm font-medium text-gray-700 mb-1">
                <Component size={14} className="inline mr-1" /> Pieza / Descripción (Uppercase)
              </label>

              <input
                id="piezaId"
                name="piezaId"
                value={formData.piezaId}
                onChange={handleChange}
                required
                placeholder="DESCRIBE LA PIEZA O TRABAJO"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
              />
            </div>

            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                <AlertTriangle size={14} className="inline mr-1" /> Tipo de Solicitud
              </label>
              <select
                id="tipo"
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

          {/* Sección 2: Detalles y Adjuntos */}
          <div>
            <label htmlFor="detalles" className="block text-sm font-medium text-gray-700 mb-1">
              <FileText size={14} className="inline mr-1" /> Detalles del Daño/Modificación
            </label>
            <textarea
              id="detalles"
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
              <Send size={18} /> Enviar Orden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}