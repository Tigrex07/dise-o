using System;
using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.DTOs
{
    // DTO usado para recibir datos de una nueva solicitud (POST).
    // Contiene los campos necesarios para crear una PIEZA y la SOLICITUD asociada.
    public class SolicitudCreationDto
    {
        // ===================================================
        // CAMPOS DE PIEZA (3 DATOS NUEVOS/MODIFICADOS)
        // ===================================================

        // 1. Nombre de la Pieza (lo que el usuario escribe)
        [Required(ErrorMessage = "El nombre de la pieza es obligatorio.")]
        [MaxLength(100)]
        public string NombrePieza { get; set; } = string.Empty;

        // 2. Máquina Asociada (lo que el usuario escribe, sin acento para evitar conflictos)
        [Required(ErrorMessage = "La máquina es obligatoria.")]
        [MaxLength(50)]
        public string Maquina { get; set; } = string.Empty;

        // 3. ID de Área para la Pieza (FK)
        [Required(ErrorMessage = "El ID de Área es obligatorio para la pieza.")]
        public int IdArea { get; set; }

        // 🚨 ELIMINADO: IdPieza - Ya no es necesario, el controlador la crea.
        // public int IdPieza { get; set; } 


        // ===================================================
        // CAMPOS DE SOLICITUD
        // ===================================================

        // Claves Foráneas
        [Required(ErrorMessage = "El ID del solicitante es obligatorio.")]
        public int SolicitanteId { get; set; }

        // Dato de fecha/hora (obligatorio en el modelo Solicitud.cs)
        [Required(ErrorMessage = "La fecha y hora de la solicitud son obligatorias.")]
        public DateTime FechaYHora { get; set; }


        // Datos Descriptivos
        [Required(ErrorMessage = "El turno es obligatorio.")]
        [MaxLength(10)]
        public string Turno { get; set; } = string.Empty;

        [Required(ErrorMessage = "El tipo de solicitud es obligatorio.")]
        [MaxLength(50)]
        public string Tipo { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los detalles son obligatorios.")]
        public string Detalles { get; set; } = string.Empty;

        // Dibujo: Se mantiene como string para el enlace de texto.
        public string? Dibujo { get; set; }
    }
}