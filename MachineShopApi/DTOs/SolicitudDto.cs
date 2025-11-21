using System;
using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.DTOs
{
    // DTO usado para enviar la solicitud al cliente (GET - Lista y Detalle)
    public class SolicitudDto
    {
        public int Id { get; set; }

        // --- Datos Desnormalizados (nombres de las FKs) ---
        // Se obtienen mediante un JOIN/Include en el controlador
        public string SolicitanteNombre { get; set; } = string.Empty;
        public string PiezaNombre { get; set; } = string.Empty;

        // La Máquina ahora se infiere de la Pieza (asumimos que Pieza tiene un campo Maquina)
        // Si no, este campo se puede mantener como string si lo almacena la tabla Pieza.
        // Como el modelo Solicitud no tiene campo 'Maquina' directo, lo obtenemos de Pieza.
        // Si Pieza no tiene Maquina, puedes obtenerlo desde la relación Pieza.
        // Por ahora, asumiremos que el nombre de la Pieza es suficiente.

        // --- Datos Directos del Modelo Solicitud ---
        public DateTime FechaYHora { get; set; }
        public string Turno { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public string Detalles { get; set; } = string.Empty;
        public string Prioridad { get; set; } = string.Empty; // Ej: Baja, Media, Alta, Urgente
        public string EstadoActual { get; set; } = string.Empty; // Ej: Pendiente, En Revisión, Completado

        // --- Propiedades de Navegación Simplificadas ---
        // Exponemos las propiedades de las relaciones 1:1, pero simplificadas o a través de otro DTO.
        // Para simplificar, asumiremos que EstadoTrabajo y Revision se cargan en el controlador 
        // y se usan para poblar el EstadoActual y notas de revisión si son necesarias.
    }
}