using MachineShopApi.DTOs;
using System;
using System.ComponentModel.DataAnnotations;


namespace MachineShopApi.DTOs
{
    public class UsuarioDto
    {
        // Se usa para las operaciones PUT (actualización)
        public int? Id { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es obligatorio.")]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "El área es obligatoria.")]
        [MaxLength(50)]
        public string Area { get; set; } = string.Empty;

        [Required(ErrorMessage = "El rol es obligatorio.")]
        [MaxLength(50)]
        public string Rol { get; set; } = string.Empty; // Operador / Supervisor / Machine Shop

        public bool Activo { get; set; } = true; // Por defecto, activo
    }
}