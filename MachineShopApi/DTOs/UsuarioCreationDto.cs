using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization; // 🚨 ¡CRÍTICO! Asegúrate de que esta línea esté presente.

namespace MachineShopApi.DTOs
{
    public class UsuarioCreationDTO
    {
        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es obligatorio.")]
        [EmailAddress(ErrorMessage = "El email no tiene un formato válido.")] // Mejora en la validación
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "El área es obligatoria.")]
        [MaxLength(50)]
        public string Area { get; set; } = string.Empty;

        [Required(ErrorMessage = "El rol es obligatorio.")]
        [MaxLength(50)]
        public string Rol { get; set; } = string.Empty;

        // 🚨 CORRECCIÓN CLAVE: El nombre del campo JSON debe ser "password"
        [JsonPropertyName("password")]
        [Required(ErrorMessage = "La contraseña es obligatoria.")]
        [MaxLength(100)]
        public string Contrasena { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;
    }
}