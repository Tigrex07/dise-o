import React, { useState } from "react";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim()) {
      setError("Introduce tu nombre completo");
      return;
    }
    if (!validateEmail(email)) {
      setError("Introduce un correo institucional válido");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      // Aquí conectas con tu backend (PHP/MySQL o API)
      await new Promise((r) => setTimeout(r, 600));
      alert(`✅ Usuario registrado: ${email}`);
    } catch {
      setError("Error al registrar. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* LEFT: Formulario */}
          <div className="px-6">
            <header className="mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  WT
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold leading-tight">Work Orders Tracker</h1>
                  <p className="text-lg text-gray-600 mt-1">
                    Registro profesional para acceso al sistema de órdenes de trabajo
                  </p>
                </div>
              </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {error && (
                <div
                  role="alert"
                  className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-2 rounded-md"
                >
                  {error}
                </div>
              )}

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Nombre completo</span>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="mt-3 block w-full rounded-xl border border-gray-300 px-5 py-4 bg-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Correo institucional</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="mt-3 block w-full rounded-xl border border-gray-300 px-5 py-4 bg-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Contraseña</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="mt-3 block w-full rounded-xl border border-gray-300 px-5 py-4 bg-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Confirmar contraseña</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="mt-3 block w-full rounded-xl border border-gray-300 px-5 py-4 bg-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                  required
                />
              </label>

              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold shadow-sm flex items-center justify-center gap-3 transition"
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "Registrarse"}
                </button>
              </div>

              <div className="pt-2 text-xs text-gray-400">
                El registro requiere correo institucional válido.
              </div>
            </form>
          </div>

          {/* RIGHT: Panel informativo */}
          <div className="px-6">
            <div className="rounded-xl border border-gray-100 p-8 bg-white h-full">
              <div className="rounded-lg p-6 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm border border-blue-100">
                <h3 className="text-2xl font-semibold mb-4 text-slate-800">Beneficios del registro</h3>

                <ul className="list-disc list-inside text-base text-slate-700 space-y-3 mb-6">
                  <li>Acceso seguro y personalizado</li>
                  <li>Gestión de órdenes de trabajo</li>
                  <li>Historial y trazabilidad completa</li>
                </ul>

                <hr className="my-6 border-t border-blue-200" />

                <div className="text-base text-slate-700 p-4 rounded-lg bg-gradient-to-br from-blue-100 via-blue-50 to-white border border-blue-100 shadow-sm">
                  <div className="font-medium text-slate-800">Requisitos</div>
                  <div className="mt-2 text-sm text-slate-700">
                    El registro requiere correo institucional. Para altas especiales, contacta al administrador de planta.
                  </div>
                </div>

                <div className="mt-8 text-sm text-slate-500">
                  Plataforma diseñada para operaciones de maquila: profesional, intuitiva y segura.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}