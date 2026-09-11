using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebApplication1;
using WebApplication1.interfaces;
using WebApplication1.models;
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

// 3. Controladores y Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(options => options.AddPolicy("DevelopmentFrontend", policy =>
    policy.WithOrigins(
            builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ??
            [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ])
          .AllowAnyHeader()
          .AllowAnyMethod()));

builder.Services.AddSwaggerGen(c =>
{
    c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
    c.CustomSchemaIds(type => type.FullName);
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<serena>();
    db.Database.Migrate();

    if (!db.rol.Any())
    {
        db.rol.AddRange(
            new rol { nombre_rol = "Aprendiz" },
            new rol { nombre_rol = "Psicólogo" },
            new rol { nombre_rol = "Administrador" }
        );
        db.SaveChanges();
    }

    if (!db.usuario.Any())
    {
        var passwordHasher = new PasswordHasher<usuario>();

        var rolAprendiz = db.rol.First(r => r.nombre_rol == "Aprendiz");
        var rolPsicologo = db.rol.First(r => r.nombre_rol == "Psicólogo");

        var aprendiz = new usuario
        {
            nombre_usuario = "Yonatan Acuña",
            email = "yacuna@soy.sena.edu.co",
            contrasena = "Aa12345*",
            id_rol = rolAprendiz.id_rol
        };

        var psicologo = new usuario
        {
            nombre_usuario = "Dra. Laura Martínez",
            email = "lmartinez@sena.edu.co",
            contrasena = "Aa12345*",
            id_rol = rolPsicologo.id_rol
        };

        aprendiz.contrasena = passwordHasher.HashPassword(aprendiz, aprendiz.contrasena);
        psicologo.contrasena = passwordHasher.HashPassword(psicologo, psicologo.contrasena);

        db.usuario.AddRange(aprendiz, psicologo);
        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
    });
    app.UseCors("DevelopmentFrontend");
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();