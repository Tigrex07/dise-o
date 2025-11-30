using System;
using System.Collections.Generic;

namespace MachineShopApi.DTOs
{
    // ====================================================================
    // 1. DTO PRINCIPAL: SOLICITUD DETALLE
    // ====================================================================
    public class SolicitudDetalleDto
    {
        // Propiedades de string ahora son anulables (string?) para resolver advertencias
        public int Id { get; set; }
        public string? PiezaNombre { get; set; }
        public string? Maquina { get; set; }
        public string? Turno { get; set; }
        public string? Tipo { get; set; }
        public string? SolicitanteNombre { get; set; }
        public string? Detalles { get; set; }
        public string? Dibujo { get; set; }
        public string? PrioridadActual { get; set; }
        public string? EstadoOperacional { get; set; }
        public DateTime FechaYHora { get; set; }

        // Datos de Pieza y Área (Aplanados)
        public string? AreaNombre { get; set; }

        // Secciones Consolidadas (Inicializamos la lista para evitar advertencias)
        public RevisionDetalleDto? Revision { get; set; }
        public EstadoTrabajoDetalleDto? UltimoEstadoTrabajo { get; set; }
        public List<EstadoTrabajoDetalleDto> HistorialTrabajo { get; set; } = new List<EstadoTrabajoDetalleDto>();
    }

    // ====================================================================
    // 2. DTO ANIDADO: REVISIÓN
    // ====================================================================
    public class RevisionDetalleDto
    {
        public string? RevisorNombre { get; set; }
        public string? Prioridad { get; set; }
        public string? Comentarios { get; set; }
        public DateTime FechaHoraRevision { get; set; }
    }

    // ====================================================================
    // 3. DTO ANIDADO: ESTADO DE TRABAJO
    // ====================================================================
    public class EstadoTrabajoDetalleDto
    {
        public int Id { get; set; }
        public string? DescripcionOperacion { get; set; }
        public string? MaquinaAsignada { get; set; }
        public string? MaquinistaNombre { get; set; }
        public DateTime FechaYHoraDeInicio { get; set; }
        public DateTime? FechaYHoraDeFin { get; set; }
        public decimal TiempoMaquina { get; set; }
        public string? Observaciones { get; set; }
    }
}