using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using WebApplication1;
using WebApplication1.interfaces;
using WebApplication1.models;
using WebApplication1.repositories;
using WebApplication1.services;

var builder = WebApplication.CreateBuilder(args);

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
    throw new InvalidOperationException("Jwt:Key debe contener al menos 32 bytes.");

var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("SERENA_CONNECTION_STRING");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection o SERENA_CONNECTION_STRING antes de iniciar la API.");

// 1. Configuración de la Base de Datos (DbContext)
builder.Services.AddDbContext<serena>(options =>
    options.UseSqlServer(connectionString, sqlServer => sqlServer.EnableRetryOnFailure()));
builder.Services.AddHttpClient<IRecaptchaService, RecaptchaService>();
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<IEmailVerificationService, EmailVerificationService>();
builder.Services.AddScoped<IProgramaRepository, programa_repository>();
builder.Services.AddScoped<IAdminRepository, admin_repository>();
builder.Services.AddScoped<IOrientacionReportRepository, orientacion_report_repository>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
            RoleClaimType = ClaimTypes.Role
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(options =>
    options.AddPolicy("verification", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            AutoReplenishment = true,
            PermitLimit = 20,
            QueueLimit = 0,
            Window = TimeSpan.FromMinutes(1)
        })));

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
                "http://0.0.0.0:3000",
                "http://[::1]:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://0.0.0.0:5173",
                "http://[::1]:5173"
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

    foreach (var nombreRol in new[] { "Aprendiz", "Psicosocial", "Admin" })
    {
        if (!db.rol.Any(item => item.nombre_rol == nombreRol))
            db.rol.Add(new rol { nombre_rol = nombreRol });
    }
    db.SaveChanges();

    const string nombrePrograma = "Análisis y Desarrollo de Software";
    const int idFicha = 3288046;
    const string codigoFicha = "3288046";
    var programa = db.programa.SingleOrDefault(item => item.nombre_programa == nombrePrograma);
    if (programa is null)
    {
        programa = new programa { nombre_programa = nombrePrograma };
        db.programa.Add(programa);
        db.SaveChanges();
    }

    var ficha = db.ficha.SingleOrDefault(item => item.id_ficha == idFicha || item.codigo_ficha == codigoFicha);
    if (ficha is null)
    {
        db.ficha.Add(new ficha
        {
            id_ficha = idFicha,
            codigo_ficha = codigoFicha,
            programa = nombrePrograma,
            id_programa = programa.id_programa,
            centro = "CMTC",
            jornada = "Diurna",
            estado = true
        });
        db.SaveChanges();
    }
    else
    {
        ficha.codigo_ficha = codigoFicha;
        ficha.programa = nombrePrograma;
        ficha.id_programa = programa.id_programa;
        ficha.centro = "CMTC";
        ficha.estado = true;
        db.SaveChanges();
    }

    var adminEmail = builder.Configuration["AdminBootstrap:Email"]?.Trim().ToLowerInvariant();
    var adminPassword = builder.Configuration["AdminBootstrap:Password"];
    if (string.IsNullOrWhiteSpace(adminEmail) != string.IsNullOrWhiteSpace(adminPassword))
        throw new InvalidOperationException("Configura juntos AdminBootstrap:Email y AdminBootstrap:Password.");

    if (!string.IsNullOrWhiteSpace(adminEmail) && !string.IsNullOrWhiteSpace(adminPassword))
    {
        if (adminPassword.Length < 16)
            throw new InvalidOperationException("AdminBootstrap:Password debe tener al menos 16 caracteres.");

        var rolAdmin = db.rol.Single(item => item.nombre_rol == "Admin");
        var adminExistente = db.usuario.SingleOrDefault(item => item.email == adminEmail);
        if (adminExistente is null)
        {
            var admin = new usuario
            {
                nombre_usuario = "Administrador SERENA",
                email = adminEmail,
                contrasena = adminPassword,
                id_rol = rolAdmin.id_rol,
                email_verificado = true
            };
            admin.contrasena = new PasswordHasher<usuario>().HashPassword(admin, adminPassword);
            db.usuario.Add(admin);
            db.SaveChanges();
        }
        else if (adminExistente.id_rol != rolAdmin.id_rol)
        {
            throw new InvalidOperationException("El correo configurado para bootstrap ya pertenece a otro rol.");
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
    });
}

app.UseRouting();
app.UseCors("DevelopmentFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.MapControllers();

app.Run();