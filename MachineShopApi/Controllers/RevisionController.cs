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
        // Crea una nueva revisión y actualiza la prioridad de la solicitud.
        [HttpPost]
        public async Task<ActionResult<Revision>> PostRevision(RevisionCreationDto revisionDto)
        {
            // 1. Validaciones
            var solicitudExiste = await _context.Solicitudes.AnyAsync(s => s.Id == revisionDto.IdSolicitud);
            var revisorExiste = await _context.Usuarios.AnyAsync(u => u.Id == revisionDto.IdRevisor);

            if (!solicitudExiste || !revisorExiste)
            {
                return BadRequest("El ID de Solicitud o Revisor proporcionado no es válido.");
            }

            // Verificar que no exista ya una revisión para esta solicitud (Relación 1:1)
            var revisionExistente = await _context.Revisiones.AnyAsync(r => r.IdSolicitud == revisionDto.IdSolicitud);
            if (revisionExistente)
            {
                // Este es el error 409 que el frontend maneja con un fallback a PUT
                return Conflict("Ya existe un registro de revisión para esta solicitud.");
            }

            // 2. Mapear DTO al Modelo
            var revision = new Revision
            {
                IdSolicitud = revisionDto.IdSolicitud,
                IdRevisor = revisionDto.IdRevisor,
                Prioridad = revisionDto.Prioridad,
                Comentarios = revisionDto.Comentarios,
                FechaHoraRevision = DateTime.Now
            };

            _context.Revisiones.Add(revision);

            // 3. FLUJO DE ESTADO: Crear un nuevo registro en EstadoTrabajo
            int idMaquinistaSistema = 1;

            var nuevoEstado = new EstadoTrabajo
            {
                IdSolicitud = revision.IdSolicitud,
                IdMaquinista = idMaquinistaSistema,
                MaquinaAsignada = "N/A",

                FechaYHoraDeInicio = DateTime.Now,
                FechaYHoraDeFin = null,

                DescripcionOperacion = $"Revisión de Ingeniería: Prioridad {revision.Prioridad}",
                TiempoMaquina = 0,
                Observaciones = "Prioridad y comentarios de ingeniería establecidos."
            };

            _context.EstadoTrabajo.Add(nuevoEstado);

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRevision), new { id = revision.Id }, revision);
        }

        // ------------------------------------------------------------------
        // 🚀 MÉTODO PUT: Actualizar la Revisión existente
        // Ruta: PUT api/Revision/{idSolicitud}
        // ------------------------------------------------------------------
        [HttpPut("{idSolicitud}")]
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

                // 5. FLUJO DE ESTADO: Crear un nuevo registro en EstadoTrabajo
                int idMaquinistaSistema = 1;

                var nuevoEstado = new EstadoTrabajo
                {
                    IdSolicitud = revision.IdSolicitud,
                    IdMaquinista = idMaquinistaSistema,
                    MaquinaAsignada = "N/A",

                    FechaYHoraDeInicio = DateTime.Now,
                    FechaYHoraDeFin = null,

                    DescripcionOperacion = $"Revisión de Ingeniería ACTUALIZADA: Prioridad {revision.Prioridad}",
                    TiempoMaquina = 0,
                    Observaciones = "Prioridad y comentarios de ingeniería re-establecidos."
                };

                _context.EstadoTrabajo.Add(nuevoEstado);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // 🚨 CORRECCIÓN: Usamos la llamada directa a AnyAsync para la verificación
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
    }
}