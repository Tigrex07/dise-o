// D:\Repositories\Training\Machine\MachineShopApi\DTOs\UsuarioDto.cs

using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization; // 🚨 PASO 1: IMPORTAR ESTO

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

        // 🚨 PASO 2: AÑADIR EL ATRIBUTO PARA MAPEADO DE JSON 🚨
        [JsonPropertyName("password")] // Mapea el campo JSON 'password'
        [MaxLength(100)]
        public string? Contrasena { get; set; } // Ahora recibirá el valor de React

        public bool Activo { get; set; } = true; // Por defecto, activo
    }
}