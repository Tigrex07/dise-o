using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MachineShopApi.Migrations
{
    /// <inheritdoc />
    public partial class RevisionBD : Migration
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
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
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
                    ResponsableAreaId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Areas", x => x.IdArea);
                    table.ForeignKey(
                        name: "FK_Areas_Usuarios_ResponsableAreaId",
                        column: x => x.ResponsableAreaId,
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
                    Máquina = table.Column<string>(type: "TEXT", nullable: false),
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
                    Dibujo = table.Column<string>(type: "TEXT", nullable: false)
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
                name: "EstadoTrabajo",
                columns: table => new
                {
                    IdEstado = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IdSolicitud = table.Column<int>(type: "INTEGER", nullable: false),
                    IdMaquinista = table.Column<int>(type: "INTEGER", nullable: false),
                    FechaYHoraDeInicio = table.Column<DateTime>(type: "TEXT", nullable: false),
                    FechaYHoraDeFin = table.Column<DateTime>(type: "TEXT", nullable: true),
                    MaquinaAsignada = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    DescripcionOperacion = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    TiempoMaquina = table.Column<decimal>(type: "decimal(10, 2)", nullable: false),
                    Observaciones = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstadoTrabajo", x => x.IdEstado);
                    table.ForeignKey(
                        name: "FK_EstadoTrabajo_Solicitudes_IdSolicitud",
                        column: x => x.IdSolicitud,
                        principalTable: "Solicitudes",
                        principalColumn: "IdSolicitud",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EstadoTrabajo_Usuarios_IdMaquinista",
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
                    Prioridad = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Comentarios = table.Column<string>(type: "TEXT", nullable: true),
                    FechaHoraRevision = table.Column<DateTime>(type: "TEXT", nullable: false)
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
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "IdUsuario", "Activo", "Area", "Email", "Nombre", "PasswordHash", "Rol" },
                values: new object[] { 1, true, "Ingeniería", "system@molex.com", "Revisión de Ingeniería", "SYSTEM_RESERVED", "Sistema" });

            migrationBuilder.CreateIndex(
                name: "IX_Areas_ResponsableAreaId",
                table: "Areas",
                column: "ResponsableAreaId");

            migrationBuilder.CreateIndex(
                name: "IX_EstadoTrabajo_IdMaquinista",
                table: "EstadoTrabajo",
                column: "IdMaquinista");

            migrationBuilder.CreateIndex(
                name: "IX_EstadoTrabajo_IdSolicitud",
                table: "EstadoTrabajo",
                column: "IdSolicitud");

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
                name: "EstadoTrabajo");

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
