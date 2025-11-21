using System;
using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.Models
{
    // Tabla: Revision
    public class Revision
    {
        // IdRevision (PK)
        [Key]
        public int IdRevision { get; set; }

        // IdSolicitud (FK)
        public int IdSolicitud { get; set; }
        public Solicitud Solicitud { get; set; } = default!; // Propiedad de navegación

        // IdRevisor (FK) - El usuario que revisa y asigna prioridad
        public int IdRevisor { get; set; }
        public Usuario Revisor { get; set; } = default!; // Propiedad de navegación

        public DateTime FechaRevision { get; set; }
        // Campos de revisión
        public string NivelUrgencia { get; set; } = "Media"; // Baja / Media / Alta / Crítica
        public string EstadoRevision { get; set; } = "Pendiente"; // Aprobada / Devuelta / Requiere más info
        public string Comentarios { get; set; } = string.Empty;
        public DateTime FechaHoraRevision { get; set; }
    }
}