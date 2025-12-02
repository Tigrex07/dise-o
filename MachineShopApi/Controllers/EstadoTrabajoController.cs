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
            // 1. Obtener la Solicitud (CRÍTICO: Incluir la Revisión para poder actualizar la prioridad)
            var solicitud = await _context.Solicitudes
                .Include(s => s.Revision)
                .FirstOrDefaultAsync(s => s.Id == estadoDto.IdSolicitud);

            // Validaciones
            if (solicitud == null || !await _context.Usuarios.AnyAsync(u => u.Id == estadoDto.IdMaquinista))
            {
                return BadRequest("El ID de Solicitud o Maquinista proporcionado no es válido.");
            }

            if (solicitud.Revision == null)
            {
                return StatusCode(500, "Error: No se encontró la revisión asociada a la solicitud.");
            }

            // =================================================
            // 2. LÓGICA DE CIERRE DE OPERACIÓN PREVIA
            // =================================================
            var ultimaOperacionAbierta = await _context.EstadoTrabajo
                .Where(e => e.IdSolicitud == estadoDto.IdSolicitud && e.FechaYHoraDeFin == null)
                .OrderByDescending(e => e.FechaYHoraDeInicio)
                .FirstOrDefaultAsync();

            var now = DateTime.Now; // 👈 Capturamos la marca de tiempo una sola vez

            if (ultimaOperacionAbierta != null)
            {
                ultimaOperacionAbierta.FechaYHoraDeFin = now; // Se cierra el log

                // 🚨 MODIFICACIÓN CLAVE: Si es el log de asignación inicial, el tiempo es 0.
                if (ultimaOperacionAbierta.DescripcionOperacion.StartsWith("Asignación inicial:"))
                {
                    ultimaOperacionAbierta.TiempoMaquina = 0.00m; // <-- Forzamos el tiempo a cero
                }
                else
                {
                    // Calcular la duración normal si es un log de trabajo real (ej. de "INICIO")
                    TimeSpan duracion = ultimaOperacionAbierta.FechaYHoraDeFin.Value - ultimaOperacionAbierta.FechaYHoraDeInicio;
                    ultimaOperacionAbierta.TiempoMaquina = (decimal)duracion.TotalHours;
                }
                _context.Entry(ultimaOperacionAbierta).State = EntityState.Modified;
            }

            // =================================================
            // 3. CREACIÓN DEL NUEVO REGISTRO Y CONTROL DE FLUJO
            // =================================================

            DateTime? fechaFinLog = null;
            decimal tiempoMaquinaLog = 0.00m;

            // 💡 Flujo de Finalización: Prioridad == "Completado"
            if (estadoDto.Prioridad == "Completado")
            {
                // Este registro se cierra inmediatamente y usa el tiempo enviado desde el frontend
                fechaFinLog = now; // Usamos el tiempo capturado
                tiempoMaquinaLog = estadoDto.TiempoMaquina;

                // CRÍTICO: Actualizar el estado de la Revisión
                solicitud.Revision.Prioridad = "Completado";
                solicitud.Revision.FechaHoraRevision = now; // Usamos el tiempo capturado

                _context.Entry(solicitud.Revision).State = EntityState.Modified;

            }
            // 💡 Flujo de Pausa: Prioridad == "Pausada"
            else if (estadoDto.Prioridad == "Pausada")
            {
                fechaFinLog = now; // Usamos el tiempo capturado
                tiempoMaquinaLog = 0.00m;
            }
            // Flujo de Inicio/Reanudación (Prioridad == "En progreso") usa los valores por defecto.


            // 3b. Crear el nuevo registro de EstadoTrabajo
            var nuevoEstadoTrabajo = new EstadoTrabajo
            {
                IdSolicitud = estadoDto.IdSolicitud,
                IdMaquinista = estadoDto.IdMaquinista,

                // Usamos los campos del DTO
                MaquinaAsignada = estadoDto.MaquinaAsignada,
                DescripcionOperacion = estadoDto.DescripcionOperacion,
                Observaciones = estadoDto.Observaciones,

                FechaYHoraDeInicio = now, // Usamos el tiempo capturado
                FechaYHoraDeFin = fechaFinLog,
                TiempoMaquina = tiempoMaquinaLog,
            };

            _context.EstadoTrabajo.Add(nuevoEstadoTrabajo);

            // 4. Guardar todos los cambios
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            // 5. Respuesta (simplificada a 204 No Content para mayor robustez)
            return NoContent();
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