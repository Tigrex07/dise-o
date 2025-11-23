using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MachineShopApi.Models
{
    // Representa un registro de operación o estado en el historial de una solicitud
    public class EstadoTrabajo
    {
        [Key]
        [Column("IdEstado")]
        public int Id { get; set; }

        // Clave Foránea a la Solicitud (Relación N:1)
        public int IdSolicitud { get; set; }

        // Clave Foránea al Maquinista/Operador
        public int IdMaquinista { get; set; }

        // 🚨 CAMBIO: Nombre ajustado a FechaYHoraDeInicio
        public DateTime FechaYHoraDeInicio { get; set; }

        // 💡 NUEVO: Fecha de finalización (nullable)
        public DateTime? FechaYHoraDeFin { get; set; }

        [MaxLength(50)]
        public string MaquinaAsignada { get; set; } = string.Empty;

        // 💡 NUEVO: Describe la operación o el estado actual ('En Revisión', 'En Fresadora 2', etc.)
        [MaxLength(100)]
        public string DescripcionOperacion { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10, 2)")]
        public decimal TiempoMaquina { get; set; }

        public string? Observaciones { get; set; }

        // ===================================================
        // Propiedades de Navegación
        // ===================================================

        // Relación N:1 con Solicitud
        [ForeignKey("IdSolicitud")]
        public Solicitud Solicitud { get; set; } = default!;

        // Relación N:1 con Usuario (el Maquinista)
        [ForeignKey("IdMaquinista")]
        public Usuario Maquinista { get; set; } = default!;
    }
}