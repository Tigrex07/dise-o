using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MachineShopApi.Models
{
    public class Pieza
    {
        // Clave Primaria
        [Key]
        [Column("IdPieza")]
        public int Id { get; set; }

        // Clave Foránea a Área
        public int IdArea { get; set; }

        public string Máquina { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string NombrePieza { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Maquina { get; set; } = string.Empty; // Nombre o código de la máquina

        // Propiedad de Navegación 1: Área a la que pertenece
        [ForeignKey("IdArea")]
        public Area? Area { get; set; }

        // Propiedad de Navegación 2: Colección de Solicitudes que usan esta Pieza
        public ICollection<Solicitud> Solicitudes { get; set; } = new List<Solicitud>();
    }
}