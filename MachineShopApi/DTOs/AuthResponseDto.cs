// DTOs/AuthResponseDto.cs

namespace MachineShopApi.DTOs
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty; // Útil para mostrar en el frontend
    }
}