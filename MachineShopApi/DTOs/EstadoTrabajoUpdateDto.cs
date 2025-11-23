using System;
using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.DTOs
{
    // DTO usado para finalizar o actualizar un registro de EstadoTrabajo existente
    public class EstadoTrabajoUpdateDto
    {
        // El único campo que puede necesitar actualización al finalizar, aparte de la hora, es Observaciones.
        // La hora de fin y el tiempo se calculan en el servidor.
        public string? Observaciones { get; set; }

        // Puedes agregar campos adicionales si permites, por ejemplo, cambiar la MaquinaAsignada a posteriori.
    }
}