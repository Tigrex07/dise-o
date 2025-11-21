use MOLEX

CREATE TABLE Usuarios (
    IdUsuario INT PRIMARY KEY IDENTITY(1,1), -- (PK) Identificador único del usuario
    Nombre VARCHAR(100) NOT NULL,            -- Nombre del usuario
    Area VARCHAR(50),                        -- Departamento al que pertenece
    Rol VARCHAR(50) NOT NULL,                -- Operador/Supervisor/Machine Shop
    Activo BIT NOT NULL DEFAULT 1            -- Estado del usuario (Si/No)
);

CREATE TABLE Areas (
    IdArea INT PRIMARY KEY IDENTITY(1,1),     -- (PK) Identificador del área
    NombreArea VARCHAR(100) NOT NULL,        -- Nombre del departamento
    ResponsableArea INT,                     -- (FK) Usuario encargado
    
    -- Restricción de Llave Foránea
    FOREIGN KEY (ResponsableArea) REFERENCES Usuarios(IdUsuario)
);


CREATE TABLE Piezas (
    IdPieza INT PRIMARY KEY IDENTITY(1,1),   -- (PK) Identificador de la Pieza 
    IdArea INT,                              -- (FK) Área a la que pertenece 
    NombrePieza VARCHAR(100) NOT NULL,       -- Nombre o código de la pieza 
    Maquina VARCHAR(50),                     -- Nombre o código de la máquina 
    
    -- Restricción de Llave Foránea
    FOREIGN KEY (IdArea) REFERENCES Areas(IdArea)
);


CREATE TABLE Solicitudes (
    IdSolicitud INT PRIMARY KEY IDENTITY(1,1),   -- (PK) Identificador único de Solicitud 
    Solicitante INT,                             -- (FK) Identificador único del usuario 
    IdPieza INT,                                 -- (FK) Identificador de la Pieza 
    FechaYHora DATETIME NOT NULL,                -- Fecha y hora del reporte 
    Turno VARCHAR(20),                           -- Turno del solicitante 
    Tipo VARCHAR(50),                            -- Mantenimiento/Reparación/Ajuste 
    Detalles VARCHAR(MAX),                       -- Descripción del problema 
    Dibujo VARCHAR(255),                         -- Referencia visual o archivo 
    Prioridad VARCHAR(20),                       -- Baja/Normal/Alta/Urgente 
    EstadoActual VARCHAR(50),                    -- Pendiente/En proceso/Terminado 
    
    -- Restricciones de Llaves Foráneas
    FOREIGN KEY (Solicitante) REFERENCES Usuarios(IdUsuario),
    FOREIGN KEY (IdPieza) REFERENCES Piezas(IdPieza)
);


CREATE TABLE EstadoTrabajo (
    IdEstado INT PRIMARY KEY IDENTITY(1,1),    -- (PK) Identificador del registro de trabajo [cite: 14]
    IdSolicitud INT UNIQUE,                    -- (FK) Solicitud Atendida. (UNIQUE para 1 registro por solicitud) [cite: 14]
    IdMaquinista INT,                          -- (FK) Usuario que realiza el trabajo [cite: 14]
    FechaYHoraDeInicio DATETIME,               -- Inicio de operación [cite: 14]
    MaquinaAsignada VARCHAR(50),               -- Maquina usada en Machine Shop [cite: 14]
    TiempoMaquina DECIMAL(10, 2),              -- Tiempo empleado [cite: 14]
    Observaciones VARCHAR(MAX),                -- Notas adicionales [cite: 14]
    
    -- Restricciones de Llaves Foráneas
    FOREIGN KEY (IdSolicitud) REFERENCES Solicitudes(IdSolicitud),
    FOREIGN KEY (IdMaquinista) REFERENCES Usuarios(IdUsuario)
);

CREATE TABLE Revision (
    IdRevision INT PRIMARY KEY IDENTITY(1,1),  -- (PK) Identificador del registro de revisión 
    IdSolicitud INT UNIQUE,                    -- (FK) Solicitud a revisar (UNIQUE para 1 registro por solicitud) 
    IdRevisor INT,                             -- (FK) Usuario que revisa y asigna prioridad 
    NivelUrgencia VARCHAR(20),                 -- Baja/Media/Alta/Crítica 
    EstadoRevision VARCHAR(50),                -- Aprobada/Devuelta/Requiere más info 
    Comentarios VARCHAR(MAX),                  -- Notas del revisor 
    FechaHoraRevision DATETIME,                -- Fecha y hora de la revisión 
    
    -- Restricciones de Llaves Foráneas
    FOREIGN KEY (IdSolicitud) REFERENCES Solicitudes(IdSolicitud),
    FOREIGN KEY (IdRevisor) REFERENCES Usuarios(IdUsuario)
);


