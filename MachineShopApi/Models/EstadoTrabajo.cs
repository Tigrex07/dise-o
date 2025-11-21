using System;
using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.Models
{
    // Tabla: EstadoTrabajo
    public class EstadoTrabajo
    {
        // IdEstado (PK)
        [Key]
        public int IdEstado { get; set; }

        // IdSolicitud (FK)
        public int IdSolicitud { get; set; }
        public Solicitud Solicitud { get; set; } = default!; // Propiedad de navegación

        // IdMaquinista (FK) - El usuario que toma la solicitud
        public int? IdMaquinista { get; set; } // Puede ser nulo si está en espera
        public Usuario? Maquinista { get; set; }

        public DateTime FechaYHoraInicio { get; set; }
        public string EstadoActual { get; set; } = string.Empty;

        // Campos de registro
        public DateTime FechaHoraInicio { get; set; }
        public string MaquinaAsignada { get; set; } = string.Empty;
        public TimeSpan? TiempoMaquina { get; set; } // Tiempo total de uso
        public string Observaciones { get; set; } = string.Empty;
    }
}