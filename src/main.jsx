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
import Configuracion from './pages/Configuracion.jsx';

// 2. Importa el CSS global
import './index.css'; 

// 3. Define las rutas de la aplicación
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // Componente que provee la Sidebar
    children: [
      {
        path: "/",
        element: <Dashboard />, // La vista principal
      },
      {
        path: "solicitar",
        element: <SolicitudForm />, // Formulario de Producción
      },
      {
        path: "trabajo/:id",
        element: <TrabajoDetail />, // Revisión y Trabajo
      },
      {
        path: "revision-calidad/:id",
        element: <CalidadReview />, // Revisión de Calidad
      },
      // Puedes añadir más rutas aquí
      {
        path: "trabajo/mis-asignaciones", //  RUTA EXACTA DEL ENLACE DE SIDEBAR
        element: <MisAsignaciones />, //  NUEVO COMPONENTE
      },
      {
        path: "trabajo/:id", // Esta ruta sigue siendo para el detalle
        element: <TrabajoDetail />,
      },
      {
        path: "reportes", // 👈 Coincide con el 'to' del MainLayout
        element: <Reportes />, 
      },
      {
        path: "usuarios", // 👈 Coincide con el 'to' del MainLayout
        element: <Usuarios />, 
      },
      {
        path: "configuracion", // 👈 Coincide con el 'to' del MainLayout
        element: <Configuracion />, 
      },
    ],
  },
]);

// 4. Renderiza la aplicación con el router
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);