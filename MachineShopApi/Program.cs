using Microsoft.EntityFrameworkCore;
// Nota: Asegúrate de tener instalado el paquete NuGet 'Microsoft.EntityFrameworkCore.Sqlite'
using MachineShopApi.Data;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// --------------------------------------------------------------------------
// 1. Configuración de Servicios (Aquí se define la política de CORS)
// --------------------------------------------------------------------------

// Variable para el nombre de la política (buena práctica)
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

// ➡️ INICIO DE CÓDIGO CORS (PASO 1: AGREGAR SERVICIO) ⬅️
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          // **🚨 ESTE ES EL ORIGEN QUE DEBES PERMITIR 🚨**
                          // Tu frontend está en 5173, tu backend en 5145.
                          policy.WithOrigins("http://localhost:5173")
                                .AllowAnyHeader()
                                .AllowAnyMethod(); // Permite GET, POST, PUT, PATCH (para toggle activo), etc.
                      });
});
// ➡️ FIN DE CÓDIGO CORS ⬅️

// Obtener la cadena de conexión y configurar DbContext con SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=machineshop.db";

// ¡IMPORTANTE! Cambiado UseSqlServer a UseSqlite para usar la base de datos de archivo.
builder.Services.AddDbContext<MachineShopContext>(options =>
    options.UseSqlite(connectionString));

// Añadir soporte para Controladores
builder.Services.AddControllers()
    .AddJsonOptions(options =>
     {
         // Esto resuelve el error "A possible object cycle was detected"
         options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
     });


// Añadir Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Machine Shop API", Version = "v1" });
});

var app = builder.Build();

// --------------------------------------------------------------------------
// --- BLOQUE CRÍTICO: CREACIÓN DE LA BASE DE DATOS AL INICIO ---
// ... (Tu código de EnsureCreated se mantiene intacto) ...
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<MachineShopContext>();
        context.Database.EnsureCreated();
        Console.WriteLine("✅ Base de datos 'machineshop.db' verificada/creada exitosamente.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "❌ Ocurrió un error al crear o inicializar la base de datos.");
    }
}
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// 2. Configuración del Pipeline HTTP (Aquí se usa la política de CORS)
// --------------------------------------------------------------------------

// Configurar el pipeline HTTP para usar Swagger en modo desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Machine Shop API V1");
        c.RoutePrefix = string.Empty; // Sirve la UI de Swagger en la raíz (/)
    });
}

app.UseHttpsRedirection();

// ➡️ INICIO DE CÓDIGO CORS (PASO 2: USAR MIDDLEWARE) ⬅️
// Debe ir ANTES de UseAuthorization y ANTES de MapControllers
app.UseCors(MyAllowSpecificOrigins);
// ➡️ FIN DE CÓDIGO CORS ⬅️

app.UseAuthorization();

// Mapear los controladores de la API
app.MapControllers();

// Ejecutar la aplicación
app.Run();