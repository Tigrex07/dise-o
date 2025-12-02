using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MachineShopApi.Models
{
        [Table("MaquinaMS")]
    public class MaquinaMS
    {
        


        // Nombre de la tabla en la base de datos: MaquinaMS
        
        
            // Clave Primaria (Id)
            [Key]
            [Column("Id")]
            public int Id { get; set; }

            // Nombre de la máquina (ej: 'Torno CNC #1', 'Fresadora Vertical')
            [Required]
            [MaxLength(100)]
            public string Nombre { get; set; } = string.Empty;

            // Opcional: Podrías añadir un campo para el estado (ej: 'Disponible', 'En Uso', 'Mantenimiento')
            // [MaxLength(50)]
            // public string? Estado { get; set; }
        }
    }


