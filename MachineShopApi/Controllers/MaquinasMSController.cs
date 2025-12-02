using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineShopApi.Data;
using MachineShopApi.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MachineShopApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaquinaMSController : ControllerBase
    {
        private readonly MachineShopContext _context;

        // Inyección de dependencias para acceder a la base de datos
        public MaquinaMSController(MachineShopContext context)
        {
            _context = context;
        }

        // ==========================================================
        // 1. READ (GET) - Obtener todas las máquinas
        // GET: api/MaquinaMS
        // ==========================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MaquinaMS>>> GetMaquinasMS()
        {
            // Usamos el DbSet que definimos en el MachineShopContext
            return await _context.MaquinasMS.ToListAsync();
        }

        // ==========================================================
        // 2. READ (GET) - Obtener una máquina por ID
        // GET: api/MaquinaMS/5
        // ==========================================================
        [HttpGet("{id}")]
        public async Task<ActionResult<MaquinaMS>> GetMaquinaMS(int id)
        {
            var maquina = await _context.MaquinasMS.FindAsync(id);

            if (maquina == null)
            {
                return NotFound(); // Retorna 404 si no se encuentra
            }

            return maquina;
        }

        // ==========================================================
        // 3. CREATE (POST) - Crear una nueva máquina
        // POST: api/MaquinaMS
        // ==========================================================
        [HttpPost]
        public async Task<ActionResult<MaquinaMS>> PostMaquinaMS(MaquinaMS maquina)
        {
            // Validar que el nombre no esté vacío, ya que es [Required]
            if (string.IsNullOrWhiteSpace(maquina.Nombre))
            {
                return BadRequest("El nombre de la máquina es obligatorio.");
            }

            // Asignar Id a 0 o evitar que venga en el cuerpo de la solicitud
            maquina.Id = 0;

            _context.MaquinasMS.Add(maquina);
            await _context.SaveChangesAsync();

            // Retorna 201 Created y la ubicación para obtener el recurso recién creado
            return CreatedAtAction(nameof(GetMaquinaMS), new { id = maquina.Id }, maquina);
        }

        // ==========================================================
        // 4. UPDATE (PUT) - Actualizar una máquina existente
        // PUT: api/MaquinaMS/5
        // ==========================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMaquinaMS(int id, MaquinaMS maquina)
        {
            if (id != maquina.Id)
            {
                return BadRequest("El ID de la ruta no coincide con el ID del cuerpo de la solicitud.");
            }

            // Validar que el nombre no esté vacío
            if (string.IsNullOrWhiteSpace(maquina.Nombre))
            {
                return BadRequest("El nombre de la máquina es obligatorio.");
            }

            _context.Entry(maquina).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Manejo de concurrencia: si el elemento no existe al intentar guardar
                if (!MaquinaMSExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent(); // Retorna 204 No Content (éxito sin cuerpo de respuesta)
        }

        // ==========================================================
        // 5. DELETE (DELETE) - Eliminar una máquina
        // DELETE: api/MaquinaMS/5
        // ==========================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMaquinaMS(int id)
        {
            var maquina = await _context.MaquinasMS.FindAsync(id);
            if (maquina == null)
            {
                return NotFound(); // La máquina ya no existe
            }

            _context.MaquinasMS.Remove(maquina);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Método auxiliar para verificar la existencia (usado en el PUT)
        private bool MaquinaMSExists(int id)
        {
            return _context.MaquinasMS.Any(e => e.Id == id);
        }
    }
}