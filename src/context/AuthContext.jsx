import React, { createContext, useContext, useState, useEffect } from 'react';
// La URL Base se mantiene por si se necesita para el envío POST
import API_BASE_URL from '../components/apiConfig'; 

// 🚨 ID FIJO PARA SIMULACIÓN: Modifique este valor para cambiar el usuario de prueba.
const FIXED_USER_ID = 4; 

// 1. Crear el Contexto
const AuthContext = createContext(null);

// 2. Endpoint para obtener datos del usuario por ID (Asumiendo GET /Usuarios/{id})
// Usando la convención corregida de URLs (API_BASE_URL ya contiene el /api)
const API_USER_BY_ID_URL = `${API_BASE_URL}/Usuarios/${FIXED_USER_ID}`; 

// Definición del estado de usuario por defecto
const defaultUser = {
    id: null,
    nombre: 'Invitado',
    rol: 'GUEST',
    area: null
};

// Hook principal que proporciona el contexto
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(defaultUser);
    const [loading, setLoading] = useState(true);

    // El usuario está autenticado si tiene un ID
    const isAuthenticated = user.id !== null;

    // --------------------------------------------------------------------------
    // 3. LÓGICA DE SIMULACIÓN DE LOGIN (useEffect)
    // --------------------------------------------------------------------------
    useEffect(() => {
        const loadFixedUser = async () => {
            setLoading(true);
            try {
                // ⚠️ Nota: Si su API exige un token incluso para esta prueba, 
                // deberá añadir un token de prueba fijo en el header.
                const response = await fetch(API_USER_BY_ID_URL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // Si se necesita token, descomentar: 'Authorization': `Bearer TU_TOKEN_FIJO`,
                    },
                });

                if (!response.ok) {
                    const errorMsg = `Fallo al obtener el usuario ID ${FIXED_USER_ID}: ${response.status}`;
                    console.error(errorMsg);
                    throw new Error(errorMsg);
                }

                const data = await response.json();

                // 4. Mapear el DTO de la API (Asumiendo propiedades como 'id' o 'idUsuario')
                setUser({
                    // Usamos el ID del backend, o el ID fijo como fallback
                    id: data.idUsuario || data.id || FIXED_USER_ID, 
                    nombre: data.nombre, 
                    rol: data.rol,
                    area: data.area || null // El área podría ser nula
                });
                
                console.log(`Simulación de login exitosa: Usuario ID ${FIXED_USER_ID} cargado.`);

            } catch (error) {
                console.error('Error al simular login con ID fijo, usando datos de emergencia:', error.message);
                // Fallback: Si la API falla, usar un usuario de prueba en el frontend
                setUser({ 
                    id: FIXED_USER_ID, 
                    nombre: 'Usuario DEBUG', 
                    rol: 'DEBUG', 
                    area: 'DEBUG' 
                });
            } finally {
                setLoading(false);
            }
        };

        loadFixedUser();
        
    }, []); // Se ejecuta solo una vez al montar

    // Se mantienen los stubs de login/logout para evitar errores en otros componentes.
    const handleLogin = () => {
        console.warn("handleLogin deshabilitado: Usando ID fijo 1 para pruebas.");
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setUser(defaultUser);
        console.log("Sesión cerrada. El contexto regresa al estado inicial.");
    };

    const contextValue = {
        user,
        isAuthenticated,
        loading,
        // Exponemos el ID fijo por si se necesita en algún componente
        FIXED_USER_ID, 
        login: handleLogin,
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
    // 5. Usar useContext en los componentes
    return useContext(AuthContext);
};