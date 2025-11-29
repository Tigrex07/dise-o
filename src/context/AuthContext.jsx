import React, { createContext, useContext, useState, useEffect } from 'react';
// IMPORTANTE: Asegúrate de tener un archivo apiConfig.js o similar para la URL base.

// 1. Crear el Contexto
const AuthContext = createContext(null);

// Valores iniciales (se leerán de localStorage)
const getInitialState = () => {
    // Leer el token primero (para saber si hay sesión activa)
    const token = localStorage.getItem('authToken');
    
    // Si hay token, intentar cargar los demás datos (el rol es clave)
    const user = {
        id: localStorage.getItem('userId') || null,
        nombre: localStorage.getItem('userName') || 'Invitado',
        rol: localStorage.getItem('userRole') || 'GUEST',
        area: localStorage.getItem('userArea') || null,
    };
    
    return { token, user, isAuthenticated: !!token };
};

// Hook principal que proporciona el contexto
export const AuthProvider = ({ children }) => {
    const initialState = getInitialState();

    const [authToken, setAuthToken] = useState(initialState.token);
    const [user, setUser] = useState(initialState.user);
    const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated);
    const [loading, setLoading] = useState(false); // No necesitamos 'loading' continuo sin la llamada fija.

    // --------------------------------------------------------------------------
    // 2. FUNCIÓN DE LOGIN REAL (Llamada desde Login.jsx)
    // --------------------------------------------------------------------------
    // Recibe el objeto 'data' del backend: { token, nombre, email, rol, ... }
const handleLogin = (data) => {
    // ⚠️ data viene como { token, user }
    const u = data.user;

    // Guardar en localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userId', u.id || u.email);
    localStorage.setItem('userName', u.nombre);
    localStorage.setItem('userRole', u.rol);
    localStorage.setItem('userArea', u.area || '');

    // Actualizar el estado del contexto
    setAuthToken(data.token);
    setUser({
        id: u.id || u.email,
        nombre: u.nombre,
        rol: u.rol,
        area: u.area || null,
    });
    setIsAuthenticated(true);

    console.log(`Login exitoso: Usuario ${u.nombre} con Rol ${u.rol} cargado.`);
};

    // --------------------------------------------------------------------------
    // 3. FUNCIÓN DE LOGOUT
    // --------------------------------------------------------------------------
    const handleLogout = () => {
        // Limpiar localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userArea');

        // Limpiar el estado
        setAuthToken(null);
       setUser(null); // 👈 Esto sí dispara el Login en App.jsx
        setIsAuthenticated(false);
    };

    // Usar useEffect para verificar la autenticación solo al inicio
    useEffect(() => {
        // Si hay token en el estado, se considera autenticado. 
        // No se requiere llamada a la API si ya cargamos de localStorage.
        setLoading(false); // Finalizamos la carga inicial
    }, []); 

    const contextValue = {
        user,
        isAuthenticated,
        loading,
        login: handleLogin, // 👈 Exponer la función de login real
        logout: handleLogout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
    return useContext(AuthContext);
};