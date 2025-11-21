using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.DTOs
{
    public class AreaCreationDto
    {
        [Required]
        [MaxLength(100)]
        public string NombreArea { get; set; } = string.Empty;

        // FK al Usuario (Responsable)
        public int ResponsableAreaId { get; set; }
    }
}