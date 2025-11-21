using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.DTOs
{
    // Usamos el mismo DTO, pero lo separamos para claridad si se necesita una versión diferente después
    public class AreaUpdateDto
    {
        [Required]
        [MaxLength(100)]
        public string NombreArea { get; set; } = string.Empty;

        // FK al Usuario (Responsable)
        public int ResponsableAreaId { get; set; }
    }
}