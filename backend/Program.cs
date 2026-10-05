using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using WebApplication1;
using WebApplication1.interfaces;
using WebApplication1.models;
using WebApplication1.repositories;
using WebApplication1.services;

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
builder.Services.AddScoped<IAdminRepository, admin_repository>();
builder.Services.AddScoped<IProgramaRepository, programa_repository>();
builder.Services.AddScoped<IOrientacionReportRepository, orientacion_report_repository>();
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<IEmailVerificationService, EmailVerificationService>();
builder.Services.AddHttpClient<IRecaptchaService, RecaptchaService>();

var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32 ||
    string.IsNullOrWhiteSpace(jwtIssuer) || string.IsNullOrWhiteSpace(jwtAudience))
    throw new InvalidOperationException("Configure una clave JWT de al menos 256 bits y Jwt:Issuer/Jwt:Audience antes de iniciar la API.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.Name
        };
    });
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("verification", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(10),
                QueueLimit = 0,
                AutoReplenishment = true
            }));
});
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
    db.Database.Migrate();

    if (!db.rol.Any())
    {
        db.rol.AddRange(
            new rol { nombre_rol = "Aprendiz" },
            new rol { nombre_rol = "Psicosocial" },
            new rol { nombre_rol = "Admin" }
        );
        db.SaveChanges();
    }

    var adminEmail = builder.Configuration["AdminBootstrap:Email"]?.Trim();
    var adminPassword = builder.Configuration["AdminBootstrap:Password"];
    if (!string.IsNullOrWhiteSpace(adminEmail) && !string.IsNullOrWhiteSpace(adminPassword) &&
        !db.usuario.Any(user => user.email == adminEmail))
    {
        if (adminPassword.Length < 16)
            throw new InvalidOperationException("AdminBootstrap:Password debe tener al menos 16 caracteres.");

        var adminRole = db.rol.AsEnumerable().FirstOrDefault(role =>
            role.nombre_rol.Contains("admin", StringComparison.OrdinalIgnoreCase));
        if (adminRole is null)
            throw new InvalidOperationException("No existe un rol administrador para crear la cuenta inicial.");

        var admin = new usuario
        {
            nombre_usuario = "Administrador SERENA",
            email = adminEmail,
            contrasena = adminPassword,
            id_rol = adminRole.id_rol,
            acepta_tratamiento_datos = true,
            fecha_consentimiento = DateTime.UtcNow,
            email_verificado = true
        };
        admin.contrasena = new PasswordHasher<usuario>().HashPassword(admin, adminPassword);
        db.usuario.Add(admin);
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

    if (!db.programa.Any())
    {
        db.programa.AddRange(
            new programa { nombre_programa = "Análisis y Desarrollo de Software" },
            new programa { nombre_programa = "Diseño y Confección Textil" });
        db.SaveChanges();
    }

    if (!db.ficha.Any())
    {
        var programaAdso = db.programa.First(item => item.nombre_programa == "Análisis y Desarrollo de Software");
        var programaTextil = db.programa.First(item => item.nombre_programa == "Diseño y Confección Textil");
        db.ficha.AddRange(
            new ficha { id_ficha = 3288046, codigo_ficha = "3288046", programa = programaAdso.nombre_programa, id_programa = programaAdso.id_programa, centro = "CMTC", jornada = "Diurna", estado = true },
            new ficha { id_ficha = 2025001, codigo_ficha = "2025001", programa = programaTextil.nombre_programa, id_programa = programaTextil.id_programa, centro = "CMTC", jornada = "Diurna", estado = true }
        );
        db.SaveChanges();
    }

    if (!db.usuario_ficha.Any())
    {
        var fichaActual = db.ficha.First(f => f.codigo_ficha == "3288046");
        var aprendices = db.usuario.Where(u => u.id_rol == db.rol.First(r => r.nombre_rol == "Aprendiz").id_rol).ToList();
        var psicologos = db.usuario.Where(u => u.id_rol == db.rol.First(r => r.nombre_rol == "Psicosocial").id_rol).ToList();

        foreach (var aprendiz in aprendices)
        {
            aprendiz.id_ficha = fichaActual.id_ficha;
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
        var psicologos = db.usuario.Where(u => u.id_rol == db.rol.First(r => r.nombre_rol == "Psicosocial").id_rol).ToList();
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
app.UseRateLimiter();
app.UseAuthentication();
app.Use(async (context, next) =>
{
    var isReadOnlyAdminRequest = context.User.IsInRole("Admin") &&
        context.Request.Method is not ("GET" or "HEAD" or "OPTIONS") &&
        !context.Request.Path.Equals("/api/Login/cambiar-contrasena", StringComparison.OrdinalIgnoreCase);
    if (isReadOnlyAdminRequest)
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return;
    }
    await next();
});
app.UseAuthorization();
app.MapControllers();

app.Run();