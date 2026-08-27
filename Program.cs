using Microsoft.EntityFrameworkCore;
using WebApplication1;
using WebApplication1.interfaces;
using WebApplication1.repositories;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("SERENA_CONNECTION_STRING");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection o SERENA_CONNECTION_STRING antes de iniciar la API.");

// 1. Configuración de la Base de Datos (DbContext)
builder.Services.AddDbContext<serena>(options =>
    options.UseSqlServer(connectionString));

// 2. Registro de Inyección de Dependencias
builder.Services.AddScoped<Icita, cita_repositories>();
builder.Services.AddScoped<Idiario, diario_repositories>();
builder.Services.AddScoped<Iemergencia, emergencia_repositories>();
builder.Services.AddScoped<Iestado_de_animo, estado_de_animo_repositories>();
builder.Services.AddScoped<Iformulario, formulario_repositories>();
builder.Services.AddScoped<Ihistorial_cita, historial_cita_repositories>();
builder.Services.AddScoped<Ihistorial_clinico, historial_clinico_repositories>();
builder.Services.AddScoped<Imenu, menu_repositories>();
builder.Services.AddScoped<Imenu_rol, menu_rol_repositories>();
builder.Services.AddScoped<Ipublicaciones, publicaciones_repositories>();
builder.Services.AddScoped<Irol, rol_repositories>();
builder.Services.AddScoped<Iusuario, usuario_repositories>();
builder.Services.AddScoped<Iloginservice, usuario_repositories>();

// 3. Controladores y Swagger con Parches para Evitar Colapsos
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(options => options.AddPolicy("DevelopmentFrontend", policy =>
    policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>())
          .AllowAnyHeader()
          .AllowAnyMethod()));

builder.Services.AddSwaggerGen(c =>
{
    // Resuelve conflictos de métodos/rutas duplicadas en los controladores automáticamente
    c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
    
    // Evita errores cuando dos modelos o DTOs comparten nombres similares
    c.CustomSchemaIds(type => type.FullName);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("DevelopmentFrontend");
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();