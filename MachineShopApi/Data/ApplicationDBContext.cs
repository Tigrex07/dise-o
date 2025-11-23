using Microsoft.EntityFrameworkCore;
using MachineShopApi.Models;
using System;

namespace MachineShopApi.Data
{
    // Clase principal con nombre de clase MachineShopContext
    public class MachineShopContext : DbContext
    {
        public MachineShopContext(DbContextOptions<MachineShopContext> options)
            : base(options)
        {
        }

        // --- Definición de Tablas (DbSet) ---
        public DbSet<Usuario> Usuarios { get; set; } = default!;
        public DbSet<Area> Areas { get; set; } = default!;
        public DbSet<Pieza> Piezas { get; set; } = default!;
        public DbSet<Solicitud> Solicitudes { get; set; } = default!;
        // 🚨 IMPORTANTE: El nombre del DbSet DEBE coincidir con el que usas en los controladores
        public DbSet<EstadoTrabajo> EstadoTrabajo { get; set; } = default!;
        public DbSet<Revision> Revisiones { get; set; } = default!; // Corregido: Si usas Revisiones en el controlador, debe ir aquí

        // Configuración de Modelos y Relaciones (Fluent API)
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ====================================================================
            // RELACIONES DE SOLICITUD
            // ====================================================================

            // Solicitud (Solicitante) <--> Usuario (Relación 1 a muchos)
            modelBuilder.Entity<Solicitud>()
                .HasOne(s => s.Solicitante)
                .WithMany(u => u.SolicitudesRealizadas) // Asumiendo que esta propiedad existe en Usuario.cs
                .HasForeignKey(s => s.SolicitanteId)
                .OnDelete(DeleteBehavior.Restrict);

            // Solicitud <--> Pieza (Relación 1 a muchos)
            modelBuilder.Entity<Solicitud>()
                .HasOne(s => s.Pieza)
                .WithMany(p => p.Solicitudes)
                .HasForeignKey(s => s.IdPieza);

            // 🚨 CAMBIO CRÍTICO: Solicitud <--> EstadoTrabajo (Relación 1 a MUCHOS)
            modelBuilder.Entity<Solicitud>()
                .HasMany(s => s.Operaciones) // Una Solicitud tiene muchos registros de EstadoTrabajo
                .WithOne(et => et.Solicitud)
                .HasForeignKey(et => et.IdSolicitud);

            // Solicitud <--> Revision (Relación 1 a 1 - Se mantiene)
            modelBuilder.Entity<Solicitud>()
                .HasOne(s => s.Revision)
                .WithOne(r => r.Solicitud)
                .HasForeignKey<Revision>(r => r.IdSolicitud);

            // ====================================================================
            // OTRAS RELACIONES
            // ====================================================================

            // EstadoTrabajo (Maquinista) <--> Usuario
            modelBuilder.Entity<EstadoTrabajo>()
                .HasOne(et => et.Maquinista)
                .WithMany()
                .HasForeignKey(et => et.IdMaquinista)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuración del campo decimal
            modelBuilder.Entity<EstadoTrabajo>()
                .Property(r => r.TiempoMaquina)
                .HasColumnType("decimal(10, 2)");


            // ====================================================================
            // CONFIGURACIÓN DE DATOS INICIALES (SEED DATA)
            // ====================================================================

            // 💡 Insertar el Usuario de Sistema
            modelBuilder.Entity<Usuario>().HasData(
                new Usuario
                {
                    // 🚨 CORRECCIÓN: Usamos 'Id' en lugar de 'IdUsuario' si ese es el nombre de la propiedad PK en tu modelo Usuario
                    Id = 1,
                    Nombre = "Revisión de Ingeniería",
                    Email = "system@molex.com",
                    PasswordHash = "SYSTEM_RESERVED",
                    Area = "Ingeniería",
                    Rol = "Sistema",
                    Activo = true
                }
            );

            // Se asumen que las demás relaciones están definidas en otros métodos o son configuraciones por convención

            base.OnModelCreating(modelBuilder);
        }
    }
}