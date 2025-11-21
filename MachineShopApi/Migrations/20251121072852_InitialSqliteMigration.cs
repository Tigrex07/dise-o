using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MachineShopApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialSqliteMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    IdUsuario = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Area = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Rol = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Activo = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.IdUsuario);
                });

            migrationBuilder.CreateTable(
                name: "Areas",
                columns: table => new
                {
                    IdArea = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NombreArea = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    ResponsableAreaId = table.Column<int>(type: "INTEGER", nullable: true),
                    UsuarioId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Areas", x => x.IdArea);
                    table.ForeignKey(
                        name: "FK_Areas_Usuarios_ResponsableAreaId",
                        column: x => x.ResponsableAreaId,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Areas_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario");
                });

            migrationBuilder.CreateTable(
                name: "Piezas",
                columns: table => new
                {
                    IdPieza = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IdArea = table.Column<int>(type: "INTEGER", nullable: false),
                    NombrePieza = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Maquina = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Piezas", x => x.IdPieza);
                    table.ForeignKey(
                        name: "FK_Piezas_Areas_IdArea",
                        column: x => x.IdArea,
                        principalTable: "Areas",
                        principalColumn: "IdArea",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Solicitudes",
                columns: table => new
                {
                    IdSolicitud = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SolicitanteId = table.Column<int>(type: "INTEGER", nullable: false),
                    IdPieza = table.Column<int>(type: "INTEGER", nullable: false),
                    FechaYHora = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Turno = table.Column<string>(type: "TEXT", nullable: false),
                    Tipo = table.Column<string>(type: "TEXT", nullable: false),
                    Detalles = table.Column<string>(type: "TEXT", nullable: false),
                    Dibujo = table.Column<string>(type: "TEXT", nullable: false),
                    Prioridad = table.Column<string>(type: "TEXT", nullable: false),
                    EstadoActual = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Solicitudes", x => x.IdSolicitud);
                    table.ForeignKey(
                        name: "FK_Solicitudes_Piezas_IdPieza",
                        column: x => x.IdPieza,
                        principalTable: "Piezas",
                        principalColumn: "IdPieza",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Solicitudes_Usuarios_SolicitanteId",
                        column: x => x.SolicitanteId,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EstadoTrabajos",
                columns: table => new
                {
                    IdEstado = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IdSolicitud = table.Column<int>(type: "INTEGER", nullable: false),
                    IdMaquinista = table.Column<int>(type: "INTEGER", nullable: true),
                    FechaHoraInicio = table.Column<DateTime>(type: "TEXT", nullable: false),
                    MaquinaAsignada = table.Column<string>(type: "TEXT", nullable: false),
                    TiempoMaquina = table.Column<TimeSpan>(type: "TEXT", nullable: true),
                    Observaciones = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstadoTrabajos", x => x.IdEstado);
                    table.ForeignKey(
                        name: "FK_EstadoTrabajos_Solicitudes_IdSolicitud",
                        column: x => x.IdSolicitud,
                        principalTable: "Solicitudes",
                        principalColumn: "IdSolicitud",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EstadoTrabajos_Usuarios_IdMaquinista",
                        column: x => x.IdMaquinista,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Revisiones",
                columns: table => new
                {
                    IdRevision = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IdSolicitud = table.Column<int>(type: "INTEGER", nullable: false),
                    IdRevisor = table.Column<int>(type: "INTEGER", nullable: false),
                    NivelUrgencia = table.Column<string>(type: "TEXT", nullable: false),
                    EstadoRevision = table.Column<string>(type: "TEXT", nullable: false),
                    Comentarios = table.Column<string>(type: "TEXT", nullable: false),
                    FechaHoraRevision = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UsuarioId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Revisiones", x => x.IdRevision);
                    table.ForeignKey(
                        name: "FK_Revisiones_Solicitudes_IdSolicitud",
                        column: x => x.IdSolicitud,
                        principalTable: "Solicitudes",
                        principalColumn: "IdSolicitud",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Revisiones_Usuarios_IdRevisor",
                        column: x => x.IdRevisor,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Revisiones_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Areas_ResponsableAreaId",
                table: "Areas",
                column: "ResponsableAreaId");

            migrationBuilder.CreateIndex(
                name: "IX_Areas_UsuarioId",
                table: "Areas",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_EstadoTrabajos_IdMaquinista",
                table: "EstadoTrabajos",
                column: "IdMaquinista");

            migrationBuilder.CreateIndex(
                name: "IX_EstadoTrabajos_IdSolicitud",
                table: "EstadoTrabajos",
                column: "IdSolicitud",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Piezas_IdArea",
                table: "Piezas",
                column: "IdArea");

            migrationBuilder.CreateIndex(
                name: "IX_Revisiones_IdRevisor",
                table: "Revisiones",
                column: "IdRevisor");

            migrationBuilder.CreateIndex(
                name: "IX_Revisiones_IdSolicitud",
                table: "Revisiones",
                column: "IdSolicitud",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Revisiones_UsuarioId",
                table: "Revisiones",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_IdPieza",
                table: "Solicitudes",
                column: "IdPieza");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_SolicitanteId",
                table: "Solicitudes",
                column: "SolicitanteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EstadoTrabajos");

            migrationBuilder.DropTable(
                name: "Revisiones");

            migrationBuilder.DropTable(
                name: "Solicitudes");

            migrationBuilder.DropTable(
                name: "Piezas");

            migrationBuilder.DropTable(
                name: "Areas");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
