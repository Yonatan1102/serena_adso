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
builder.Services.AddScoped<Iestado_animo_usuario, estado_animo_usuario_repositories>();
builder.Services.AddScoped<Iformulario, formulario_repositories>();
builder.Services.AddScoped<Ihistorial_cita, historial_cita_repositories>();
builder.Services.AddScoped<Ihistorial_clinico, historial_clinico_repositories>();
builder.Services.AddScoped<Imenu, menu_repositories>();
builder.Services.AddScoped<Imenu_rol, menu_rol_repositories>();
builder.Services.AddScoped<Idisponibilidad, disponibilidad_Repositories>();
builder.Services.AddScoped<Ificha, ficha_repositories>();
builder.Services.AddScoped<Iusuario_ficha, usuario_ficha_repositories>();
builder.Services.AddScoped<Ipublicaciones, publicaciones_repositories>();
builder.Services.AddScoped<Irol, rol_repositories>();
builder.Services.AddScoped<Iusuario, usuario_repositories>();
builder.Services.AddScoped<Iloginservice, usuario_repositories>();

// 3. Controladores y Swagger
builder.Services.AddControllers().AddJsonOptions(options =>
    options.JsonSerializerOptions.PropertyNamingPolicy = null);
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
    db.Database.EnsureCreated();
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

    if (!db.estado_de_animo.Any())
    {
        db.estado_de_animo.AddRange(
            new estado_de_animo { nombre_estado = "Feliz" },
            new estado_de_animo { nombre_estado = "Calmado" },
            new estado_de_animo { nombre_estado = "Ansioso" },
            new estado_de_animo { nombre_estado = "Triste" },
            new estado_de_animo { nombre_estado = "Motivado" }
        );
        db.SaveChanges();
    }

    if (!db.usuario.Any())
    {
        var passwordHasher = new PasswordHasher<usuario>();

        var rolAprendiz = db.rol.First(r => r.nombre_rol == "Aprendiz");
        var rolPsicologo = db.rol.First(r => r.nombre_rol == "Psicólogo");

        var usuarios = new[]
        {
            new usuario
            {
                nombre_usuario = "Yonatan Acuña",
                email = "yacuna@soy.sena.edu.co",
                contrasena = "Aa12345*",
                id_rol = rolAprendiz.id_rol,
                num_ficha = "3288046",
                sede = "CMTC",
                centro = "CMTC",
                programa_formacion = "ADSO",
            },
            new usuario
            {
                nombre_usuario = "Josué Tovar",
                email = "jtovar@soy.sena.edu.co",
                contrasena = "Aa12345*",
                id_rol = rolAprendiz.id_rol,
                num_ficha = "3288046",
                sede = "CMTC",
                centro = "CMTC",
                programa_formacion = "Textil",
            },
            new usuario
            {
                nombre_usuario = "Camila Restrepo",
                email = "crestrepo@soy.sena.edu.co",
                contrasena = "Aa12345*",
                id_rol = rolAprendiz.id_rol,
                num_ficha = "3288046",
                sede = "CMTC",
                centro = "CMTC",
                programa_formacion = "Patronaje",
            },
            new usuario
            {
                nombre_usuario = "Dra. Laura Martínez",
                email = "lmartinez@sena.edu.co",
                contrasena = "Aa12345*",
                id_rol = rolPsicologo.id_rol,
                num_ficha = "3288046",
                sede = "CMTC",
                centro = "CMTC",
                programa_formacion = "Psicología",
            },
            new usuario
            {
                nombre_usuario = "Dr. Carlos Pardo",
                email = "cpardo@sena.edu.co",
                contrasena = "Aa12345*",
                id_rol = rolPsicologo.id_rol,
                num_ficha = "3288046",
                sede = "CMTC",
                centro = "CMTC",
                programa_formacion = "Orientación Vocacional",
            }
        };

        foreach (var usuario in usuarios)
        {
            usuario.contrasena = passwordHasher.HashPassword(usuario, usuario.contrasena);
        }

        db.usuario.AddRange(usuarios);
        db.SaveChanges();
    }

    if (!db.ficha.Any())
    {
        db.ficha.AddRange(
            new ficha { codigo_ficha = "3288046", programa = "ADSO", centro = "CMTC", jornada = "Diurna", estado = true },
            new ficha { codigo_ficha = "2025001", programa = "Textil", centro = "CMTC", jornada = "Diurna", estado = true }
        );
        db.SaveChanges();
    }

    if (!db.usuario_ficha.Any())
    {
        var fichaActual = db.ficha.First(f => f.codigo_ficha == "3288046");
        var aprendices = db.usuario.Where(u => u.id_rol == db.rol.First(r => r.nombre_rol == "Aprendiz").id_rol).ToList();
        var psicologos = db.usuario.Where(u => u.id_rol == db.rol.First(r => r.nombre_rol == "Psicólogo").id_rol).ToList();

        foreach (var aprendiz in aprendices)
        {
            db.usuario_ficha.Add(new usuario_ficha
            {
                id_usuario = aprendiz.id_usuario,
                id_ficha = fichaActual.id_ficha,
                fecha_asignacion = DateTime.UtcNow,
                estado = true
            });
        }

        foreach (var psicologo in psicologos)
        {
            db.usuario_ficha.Add(new usuario_ficha
            {
                id_usuario = psicologo.id_usuario,
                id_ficha = fichaActual.id_ficha,
                fecha_asignacion = DateTime.UtcNow,
                estado = true
            });
        }

        db.SaveChanges();
    }

    if (!db.disponibilidad.Any())
    {
        var psicologos = db.usuario.Where(u => u.id_rol == db.rol.First(r => r.nombre_rol == "Psicólogo").id_rol).ToList();
        foreach (var psicologo in psicologos)
        {
            db.disponibilidad.AddRange(
                new disponibilidad
                {
                    id_usuario = psicologo.id_usuario,
                    id_rol = psicologo.id_rol,
                    dia_semana = 1,
                    hora_inicio = new TimeSpan(9, 0, 0),
                    hora_fin = new TimeSpan(11, 0, 0),
                    estado = true
                },
                new disponibilidad
                {
                    id_usuario = psicologo.id_usuario,
                    id_rol = psicologo.id_rol,
                    dia_semana = 3,
                    hora_inicio = new TimeSpan(10, 0, 0),
                    hora_fin = new TimeSpan(12, 0, 0),
                    estado = true
                }
            );
        }
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