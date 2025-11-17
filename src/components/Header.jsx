import React from "react";
import NotificacionesPanel from "./NotificacionesPanel";

function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-slate-100 shadow-md">
      <h1 className="text-xl font-bold text-slate-700">Machine Shop</h1>
      <div className="flex items-center gap-6">
        <nav>
          <ul className="flex gap-6 text-slate-600 font-medium">
            <li className="hover:text-blue-600 cursor-pointer">Inicio</li>
            <li className="hover:text-blue-600 cursor-pointer">Productos</li>
            <li className="hover:text-blue-600 cursor-pointer">Requerimientos</li>
            <li className="hover:text-blue-600 cursor-pointer">Acerca de</li>
          </ul>
        </nav>
        <NotificacionesPanel />
      </div>
    </header>
  );
}

export default Header;