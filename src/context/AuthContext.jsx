import React, { createContext, useContext, useState, useEffect } from 'react';
// La URL Base se mantiene por si se necesita para el envío POST
import API_BASE_URL from '../components/apiConfig'; 

// URL base para obtener los datos del usuario después del login
const API_USER_DATA_URL = `${API_BASE_URL}/api/usuarios/me`; 

// 1. Crear el Contexto
const AuthContext = createContext(null);

// Lógica auxiliar de conexión API (Mantengo la estructura para futuros usos)
const apiFetcher = async (url, token) => {
    // ... (cuerpo de la función fetcher se mantiene igual)
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error('Token inválido o expirado. Sesión no autorizada.');
    }
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
        throw new Error(`Fallo en la consulta de datos del usuario: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return response.json();
};

// --------------------------------------------------------------------------
// DEFINICIÓN DE CONTEXTO Y HOOK
// --------------------------------------------------------------------------

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

// Objeto por defecto para el usuario (si no hay sesión)
const defaultUser = {
    id: null,
    nombre: 'Invitado', 
    rol: 'OPERADOR', 
    area: null,
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(defaultUser);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = user && user.id !== null;

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        if (token) {
            const loadUser = async () => {
                try {
                    const data = await apiFetcher(API_USER_DATA_URL, token);
                    
                    setUser({ 
                        id: data.IdUsuario, 
                        nombre: data.Nombre, 
                        rol: data.Rol,
                        area: data.Area || null 
                    });
                    
                } catch (error) {
                    console.error('Fallo la validación del token:', error.message);
                    // Si el token falla, usamos el usuario de prueba
                    setUser({ id: 1, nombre: 'Usuario Fijo (ID 1)', rol: 'TEST', area: 'Pruebas' });
                } finally {
                    setLoading(false);
                }
            };
            loadUser();
        } else {
            // 🚨 CAMBIO AQUÍ: Si NO hay token, forzamos el ID 1 para fines de prueba 🚨
            setUser({ id: 1, nombre: 'Usuario Fijo (ID 1)', rol: 'TEST', area: 'Pruebas' });
            setLoading(false); 
        }
    }, []);

    // ... (handleLogin y handleLogout se mantienen igual)
    const handleLogin = (userData, authToken) => {
        localStorage.setItem('authToken', authToken); 
        setUser(userData); 
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setUser(defaultUser);
    };

    const contextValue = {
        user,
        isAuthenticated,
        loading,
        login: handleLogin,
        logout: handleLogout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};