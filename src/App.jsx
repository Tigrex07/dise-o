import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext"; 
import Login from "./Login"; 
import Sidebar from "./Sidebar"; 
import Dashboard from "./Dashboard"; 
import Usuarios from "./Usuarios"; 

function SettingsPage() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800">Configuración</h2>
      <p className="mt-2 text-gray-600">Página en construcción.</p>
    </div>
  );
}

function ReportesPage() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800">Reportes</h2>
      <p className="mt-2 text-gray-600">Página en construcción.</p>
    </div>
  );
}

export default function App() {
  const { user, logout, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard"); 

  useEffect(() => {
    if (isAuthenticated && currentPage !== "dashboard") {
      setCurrentPage("dashboard");
    }
  }, [isAuthenticated, currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "gestion-usuarios":
        if (user?.rol === "Admin IT") {
          return <Usuarios />;
        }
        return <ReportesPage />;
      case "reportes":
        return <ReportesPage />;
      case "configuracion":
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  // 🔑 Aquí está la condición correcta
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Login /> 
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user} 
        logout={logout} 
      />

      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-semibold text-gray-800">
            Bienvenido, {user?.nombre?.split(' ')[0] || 'Usuario'}!
          </h1>
          <p className="text-sm text-indigo-600 font-medium">
            Panel de Control: {user?.rol || 'Sin rol'} en {user?.area || 'Sin área'}
          </p>
        </header>

        <section className="bg-white rounded-xl shadow-lg p-6 min-h-[80vh]">
          {renderPage()}
        </section>
      </main>
    </div>
  );
}
