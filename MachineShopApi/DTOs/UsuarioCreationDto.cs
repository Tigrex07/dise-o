// Models/UsuarioCreationDto.cs

using System.ComponentModel.DataAnnotations;

namespace MachineShopApi.DTOs
{
	// DTO: Data Transfer Object
	// Usamos esta clase para definir qué campos esperamos recibir del cliente
	// cuando intenta crear un nuevo usuario.
	public class UsuarioCreationDto
	{
		// El nombre debe ser un campo obligatorio.
		[Required(ErrorMessage = "El nombre de usuario es obligatorio.")]
        [MaxLength(100)]

        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es obligatorio.")]
        public string Email { get; set; } = string.Empty;

        // El área es obligatoria.
        [Required(ErrorMessage = "El área es obligatoria.")]
        [MaxLength(50)]

        public string Area { get; set; } = string.Empty;

		// El rol es obligatorio y debe coincidir con uno de los roles válidos del negocio.
		// (Operador, Supervisor, Machine Shop)
		[Required(ErrorMessage = "El rol es obligatorio.")]
        [MaxLength(50)]

        public string Rol { get; set; } = string.Empty;

		// La propiedad 'Activo' se inicializará por defecto a 'Si' en el controlador
		// a menos que se indique lo contrario en el DTO, pero la omitiremos por simplicidad
		// y la gestionaremos directamente en el controlador.
	}
}