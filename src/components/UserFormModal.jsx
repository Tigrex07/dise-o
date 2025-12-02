import React, { useState, useEffect } from "react";
import { User, X, AlertTriangle } from "lucide-react";

export default function UserFormModal({ isOpen, userToEdit, onClose, onSave }) {
  const isEditing = !!userToEdit;
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "Operador",
    area: "Machine Shop",
    activo: true,
    password: ""
  });
  const [formError, setFormError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      if (userToEdit) {
        setFormData({
          nombre: userToEdit.nombre,
          email: userToEdit.email,
          rol: userToEdit.rol,
          area: userToEdit.area,
          activo: userToEdit.activo,
          password: "" // vacío por defecto en edición
        });
      } else {
        setFormData({
          nombre: "",
          email: "",
          rol: "Operador",
          area: "Machine Shop",
          activo: true,
          password: ""
        });
      }
    }
  }, [isOpen, userToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nombre.trim() || !formData.email.trim() || !formData.rol.trim()) {
      setFormError("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const userPayload = {
      ...(isEditing && { id: userToEdit.id }),
      ...formData,
      ...(isEditing && !formData.password.trim() ? {} : { password: formData.password })
    };

    setIsSaving(true);
    try {
      await onSave(userPayload, isEditing);
      onClose();
    } catch (e) {
      setFormError(e.message || "Error al guardar el usuario.");
    } finally {
      setIsSaving(false);
    }
  };

  const ROLES = ["Admin IT", "Ingeniero", "Operador", "Maquinista", "Master"];
  const AREAS = ["Machine Shop", "Inyección", "Extrusión", "Mantenimiento", "IT/Sistemas", "Otros"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-3xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center">
              <User className="mr-2 w-5 h-5 text-indigo-600" />
              {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
            </h3>
            <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {formError && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center">
                <AlertTriangle size={16} className="mr-2" />
                {formError}
              </div>
            )}

            {/* Nombre */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                disabled={isSaving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isEditing || isSaving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              {isEditing && <p className="text-xs text-gray-500 mt-1">El Email no se puede modificar.</p>}
            </div>

            {/* Contraseña */}
<div className="mb-4">
  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
  <input
    type="password"
    id="password"
    name="password"
    value={formData.password}
    onChange={handleChange}
    disabled={isSaving}
    className="w-full border border-gray-300 rounded-lg px-3 py-2"
    placeholder={isEditing ? "Dejar vacío para no cambiarla" : "••••••••"}
    required={!isEditing}
  />
  {isEditing && (
    <p className="text-xs text-gray-500 mt-1">
      Si no deseas cambiar la contraseña, deja este campo vacío.
    </p>
  )}
</div>

            {/* Rol */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                required
                disabled={isSaving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Área */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Área/Departamento</label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                disabled={isSaving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Activo */}
            <div className="flex items-center mb-6">
              <input
                id="activo"
                name="activo"
                type="checkbox"
                checked={formData.activo}
                onChange={handleChange}
                disabled={isSaving}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 text-sm text-gray-900">Usuario Activo</label>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg"
              >
                {isEditing ? "Guardar Cambios" : "Crear Usuario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
