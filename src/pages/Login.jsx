import React, { useState, useEffect } from "react";
import { 
  User, 
  XCircle, 
  // 🚨 CORREGIDO: UserCheck estaba faltando en la importación en la versión real
  UserCheck, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff // Para alternar la visibilidad de la contraseña
} from 'lucide-react'; 
import API_BASE_URL from '../components/apiConfig'; 
import { useAuth } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";


// Define la URL del endpoint de Login
const API_LOGIN_URL = `${API_BASE_URL}/auth/login`; 

export default function Login() {
  const { login, isAuthenticated } = useAuth(); // 👈 junta login e isAuthenticated aquí
  const navigate = useNavigate();

  // Estados
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // Estado para el mensaje de éxito

  // ✅ Limpia mensajes si no hay sesión
  useEffect(() => {
    if (!isAuthenticated) {
      setSuccess(false);
      setError("");
    }
  }, [isAuthenticated]);

  // ✅ Redirige si ya hay sesión
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // 👈 manda al dashboard
    }
  }, [isAuthenticated, navigate]);

  // Función de validación de correo simple
  const validateEmail = (v) => /^[^@]+@[^@]+\.[^@]+$/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateEmail(email)) {
        setError("Introduce un correo institucional válido.");
        return;
    }
    if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    setLoading(true);

    try {
        const response = await fetch(API_LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            // Si la respuesta no es 200 OK, intenta leer el mensaje de error del servidor
            const errorData = await response.json();
            const message = errorData.message || "Credenciales inválidas o error de conexión.";
            throw new Error(message);
        }

       // Si es exitoso
const data = await response.json();
login(data); // 👈 Pasamos el objeto completo { token, user }; // Guarda el token/usuario
setSuccess(true);

// ✅ Ya no navegamos manualmente, App.jsx detecta el user y muestra Dashboard


    } catch (err) {
        console.error("Login Error:", err);
        setError(err.message || "Error al conectar con el servidor. Intenta de nuevo.");
        setLoading(false); // Detener la carga solo en caso de error
    } finally {
        // Detener loading solo si no fue un éxito (porque la redirección se encarga del éxito)
        if (!success) {
            setLoading(false);
        }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-5xl w-full rounded-2xl shadow-2xl overflow-hidden bg-white">

        {/* Columna de Bienvenida / Beneficios */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 md:p-12">
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

                <div className="mt-8 text-center text-sm text-gray-500">
                  <p>© 2025 | Tigrex Team</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Columna de Formulario de Login */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-indigo-700">Molds Tracker</h1>
              <p className="text-lg text-gray-600 mt-2">Acceso al Sistema de Producción</p>
            </div>

            {/* Mensajes de Estado (Error, Éxito, Carga) */}
            {error && (
              <div className="flex items-center p-4 mb-6 text-sm text-red-800 rounded-xl bg-red-50 border border-red-200" role="alert">
                <AlertCircle className="flex-shrink-0 inline w-5 h-5 mr-3" />
                <span className="sr-only">Error</span>
                <div>
                  <span className="font-medium">Error de acceso:</span> {error}
                </div>
              </div>
            )}

            {success && (
              <div className="flex items-center p-4 mb-6 text-sm text-green-800 rounded-xl bg-green-50 border border-green-200" role="alert">
                {/* 🚨 Esta es la línea que causaba el error si UserCheck no estaba importado */}
                <UserCheck className="flex-shrink-0 inline w-5 h-5 mr-3" /> 
                <span className="sr-only">Éxito</span>
                <div>
                  <span className="font-medium">Acceso exitoso!</span> Redirigiendo...
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de Correo */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Institucional
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || success}
                    className={`w-full pr-10 pl-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none transition ${
                      error && !validateEmail(email) ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                    placeholder="ejemplo@planta.com"
                  />
                  <User size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Campo de Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || success}
                    className={`w-full pl-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none transition ${
                      error && password.length < 6 ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    disabled={loading || success}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-indigo-600 transition"
                    aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Checkbox y Enlace */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    disabled={loading || success}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition" onClick={(e) => e.preventDefault()}>
                  
                  </a>
                </div>
              </div>

              {/* Botón de Login */}
              <div>
                <button
                  type="submit"
                  disabled={loading || success}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-base font-semibold text-white transition duration-200 ${
                    loading || success
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {success && <UserCheck className="mr-2 h-5 w-5" />}
                  {loading ? 'Accediendo...' : success ? 'Éxito' : 'Iniciar Sesión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}