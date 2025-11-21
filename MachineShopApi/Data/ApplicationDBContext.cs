using Microsoft.EntityFrameworkCore;
using MachineShopApi.Models;
using System;

namespace MachineShopApi.Data
{
    // Clase principal para la conexión y configuración de la base de datos (DB Context)
    public class MachineShopContext : DbContext
    {
        // Constructor que recibe las opciones de configuración del contexto
        public MachineShopContext(DbContextOptions<MachineShopContext> options)
            : base(options)
        {
        }

        // --- Definición de Tablas (DbSet) ---
        // Estas propiedades representan las colecciones (tablas) en la base de datos.
        public DbSet<Usuario> Usuarios { get; set; } = default!;
        public DbSet<Area> Areas { get; set; } = default!;
        public DbSet<Pieza> Piezas { get; set; } = default!;
        public DbSet<Solicitud> Solicitudes { get; set; } = default!;
        public DbSet<EstadoTrabajo> EstadoTrabajos { get; set; } = default!;
        public DbSet<Revision> Revisiones { get; set; } = default!;

        public DbSet<Revision> Revision { get; set; } = default!;
        public DbSet<EstadoTrabajo> EstadoTrabajo { get; set; } = default!;

        // Configuración de Modelos y Relaciones (Fluent API)
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ====================================================================
            // RELACIONES DE SOLICITUD
            // ====================================================================

            // Solicitud (Solicitante) <--> Usuario (Relación 1 a muchos: Un Usuario puede tener muchas Solicitudes, una Solicitud tiene un Solicitante)
            modelBuilder.Entity<Solicitud>()
                .HasOne(s => s.Solicitante) // Una Solicitud tiene un Solicitante
                .WithMany(u => u.SolicitudesRealizadas) // Un Usuario puede tener muchas SolicitudesRealizadas
                .HasForeignKey(s => s.SolicitanteId) // Clave foránea en Solicitud
                .OnDelete(DeleteBehavior.Restrict); // Restringir la eliminación del Usuario si tiene Solicitudes asociadas

            // Solicitud <--> Pieza (Relación 1 a muchos: Una Pieza puede estar en muchas Solicitudes, una Solicitud es para una Pieza)
            modelBuilder.Entity<Solicitud>()
                .HasOne(s => s.Pieza) // Una Solicitud tiene una Pieza
                .WithMany(p => p.Solicitudes) // Una Pieza puede tener muchas Solicitudes
                .HasForeignKey(s => s.IdPieza); // Clave foránea en Solicitud

            // Solicitud <--> EstadoTrabajo (Relación 1 a 1: Una solicitud tiene un único EstadoTrabajo)
            modelBuilder.Entity<Solicitud>()
                .HasOne(s => s.EstadoTrabajo) // Una Solicitud tiene un EstadoTrabajo
                .WithOne(e => e.Solicitud) // El EstadoTrabajo está asociado a una Solicitud
                .HasForeignKey<EstadoTrabajo>(e => e.IdSolicitud); // La clave foránea está en EstadoTrabajo

            // Solicitud <--> Revision (Relación 1 a 1: Una solicitud tiene una única Revisión)
            modelBuilder.Entity<Solicitud>()
                .HasOne(s => s.Revision) // Una Solicitud tiene una Revisión
                .WithOne(r => r.Solicitud) // La Revisión está asociada a una Solicitud
                .HasForeignKey<Revision>(r => r.IdSolicitud); // La clave foránea está en Revision

            // ====================================================================
            // OTRAS RELACIONES
            // ====================================================================

            // Pieza <--> Area (Relación 1 a muchos: Un Área puede tener muchas Piezas, una Pieza pertenece a un Área)
            modelBuilder.Entity<Pieza>()
                .HasOne(p => p.Area) // Una Pieza pertenece a un Área
                .WithMany(a => a.Piezas) // Un Área tiene muchas Piezas
                .HasForeignKey(p => p.IdArea); // Clave foránea en Pieza

            // Area (ResponsableArea) <--> Usuario (Relación 1 a 1/muchos: Un Usuario puede ser Responsable de 0 o más Áreas)
            modelBuilder.Entity<Area>()
                .HasOne(a => a.ResponsableArea) // Un Área tiene un ResponsableArea
                .WithMany() // El Usuario puede ser responsable de muchas áreas (relación auto-descubierta)
                .HasForeignKey(a => a.ResponsableAreaId) // Clave foránea en Area
                .OnDelete(DeleteBehavior.SetNull); // Si el Usuario es eliminado, el ResponsableAreaId se establece en NULL

            // EstadoTrabajo (Maquinista) <--> Usuario (Relación 1 a muchos: Un Usuario puede ser Maquinista de varios EstadosTrabajo)
            modelBuilder.Entity<EstadoTrabajo>()
                .HasOne(e => e.Maquinista) // Un EstadoTrabajo tiene un Maquinista asignado
                .WithMany() // El Maquinista puede tener muchos EstadosTrabajo (relación auto-descubierta)
                .HasForeignKey(e => e.IdMaquinista) // Clave foránea en EstadoTrabajo
                .OnDelete(DeleteBehavior.Restrict); // Restringir la eliminación del Maquinista

            // Revision (Revisor) <--> Usuario (Relación 1 a muchos: Un Usuario puede ser Revisor de varias Revisiones)
            modelBuilder.Entity<Revision>()
                .HasOne(r => r.Revisor) // Una Revisión tiene un Revisor asignado
                .WithMany() // El Revisor puede tener muchas Revisiones (relación auto-descubierta)
                .HasForeignKey(r => r.IdRevisor) // Clave foránea en Revision
                .OnDelete(DeleteBehavior.Restrict); // Restringir la eliminación del Revisor

            base.OnModelCreating(modelBuilder);
        }
    }
}