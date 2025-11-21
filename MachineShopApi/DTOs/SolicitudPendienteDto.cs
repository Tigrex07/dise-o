// D:\Repositories\Training\Machine\MachineShopApi\DTOs\SolicitudPendienteDto.cs

using System;
using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.DTOs
{
    /// <summary>
    /// DTO usado para el Dashboard/Lista de Solicitudes Pendientes, En Revisión o En Proceso.
    /// Contiene datos desnormalizados (nombres en lugar de IDs) y propiedades derivadas de Revision y EstadoTrabajo.
    /// </summary>
    public class SolicitudPendienteDto
    {
        // --- Datos de la Solicitud ---
        public int Id { get; set; }
        public string Detalles { get; set; } = string.Empty;
        public string EstadoActual { get; set; } = string.Empty;
        public DateTime FechaYHora { get; set; }

        // --- Datos Desnormalizados (JOINs) ---
        public string Pieza { get; set; } = string.Empty;       // Nombre de la Pieza
        public string Solicitante { get; set; } = string.Empty; // Nombre del Solicitante
        public string Maquina { get; set; } = string.Empty;     // Máquina asociada a la Pieza

        // --- Propiedades Dinámicas (Derivadas de Revision/EstadoTrabajo) ---

        // Prioridad: Se usa la revisada (si existe) o la inicial.
        public string Prioridad { get; set; } = string.Empty;

        // AsignadoA: Nombre del Maquinista asignado al último EstadoTrabajo.
        public string AsignadoA { get; set; } = string.Empty;

        // NotasIngenieria: Comentarios de la última Revisión.
        public string NotasIngenieria { get; set; } = string.Empty;
    }
}