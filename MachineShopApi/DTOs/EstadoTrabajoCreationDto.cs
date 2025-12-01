using System;
using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.DTOs
{
    // DTO usado para registrar el INICIO de un nuevo estado de trabajo (POST)
    public class EstadoTrabajoCreationDto
    {
        [Required(ErrorMessage = "El ID de la solicitud es obligatorio.")]
        public int IdSolicitud { get; set; }

        [Required(ErrorMessage = "El ID del maquinista es obligatorio.")]
        public int IdMaquinista { get; set; }

        public string Prioridad { get; set; }
        public string? TiemposRegistradosJson { get; set; }

        [Required(ErrorMessage = "La máquina asignada es obligatoria.")]
        [MaxLength(50)]
        public string MaquinaAsignada { get; set; } = string.Empty;

        [Required(ErrorMessage = "La descripción de la operación es obligatoria.")]
        [MaxLength(100)]
        public string DescripcionOperacion { get; set; } = string.Empty;

        public string? Observaciones { get; set; }
    }
}