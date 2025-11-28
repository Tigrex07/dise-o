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
            SolicitanteNombre = s.Solicitante!.Nombre, // Usamos ? por si Solicitante fuera nulo
            PiezaNombre = s.Pieza!.NombrePieza, // Usamos ? por si Pieza fuera nulo

            FechaYHora = s.FechaYHora,
            Turno = s.Turno,
            Tipo = s.Tipo,
            Detalles = s.Detalles,
            Dibujo = s.Dibujo,

            // --- Propiedades Derivadas ---
            PrioridadActual = s.Revision != null ? s.Revision.Prioridad : "En Revisión",

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


    // POST: api/Solicitudes - CREAR una nueva solicitud
    // Recibe el DTO unificado con los datos de Pieza y Solicitud.
    // POST: api/Solicitudes - CREAR una nueva solicitud
    [HttpPost]
    public async Task<ActionResult<SolicitudDto>> PostSolicitud([FromBody] SolicitudCreationDto solicitudDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // 1. Validar Solicitante (FK 1: SolicitanteId)
        var solicitante = await _context.Usuarios.FindAsync(solicitudDto.SolicitanteId);
        if (solicitante == null)
        {
            return BadRequest("El ID de Solicitante proporcionado no existe.");
        }

        // 2. Validar IdArea (FK 2: IdArea para la Pieza)
        var areaExiste = await _context.Areas.AnyAsync(a => a.Id == solicitudDto.IdArea);
        if (!areaExiste)
        {
            return BadRequest($"El ID de Área '{solicitudDto.IdArea}' no existe para asignar la pieza.");
        }

        // =======================================================
        // 3. CREAR PIEZA 
        // =======================================================
        var nuevaPieza = new Pieza
        {
            IdArea = solicitudDto.IdArea,
            NombrePieza = solicitudDto.NombrePieza,
            Maquina = solicitudDto.Maquina
        };

        // Llenar Propiedad de Sombra para columna 'Maquina' (sin acento)
        _context.Entry(nuevaPieza).Property("MaquinaSinAcento").CurrentValue = solicitudDto.Maquina;

        _context.Piezas.Add(nuevaPieza);

        // --- Primer SaveChanges: Guardamos la nueva Pieza para obtener su Id ---
        await _context.SaveChangesAsync();

        int idPieza = nuevaPieza.Id; // ID de la Pieza recién creada

        // =======================================================
        // 4. CREAR SOLICITUD
        // =======================================================
        var solicitud = new Solicitud
        {
            SolicitanteId = solicitudDto.SolicitanteId,
            IdPieza = idPieza, // Usamos el ID de la pieza recién creada
            FechaYHora = solicitudDto.FechaYHora,
            Turno = solicitudDto.Turno,
            Tipo = solicitudDto.Tipo,
            Detalles = solicitudDto.Detalles,
            Dibujo = solicitudDto.Dibujo ?? string.Empty,
        };

        _context.Solicitudes.Add(solicitud); // Agregamos la Solicitud

        // =======================================================
        // ELIMINADO 5. CREAR REVISIÓN INICIAL (Dependiente de Solicitud)
        // =======================================================
        

        // =======================================================
        // ELIMINADO 6. CREAR ESTADO DE TRABAJO INICIAL (Dependiente de Solicitud)
        // =======================================================
        
        

        // --- Segundo SaveChanges: Guarda Solicitud, Revision y Estado Inicial ---
        // Al guardar 'solicitud', se le asignará el Id, y los enlaces se resolverán.
        await _context.SaveChangesAsync();

        // 7. Recuperar y devolver DTO
        // La variable 'solicitud' ya tiene el ID generado por la BD.
        var solicitudConRelaciones = await GetBaseSolicitudQuery()
            .FirstOrDefaultAsync(s => s.Id == solicitud.Id);

        var nuevaSolicitudDto = MapToDto(solicitudConRelaciones!);

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