// RevisionApprovalDto.cs
using System.ComponentModel.DataAnnotations;

// DTO para la Aprobación inicial y Asignación de Trabajo
public class RevisionApprovalDto
{
	// Campos heredados de la Revisión
	[Required]
	public int IdSolicitud { get; set; }
	[Required]
	public int IdRevisor { get; set; }
	[Required, MaxLength(20)]
	public string Prioridad { get; set; } = string.Empty; // Ej: Urgente, Alta, Media, Baja

	public string? Comentarios { get; set; }

	// 💡 CAMPOS CRÍTICOS DE ASIGNACIÓN
	[Required]
	// El ID del maquinista seleccionado por la persona de revisión
	public int IdMaquinistaAsignado { get; set; }
	

}