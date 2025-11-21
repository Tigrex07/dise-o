// SolicitudesController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Data;
using MachineShopApi.DTOs; // Asegúrate que aquí están tus DTOs (SolicitudDto, SolicitudCreationDto, SolicitudPendienteDto, AsignacionRevisionDto)
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

    // 🚨 MÉTODO FALTANTE: GetSolicitud(int id) 🚨 (Requiere que SolicitudDto sea accesible)
    [HttpGet("{id}")]
    public async Task<ActionResult<SolicitudDto>> GetSolicitud(int id)
    {
        var solicitudDto = await GetSolicitudDtoQuery()
            .FirstOrDefaultAsync(s => s.Id == id);

        if (solicitudDto == null)
        {
            return NotFound();
        }

        return solicitudDto;
    }

    // --- HELPER: Consulta base para mapeo a DTO de Lectura (GET /api/solicitudes) ---
    private IQueryable<SolicitudDto> GetSolicitudDtoQuery()
    {
        // ... (El código de tu archivo SolicitudesController.cs)
        // ...
        return _context.Solicitudes
            .Include(s => s.Solicitante)
            .Include(s => s.Pieza)
            .Select(s => new SolicitudDto
            {
                Id = s.Id,
                SolicitanteNombre = s.Solicitante.Nombre,
                PiezaNombre = s.Pieza.NombrePieza,
                FechaYHora = s.FechaYHora,
                Turno = s.Turno,
                Tipo = s.Tipo,
                Detalles = s.Detalles,
                Prioridad = s.Prioridad,
                EstadoActual = s.EstadoActual
            });
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
        var solicitanteExiste = await _context.Usuarios.AnyAsync(u => u.Id == creationDto.SolicitanteId);
        var piezaExiste = await _context.Piezas.AnyAsync(p => p.Id == creationDto.IdPieza);

        if (!solicitanteExiste || !piezaExiste)
        {
            return BadRequest("El ID del Solicitante o de la Pieza proporcionado no es válido.");
        }

        // 2. Mapear el DTO de Creación al Modelo
        var solicitud = new Solicitud
        {
            SolicitanteId = creationDto.SolicitanteId,
            IdPieza = creationDto.IdPieza,
            Turno = creationDto.Turno,
            Tipo = creationDto.Tipo,
            Detalles = creationDto.Detalles,
            Prioridad = creationDto.Prioridad,

            FechaYHora = DateTime.Now,
            EstadoActual = "Pendiente" // Estado inicial
        };

        _context.Solicitudes.Add(solicitud);
        await _context.SaveChangesAsync();

        // 3. Recuperar el DTO de Lectura para la respuesta
        var nuevaSolicitudDto = await GetSolicitudDtoQuery()
            .FirstOrDefaultAsync(s => s.Id == solicitud.Id);

        // 🚨 CAMBIO CORREGIDO: GetSolicitud ya existe ahora 🚨
        return CreatedAtAction(nameof(GetSolicitud), new { id = nuevaSolicitudDto!.Id }, nuevaSolicitudDto);
    }

    // --- NUEVO ENDPOINT: Dashboard de Pendientes ---
    [HttpGet("pendientes")]
    // 🚨 NOTA: Reemplazar SolicitudPendienteDto si usaste SolicitudRevisionDto localmente 🚨
    public async Task<ActionResult<IEnumerable<SolicitudPendienteDto>>> GetSolicitudesPendientes()
    {
        var solicitudes = await _context.Solicitudes
            .Where(s => s.EstadoActual == "Pendiente" || s.EstadoActual == "Asignada" || s.EstadoActual == "En proceso")
            .Select(s => new SolicitudPendienteDto // 🚨 Asegúrate que este DTO existe y tiene las props 🚨
            {
                Id = s.Id,
                Pieza = s.Pieza.NombrePieza,
                Solicitante = s.Solicitante.Nombre,
                Detalles = s.Detalles,
                EstadoActual = s.EstadoActual,
                FechaYHora = s.FechaYHora,
                Maquina = s.Pieza.Máquina, // 🚨 CORREGIDO: Propiedad Máquina agregada a Pieza.cs 🚨

                // Prioridad: Toma la de la última revisión, sino la inicial
                Prioridad = _context.Revision // 🚨 CORREGIDO: DbSet<Revision> agregado al Contexto 🚨
                                .Where(r => r.IdSolicitud == s.Id)
                                .OrderByDescending(r => r.FechaRevision)
                                .Select(r => r.NivelUrgencia)
                                .FirstOrDefault() ?? s.Prioridad,

                // AsignadoA: Busca el nombre del operador en el EstadoTrabajo más reciente
                AsignadoA = _context.EstadoTrabajo // 🚨 CORREGIDO: DbSet<EstadoTrabajo> agregado al Contexto 🚨
                                .Where(et => et.IdSolicitud == s.Id)
                                .OrderByDescending(et => et.FechaYHoraInicio)
                                .Select(et => et.Maquinista.Nombre)
                                .FirstOrDefault(),

                // Notas Ingeniería: Toma los comentarios de la última revisión
                NotasIngenieria = _context.Revision
                                .Where(r => r.IdSolicitud == s.Id)
                                .OrderByDescending(r => r.FechaRevision)
                                .Select(r => r.Comentarios)
                                .FirstOrDefault()

            })
            .ToListAsync();

        return solicitudes;
    }

    // --- NUEVO ENDPOINT: POST Revisión y Asignación ---
    [HttpPost("asignar")]
    public async Task<IActionResult> AsignarSolicitud([FromBody] AsignacionRevisionDto revisionDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var solicitud = await _context.Solicitudes
            .FirstOrDefaultAsync(s => s.Id == revisionDto.IdSolicitud);

        if (solicitud == null)
        {
            return NotFound("Solicitud no encontrada.");
        }

        var idRevisorAutenticado = 1;

        // 1. Crear registro en la tabla Revision
        var revision = new Revision
        {
            IdSolicitud = revisionDto.IdSolicitud,
            IdRevisor = idRevisorAutenticado,
            NivelUrgencia = revisionDto.PrioridadRevisada,
            Comentarios = revisionDto.NotasIngenieria,
            FechaRevision = DateTime.Now, // 🚨 CORREGIDO: Propiedad FechaRevision agregada a Revision.cs 🚨
            EstadoRevision = "Aprobada"
        };
        _context.Revision.Add(revision); // 🚨 CORREGIDO: DbSet<Revision> agregado al Contexto 🚨

        // 2. Manejar Asignación (Estado Trabajo)
        if (revisionDto.IdOperadorAsignado.HasValue)
        {
            var estadoTrabajo = new EstadoTrabajo
            {
                IdSolicitud = revisionDto.IdSolicitud,
                IdMaquinista = revisionDto.IdOperadorAsignado.Value,
                FechaYHoraInicio = DateTime.Now, // 🚨 CORREGIDO: Propiedad FechaYHoraInicio agregada a EstadoTrabajo.cs 🚨
                EstadoActual = "Asignada",       // 🚨 CORREGIDO: Propiedad EstadoActual agregada a EstadoTrabajo.cs 🚨
            };
            _context.EstadoTrabajo.Add(estadoTrabajo); // 🚨 CORREGIDO: DbSet<EstadoTrabajo> agregado al Contexto 🚨

            // 3. Actualizar el estado de la Solicitud principal
            solicitud.EstadoActual = "Asignada";
        }
        else
        {
            solicitud.EstadoActual = "Pendiente (Prioridad Revisada)";
        }

        solicitud.Prioridad = revisionDto.PrioridadRevisada; // Actualiza la prioridad principal

        await _context.SaveChangesAsync();

        return Ok(new { message = $"Solicitud {solicitud.Id} revisada y estado actualizado." });
    }
}