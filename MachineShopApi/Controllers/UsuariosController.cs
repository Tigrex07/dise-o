using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Data;
using MachineShopApi.DTOs; // ¡Importamos los DTOs!
using MachineShopApi.Models; // Importamos el Modelo
using MachineShopApi.Services; // Importamos el Servicio
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class UsuariosController : ControllerBase
{
    private readonly MachineShopContext _context;
    private readonly IPasswordHasher _passwordHasher; // 🚨 PASO 1: Declarar el servicio

    public UsuariosController(MachineShopContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher; // 🚨 PASO 3: Asignar
    }

    // 1. GET: api/Usuarios - Lista todos los usuarios
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetUsuarios()
    {
        var usuarios = await _context.Usuarios
            // Mapeo del Modelo (Usuario) al DTO de Lectura (UsuarioDto)
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

        // Mapeo al DTO de Lectura
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
    // Recibe el UsuarioCreationDto (sin ID)
    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> PostUsuario(UsuarioCreationDTO creationDto)
    {
        var hashedPassword = _passwordHasher.HashPassword(creationDto.Contrasena); // Suponiendo que creationDto tiene Contrasena


        // 1. Mapear el DTO de Creación al Modelo de la Base de Datos
        var usuario = new Usuario
        {
            Nombre = creationDto.Nombre,
            Email = creationDto.Email,
            Area = creationDto.Area,
            Rol = creationDto.Rol,
            Activo = true, // Regla de negocio: un usuario nuevo siempre está activo
            // Las colecciones de navegación (AreasResponsables, etc.) se dejan vacías al crear
            PasswordHash = hashedPassword // 🚨 PASO 4: Asignar el hash
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        // 2. Mapear el Modelo creado de vuelta al DTO de Lectura para la respuesta (incluye el nuevo ID)
        var usuarioDto = new UsuarioDto
        {
            Id = usuario.Id,
            Nombre = usuario.Nombre,
            Email = usuario.Email,
            Area = usuario.Area,
            Rol = usuario.Rol,
            Activo = usuario.Activo
        };

        // Retorna un 201 Created y la ubicación del nuevo recurso
        return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, usuarioDto);
    }

    // 4. PUT: api/Usuarios/5 - EDITAR un usuario existente
    // Recibe el UsuarioDto (incluye el ID y la propiedad Activo para la inactivación)
    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutUsuario(int id, UsuarioDto usuarioDto)
    {
        if (id != usuarioDto.Id)
        {
            return BadRequest("El ID de la ruta no coincide con el ID del cuerpo.");
        }

        // 1. Buscar el usuario existente en la base de datos
        var usuarioExistente = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Id == id);

        if (usuarioExistente == null)
        {
            return NotFound($"No se encontró un usuario con el ID {id}.");
        }

        // 2. Actualizar las propiedades permitidas del Modelo Existente
        // Esto es un 'parche' elegante (a pesar de usar PUT) que ignora las propiedades de navegación
        usuarioExistente.Nombre = usuarioDto.Nombre;
        usuarioExistente.Area = usuarioDto.Area;
        usuarioExistente.Rol = usuarioDto.Rol;
        usuarioExistente.Activo = usuarioDto.Activo;

        if (!string.IsNullOrWhiteSpace(usuarioDto.Contrasena))
        {
            usuarioExistente.PasswordHash = _passwordHasher.HashPassword(usuarioDto.Contrasena);
        }

        // 3. Marcar como modificado y guardar
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



        return NoContent(); // Retorna 204 No Content para una actualización exitosa
    }



    [HttpGet("Maquinistas")]
    public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetMaquinistas()
    {
        // 1. Filtrar los usuarios donde el campo Rol sea "Maquinista"
        var maquinistas = await _context.Usuarios
            .Where(u => u.Rol == "Maquinista")
            // 2. Seleccionar solo los campos necesarios (ID y Nombre)
            .Select(u => new UsuarioDto // Asume que tienes un DTO simple para Usuario/Maquinista
            {
                Id = u.Id,
                Nombre = u.Nombre,
                // (Agregar otros campos necesarios, como Rol, si aplica)
            })
            .ToListAsync();

        if (maquinistas == null || maquinistas.Count == 0)
        {
            // Esto es �til si todav�a no hay maquinistas registrados
            return NotFound("No se encontraron usuarios con el rol 'Maquinista'.");
        }

        return maquinistas;
    }

    // 🚨 DELETE: Eliminar usuario por ID
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
        {
            return NotFound();
        }

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();

        return NoContent(); // 204
    }
}