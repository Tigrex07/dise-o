using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Data;
using MachineShopApi.DTOs; // Importamos los DTOs
using MachineShopApi.Models; // Importamos el Modelo
using MachineShopApi.Services; // 💡 Necesario para IPasswordHasher
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class UsuariosController : ControllerBase
{
    private readonly MachineShopContext _context;
    private readonly IPasswordHasher _passwordHasher; // ✅ Inyección de la interfaz

    // 🚨 CONSTRUCTOR CORREGIDO: Inyecta IPasswordHasher
    public UsuariosController(MachineShopContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    // 1. GET: api/Usuarios - Lista todos los usuarios
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetUsuarios()
    {
        var usuarios = await _context.Usuarios
            .Select(u => new UsuarioDto
            {
                Id = u.Id,
                Nombre = u.Nombre,
                Email = u.Email,
                Area = u.Area,
                Rol = u.Rol,
                Activo = u.Activo
            })
            .OrderBy(u => u.Nombre)
            .ToListAsync();

        return Ok(usuarios);
    }

    // 2. GET: api/Usuarios/5 - Obtener un solo usuario por ID
    [HttpGet("{id:int}")]
    public async Task<ActionResult<UsuarioDto>> GetUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
        {
            return NotFound();
        }

        var usuarioDto = new UsuarioDto
        {
            Id = usuario.Id,
            Nombre = usuario.Nombre,
            Email = usuario.Email,
            Area = usuario.Area,
            Rol = usuario.Rol,
            Activo = usuario.Activo
        };

        return Ok(usuarioDto);
    }

    // 3. POST: api/Usuarios - CREAR un nuevo usuario
    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> PostUsuario(UsuarioCreationDTO creationDto)
    {
        // 🚨 PASO DE DEBUGGING: Si el modelo no es válido, devuelve el error 400 con detalles.
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Validar que no exista otro usuario con el mismo correo
        var exists = await _context.Usuarios.AnyAsync(u => u.Email == creationDto.Email);
        if (exists) return Conflict("Ya existe un usuario con ese correo.");

        var usuario = new Usuario
        {
            Nombre = creationDto.Nombre,
            Email = creationDto.Email,
            Area = creationDto.Area,
            Rol = creationDto.Rol,
            Activo = true,

            // ✅ Uso del servicio de hashing inyectado
            PasswordHash = _passwordHasher.HashPassword(creationDto.Contrasena)
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        // Devolvemos el DTO de lectura (sin el hash)
        var usuarioDto = new UsuarioDto
        {
            Id = usuario.Id,
            Nombre = usuario.Nombre,
            Email = usuario.Email,
            Area = usuario.Area,
            Rol = usuario.Rol,
            Activo = usuario.Activo
        };

        return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, usuarioDto);
    }

    // 4. PUT: api/Usuarios/5 - EDITAR un usuario existente
    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutUsuario(int id, UsuarioDto usuarioDto)
    {
        if (id != usuarioDto.Id)
        {
            return BadRequest("El ID de la ruta no coincide con el ID del cuerpo.");
        }

        // Validar el modelo para PUT
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var usuarioExistente = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);

        if (usuarioExistente == null)
        {
            return NotFound($"No se encontró un usuario con el ID {id}.");
        }

        // Actualizamos campos que no son la contraseña
        usuarioExistente.Nombre = usuarioDto.Nombre;
        usuarioExistente.Area = usuarioDto.Area;
        usuarioExistente.Rol = usuarioDto.Rol;
        usuarioExistente.Activo = usuarioDto.Activo;

        // 🚨 Lógica para actualizar contraseña solo si el campo Contrasena tiene un valor
        if (!string.IsNullOrWhiteSpace(usuarioDto.Contrasena))
        {
            usuarioExistente.PasswordHash = _passwordHasher.HashPassword(usuarioDto.Contrasena);
        }

        _context.Entry(usuarioExistente).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Usuarios.Any(e => e.Id == id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    //--------------------------
    // Filtrado por Maquinistas
    //--------------------------
    [HttpGet("Maquinistas")]
    public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetMaquinistas()
    {
        var maquinistas = await _context.Usuarios
            .Where(u => u.Rol == "Maquinista")
            .Select(u => new UsuarioDto
            {
                Id = u.Id,
                Nombre = u.Nombre
            })
            .ToListAsync();

        if (maquinistas == null || maquinistas.Count == 0)
        {
            return NotFound("No se encontraron usuarios con el rol 'Maquinista'.");
        }

        return maquinistas;
    }
}
