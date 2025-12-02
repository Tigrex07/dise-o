using System;
using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.DTOs
{
    public class EstadoTrabajoCreationDto
    {
        // Campos que ya existían
        public int IdSolicitud { get; set; }
        public int IdMaquinista { get; set; }
        public string DescripcionOperacion { get; set; }
        public string? Observaciones { get; set; }

        // Campo de control de flujo
        public string Prioridad { get; set; } // Lo necesitamos para el control de flujo (En progreso, Pausada, Completado)

        // ✅ CAMPOS NUEVOS/CRÍTICOS
        public string MaquinaAsignada { get; set; }
        public decimal TiempoMaquina { get; set; }
    }
}