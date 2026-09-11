using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
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

// 3. Controladores y Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(options => options.AddPolicy("DevelopmentFrontend", policy =>
    policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>())
          .AllowAnyHeader()
          .AllowAnyMethod()));

builder.Services.AddSwaggerGen(c =>
{
    c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
    c.CustomSchemaIds(type => type.FullName);
});

var app = builder.Build();

await SeedDatabaseAsync(app.Services);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
    });
    app.UseCors("DevelopmentFrontend");
}


app.MapControllers();

app.Run();

static async Task SeedDatabaseAsync(IServiceProvider services)
{
    using var scope = services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<serena>();

    await context.Database.MigrateAsync();

    var adminRole = await context.rol.FirstOrDefaultAsync(item => item.nombre_rol == "Administrador");
    if (adminRole == null)
    {
        adminRole = new rol { nombre_rol = "Administrador" };
        context.rol.Add(adminRole);
    }

    var studentRole = await context.rol.FirstOrDefaultAsync(item => item.nombre_rol == "Aprendiz");
    if (studentRole == null)
    {
        studentRole = new rol { nombre_rol = "Aprendiz" };
        context.rol.Add(studentRole);
    }

    await context.SaveChangesAsync();

    var passwordHasher = new PasswordHasher<usuario>();
    var demoUser = await context.usuario.FirstOrDefaultAsync(item => item.email == "demo@serena.local");
    if (demoUser == null)
    {
        demoUser = new usuario
        {
            nombre_usuario = "Usuario Demo",
            email = "demo@serena.local",
            contrasena = "Demo123*",
            id_rol = studentRole.id_rol
        };
        demoUser.contrasena = passwordHasher.HashPassword(demoUser, demoUser.contrasena);
        context.usuario.Add(demoUser);
    }

    var psychologist = await context.usuario.FirstOrDefaultAsync(item => item.email == "psicologia@serena.local");
    if (psychologist == null)
    {
        psychologist = new usuario
        {
            nombre_usuario = "Psicologia Demo",
            email = "psicologia@serena.local",
            contrasena = "Demo123*",
            id_rol = adminRole.id_rol
        };
        psychologist.contrasena = passwordHasher.HashPassword(psychologist, psychologist.contrasena);
        context.usuario.Add(psychologist);
    }

    await context.SaveChangesAsync();

    if (!await context.menu.AnyAsync())
    {
        context.menu.AddRange(
            new menu { nombre_menu = "Inicio" },
            new menu { nombre_menu = "Citas" },
            new menu { nombre_menu = "Diario" });
        await context.SaveChangesAsync();
    }

    var menus = await context.menu.ToListAsync();
    if (!await context.menu_rol.AnyAsync())
    {
        context.menu_rol.AddRange(menus.Select(item => new menu_rol
        {
            id_menu = item.id_menu,
            id_rol = studentRole.id_rol
        }));
    }

    if (!await context.cita.AnyAsync())
    {
        context.cita.Add(new cita
        {
            fecha_hora = DateTime.UtcNow.AddDays(1),
            motivo = "Consulta de seguimiento",
            estado_cita = "pendiente",
            id_usuario_aprendiz = demoUser.id_usuario,
            id_usuario_psicologo = psychologist.id_usuario
        });
    }

    if (!await context.historial_clinico.AnyAsync())
    {
        context.historial_clinico.Add(new historial_clinico
        {
            id_usuario = demoUser.id_usuario,
            num_ficha = "FICHA-DEMO-001",
            fecha_apertura = DateTime.UtcNow,
            condiciones = "Sin condiciones registradas",
            antecedentes = "Registro inicial de demostracion"
        });
    }

    if (!await context.formulario.AnyAsync())
    {
        context.formulario.Add(new formulario
        {
            nombre_formulario = "Formulario de bienestar inicial",
            id_usuario = demoUser.id_usuario
        });
    }

    if (!await context.estado_de_animo.AnyAsync())
    {
        context.estado_de_animo.Add(new estado_de_animo
        {
            nombre_estado = "Tranquilo",
            fecha_estado = DateTime.UtcNow,
            id_usuario = demoUser.id_usuario
        });
    }

    if (!await context.diario.AnyAsync())
    {
        context.diario.Add(new diario
        {
            id_usuario = demoUser.id_usuario,
            fecha_apertura = DateTime.UtcNow,
            compartir_sp = false,
            contenido = "Entrada de diario de demostracion"
        });
    }

    if (!await context.publicaciones.AnyAsync())
    {
        context.publicaciones.Add(new publicaciones
        {
            titulo = "Bienestar emocional",
            contenido = "Recuerda reservar unos minutos para cuidar tu salud mental.",
            fecha_publicacion = DateTime.UtcNow,
            id_usuario = psychologist.id_usuario
        });
    }

    if (!await context.emergencia.AnyAsync())
    {
        context.emergencia.Add(new emergencia
        {
            id_usuario = demoUser.id_usuario,
            fecha_emergencia = DateTime.UtcNow,
            descripcion = "Registro de emergencia de demostracion"
        });
    }

    await context.SaveChangesAsync();

    var citaDemo = await context.cita.FirstOrDefaultAsync(item => item.motivo == "Consulta de seguimiento");
    if (citaDemo != null && !await context.historial_cita.AnyAsync())
    {
        context.historial_cita.Add(new historial_cita
        {
            id_cita = citaDemo.id_cita,
            observaciones_historial = "Cita creada como dato de demostracion",
            fecha_cambio = DateTime.UtcNow
        });
        await context.SaveChangesAsync();
    }
}