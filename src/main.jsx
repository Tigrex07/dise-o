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



// 2. Importa el CSS global
import './index.css';

// 3. Define las rutas de la aplicación
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // Componente que provee la Sidebar
    children: [
      {
        index: true,
        element: <Dashboard />, // La vista principal
      },
      {
        path: "login",
        element: <Login />, // Mock visual de login
      },
      {
        path: "solicitar",
        element: <SolicitudForm />, // Formulario de Producción / Orden
      },
      {
        path: "trabajo/mis-asignaciones", // RUTA ESTÁTICA — debe ir antes de la dinámica
        element: <MisAsignaciones />,
      },
      {
        path: "trabajo/:id",
        element: <TrabajoDetail />, // Revisión y Trabajo (detalle)
      },
      {
        path: "revision-calidad/:id",
        element: <CalidadReview />, // Revisión de Calidad
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
    <RouterProvider router={router} />
  </StrictMode>,
);