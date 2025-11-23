using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic; // Necesario para ICollection

namespace MachineShopApi.Models
{
    // Representa una Solicitud de trabajo o reparación en Machine Shop
    public class Solicitud
    {
        // Clave Primaria (IdSolicitud)
        [Key]
        [Column("IdSolicitud")]
        public int Id { get; set; }

        // Clave Foránea al Usuario Solicitante
        public int SolicitanteId { get; set; }

        // Clave Foránea a la Pieza (o Molde) a trabajar
        public int IdPieza { get; set; }

        // Datos de la Solicitud
        public DateTime FechaYHora { get; set; }
        public string Turno { get; set; } = string.Empty; // Ej: Turno A, B, C
        public string Tipo { get; set; } = string.Empty; // Ej: Daño Físico, Mejora, Fabricación
        public string Detalles { get; set; } = string.Empty;
        public string Dibujo { get; set; } = string.Empty; // Nuevo campo

        // 🚨 ELIMINADAS: Prioridad y EstadoActual
        // public string Prioridad { get; set; } = string.Empty; 
        // public string EstadoActual { get; set; } = string.Empty; 

        // ===================================================
        // Propiedades de Navegación
        // ===================================================

        // Relación N:1 con Usuario (el Solicitante)
        [ForeignKey("SolicitanteId")]
        public Usuario Solicitante { get; set; } = default!;

        // Relación N:1 con Pieza (el objeto a reparar/fabricar)
        [ForeignKey("IdPieza")]
        public Pieza Pieza { get; set; } = default!;

        // 🚨 CAMBIO CRÍTICO: Relación 1:N con EstadoTrabajo (Historial de Operaciones)
        // Sustituye la relación 1:1 anterior.
        public ICollection<EstadoTrabajo> Operaciones { get; set; } = new List<EstadoTrabajo>();

        // Relación 1:1 con Revision (para la revisión de ingeniería/calidad)
        public Revision? Revision { get; set; }
    }
}