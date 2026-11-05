using Microsoft.EntityFrameworkCore;
using WebApplication1;
using WebApplication1.interfaces;
using WebApplication1.models;
using WebApplication1.repositories;
using WebApplication1.services;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("SERENA_CONNECTION_STRING");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection o SERENA_CONNECTION_STRING antes de iniciar la API.");

builder.Services.AddDbContext<SerenaDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddHsts(options =>
{
    options.Preload = true;
    options.IncludeSubDomains = true;
    options.MaxAge = TimeSpan.FromDays(365);
});

builder.Services.AddScoped<ICita, CitaRepository>();
builder.Services.AddScoped<IDiario, DiarioRepository>();
builder.Services.AddScoped<IEmergencia, EmergenciaRepository>();
builder.Services.AddScoped<IEstadoDeAnimo, EstadoDeAnimoRepository>();
builder.Services.AddScoped<IEstadoAnimoUsuario, EstadoAnimoUsuarioRepository>();
builder.Services.AddScoped<IFormulario, FormularioRepository>();
builder.Services.AddScoped<IHistorialCita, HistorialCitaRepository>();
builder.Services.AddScoped<IHistorialClinico, HistorialClinicoRepository>();
builder.Services.AddScoped<IMenu, MenuRepository>();
builder.Services.AddScoped<IMenuRol, MenuRolRepository>();
builder.Services.AddScoped<IDisponibilidad, DisponibilidadRepository>();
builder.Services.AddScoped<IFicha, FichaRepository>();
builder.Services.AddScoped<IUsuarioFicha, UsuarioFichaRepository>();
builder.Services.AddScoped<IPublicaciones, PublicacionesRepository>();
builder.Services.AddScoped<IRol, RolRepository>();
builder.Services.AddScoped<IUsuario, UsuarioRepository>();
builder.Services.AddScoped<ILoginService, UsuarioRepository>();
builder.Services.AddScoped<IPasswordService, PasswordService>();

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

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SerenaDbContext>();
    db.Database.EnsureCreated();
    db.Database.Migrate();

    if (!db.Rol.Any())
    {
        db.Rol.AddRange(
            new Rol { nombre_rol = "Aprendiz" },
            new Rol { nombre_rol = "Psicólogo" },
            new Rol { nombre_rol = "Administrador" }
        );
        db.SaveChanges();
    }

    if (!db.EstadoDeAnimo.Any())
    {
        db.EstadoDeAnimo.AddRange(
            new EstadoDeAnimo { nombre_estado = "Feliz" },
            new EstadoDeAnimo { nombre_estado = "Calmado" },
            new EstadoDeAnimo { nombre_estado = "Ansioso" },
            new EstadoDeAnimo { nombre_estado = "Triste" },
            new EstadoDeAnimo { nombre_estado = "Motivado" }
        );
        db.SaveChanges();
    }

    if (!db.Usuario.Any())
    {
        var passwordService = app.Services.GetRequiredService<IPasswordService>();
        var seedPassword = builder.Configuration["Auth:Password"]
            ?? Environment.GetEnvironmentVariable("SERENA_SEED_PASSWORD")
            ?? "ChangeMe!123";

        var rolAprendiz = db.Rol.First(r => r.nombre_rol == "Aprendiz");
        var rolPsicologo = db.Rol.First(r => r.nombre_rol == "Psicólogo");

        var usuarios = new[]
        {
            new Usuario { nombre_usuario = "Yonatan Acuña", email = "yacuna@soy.sena.edu.co", contrasena = seedPassword, id_rol = rolAprendiz.id_rol, num_ficha = "3288046", sede = "CMTC", centro = "CMTC", programa_formacion = "ADSO" },
            new Usuario { nombre_usuario = "Josué Tovar", email = "jtovar@soy.sena.edu.co", contrasena = seedPassword, id_rol = rolAprendiz.id_rol, num_ficha = "3288046", sede = "CMTC", centro = "CMTC", programa_formacion = "Textil" },
            new Usuario { nombre_usuario = "Camila Restrepo", email = "crestrepo@soy.sena.edu.co", contrasena = seedPassword, id_rol = rolAprendiz.id_rol, num_ficha = "3288046", sede = "CMTC", centro = "CMTC", programa_formacion = "Patronaje" },
            new Usuario { nombre_usuario = "Dra. Laura Martínez", email = "lmartinez@sena.edu.co", contrasena = seedPassword, id_rol = rolPsicologo.id_rol, num_ficha = "3288046", sede = "CMTC", centro = "CMTC", programa_formacion = "Psicología" },
            new Usuario { nombre_usuario = "Dr. Carlos Pardo", email = "cpardo@sena.edu.co", contrasena = seedPassword, id_rol = rolPsicologo.id_rol, num_ficha = "3288046", sede = "CMTC", centro = "CMTC", programa_formacion = "Orientación Vocacional" }
        };

        foreach (var Usuario in usuarios)
        {
            Usuario.contrasena = passwordService.HashPassword(Usuario.contrasena);
        }

        db.Usuario.AddRange(usuarios);
        db.SaveChanges();
    }

    if (!db.Ficha.Any())
    {
        db.Ficha.AddRange(
            new Ficha { codigo_ficha = "3288046", programa = "ADSO", centro = "CMTC", jornada = "Diurna", estado = true },
            new Ficha { codigo_ficha = "2025001", programa = "Textil", centro = "CMTC", jornada = "Diurna", estado = true }
        );
        db.SaveChanges();
    }

    if (!db.UsuarioFicha.Any())
    {
        var fichaActual = db.Ficha.First(f => f.codigo_ficha == "3288046");
        var aprendices = db.Usuario.Where(u => u.id_rol == db.Rol.First(r => r.nombre_rol == "Aprendiz").id_rol).ToList();
        var psicologos = db.Usuario.Where(u => u.id_rol == db.Rol.First(r => r.nombre_rol == "Psicólogo").id_rol).ToList();

        foreach (var aprendiz in aprendices)
        {
            db.UsuarioFicha.Add(new UsuarioFicha
            {
                id_usuario = aprendiz.id_usuario,
                id_ficha = fichaActual.id_ficha,
                fecha_asignacion = DateTime.UtcNow,
                estado = true
            });
        }

        foreach (var psicologo in psicologos)
        {
            db.UsuarioFicha.Add(new UsuarioFicha
            {
                id_usuario = psicologo.id_usuario,
                id_ficha = fichaActual.id_ficha,
                fecha_asignacion = DateTime.UtcNow,
                estado = true
            });
        }

        db.SaveChanges();
    }

    if (!db.Disponibilidad.Any())
    {
        var psicologos = db.Usuario.Where(u => u.id_rol == db.Rol.First(r => r.nombre_rol == "Psicólogo").id_rol).ToList();
        foreach (var psicologo in psicologos)
        {
            db.Disponibilidad.AddRange(
                new Disponibilidad
                {
                    id_usuario = psicologo.id_usuario,
                    id_rol = psicologo.id_rol,
                    dia_semana = 1,
                    hora_inicio = new TimeSpan(9, 0, 0),
                    hora_fin = new TimeSpan(11, 0, 0),
                    estado = true
                },
                new Disponibilidad
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