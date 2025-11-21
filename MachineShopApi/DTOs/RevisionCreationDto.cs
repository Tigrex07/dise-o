using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.DTOs
{
    public class RevisionCreationDto
    {
        // 1. Identificadores
        [Required]
        public int IdSolicitud { get; set; } // La solicitud que se está revisando

        [Required]
        public int IdRevisor { get; set; } // Quién está haciendo la revisión (Usuario ID)

        // 2. Resultado de la revisión
        [Required]
        [MaxLength(20)]
        public string NivelUrgencia { get; set; } = string.Empty;// Ej: Baja, Media, Alta, Crítica

        [Required]
        [MaxLength(50)]
        public string EstadoRevision { get; set; } = string.Empty;// Ej: Aprobada, Devuelta, Requiere más info

        [MaxLength(500)]
        public string Comentarios { get; set; } = string.Empty;

        // La FechaHoraRevision la genera el controlador con DateTime.Now
    }
}