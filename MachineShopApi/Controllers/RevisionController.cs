using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Models;
using MachineShopApi.DTOs; // Asegúrate de tener RevisionCreationDto
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
                return Conflict("Ya existe un registro de revisión para esta solicitud.");
            }

            // 2. Mapear DTO al Modelo
            var revision = new Revision
            {
                IdSolicitud = revisionDto.IdSolicitud,
                IdRevisor = revisionDto.IdRevisor,
                // 🚨 CORREGIDO CS1061 (Línea 42 y 58): Usar Prioridad, no NivelUrgencia
                Prioridad = revisionDto.Prioridad,
                Comentarios = revisionDto.Comentarios,
                FechaHoraRevision = DateTime.Now
            };

            _context.Revisiones.Add(revision);

            // 3. 💡 FLUJO DE ESTADO: Crear un nuevo registro en EstadoTrabajo que indique el cambio de estado
            // Usamos Id=1 (Usuario de Sistema) para el estado inicial (que se creó con 'En Revisión').
            int idMaquinistaSistema = 1;

            var nuevoEstado = new EstadoTrabajo
            {
                IdSolicitud = revision.IdSolicitud,
                IdMaquinista = idMaquinistaSistema,
                MaquinaAsignada = "N/A",

                FechaYHoraDeInicio = DateTime.Now,
                FechaYHoraDeFin = null, // Como es solo un cambio de estado, el tiempo de máquina es 0/NULL

                DescripcionOperacion = $"Revisión de Ingeniería: Prioridad {revision.Prioridad}",
                TiempoMaquina = 0,
                Observaciones = "Prioridad y comentarios de ingeniería establecidos."
            };

            // 🚨 IMPORTANTE: Usar el DbSet correcto que es 'EstadoTrabajo' (no EstadoTrabajos)
            _context.EstadoTrabajo.Add(nuevoEstado);

            await _context.SaveChangesAsync();

            // 🚨 CORREGIDO CS1061 (Línea 63): Usar Id (PK del modelo), no IdRevision
            return CreatedAtAction(nameof(GetRevision), new { id = revision.Id }, revision);
        }

        // GET: api/Revision/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Revision>> GetRevision(int id)
        {
            // 🚨 CORREGIDO: Usar Id, no IdRevision
            var revision = await _context.Revisiones.FindAsync(id);

            if (revision == null)
            {
                return NotFound();
            }

            return revision;
        }

        // Otros métodos (GET ALL, PUT, DELETE) deben ser implementados.
        // El método PUT debe usar el DTO de actualización y el campo Prioridad.
    }
}