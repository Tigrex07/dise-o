using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Models;
using MachineShopApi.DTOs;
using MachineShopApi.Data;

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
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EstadoTrabajo>>> GetEstadosTrabajo()
        {
            // Incluir Solicitud y Maquinista (Usuario)
            return await _context.EstadoTrabajos
                .Include(e => e.Solicitud)
                .Include(e => e.Maquinista)
                .ToListAsync();
        }

        // POST: api/EstadoTrabajo
        // Esta acción registra el inicio del trabajo en una solicitud.
        // Necesitas un EstadoTrabajoCreationDto
        [HttpPost]
        public async Task<ActionResult<EstadoTrabajo>> PostEstadoTrabajo(EstadoTrabajoCreationDto estadoDto)
        {
            // 1. Crear el registro de inicio de trabajo
            var estadoTrabajo = new EstadoTrabajo
            {
                IdSolicitud = estadoDto.IdSolicitud,
                IdMaquinista = estadoDto.IdMaquinista,
                FechaHoraInicio = DateTime.Now,
                MaquinaAsignada = estadoDto.MaquinaAsignada,
                TiempoMaquina = TimeSpan.Zero, // Se inicializa en 0
                Observaciones = estadoDto.Observaciones
            };

            _context.EstadoTrabajos.Add(estadoTrabajo);

            // 2. ACTUALIZAR EL ESTADO DE LA SOLICITUD
            var solicitud = await _context.Solicitudes.FindAsync(estadoDto.IdSolicitud);
            if (solicitud != null)
            {
                solicitud.EstadoActual = "En Proceso: " + estadoTrabajo.MaquinaAsignada;
                _context.Entry(solicitud).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEstadosTrabajo), new { id = estadoTrabajo.IdEstado }, estadoTrabajo);
        }

        // ... (Puedes agregar un método PUT/PATCH para registrar el FIN del trabajo,
        // actualizando el TiempoMaquina y cambiando el estado de la Solicitud a "Terminado") ...
    }
}