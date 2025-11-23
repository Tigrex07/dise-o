using System;
using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.DTOs
{
    // DTO usado para enviar la solicitud al cliente (GET - Lista y Detalle)
    public class SolicitudDto
    {
        public int Id { get; set; }

        // --- Datos Desnormalizados (nombres de las FKs) ---
        public string SolicitanteNombre { get; set; } = string.Empty;
        public string PiezaNombre { get; set; } = string.Empty;

        // --- Datos Directos del Modelo Solicitud ---
        public DateTime FechaYHora { get; set; }
        public string Turno { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public string Detalles { get; set; } = string.Empty;
        public string Dibujo { get; set; } = string.Empty;

        // 🚨 ELIMINADAS: Ya no existen en el modelo Solicitud.
        // public string Prioridad { get; set; } = string.Empty; 
        // public string EstadoActual { get; set; } = string.Empty; 

        // --- Propiedades Derivadas (del nuevo esquema 1:N) ---
        // Estos campos son calculados por el controlador a partir del historial (Revision y EstadoTrabajo)

        /// <summary>
        /// Viene de Revision.Prioridad (Baja/Media/Alta).
        /// </summary>
        public string PrioridadActual { get; set; } = "N/A";

        /// <summary>
        /// Viene del ÚLTIMO EstadoTrabajo.DescripcionOperacion.
        /// </summary>
        public string EstadoOperacional { get; set; } = "N/A";

        /// <summary>
        /// Viene del maquinista asociado al ÚLTIMO EstadoTrabajo.
        /// </summary>
        public string MaquinistaAsignado { get; set; } = "N/A";

        /// <summary>
        /// Tiempo total de máquina empleado en todas las operaciones terminadas.
        /// </summary>
        public decimal? TiempoTotalMaquina { get; set; }
    }
}