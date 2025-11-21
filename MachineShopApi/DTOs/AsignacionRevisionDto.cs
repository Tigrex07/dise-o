// MachineShopApi/DTOs/AsignacionRevisionDto.cs

using System.ComponentModel.DataAnnotations;

public class AsignacionRevisionDto
{
	[Required]
	public int IdSolicitud { get; set; } // La solicitud que se está revisando

	[Required]
	// Corresponde a NivelUrgencia en la DB
	public string PrioridadRevisada { get; set; } = string.Empty;

	// Corresponde a Comentarios en Revision (nullable)
	public string? NotasIngenieria { get; set; }

	// Corresponde a IdMaquinista (int? permite null)
	// El frontend enviará null si no se asigna a nadie.
	public int? IdOperadorAsignado { get; set; }
}