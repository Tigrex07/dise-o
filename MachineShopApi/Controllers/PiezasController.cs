using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Data;
using MachineShopApi.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// Agregamos el namespace para PiezaCreationDto (Asumido)
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
            var pieza = await _context.Piezas.Include(p => p.Area).FirstOrDefaultAsync(p => p.Id == id);

            if (pieza == null)
            {
                return NotFound();
            }

            return pieza;
        }

        // POST: api/Piezas
        [HttpPost]
        public async Task<ActionResult<Pieza>> PostPieza(PiezaCreationDto piezaDto)
        {
            // Validar si el IdArea existe antes de crear la pieza
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

            // Incluimos el área para la respuesta CreatedAtAction
            await _context.Entry(pieza).Reference(p => p.Area).LoadAsync();

            return CreatedAtAction(nameof(GetPieza), new { id = pieza.Id }, pieza);
        }

        // ===============================================
        // 💡 NUEVO: PUT (Actualización)
        // ===============================================
        // PUT: api/Piezas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPieza(int id, PiezaCreationDto piezaDto)
        {
            // 1. Buscar la pieza existente
            var pieza = await _context.Piezas.FindAsync(id);
            if (pieza == null)
            {
                return NotFound($"Pieza con ID {id} no encontrada.");
            }

            // 2. Validar si el IdArea existe
            var areaExiste = await _context.Areas.AnyAsync(a => a.Id == piezaDto.IdArea);
            if (!areaExiste)
            {
                return BadRequest($"El ID de Área '{piezaDto.IdArea}' no existe.");
            }

            // 3. Actualizar las propiedades
            pieza.IdArea = piezaDto.IdArea;
            pieza.NombrePieza = piezaDto.NombrePieza;
            pieza.Maquina = piezaDto.Maquina;

            _context.Entry(pieza).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Manejo de concurrencia: si no existe (alguien la borró), retorna NotFound
                if (!_context.Piezas.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            // Retorna 204 No Content (Éxito sin contenido de retorno)
            return NoContent();
        }

        // ===============================================
        // 💡 NUEVO: DELETE (Eliminación)
        // ===============================================
        // DELETE: api/Piezas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePieza(int id)
        {
            var pieza = await _context.Piezas.FindAsync(id);
            if (pieza == null)
            {
                return NotFound();
            }

            _context.Piezas.Remove(pieza);
            await _context.SaveChangesAsync();

            // Retorna 204 No Content (Éxito sin contenido de retorno)
            return NoContent();
        }
    }
}
