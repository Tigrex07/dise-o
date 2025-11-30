using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Data;
using MachineShopApi.Models;
using MachineShopApi.Services; // Necesario para IPasswordHasher
using System; // Necesario para Guid.NewGuid()
using System.Threading.Tasks;

namespace MachineShopApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly MachineShopContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public AuthController(MachineShopContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        // 🚨 DTO de Petición (Request Body)
        public class LoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        // 🚨 DTO de Respuesta (Response Body) - Limpio por seguridad
        public class LoginResponse
        {
            public string Nombre { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Rol { get; set; } = string.Empty;
            public string Token { get; set; } = string.Empty;

            // Opcional: El área y el ID generalmente no son necesarios para la autenticación pura.
            // Puedes re-agregar Id o Area si tu frontend los necesita inmediatamente.
            // public int Id { get; set; }
            // public string Area { get; set; } = string.Empty; 
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            // 1. Buscar usuario
            var user = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == req.Email);

            // 2. Verificar si existe y está activo
            if (user == null || !user.Activo)
                // Mensaje genérico por seguridad
                return Unauthorized(new { mensaje = "Credenciales inválidas." });

            // 3. 🚨 CORRECCIÓN CRÍTICA DEL ERROR 500: Verificar el hash antes de usarlo
            if (string.IsNullOrEmpty(user.PasswordHash))
                // Si el hash es nulo, las credenciales son inválidas (o hay un error de DB)
                return Unauthorized(new { mensaje = "Credenciales inválidas." });

            // 4. Verificar la contraseña
            if (!_passwordHasher.VerifyPassword(req.Password, user.PasswordHash))
                return Unauthorized(new { mensaje = "Credenciales inválidas." });

            // 5. Generar la respuesta (si pasa la autenticación)
            return Ok(new
            {
                token = Guid.NewGuid().ToString(), // Token temporal
                user = new
                {
                    id = user.Id,
                    nombre = user.Nombre,
                    email = user.Email,
                    rol = user.Rol,
                    area = user.Area,
                    activo = user.Activo
                }
            });

            // 🚨 Importante: Cuando implementes JWT, esta línea generará el token real.
            // Token = _jwtService.GenerateToken(user); 

       
        }
    }
}