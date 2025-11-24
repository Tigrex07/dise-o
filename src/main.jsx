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

// 🚨 CAMBIO 1: Importar el AuthProvider 🚨
import { AuthProvider } from './context/AuthContext'; // 👈 AJUSTA LA RUTA SI ES NECESARIO

// 2. Importa el CSS global
import './index.css';

// 3. Define las rutas de la aplicación (Se mantiene igual)
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, 
    children: [
      {
        index: true,
        element: <Dashboard />, 
      },
      {
        path: "login",
        element: <Login />, 
      },
      {
        path: "solicitar",
        element: <SolicitudForm />, // Ahora puede usar useAuth
      },
      {
        path: "trabajo/mis-asignaciones", 
        element: <MisAsignaciones />,
      },
      {
        path: "trabajo/:id",
        element: <TrabajoDetail />, 
      },
      {
        path: "revision-calidad/:id",
        element: <CalidadReview />, 
      },
      {
        path: "reportes",
        element: <Reportes />,
      },
      {
        path: "usuarios",
        element: <Usuarios />,
      },
      {
        path: "configuracion",
        element: <Configuracion />,
      },
      { path: "revision", element: <Revision /> },
      { path: 'historial', element: <Historial /> }
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