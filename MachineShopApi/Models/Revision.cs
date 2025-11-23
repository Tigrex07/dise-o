using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MachineShopApi.Models
{
    // Representa la revisión de ingeniería sobre una solicitud
    public class Revision
    {
        [Key]
        [Column("IdRevision")]
        public int Id { get; set; }

        // Clave Foránea a la Solicitud (Relación 1:1)
        public int IdSolicitud { get; set; }

        // Clave Foránea al Revisor
        public int IdRevisor { get; set; }

        // 🚨 CAMBIO: NivelUrgencia renombrado a Prioridad
        [MaxLength(20)]
        public string Prioridad { get; set; } = string.Empty;

        // 🚨 ELIMINADA: EstadoRevision
        // public string EstadoRevision { get; set; } = string.Empty;

        public string? Comentarios { get; set; }

        // 🚨 CAMBIO: FechaHoraRevision renombrado a FechaHoraRevision
        public DateTime FechaHoraRevision { get; set; }

        // ===================================================
        // Propiedades de Navegación
        // ===================================================

        // Relación 1:1 con Solicitud
        [ForeignKey("IdSolicitud")]
        public Solicitud Solicitud { get; set; } = default!;

        // Relación N:1 con Usuario (el Revisor)
        [ForeignKey("IdRevisor")]
        public Usuario Revisor { get; set; } = default!;
    }
}