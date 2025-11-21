using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Models;
using MachineShopApi.DTOs;
using MachineShopApi.Data;

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

        // GET: api/Revision
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Revision>>> GetRevisiones()
        {
            // Incluimos la Solicitud y el Revisor (Usuario) para contexto
            return await _context.Revisiones
                .Include(r => r.Solicitud)
                .Include(r => r.Revisor)
                .ToListAsync();
        }

        // POST: api/Revision
        // Esta es la acción de 'aprobar/devolver' una solicitud.
        // Necesitas un RevisionCreationDto con IdSolicitud, IdRevisor, NivelUrgencia, EstadoRevision, Comentarios
        [HttpPost]
        public async Task<ActionResult<Revision>> PostRevision(RevisionCreationDto revisionDto)
        {
            // 1. Crear el objeto Revision
            var revision = new Revision
            {
                IdSolicitud = revisionDto.IdSolicitud,
                IdRevisor = revisionDto.IdRevisor,
                NivelUrgencia = revisionDto.NivelUrgencia,
                EstadoRevision = revisionDto.EstadoRevision,
                Comentarios = revisionDto.Comentarios,
                FechaHoraRevision = DateTime.Now // Se registra la fecha actual
            };

            _context.Revisiones.Add(revision);

            // 2. ACTUALIZAR EL ESTADO DE LA SOLICITUD ASOCIADA
            var solicitud = await _context.Solicitudes.FindAsync(revisionDto.IdSolicitud);
            if (solicitud == null)
            {
                // Manejar error si la solicitud no existe
                return NotFound("Solicitud asociada no encontrada.");
            }

            // Actualizar el estado y la prioridad de la solicitud
            solicitud.Prioridad = revisionDto.NivelUrgencia;
            solicitud.EstadoActual = "Revisado: " + revisionDto.EstadoRevision;
            _context.Entry(solicitud).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRevisiones), new { id = revision.IdRevision }, revision);
        }

        // ... (Implementar GET/{id} y los demás métodos si son necesarios.
        // Las revisiones a menudo no se editan/eliminan después de crearse por motivos de auditoría.) ...
    }
}