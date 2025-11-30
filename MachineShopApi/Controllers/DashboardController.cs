using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

// Asegúrate de que estos using sean correctos
using MachineShopApi.Data;
using MachineShopApi.DTOs;
using MachineShopApi.Models;


[Route("api/[controller]")]
[ApiController]
public class DashboardController : ControllerBase
{
    private readonly MachineShopContext _context;

    public DashboardController(MachineShopContext context)
    {
        _context = context;
    }

    [HttpGet("FullDetails/{idSolicitud}")]
    public async Task<ActionResult<SolicitudDetalleDto>> GetFullSolicitudDetails(int idSolicitud)
    {
        // 1. Obtener la Solicitud base y sus dependencias
        var solicitud = await _context.Solicitudes
            // Incluye Pieza y su Área (necesario para Maquina y AreaNombre)
            .Include(s => s.Pieza)
            .ThenInclude(p => p.Area)
            // Incluimos Solicitante para obtener el nombre (Usuario.Nombre)
            .Include(s => s.Solicitante)
            .FirstOrDefaultAsync(s => s.Id == idSolicitud);

        if (solicitud == null)
        {
            return NotFound();
        }

        // 2. Obtener Revisión (última)
        var ultimaRevision = await _context.Revisiones
            .Include(r => r.Revisor) // Revisor es un Usuario
            .Where(r => r.IdSolicitud == idSolicitud)
            .OrderByDescending(r => r.FechaHoraRevision)
            .Select(r => new RevisionDetalleDto
            {
                RevisorNombre = r.Revisor.Nombre, // Asumiendo Usuario tiene .Nombre
                Prioridad = r.Prioridad,
                Comentarios = r.Comentarios,
                FechaHoraRevision = r.FechaHoraRevision
            })
            .FirstOrDefaultAsync();

        // 3. Obtener Historial de Estado de Trabajo
        var historialEstadoTrabajo = await _context.EstadoTrabajo
            .Include(et => et.Maquinista) // Maquinista es un Usuario
            .Where(et => et.IdSolicitud == idSolicitud)
            .OrderByDescending(et => et.FechaYHoraDeInicio)
            .Select(et => new EstadoTrabajoDetalleDto
            {
                Id = et.Id,
                DescripcionOperacion = et.DescripcionOperacion,
                MaquinaAsignada = et.MaquinaAsignada,
                MaquinistaNombre = et.Maquinista.Nombre, // Asumiendo Usuario tiene .Nombre
                FechaYHoraDeInicio = et.FechaYHoraDeInicio,
                FechaYHoraDeFin = et.FechaYHoraDeFin,
                TiempoMaquina = et.TiempoMaquina,
                Observaciones = et.Observaciones
            })
            .ToListAsync();

        // Determinar Prioridad y Estado Operacional (son campos derivados)
        var prioridadActual = ultimaRevision?.Prioridad ?? "En Revisión";
        var ultimoEstado = historialEstadoTrabajo.FirstOrDefault()?.DescripcionOperacion;

        // 4. Mapear y devolver el DTO consolidado
        var detalleDto = new SolicitudDetalleDto
        {
            Id = solicitud.Id,

            // 🚨 CORRECCIÓN FINAL CS1061: Usamos Pieza.NombrePieza
            PiezaNombre = solicitud.Pieza?.NombrePieza,
            //Maquina = $"[{solicitud.Pieza?.Maquina}]", // Envía el valor entre corchetes
            Maquina = solicitud.Pieza?.Maquina ?? "No Asignada",

            Turno = solicitud.Turno,
            Tipo = solicitud.Tipo,

            SolicitanteNombre = solicitud.Solicitante?.Nombre, // Asumiendo Solicitante (Usuario) tiene .Nombre

            Detalles = solicitud.Detalles,
            Dibujo = solicitud.Dibujo,

            PrioridadActual = prioridadActual,
            EstadoOperacional = ultimoEstado ?? (ultimaRevision != null ? "Aprobada/En Espera" : "En Revisión"),

            FechaYHora = solicitud.FechaYHora,

            // 🚨 CORRECCIÓN FINAL CS0117: Usamos Pieza.Area.NombreArea (coincide con el modelo Area.cs)
            AreaNombre = solicitud.Pieza?.Area?.NombreArea,

            // Secciones Consolidadas
            Revision = ultimaRevision,
            UltimoEstadoTrabajo = historialEstadoTrabajo.FirstOrDefault(),
            HistorialTrabajo = historialEstadoTrabajo
        };

        return Ok(detalleDto);
    }
}