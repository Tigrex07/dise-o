using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.DTOs
{
    public class PiezaCreationDto
    {
        [Required]
        [MaxLength(100)]
        public string NombrePieza { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Maquina { get; set; } // Opcional o puede ser nulo en DB

        // FK al Área
        public int IdArea { get; set; }
    }
}