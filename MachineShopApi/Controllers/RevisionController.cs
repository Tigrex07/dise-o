using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Models;
using MachineShopApi.DTOs;
using MachineShopApi.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace MachineShopApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RevisionController : ControllerBase
    {
        private readonly MachineShopContext _context;

        public RevisionController(MachineShopContext context)
        {
            _context = context;
        }

        // POST: api/Revision
        // Crea una nueva revisión y actualiza la prioridad de la solicitud.solicitud.PrioridadActual
        [HttpPost]
        // 🚨 CAMBIO CRÍTICO 1: Usamos el DTO de APROBACIÓN
        public async Task<ActionResult<Revision>> PostRevision(RevisionApprovalDto approvalDto)
        {
            // 1. Validaciones
            var solicitudExiste = await _context.Solicitudes.AnyAsync(s => s.Id == approvalDto.IdSolicitud);
            var revisorExiste = await _context.Usuarios.AnyAsync(u => u.Id == approvalDto.IdRevisor);
            // 🚨 NUEVA VALIDACIÓN: Maquinista Asignado debe existir
            var maquinistaExiste = await _context.Usuarios.AnyAsync(u => u.Id == approvalDto.IdMaquinistaAsignado);


            if (!solicitudExiste || !revisorExiste || !maquinistaExiste)
            {
                return BadRequest("El ID de Solicitud, Revisor o Maquinista proporcionado no es válido.");
            }

            // Verificar que no exista ya una revisión para esta solicitud (Relación 1:1)
            var revisionExistente = await _context.Revisiones.AnyAsync(r => r.IdSolicitud == approvalDto.IdSolicitud);
            if (revisionExistente)
            {
                // Este es el error 409 que el frontend maneja con un fallback a PUT
                return Conflict("Ya existe un registro de revisión para esta solicitud. Use el método PUT para actualizar.");
            }

            // =======================================================
            // 2. CREAR REGISTRO DE REVISIÓN
            // =======================================================
            var revision = new Revision
            {
                IdSolicitud = approvalDto.IdSolicitud,
                IdRevisor = approvalDto.IdRevisor,
                Prioridad = approvalDto.Prioridad,
                Comentarios = approvalDto.Comentarios,
                FechaHoraRevision = DateTime.Now
            };
            _context.Revisiones.Add(revision);

            // =======================================================
            // 3. CREAR REGISTRO DE ESTADO DE TRABAJO (Asignación)
            // =======================================================
            var nuevoEstado = new EstadoTrabajo
            {
                IdSolicitud = revision.IdSolicitud,
                // 🚨 CAMBIO CRÍTICO 2: Usamos el ID y la máquina del DTO
                IdMaquinista = approvalDto.IdMaquinistaAsignado,
                MaquinaAsignada = "N/A",

                FechaYHoraDeInicio = DateTime.Now,
                FechaYHoraDeFin = null,

                DescripcionOperacion = $"Asignación inicial: Prioridad {revision.Prioridad}",
                TiempoMaquina = 0,
                Observaciones = $"Solicitud aprobada y asignada al Maquinista ID {approvalDto.IdMaquinistaAsignado}. Pendiente de inicio de trabajo y asignación de máquina."
            };

            _context.EstadoTrabajo.Add(nuevoEstado);

            await _context.SaveChangesAsync();

            // Devolver la revisión creada
            return CreatedAtAction(nameof(GetRevision), new { id = revision.Id }, revision);
        }

        // ------------------------------------------------------------------
        // 🚀 MÉTODO PUT: Actualizar la Revisión existente
        // Ruta: PUT api/Revision/{idSolicitud}
        // ------------------------------------------------------------------
        [HttpPut("{idSolicitud}")]
        // 🚨 CAMBIO CRÍTICO 3: Seguimos usando el DTO simple (asumiendo que es RevisionCreationDto)
        public async Task<IActionResult> PutRevision(int idSolicitud, RevisionCreationDto revisionDto)
        {
            if (idSolicitud != revisionDto.IdSolicitud)
            {
                return BadRequest("El ID de Solicitud en la ruta no coincide con el cuerpo de la solicitud.");
            }

            // 1. Buscar la revisión existente por IdSolicitud (Relación 1:1)
            var revision = await _context.Revisiones
                .FirstOrDefaultAsync(r => r.IdSolicitud == idSolicitud);

            if (revision == null)
            {
                return NotFound($"No se encontró una revisión para la Solicitud ID {idSolicitud}.");
            }

            // 2. Validar que el revisor exista
            var revisorExiste = await _context.Usuarios.AnyAsync(u => u.Id == revisionDto.IdRevisor);

            if (!revisorExiste)
            {
                return BadRequest("El ID de Revisor proporcionado no es válido.");
            }

            // 3. Aplicar los cambios al modelo existente
            revision.Prioridad = revisionDto.Prioridad;
            revision.Comentarios = revisionDto.Comentarios;
            revision.IdRevisor = revisionDto.IdRevisor;
            revision.FechaHoraRevision = DateTime.Now;

            _context.Entry(revision).State = EntityState.Modified;

            try
            {
                // 4. Actualizar la revisión en la base de datos
                await _context.SaveChangesAsync();

                // 🚨 CAMBIO CRÍTICO 4: ELIMINAMOS la creación del registro en EstadoTrabajo aquí.
                // El PUT solo actualiza la revisión, no inicia una nueva operación.
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Revisiones.AnyAsync(e => e.IdSolicitud == idSolicitud))
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

        // GET: api/Revision/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Revision>> GetRevision(int id)
        {
            var revision = await _context.Revisiones.FindAsync(id);

            if (revision == null)
            {
                return NotFound();
            }

            return revision;
        }

        // NOTA: La función auxiliar RevisionExists fue eliminada para evitar el error de compilación.
    



    // ------------------------------------------------------------------
        // 🚀 NUEVO MÉTODO PUT: Actualizar solo la Prioridad de la Revisión
        // Ruta: PUT api/Revision/{idSolicitud}/priority
        // ------------------------------------------------------------------
        [HttpPut("{idSolicitud}/priority")]
        public async Task<IActionResult> PutRevisionPriority(int idSolicitud, [FromBody] RevisionPriorityUpdateDto priorityDto)
        {
            // 1. Buscar la revisión existente por IdSolicitud
            var revision = await _context.Revisiones
                .FirstOrDefaultAsync(r => r.IdSolicitud == idSolicitud);

            if (revision == null)
            {
                return NotFound($"No se encontró una revisión para la Solicitud ID {idSolicitud}.");
            }

            // 2. Aplicar solo el cambio de prioridad y la fecha de revisión
            string prioridadAnterior = revision.Prioridad;

            revision.Prioridad = priorityDto.NuevaPrioridad;
            revision.FechaHoraRevision = DateTime.Now; // Opcional: Registrar cuándo se cambió la prioridad

            _context.Entry(revision).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Revisiones.AnyAsync(e => e.IdSolicitud == idSolicitud))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            // 3. Opcional: Registrar el cambio en EstadoTrabajo (para historial)
            var nuevoEstado = new EstadoTrabajo
            {
                IdSolicitud = idSolicitud,
                // Opcional: Si quieres registrar qué usuario hizo el cambio (necesitas IdUsuario en el DTO o Token)
                // IdMaquinista = 1, 
                DescripcionOperacion = $"Prioridad de Revisión cambiada de '{prioridadAnterior}' a '{revision.Prioridad}'",
                FechaYHoraDeInicio = DateTime.Now,
                TiempoMaquina = 0,
            };
            _context.EstadoTrabajo.Add(nuevoEstado);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }



}