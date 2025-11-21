using System.ComponentModel.DataAnnotations;
using System;

namespace MachineShopApi.DTOs
{
    public class EstadoTrabajoCreationDto
    {
        [Required]
        public int IdSolicitud { get; set; } // Solicitud que va a empezar a trabajarse

        [Required]
        public int IdMaquinista { get; set; } // Usuario que inicia el trabajo

        [Required]
        [MaxLength(50)]
        public string MaquinaAsignada { get; set; } = string.Empty;// Ej: CNC1, Torno C

        [MaxLength(500)]
        public string Observaciones { get; set; } = string.Empty;

        // La FechaYHoraDeInicio se genera con DateTime.Now en el controlador.
        // El TiempoMaquina se inicializa en 0 o se actualiza en un PATCH/PUT posterior de "Finalización".
    }
}