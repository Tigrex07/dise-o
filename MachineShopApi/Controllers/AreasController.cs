using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Data; // Asegúrate de que este es el namespace de tu DbContext
using MachineShopApi.Models;
using MachineShopApi.DTOs; // Usaremos DTOs para la creación/edición

namespace MachineShopApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AreasController : ControllerBase
    {
        private readonly MachineShopContext _context;

        public AreasController(MachineShopContext context)
        {
            _context = context;
        }

        // GET: api/Areas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Area>>> GetAreas()
        {
            // Incluimos al responsable para mostrar quién está a cargo
            return await _context.Areas.Include(a => a.ResponsableArea).ToListAsync();
        }

        // GET: api/Areas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Area>> GetArea(int id)
        {
            var area = await _context.Areas.Include(a => a.ResponsableArea).FirstOrDefaultAsync(a => a.Id == id);

            if (area == null)
            {
                return NotFound();
            }

            return area;
        }

        // POST: api/Areas
        // Necesitas un AreaCreationDto con NombreArea y ResponsableAreaId
        [HttpPost]
        public async Task<ActionResult<Area>> PostArea(AreaCreationDto areaDto)
        {
            var area = new Area
            {
                NombreArea = areaDto.NombreArea,
                ResponsableAreaId = areaDto.ResponsableAreaId
            };

            _context.Areas.Add(area);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetArea), new { id = area.Id }, area);
        }

        // PUT: api/Areas/5
        // Nota: Se recomienda usar DTOs de edición para control.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutArea(int id, AreaUpdateDto areaDto)
        {
            var area = await _context.Areas.FindAsync(id);

            if (area == null)
            {
                return NotFound();
            }

            area.NombreArea = areaDto.NombreArea;
            area.ResponsableAreaId = areaDto.ResponsableAreaId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Lógica para manejar la concurrencia
                if (!_context.Areas.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent(); // 204 Success
        }

        // DELETE: api/Areas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArea(int id)
        {
            var area = await _context.Areas.FindAsync(id);
            if (area == null)
            {
                return NotFound();
            }

            _context.Areas.Remove(area);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}