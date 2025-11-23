using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Data;
using MachineShopApi.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// Agregamos el namespace para PiezaCreationDto
using MachineShopApi.DTOs;

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
            // 🚨 CORRECCIÓN: Usamos 'Pieza?' para indicar que el resultado puede ser null (quita la advertencia CS8601)
            var pieza = await _context.Piezas.Include(p => p.Area).FirstOrDefaultAsync(p => p.Id == id);

            if (pieza == null)
            {
                return NotFound();
            }

            // Al llegar aquí, 'pieza' es definitivamente no-nula.
            return pieza;
        }

        // POST: api/Piezas
        // Necesitas un PiezaCreationDto con IdArea, NombrePieza y Máquina
        [HttpPost]
        public async Task<ActionResult<Pieza>> PostPieza(PiezaCreationDto piezaDto)
        {
            // 💡 MEJORA: Validar si el IdArea existe antes de crear la pieza
            var areaExiste = await _context.Areas.AnyAsync(a => a.Id == piezaDto.IdArea);
            if (!areaExiste)
            {
                return BadRequest($"El ID de Área '{piezaDto.IdArea}' no existe.");
            }

            var pieza = new Pieza
            {
                IdArea = piezaDto.IdArea,
                NombrePieza = piezaDto.NombrePieza,
                Maquina = piezaDto.Maquina
            };

            _context.Piezas.Add(pieza);
            await _context.SaveChangesAsync();

            // 💡 MEJORA: Devolver el objeto Pieza con la relación de Área cargada
            // Incluimos el área para la respuesta CreatedAtAction
            await _context.Entry(pieza).Reference(p => p.Area).LoadAsync();

            return CreatedAtAction(nameof(GetPieza), new { id = pieza.Id }, pieza);
        }

        // ... (Implementar PUT y DELETE de forma similar al controlador de Areas) ...
    }
}