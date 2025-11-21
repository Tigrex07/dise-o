using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Models;
using MachineShopApi.DTOs;
using MachineShopApi.Data;

namespace MachineShopApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PiezasController : ControllerBase
    {
        private readonly MachineShopContext _context;

        public PiezasController(MachineShopContext context)
        {
            _context = context;
        }

        // GET: api/Piezas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pieza>>> GetPiezas()
        {
            // Incluimos el área para referencia rápida
            return await _context.Piezas.Include(p => p.Area).ToListAsync();
        }

        // GET: api/Piezas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Pieza>> GetPieza(int id)
        {
            var pieza = await _context.Piezas.Include(p => p.Area).FirstOrDefaultAsync(p => p.Id == id);

            if (pieza == null)
            {
                return NotFound();
            }

            return pieza;
        }

        // POST: api/Piezas
        // Necesitas un PiezaCreationDto con IdArea, NombrePieza y Máquina
        [HttpPost]
        public async Task<ActionResult<Pieza>> PostPieza(PiezaCreationDto piezaDto)
        {
            var pieza = new Pieza
            {
                IdArea = piezaDto.IdArea,
                NombrePieza = piezaDto.NombrePieza,
                Maquina = piezaDto.Maquina
            };

            _context.Piezas.Add(pieza);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPieza), new { id = pieza.Id }, pieza);
        }

        // ... (Implementar PUT y DELETE de forma similar al controlador de Areas) ...
    }
}