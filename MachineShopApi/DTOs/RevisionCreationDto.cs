using System;
using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.DTOs
{
    // DTO usado para crear un nuevo registro de Revisión (POST)
    public class RevisionCreationDto
    {
        [Required(ErrorMessage = "El ID de la solicitud es obligatorio.")]
        public int IdSolicitud { get; set; }

        [Required(ErrorMessage = "El ID del revisor es obligatorio.")]
        public int IdRevisor { get; set; }

        // 🚨 CRÍTICO: Usar Prioridad en lugar de NivelUrgencia
        [Required(ErrorMessage = "La prioridad es obligatoria.")]
        [MaxLength(20)]
        public string Prioridad { get; set; } = string.Empty;

        public string? Comentarios { get; set; }
    }
}