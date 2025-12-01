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

        [HttpPost]
        public async Task<ActionResult<EstadoTrabajo>> PostEstadoTrabajo([FromBody] EstadoTrabajoCreationDto estadoDto)
        {
            // 1. Obtener la Solicitud y validaciones básicas
            var solicitud = await _context.Solicitudes
                .Include(s => s.Revision)
                .FirstOrDefaultAsync(s => s.Id == estadoDto.IdSolicitud);

            if (solicitud == null || !await _context.Usuarios.AnyAsync(u => u.Id == estadoDto.IdMaquinista))
            {
                return BadRequest("El ID de Solicitud o Maquinista proporcionado no es válido.");
            }

            // =================================================
            // 2. LÓGICA DE CIERRE DE OPERACIÓN PREVIA
            // Se calcula el tiempo trabajado en el segmento anterior (si estaba en progreso)
            // =================================================
            var ultimaOperacionAbierta = await _context.EstadoTrabajo
                .Where(e => e.IdSolicitud == estadoDto.IdSolicitud && e.FechaYHoraDeFin == null)
                .OrderByDescending(e => e.FechaYHoraDeInicio)
                .FirstOrDefaultAsync();

            if (ultimaOperacionAbierta != null)
            {
                ultimaOperacionAbierta.FechaYHoraDeFin = DateTime.Now;
                TimeSpan duracion = ultimaOperacionAbierta.FechaYHoraDeFin.Value - ultimaOperacionAbierta.FechaYHoraDeInicio;
                ultimaOperacionAbierta.TiempoMaquina = (decimal)duracion.TotalHours;
                _context.Entry(ultimaOperacionAbierta).State = EntityState.Modified;
            }

            // =================================================
            // 3. CONTROL DE FLUJO
            // =================================================

            // 💡 FLUJO A: FINALIZAR EL TRABAJO
            if (estadoDto.Prioridad == "Completado")
            {
                // 3a. Validar si la Revisión existe para poder actualizar la Prioridad.
                if (solicitud.Revision == null)
                {
                    return StatusCode(500, "Error: No se encontró la revisión asociada para actualizar la prioridad.");
                }

                // 3b. Actualizar la Prioridad de la Revisión (Esto mueve el estado en los filtros)
                solicitud.Revision.Prioridad = "Completado";

                // 3c. Opcional: Almacenar los Tiempos Registrados (si el modelo Solicitud no lo permite, 
                // se puede almacenar en la tabla de Observaciones o en un campo de la Solicitud).
                // Si la Solicitud no tiene un campo para tiempos, puedes guardarlo en las Observaciones
                // de la última operación o en un nuevo registro de EstadoTrabajo.

                // Opción simple: Si queremos guardar el JSON de tiempos en la última operación cerrada:
                if (ultimaOperacionAbierta != null)
                {
                    ultimaOperacionAbierta.Observaciones =
                        (ultimaOperacionAbierta.Observaciones ?? string.Empty)
                        + "\n--- Tiempos Finales ---\n"
                        + estadoDto.TiemposRegistradosJson;
                    ultimaOperacionAbierta.Observaciones = estadoDto.Observaciones; // Sobreescribe con las observaciones finales

                    _context.Entry(ultimaOperacionAbierta).State = EntityState.Modified;
                }

                // 3d. Guardar cambios (Cierre de última operación y cambio de prioridad)
                await _context.SaveChangesAsync();

                return NoContent(); // Respuesta 204 para indicar éxito sin contenido de retorno
            }

            // 💡 FLUJO B: INICIO o PAUSA (Cualquier otra acción que no sea "Completado")
            else
            {
                // 3e. Crear un nuevo registro de estado (INICIO o PAUSA)
                var nuevoEstadoTrabajo = new EstadoTrabajo
                {
                    IdSolicitud = estadoDto.IdSolicitud,
                    IdMaquinista = estadoDto.IdMaquinista,
                    // Se usa la máquina asignada de la Solicitud, o del DTO si se manda.
                    MaquinaAsignada = estadoDto.MaquinaAsignada ?? solicitud.Pieza.Maquina,
                    DescripcionOperacion = estadoDto.DescripcionOperacion,
                    Observaciones = estadoDto.Observaciones,
                    FechaYHoraDeInicio = DateTime.Now,
                    FechaYHoraDeFin = null, // Se deja abierto
                    TiempoMaquina = 0.00m,
                };

                _context.EstadoTrabajo.Add(nuevoEstadoTrabajo);

                // 3f. Guardar cambios (Cierre de operación previa y creación de la nueva)
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetHistorialSolicitud), new { idSolicitud = nuevoEstadoTrabajo.IdSolicitud }, nuevoEstadoTrabajo);
            }
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