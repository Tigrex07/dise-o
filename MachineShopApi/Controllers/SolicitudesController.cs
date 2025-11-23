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

    // --- HELPER: Consulta base para mapeo a DTO de Lectura ---
    private IQueryable<SolicitudDto> GetSolicitudDtoQuery()
    {
        return _context.Solicitudes
            // Incluir las entidades relacionadas para obtener sus nombres
            .Include(s => s.Solicitante)
            .Include(s => s.Pieza)
            // Incluir Revision (para la Prioridad)
            .Include(s => s.Revision)
            // Incluir Operaciones y al Maquinista para obtener el estado actual
            .Include(s => s.Operaciones)
                .ThenInclude(et => et.Maquinista)

            // Proyección al DTO de Lectura
            .Select(s => new SolicitudDto
            {
                Id = s.Id,
                // Mapeo de FKs a nombres:
                SolicitanteNombre = s.Solicitante.Nombre,
                PiezaNombre = s.Pieza.NombrePieza,

                // Datos Directos:
                FechaYHora = s.FechaYHora,
                Turno = s.Turno,
                Tipo = s.Tipo,
                Detalles = s.Detalles,
                Dibujo = s.Dibujo,

                // --- Propiedades Derivadas del Nuevo Esquema ---
                // Prioridad actual (viene de Revision)
                PrioridadActual = s.Revision != null ? s.Revision.Prioridad : "Pendiente de Revisión",

                // Estado Operacional (Viene del ÚLTIMO registro de EstadoTrabajo)
                EstadoOperacional = s.Operaciones
                    .OrderByDescending(op => op.FechaYHoraDeInicio)
                    .Select(op => op.DescripcionOperacion)
                    .FirstOrDefault() ?? "Sin Estado Inicial",

                // Maquinista Asignado (Viene del ÚLTIMO registro de EstadoTrabajo)
                MaquinistaAsignado = s.Operaciones
                    .OrderByDescending(op => op.FechaYHoraDeInicio)
                    .Select(op => op.Maquinista.Nombre)
                    .FirstOrDefault() ?? "N/A",

                // 🚨 NUEVO CÁLCULO: Sumar el tiempo de máquina de todas las operaciones terminadas
                TiempoTotalMaquina = s.Operaciones
                    .Where(op => op.FechaYHoraDeFin.HasValue) // Solo operaciones finalizadas
                    .Sum(op => op.TiempoMaquina)
            });
    }

    // GET: api/Solicitudes
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SolicitudDto>>> GetSolicitudes()
    {
        return await GetSolicitudDtoQuery().ToListAsync();
    }

    // GET: api/Solicitudes/5
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

        // 2. Mapear el DTO de Creación al Modelo (Prioridad y EstadoActual ya no existen)
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
        // Usamos Id=1 (Usuario de Sistema) para el estado inicial.
        int idMaquinistaSistema = 1;

        var primerEstado = new EstadoTrabajo
        {
            IdSolicitud = solicitud.Id,
            IdMaquinista = idMaquinistaSistema,
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
        var nuevaSolicitudDto = await GetSolicitudDtoQuery()
            .FirstOrDefaultAsync(s => s.Id == solicitud.Id);

        return CreatedAtAction(nameof(GetSolicitud), new { id = nuevaSolicitudDto!.Id }, nuevaSolicitudDto);
    }

    // NOTA: Otros métodos (PutSolicitud, DeleteSolicitud) deben ser revisados
}