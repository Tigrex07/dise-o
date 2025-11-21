using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using MachineShopApi.Data;
using MachineShopApi.DTOs;

namespace MachineShopApi.DTOs
{
    // DTO usado para recibir datos de una nueva solicitud desde el cliente (POST)
    public class SolicitudCreationDto
    {
        // El ID se excluye

        // Claves Foráneas necesarias para crear las relaciones en la DB
        [Required(ErrorMessage = "El ID del solicitante es obligatorio.")]
        public int SolicitanteId { get; set; }

        [Required(ErrorMessage = "El ID de la pieza es obligatorio.")]
        public int IdPieza { get; set; }

        // Datos de la Solicitud
        // La FechaYHora se puede manejar en el servidor, pero si el cliente la envia:
        // [Required(ErrorMessage = "La fecha y hora son obligatorias.")]
        // public DateTime FechaYHora { get; set; }

        [Required(ErrorMessage = "El turno es obligatorio.")]
        [MaxLength(10)]
        public string Turno { get; set; } = string.Empty;

        [Required(ErrorMessage = "El tipo de solicitud es obligatorio.")]
        [MaxLength(50)]
        public string Tipo { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los detalles son obligatorios.")]
        public string Detalles { get; set; } = string.Empty;

        // El dibujo puede ser opcional
        

        [Required(ErrorMessage = "La prioridad es obligatoria.")]
        [MaxLength(50)]
        public string Prioridad { get; set; } = string.Empty;

        // NOTA: EstadoActual (Ej: 'Pendiente') y FechaYHora (DateTime.Now) 
        // se deben establecer en el servidor, no en el cliente.
    }
}