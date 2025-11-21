using System.ComponentModel.DataAnnotations;
using System;

namespace MachineShopApi.DTOs
{
    // DTO usado para actualizar el estado, prioridad o notas de una solicitud (PUT/PATCH)
    public class SolicitudRevisionDto
    {
        // La prioridad puede ser actualizada por Ingeniería o Administración.
        [Required(ErrorMessage = "La prioridad es obligatoria.")]
        public string Prioridad { get; set; } = string.Empty;

        // El estado es lo más importante a actualizar.
        [Required(ErrorMessage = "El estado actual es obligatorio.")]
        public string EstadoActual { get; set; } = string.Empty;

        // Campo para notas de revisión, opcional.
        public string? NotasRevision { get; set; } 
        
        // NOTA: Puedes añadir un campo 'RevisorId' si quieres rastrear quién hizo la última revisión.
        // public int? RevisorId { get; set; } 
    }
}