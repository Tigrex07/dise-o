import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// 1. Importa el Layout y las Vistas
import MainLayout from './MainLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SolicitudForm from './pages/SolicitudForm.jsx';
import TrabajoDetail from './pages/TrabajoDetail.jsx';
import CalidadReview from './pages/CalidadReview.jsx';
import MisAsignaciones from './pages/MisAsignaciones.jsx';
import Reportes from './pages/Reportes.jsx';
import Usuarios from './pages/Usuarios.jsx';
import Login from './pages/Login.jsx';
import Configuracion from './pages/Configuracion.jsx';
import Revision from './pages/Revision.jsx';
import Historial from './pages/historial';
import Registro from './pages/Registro.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Tipos from './pages/Tipos.jsx';
import Prioridades from './pages/Prioridades.jsx';
import Maquinas from './pages/Maquinas.jsx';
import Areas from './pages/Areas.jsx';
import Notificaciones from './pages/Notificaciones.jsx';
import Piezas from './pages/Piezas.jsx';

// 🚨 CAMBIO 1: Importar el AuthProvider 🚨
import { AuthProvider } from './context/AuthContext'; // 👈 Ajusta la ruta si es necesario

// 2. Importa el CSS global
import './index.css';

// 3. Define las rutas de la aplicación
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "login", element: <Login /> },
      { path: "registro", element: <Registro /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "solicitar", element: <SolicitudForm /> },
      { path: "trabajo/mis-asignaciones", element: <MisAsignaciones /> },
      { path: "trabajo/:id", element: <TrabajoDetail /> },
      { path: "revision-calidad/:id", element: <CalidadReview /> },
      { path: "reportes", element: <Reportes /> },
      { path: "usuarios", element: <Usuarios /> },
      { path: "configuracion", element: <Configuracion /> },
      { path: "revision", element: <Revision /> },
      { path: "historial", element: <Historial /> },
      { path: "configuracion/tipos", element: <Tipos /> },
{ path: "configuracion/prioridades", element: <Prioridades /> },
{ path: "configuracion/maquinas", element: <Maquinas /> },
{ path: "configuracion/areas", element: <Areas /> },
{ path: "notificaciones", element: <Notificaciones /> },
{ path: "notificaciones", element: <Notificaciones /> },
{ path: "configuracion/piezas", element: <Piezas /> },

    ],
  },
]);

// 4. Renderiza la aplicación con el router
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 🚨 CAMBIO 2: Envolver el RouterProvider con el AuthProvider 🚨 */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
