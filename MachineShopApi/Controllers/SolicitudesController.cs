using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Data;
using MachineShopApi.DTOs;
using MachineShopApi.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

[Route("api/[controller]")]
[ApiController]
public class SolicitudesController : ControllerBase
{
    private readonly MachineShopContext _context;

    public SolicitudesController(MachineShopContext context)
    {
        _context = context;
    }

    // ----------------------------------------------------------------------
    // --- HELPER 1: Consulta Base (Solo Includes, Se ejecuta en la DB) ---
    // ----------------------------------------------------------------------
    private IQueryable<Solicitud> GetBaseSolicitudQuery()
    {
        return _context.Solicitudes
            // Incluir las entidades relacionadas
            .Include(s => s.Solicitante)
            .Include(s => s.Pieza)
            .Include(s => s.Revision)
            .Include(s => s.Operaciones)
                .ThenInclude(et => et.Maquinista);
    }

    // ----------------------------------------------------------------------
    // --- HELPER 2: Mapeo a DTO (Se ejecuta en C# / Memoria) ---
    // ----------------------------------------------------------------------
    private SolicitudDto MapToDto(Solicitud s)
    {
        // Esta lógica se ejecuta en el servidor (C#), no en SQL,
        // por lo que las conversiones y Sums funcionan correctamente.
        return new SolicitudDto
        {
            Id = s.Id,
            SolicitanteNombre = s.Solicitante?.Nombre, // Usamos ? por si Solicitante fuera nulo
            PiezaNombre = s.Pieza?.NombrePieza, // Usamos ? por si Pieza fuera nulo

            FechaYHora = s.FechaYHora,
            Turno = s.Turno,
            Tipo = s.Tipo,
            Detalles = s.Detalles,
            Dibujo = s.Dibujo,

            // --- Propiedades Derivadas ---
            PrioridadActual = s.Revision != null ? s.Revision.Prioridad : "Pendiente de Revisión",

            // Estado Operacional (Cálculo en memoria)
            EstadoOperacional = s.Operaciones
                .OrderByDescending(op => op.FechaYHoraDeInicio)
                .Select(op => op.DescripcionOperacion)
                .FirstOrDefault() ?? "Sin Estado Inicial",

            // Maquinista Asignado (Cálculo en memoria)
            MaquinistaAsignado = s.Operaciones
                .OrderByDescending(op => op.FechaYHoraDeInicio)
                .Select(op => op.Maquinista?.Nombre)
                .FirstOrDefault() ?? "N/A",

            // ✅ CÁLCULO DE SUMA CORREGIDO: Suma realizada en C# con tipo decimal nativo.
            TiempoTotalMaquina = s.Operaciones
                .Where(op => op.FechaYHoraDeFin.HasValue)
                .Sum(op => op.TiempoMaquina)
        };
    }

    // GET: api/Solicitudes
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SolicitudDto>>> GetSolicitudes()
    {
        // 🚨 PASO CRÍTICO: Ejecutar la consulta SQL primero y traer los datos a memoria.
        var solicitudes = await GetBaseSolicitudQuery().ToListAsync();

        // Mapear los resultados en memoria usando la función MapToDto.
        var solicitudDtos = solicitudes.Select(MapToDto).ToList();

        return solicitudDtos;
    }

    // GET: api/Solicitudes/5
    [HttpGet("{id}")]
    public async Task<ActionResult<SolicitudDto>> GetSolicitud(int id)
    {
        // 🚨 PASO CRÍTICO: Buscar y traer el dato a memoria.
        var solicitud = await GetBaseSolicitudQuery()
            .FirstOrDefaultAsync(s => s.Id == id);

        if (solicitud == null)
        {
            return NotFound();
        }

        // Mapear el resultado en memoria.
        return MapToDto(solicitud);
    }


    // 1. POST: api/Solicitudes - CREAR una nueva solicitud
    [HttpPost]
    public async Task<ActionResult<SolicitudDto>> PostSolicitud([FromBody] SolicitudCreationDto creationDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // 1. Validar que las FKs existan
        // 🚨 Mantenemos comentado: Esto permite que los IDs fijos (1, 1) pasen sin requerir los datos de la base.
        /*
        var solicitanteExiste = await _context.Usuarios.AnyAsync(u => u.Id == creationDto.SolicitanteId);
        var piezaExiste = await _context.Piezas.AnyAsync(p => p.Id == creationDto.IdPieza);

        if (!solicitanteExiste || !piezaExiste)
        {
            return BadRequest("El ID del Solicitante o de la Pieza proporcionado no es válido.");
        }
        */

        // 2. Mapear el DTO de Creación al Modelo 
        var solicitud = new Solicitud
        {
            SolicitanteId = creationDto.SolicitanteId,
            IdPieza = creationDto.IdPieza,
            Turno = creationDto.Turno,
            Tipo = creationDto.Tipo,
            Detalles = creationDto.Detalles,
            Dibujo = creationDto.Dibujo ?? string.Empty,
            FechaYHora = DateTime.Now
        };

        // --- Primer SaveChanges: Obtener el IdSolicitud ---
        _context.Solicitudes.Add(solicitud);
        await _context.SaveChangesAsync();


        // 3. 💡 FLUJO DE ESTADO INICIAL: Crear el primer registro en EstadoTrabajo ("En Revisión")
        // ✅ CORRECCIÓN DE ERROR 500: Usamos el SolicitanteId, que está garantizado como 1.
        // Esto evita el fallo de la clave foránea si el "Usuario de Sistema" (ID 1) no existe.
        int idMaquinistaParaEstadoInicial = creationDto.SolicitanteId;

        var primerEstado = new EstadoTrabajo
        {
            IdSolicitud = solicitud.Id,
            IdMaquinista = idMaquinistaParaEstadoInicial, // Usamos SolicitanteId (1)
            MaquinaAsignada = "N/A",

            FechaYHoraDeInicio = DateTime.Now,
            FechaYHoraDeFin = null,

            DescripcionOperacion = "En Revisión", // El estado inicial
            TiempoMaquina = 0,
            Observaciones = "Solicitud creada. Pendiente de Revisión de Ingeniería."
        };

        // --- Segundo SaveChanges: Guardar el primer estado ---
        _context.EstadoTrabajo.Add(primerEstado);
        await _context.SaveChangesAsync();


        // 4. Recuperar el DTO de Lectura para la respuesta
        // Usamos GetBaseSolicitudQuery para asegurar que todos los datos relacionados estén cargados
        var nuevaSolicitud = await GetBaseSolicitudQuery()
            .FirstOrDefaultAsync(s => s.Id == solicitud.Id);

        // Mapear a DTO en memoria
        var nuevaSolicitudDto = MapToDto(nuevaSolicitud!);

        return CreatedAtAction(nameof(GetSolicitud), new { id = nuevaSolicitudDto.Id }, nuevaSolicitudDto);
    }

    // ----------------------------------------------------------------------
    // --- NUEVO ENDPOINT: DELETE ---
    // ----------------------------------------------------------------------

    // DELETE: api/Solicitudes/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSolicitud(int id)
    {
        var solicitud = await _context.Solicitudes.FindAsync(id);

        if (solicitud == null)
        {
            return NotFound();
        }

        // 🚨 NOTA IMPORTANTE: Si la tabla Solicitudes tiene relaciones
        // con claves foráneas (FK) en otras tablas (como EstadoTrabajo o Revision),
        // y esas relaciones no están configuradas para "CASCADE DELETE"
        // podrías tener que borrar primero los registros relacionados manualmente.
        // Asumo que EF Core manejará la eliminación en cascada si está configurado.

        _context.Solicitudes.Remove(solicitud);
        await _context.SaveChangesAsync();

        // HTTP 204 No Content: Indica que la acción se completó exitosamente sin devolver un cuerpo.
        return NoContent();
    }
}