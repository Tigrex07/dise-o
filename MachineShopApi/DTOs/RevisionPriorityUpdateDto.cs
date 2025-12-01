// RevisionPriorityUpdateDto.cs

using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.DTOs
{
    public class RevisionPriorityUpdateDto
    {
        [Required]
        // Se asume que la prioridad es una cadena ("Baja", "Media", "Alta", etc.)
        public string NuevaPrioridad { get; set; }
    }
}