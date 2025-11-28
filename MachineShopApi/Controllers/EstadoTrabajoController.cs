using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Models;
using MachineShopApi.DTOs; // Se asume que existe EstadoTrabajoCreationDto y EstadoTrabajoUpdateDto
using MachineShopApi.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace MachineShopApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EstadoTrabajoController : ControllerBase
    {
        private readonly MachineShopContext _context;

        public EstadoTrabajoController(MachineShopContext context)
        {
            _context = context;
        }

        // GET: api/EstadoTrabajo
        // Obtiene TODO el historial de operaciones de todas las solicitudes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EstadoTrabajo>>> GetEstadosTrabajo()
        {
            // 🚨 IMPORTANTE: Usar el nombre del DbSet que definiste en ApplicationDBContext.cs (EstadoTrabajo)
            return await _context.EstadoTrabajo
                .Include(e => e.Solicitud)
                .Include(e => e.Maquinista)
                .ToListAsync();
        }

        // GET: api/EstadoTrabajo/Solicitud/5
        // Obtiene el historial de una solicitud específica
        [HttpGet("Solicitud/{idSolicitud}")]
        public async Task<ActionResult<IEnumerable<EstadoTrabajo>>> GetHistorialSolicitud(int idSolicitud)
        {
            // 🚨 IMPORTANTE: Usar el nombre del DbSet correcto (EstadoTrabajo)
            var historial = await _context.EstadoTrabajo
                .Where(e => e.IdSolicitud == idSolicitud)
                .Include(e => e.Maquinista)
                .OrderByDescending(e => e.FechaYHoraDeInicio)
                .ToListAsync();

            if (historial == null || !historial.Any())
            {
                return NotFound("No se encontró historial para esta solicitud.");
            }

            return historial;
        }

        // POST: api/EstadoTrabajo
        // Esta acción registra el INICIO de un trabajo o un nuevo estado.
        [HttpPost]
        public async Task<ActionResult<EstadoTrabajo>> PostEstadoTrabajo(EstadoTrabajoCreationDto estadoDto)
        {
            // Validaciones de existencia de FKs
            var solicitudExiste = await _context.Solicitudes.AnyAsync(s => s.Id == estadoDto.IdSolicitud);
            var maquinistaExiste = await _context.Usuarios.AnyAsync(u => u.Id == estadoDto.IdMaquinista);

            if (!solicitudExiste || !maquinistaExiste)
            {
                return BadRequest("El ID de Solicitud o Maquinista proporcionado no es válido.");
            }

            // 1. Crear el registro de inicio de trabajo
            var estadoTrabajo = new EstadoTrabajo
            {
                IdSolicitud = estadoDto.IdSolicitud,
                IdMaquinista = estadoDto.IdMaquinista,
                MaquinaAsignada = estadoDto.MaquinaAsignada,
                DescripcionOperacion = estadoDto.DescripcionOperacion,
                Observaciones = estadoDto.Observaciones,

                // 💡 INICIO: Se registra el tiempo de inicio
                FechaYHoraDeInicio = DateTime.Now,

                // 💡 INICIO: La fecha de fin es NULL y el tiempo es 0.00
                FechaYHoraDeFin = null,
                TiempoMaquina = 0.00m,
            };

            // 🚨 IMPORTANTE: Usar el nombre del DbSet correcto (EstadoTrabajo)
            _context.EstadoTrabajo.Add(estadoTrabajo);

            // 🚨 ELIMINADO: Ya no actualizamos Solicitud.EstadoActual porque fue eliminado. 
            // El estado se infiere de este nuevo registro de EstadoTrabajo.

            await _context.SaveChangesAsync();

            // Usar Id para el CreatedAtAction (asumiendo que IdEstado es la PK)
            return CreatedAtAction(nameof(GetHistorialSolicitud), new { idSolicitud = estadoTrabajo.IdSolicitud }, estadoTrabajo);
        }

        // PUT: api/EstadoTrabajo/5
        // Esta acción registra el FIN de un trabajo, calcula el tiempo y avanza la solicitud.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEstadoTrabajo(int id, EstadoTrabajoUpdateDto estadoUpdateDto)
        {
            // 1. Obtener el estado de trabajo a finalizar
            // 🚨 IMPORTANTE: Usar el nombre del DbSet correcto (EstadoTrabajo)
            var estado = await _context.EstadoTrabajo.FindAsync(id);
            if (estado == null)
            {
                return NotFound();
            }

            // 2. Aplicar las actualizaciones (solo para registros NO finalizados)
            if (estado.FechaYHoraDeFin == null)
            {
                estado.FechaYHoraDeFin = DateTime.Now; // 💡 FIN: Registrar el tiempo de fin

                // Cálculo del tiempo transcurrido
                TimeSpan duracion = estado.FechaYHoraDeFin.Value - estado.FechaYHoraDeInicio;

                // Asignación de tiempo en horas decimales (Ej: 1.5 horas)
                estado.TiempoMaquina = (decimal)duracion.TotalHours;
            }

            // Aplicar otros campos de la actualización (como observaciones)
            estado.Observaciones = estadoUpdateDto.Observaciones ?? estado.Observaciones;


            _context.Entry(estado).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) when (!_context.EstadoTrabajo.Any(e => e.Id == id))
            {
                return NotFound();
            }

            return NoContent();
        }


        [HttpGet("Assignments")] // Ruta: GET api/EstadoTrabajo/Assignments
        public async Task<ActionResult<IEnumerable<MaquinistaAssignmentDto>>> GetSolicitudAssignments()
        {
            // PASO 1: Traer a memoria (ToList) todos los registros de EstadoTrabajo que tienen asignación.
            // Usamos .Include(et => et.Maquinista) para asegurar que el nombre del usuario se cargue
            // junto con cada registro de EstadoTrabajo en la misma consulta a la DB.
            var allEstadoTrabajoWithMaquinista = await _context.EstadoTrabajo
                .Include(et => et.Maquinista)
                .Where(et => et.IdMaquinista != null)
                .ToListAsync(); // <-- ¡AQUÍ ESTÁ LA CLAVE! Se ejecuta la consulta SQL.

            // PASO 2: Procesar los datos cargados en la memoria de la aplicación (LINQ to Objects).
            // Esta parte ya no necesita traducción a SQL.
            var assignments = allEstadoTrabajoWithMaquinista
                .GroupBy(et => et.IdSolicitud)
                // Seleccionamos el registro más reciente de EstadoTrabajo dentro de cada grupo
                .Select(g => g.OrderByDescending(et => et.FechaYHoraDeInicio).First())
                // Mapeamos al DTO final
                .Select(et => new MaquinistaAssignmentDto
                {
                    IdSolicitud = et.IdSolicitud,
                    // Ahora .Maquinista.Nombre funciona porque los datos están en memoria.
                    MaquinistaAsignadoNombre = et.Maquinista.Nombre
                })
                .ToList();

            return Ok(assignments);
        }
    }
}