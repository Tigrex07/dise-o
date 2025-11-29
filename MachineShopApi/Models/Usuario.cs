using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MachineShopApi.Models
{
    public class Usuario
    {
        // 🚨 SOLUCIÓN: Definición explícita de la Clave Primaria (IdUsuario)
        [Key]
        [Column("IdUsuario")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty; // Nuevo

        [Required]
        public string PasswordHash { get; set; } = string.Empty; // Nuevo
        [Required]
        [MaxLength(50)]
        public string Area { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Rol { get; set; } = string.Empty; // Operador / Supervisor / Machine Shop

        public bool Activo { get; set; } // Si/No

        // Propiedades de Navegación (Relaciones)

        // Colección de Áreas donde este usuario es el Responsable (Relación 1 a Muchos)
        // La FK está definida en la clase Area: ResponsableAreaId
        public ICollection<Area> AreasResponsables { get; set; } = new List<Area>();

        // Colección de Solicitudes que este usuario ha realizado (Relación 1 a Muchos)
        // La FK está definida en la clase Solicitud: SolicitanteId
        public ICollection<Solicitud> SolicitudesRealizadas { get; set; } = new List<Solicitud>();

        // Colección de Revisiones que este usuario ha realizado (Relación 1 a Muchos)
        // La FK está definida en la clase Revision: IdRevisor
        public ICollection<Revision> RevisionesRealizadas { get; set; } = new List<Revision>();
    }
}
