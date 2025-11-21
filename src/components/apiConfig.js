// apiConfig.js
// Este archivo centraliza la URL base del API para evitar tener que modificarla
// en múltiples lugares del código.

// URL base de tu API.
// Asegúrate de que el protocolo (http/https) y el puerto sean correctos.
// Ejemplo para el endpoint de Solicitudes: https://localhost:7000/api/Solicitudes
const API_BASE_URL = 'http://localhost:5145/api';

// Exportamos la constante para que pueda ser utilizada en otros componentes.
export default API_BASE_URL;