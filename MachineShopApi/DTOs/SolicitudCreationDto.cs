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

        [Required(ErrorMessage = "El turno es obligatorio.")]
        [MaxLength(10)]
        public string Turno { get; set; } = string.Empty;

        [Required(ErrorMessage = "El tipo de solicitud es obligatorio.")]
        [MaxLength(50)]
        public string Tipo { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los detalles son obligatorios.")]
        public string Detalles { get; set; } = string.Empty;

        // El dibujo puede ser opcional
        public string? Dibujo { get; set; }

        // 🚨 ELIMINADA: Prioridad (Ahora se define en Revision)
        // [Required(ErrorMessage = "La prioridad es obligatoria.")]
        // [MaxLength(50)]
        // public string Prioridad { get; set; } = string.Empty;

        // NOTA: EstadoActual (Ej: 'Pendiente') se maneja automáticamente en el controlador
    }
}