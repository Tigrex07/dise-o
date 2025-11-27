-- Reconstrucción del Esquema de Base de Datos Machine Shop
-- Basado en capturas de pantalla del estado actual

PRAGMA foreign_keys = OFF;

-- --------------------------------------------------------
-- 1. Tabla: Usuarios
-- [Referencia: 1000305306.jpg]
-- --------------------------------------------------------
DROP TABLE IF EXISTS "Usuarios";
CREATE TABLE "Usuarios" (
    "IdUsuario" INTEGER NOT NULL CONSTRAINT "PK_Usuarios" PRIMARY KEY AUTOINCREMENT,
    "Nombre" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "Area" TEXT NOT NULL,
    "Rol" TEXT NOT NULL,
    "Activo" INTEGER NOT NULL
);

-- --------------------------------------------------------
-- 2. Tabla: Areas
-- [Referencia: 1000305301.jpg]
-- --------------------------------------------------------
DROP TABLE IF EXISTS "Areas";
CREATE TABLE "Areas" (
    "IdArea" INTEGER NOT NULL CONSTRAINT "PK_Areas" PRIMARY KEY AUTOINCREMENT,
    "NombreArea" TEXT NOT NULL,
    "ResponsableAreaId" INTEGER NULL,
    CONSTRAINT "FK_Areas_Usuarios_ResponsableAreaId" FOREIGN KEY ("ResponsableAreaId") REFERENCES "Usuarios" ("IdUsuario")
);

-- --------------------------------------------------------
-- 3. Tabla: Piezas
-- [Referencia: 1000305303.jpg]
-- 🚨 NOTA: Se observa la redundancia 'Máquina' y 'Maquina' y FALTA 'PiezaNumero'
-- --------------------------------------------------------
DROP TABLE IF EXISTS "Piezas";
CREATE TABLE "Piezas" (
    "IdPieza" INTEGER NOT NULL CONSTRAINT "PK_Piezas" PRIMARY KEY AUTOINCREMENT,
    "IdArea" INTEGER NOT NULL,
    "Máquina" TEXT NOT NULL, -- (Con acento)
    "NombrePieza" TEXT NOT NULL,
    "Maquina" TEXT NOT NULL, -- (Sin acento)
    CONSTRAINT "FK_Piezas_Areas_IdArea" FOREIGN KEY ("IdArea") REFERENCES "Areas" ("IdArea") ON DELETE CASCADE
);

-- --------------------------------------------------------
-- 4. Tabla: Solicitudes
-- [Referencia: 1000305305.jpg]
-- --------------------------------------------------------
DROP TABLE IF EXISTS "Solicitudes";
CREATE TABLE "Solicitudes" (
    "IdSolicitud" INTEGER NOT NULL CONSTRAINT "PK_Solicitudes" PRIMARY KEY AUTOINCREMENT,
    "SolicitanteId" INTEGER NOT NULL,
    "IdPieza" INTEGER NOT NULL,
    "FechaYHora" TEXT NOT NULL,
    "Turno" TEXT NOT NULL,
    "Tipo" TEXT NOT NULL,
    "Detalles" TEXT NOT NULL,
    "Dibujo" TEXT NOT NULL,
    CONSTRAINT "FK_Solicitudes_Piezas_IdPieza" FOREIGN KEY ("IdPieza") REFERENCES "Piezas" ("IdPieza") ON DELETE CASCADE,
    CONSTRAINT "FK_Solicitudes_Usuarios_SolicitanteId" FOREIGN KEY ("SolicitanteId") REFERENCES "Usuarios" ("IdUsuario") ON DELETE RESTRICT
);

-- --------------------------------------------------------
-- 5. Tabla: EstadoTrabajo
-- [Referencia: 1000305302.jpg]
-- --------------------------------------------------------
DROP TABLE IF EXISTS "EstadoTrabajo";
CREATE TABLE "EstadoTrabajo" (
    "IdEstado" INTEGER NOT NULL CONSTRAINT "PK_EstadoTrabajo" PRIMARY KEY AUTOINCREMENT,
    "IdSolicitud" INTEGER NOT NULL,
    "IdMaquinista" INTEGER NOT NULL,
    "FechaYHoraDeInicio" TEXT NOT NULL,
    "FechaYHoraDeFin" TEXT NULL,
    "MaquinaAsignada" TEXT NOT NULL,
    "DescripcionOperacion" TEXT NOT NULL,
    "TiempoMaquina" DECIMAL(10, 2) NOT NULL,
    "Observaciones" TEXT NULL,
    CONSTRAINT "FK_EstadoTrabajo_Solicitudes_IdSolicitud" FOREIGN KEY ("IdSolicitud") REFERENCES "Solicitudes" ("IdSolicitud") ON DELETE CASCADE,
    CONSTRAINT "FK_EstadoTrabajo_Usuarios_IdMaquinista" FOREIGN KEY ("IdMaquinista") REFERENCES "Usuarios" ("IdUsuario") ON DELETE RESTRICT
);

-- --------------------------------------------------------
-- 6. Tabla: Revisiones
-- [Referencia: 1000305304.jpg]
-- --------------------------------------------------------
DROP TABLE IF EXISTS "Revisiones";
CREATE TABLE "Revisiones" (
    "IdRevision" INTEGER NOT NULL CONSTRAINT "PK_Revisiones" PRIMARY KEY AUTOINCREMENT,
    "IdSolicitud" INTEGER NOT NULL,
    "IdRevisor" INTEGER NOT NULL,
    "Prioridad" TEXT NOT NULL,
    "Comentarios" TEXT NULL,
    "FechaHoraRevision" TEXT NOT NULL,
    CONSTRAINT "FK_Revisiones_Solicitudes_IdSolicitud" FOREIGN KEY ("IdSolicitud") REFERENCES "Solicitudes" ("IdSolicitud") ON DELETE CASCADE,
    CONSTRAINT "FK_Revisiones_Usuarios_IdRevisor" FOREIGN KEY ("IdRevisor") REFERENCES "Usuarios" ("IdUsuario") ON DELETE CASCADE
);

-- --------------------------------------------------------
-- 7. Tabla Historial de Migraciones
-- [Referencia: 1000305307.jpg]
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" TEXT NOT NULL CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY,
    "ProductVersion" TEXT NOT NULL
);

-- --------------------------------------------------------
-- Índices (Reconstruidos por convención de EF Core)
-- --------------------------------------------------------
CREATE INDEX "IX_Areas_ResponsableAreaId" ON "Areas" ("ResponsableAreaId");
CREATE INDEX "IX_Piezas_IdArea" ON "Piezas" ("IdArea");
CREATE INDEX "IX_Solicitudes_IdPieza" ON "Solicitudes" ("IdPieza");
CREATE INDEX "IX_Solicitudes_SolicitanteId" ON "Solicitudes" ("SolicitanteId");
CREATE INDEX "IX_EstadoTrabajo_IdSolicitud" ON "EstadoTrabajo" ("IdSolicitud");
CREATE INDEX "IX_EstadoTrabajo_IdMaquinista" ON "EstadoTrabajo" ("IdMaquinista");
CREATE INDEX "IX_Revisiones_IdSolicitud" ON "Revisiones" ("IdSolicitud");
CREATE INDEX "IX_Revisiones_IdRevisor" ON "Revisiones" ("IdRevisor");

PRAGMA foreign_keys = ON;