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
import Tipos from './pages/Tipos.jsx';
import Prioridades from './pages/Prioridades.jsx';
import Maquinas from './pages/Maquinas.jsx';
import Areas from './pages/Areas.jsx';
import Piezas from './pages/Piezas.jsx';

// 🚨 Protección por rol
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// 🚨 Contexto de autenticación
import { AuthProvider } from './context/AuthContext';

// 2. CSS global
import './index.css';

// 3. Rutas protegidas por rol
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "login", element: <Login /> },
      { path: "solicitar", element: <SolicitudForm /> },

      {
        path: "trabajo/mis-asignaciones",
        element: (
          <ProtectedRoute allowedRoles={["Operador", "Maquinista", "Admin IT"]}>
            <MisAsignaciones />
          </ProtectedRoute>
        ),
      },
      {
  path: "trabajo/:id",
  element: (
    <ProtectedRoute allowedRoles={["Admin IT", "Ingeniero", "Supervisor", "Operador", "Maquinista"]}>
      <TrabajoDetail />
    </ProtectedRoute>
  ),
},
      {
        path: "revision-calidad/:id",
        element: (
          <ProtectedRoute allowedRoles={["Admin IT", "Ingeniero", "Supervisor"]}>
            <CalidadReview />
          </ProtectedRoute>
        ),
      },
      {
        path: "reportes",
        element: (
          <ProtectedRoute allowedRoles={["Admin IT", "Ingeniero", "Supervisor"]}>
            <Reportes />
          </ProtectedRoute>
        ),
      },
      {
        path: "usuarios",
        element: (
          <ProtectedRoute allowedRoles={["Admin IT"]}>
            <Usuarios />
          </ProtectedRoute>
        ),
      },
      {
        path: "configuracion",
        element: (
          <ProtectedRoute allowedRoles={["Admin IT"]}>
            <Configuracion />
          </ProtectedRoute>
        ),
      },
      {
        path: "revision",
        element: (
          <ProtectedRoute allowedRoles={["Admin IT", "Ingeniero", "Supervisor"]}>
            <Revision />
          </ProtectedRoute>
        ),
      },
    
      {
        path: "configuracion/tipos",
        element: (
          <ProtectedRoute allowedRoles={["Admin IT"]}>
            <Tipos />
          </ProtectedRoute>
        ),
      },
      {
        path: "configuracion/prioridades",
        element: (
          <ProtectedRoute allowedRoles={["Admin IT"]}>
            <Prioridades />
          </ProtectedRoute>
        ),
      },
      {
        path: "configuracion/maquinas",
        element: (
          <ProtectedRoute allowedRoles={["Admin IT"]}>
            <Maquinas />
          </ProtectedRoute>
        ),
      },
      {
        path: "configuracion/areas",
        element: (
          <ProtectedRoute allowedRoles={["Admin IT"]}>
            <Areas />
          </ProtectedRoute>
        ),
      },
      {
        path: "configuracion/piezas",
        element: (
          <ProtectedRoute allowedRoles={["Admin IT"]}>
            <Piezas />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

// 4. Renderiza la aplicación
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);  
