using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace MachineShopApi.Models
{
    public class Pieza
    {
        [Key]
        [Column("IdPieza")]
        public int Id { get; set; }

        public int IdArea { get; set; }

        [Required]
        [MaxLength(100)]
        public string NombrePieza { get; set; } = string.Empty;

        // ✅ USAMOS SOLO ESTA: Se mapea correctamente a la columna "Maquina" de la BD.
        [Required]
        [MaxLength(50)]
        public string Maquina { get; set; } = string.Empty;

        // Propiedad de Navegación 1: Área a la que pertenece
        [ForeignKey("IdArea")]
        public Area? Area { get; set; }

        // Propiedad de Navegación 2: Colección de Solicitudes que usan esta Pieza
        public ICollection<Solicitud> Solicitudes { get; set; } = new List<Solicitud>();
    }
}