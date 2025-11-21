using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MachineShopApi.Models
{
    public class Area
    {
        [Key]
        [Column("IdArea")]
        public int Id { get; set; } // Clave Primaria

        [Required]
        [MaxLength(100)]
        public string NombreArea { get; set; } = string.Empty;

        // FK para el responsable
        public int? ResponsableAreaId { get; set; }

        // Propiedad de Navegación 1: Responsable
        [ForeignKey("ResponsableAreaId")]
        public Usuario? ResponsableArea { get; set; }

        // ESTO FUE LO QUE FALTABA O ESTABA MAL
        public ICollection<Pieza> Piezas { get; set; } = new List<Pieza>(); // Colección de Piezas
    }
}