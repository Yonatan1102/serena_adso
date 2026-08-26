using Microsoft.EntityFrameworkCore;
using WebApplication1;
using WebApplication1.interfaces;
using WebApplication1.repositories;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuración de la Base de Datos (DbContext)
builder.Services.AddDbContext<serena>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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

// 3. Controladores y Swagger con Parches para Evitar Colapsos
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

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
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();