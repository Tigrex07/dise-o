// Services/PasswordHasherService.cs

using BCrypt.Net;

namespace MachineShopApi.Services
{
    public class PasswordHasherService : IPasswordHasher
    {
        // Implementación del método para hashear
        public string HashPassword(string password)
        {
            // BCrypt incluye el salt de forma automática, lo que lo hace muy seguro
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        // Implementación del método para verificar (necesario para el Login)
        public bool VerifyPassword(string providedPassword, string hash)
        {
            // BCrypt compara la contraseña proporcionada con el hash almacenado
            return BCrypt.Net.BCrypt.Verify(providedPassword, hash);
        }
    }
}