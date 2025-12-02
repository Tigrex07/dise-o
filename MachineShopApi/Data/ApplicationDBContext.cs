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
        public DbSet<EstadoTrabajo> EstadoTrabajo { get; set; } = default!;
        public DbSet<Revision> Revisiones { get; set; } = default!;

        public DbSet<MaquinaMS> MaquinasMS { get; set; } = default!;

        // Configuración de Modelos y Relaciones (Fluent API)
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ====================================================================
            // 🚨 CAMBIO CRÍTICO: SOLUCIÓN DOBLE COLUMNA MÁQUINA (NOT NULL) EN PIEZA
            // ====================================================================

            // 1. Mapear la propiedad C# 'Maquina' (sin acento) a la columna OBLIGATORIA 'Máquina' (con acento).
            //    Esta es la columna que EF Core intentaba llenar en el comando SQL (ver tu log).
            modelBuilder.Entity<Pieza>()
                .Property(p => p.Maquina)
                .HasColumnName("Maquina")
                .IsRequired();

            // ====================================================================
            // RELACIONES DE SOLICITUD (Las que ya tenías)
            // ====================================================================

            // Solicitud (Solicitante) <--> Usuario (Relación 1 a muchos)
            modelBuilder.Entity<Solicitud>()
                .HasOne(s => s.Solicitante)
                .WithMany(u => u.SolicitudesRealizadas)
                .HasForeignKey(s => s.SolicitanteId)
                .OnDelete(DeleteBehavior.Restrict);

            // Solicitud <--> Pieza (Relación 1 a muchos)
            modelBuilder.Entity<Solicitud>()
                .HasOne(s => s.Pieza)
                .WithMany(p => p.Solicitudes)
                .HasForeignKey(s => s.IdPieza);

            // Solicitud <--> EstadoTrabajo (Relación 1 a MUCHOS)
            modelBuilder.Entity<Solicitud>()
                .HasMany(s => s.Operaciones)
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
                    Id = 1,
                    Nombre = "Equipo Tigrex",
                    Email = "tigrexteam@molex.com",
                    PasswordHash = "$2a$12$sf1MZFzuH8p9iYCZ3Z8YIuJVbEI4XUm7LAle1qvnCYV3vO36a3vMO",
                    Area = "Ingeniería",
                    Rol = "Master",
                    Activo = true
                }
            );
        }
    }
}
