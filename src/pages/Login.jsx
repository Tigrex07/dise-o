import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Introduce un correo institucional válido");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      // Cuando integres backend, reemplaza esto por la llamada real.
      await new Promise((r) => setTimeout(r, 600));
      // navegación o manejo de sesión irá aquí
    } catch {
      setError("Error al iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* LEFT: Form */}
          <div className="px-6">
            <header className="mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  WT
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold leading-tight">Work Orders Tracker</h1>
                  <p className="text-lg text-gray-600 mt-1">
                    Acceso profesional para la gestión y seguimiento de órdenes de trabajo
                  </p>
                </div>
              </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {error && (
                <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-2 rounded-md">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Correo institucional</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="mt-3 block w-full rounded-xl border border-gray-300 px-5 py-4 bg-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                  required
                  aria-required="true"
                />
              </label>

              <label className="block relative">
                <span className="text-sm font-medium text-gray-700">Contraseña</span>
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="mt-3 block w-full rounded-xl border border-gray-300 px-5 py-4 bg-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-16 placeholder-gray-400"
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPw ? "Ocultar" : "Mostrar"}
                </button>
              </label>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-5 w-5 text-blue-600 rounded"
                  />
                  <span>Recordarme</span>
                </label>

                <Link to="/reset-password" className="text-sm text-blue-600 hover:underline">
      ¿Olvidaste tu contraseña?
    </Link>
  </div>


              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold shadow-sm flex items-center justify-center gap-3 transition"
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "Iniciar sesión"}
                </button>
              </div>

              <div className="pt-2 text-xs text-gray-400">
                Acceso autorizado exclusivamente con correo institucional.
              </div>
            </form>
          </div>

          {/* RIGHT: Blue pastel panel (solo el cuadro azul) */}
          <div className="px-6">
            <div className="rounded-xl border border-gray-100 p-8 bg-white h-full">
              <div className="rounded-lg p-6 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm border border-blue-100">
                <h3 className="text-2xl font-semibold mb-4 text-slate-800">Beneficios</h3>

                <ul className="list-disc list-inside text-base text-slate-700 space-y-3 mb-6">
                  <li>Asignación y balance de carga por persona</li>
                  <li>Trazabilidad completa de cada orden</li>
                  <li>Reportes operativos y métricas de ciclo</li>
                </ul>

                <hr className="my-6 border-t border-blue-200" />

                
<div className="text-base text-slate-700 p-4 rounded-lg bg-gradient-to-br from-blue-100 via-blue-50 to-white border border-blue-100 shadow-sm">
  <div className="font-medium text-slate-800">Acceso</div>
  <div className="mt-2 text-sm text-slate-700">
    Ingresa con tu correo institucional. Para altas o permisos, contacta al administrador de planta.
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