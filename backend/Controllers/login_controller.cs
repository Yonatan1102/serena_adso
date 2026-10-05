using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using WebApplication1.interfaces;
using WebApplication1.models;
using WebApplication1.services;
using Microsoft.AspNetCore.RateLimiting;

namespace WebApplication1.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{
    private readonly Iloginservice _loginService;
    private readonly IRecaptchaService _recaptchaService;
    private readonly IEmailVerificationService _emailVerificationService;
    private readonly IProgramaRepository _programaRepository;
    private readonly IConfiguration _config;
    private readonly ILogger<LoginController> _logger;

    public LoginController(
        Iloginservice loginService,
        IRecaptchaService recaptchaService,
        IConfiguration config,
        IEmailVerificationService emailVerificationService,
        IProgramaRepository programaRepository,
        ILogger<LoginController> logger)
    {
        _loginService = loginService;
        _recaptchaService = recaptchaService;
        _config = config;
        _emailVerificationService = emailVerificationService;
        _programaRepository = programaRepository;
        _logger = logger;
    }

    [HttpPost("registrar")]
    [EnableRateLimiting("verification")]
    public async Task<IActionResult> Registrar(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        if (!request.acepta_tratamiento_datos)
            return BadRequest(new { mensaje = "Debes aceptar el tratamiento de datos y el acuerdo de confidencialidad." });
        if (request.id_rol is not (1 or 2))
            return BadRequest(new { mensaje = "El rol seleccionado no es válido." });
        var email = request.email.Trim().ToLowerInvariant();
        var dominioValido = request.id_rol == 1
            ? email.EndsWith("@soy.sena.edu.co", StringComparison.Ordinal)
            : email.EndsWith("@sena.edu.co", StringComparison.Ordinal);
        if (!dominioValido)
            return BadRequest(new { mensaje = request.id_rol == 1
                ? "Los aprendices deben usar su correo @soy.sena.edu.co."
                : "Los profesionales psicosociales deben usar su correo @sena.edu.co." });
        if (request.id_rol == 1 &&
            (!request.id_programa.HasValue || !request.id_ficha.HasValue ||
             !await _programaRepository.IsActiveFichaForProgramAsync(
                 request.id_ficha.Value,
                 request.id_programa.Value,
                 cancellationToken)))
            return BadRequest(new { mensaje = "Selecciona un programa y una ficha activa asociada." });
        if (request.id_rol == 2 && (request.id_programa.HasValue || request.id_ficha.HasValue))
            return BadRequest(new { mensaje = "Solo los aprendices deben seleccionar un programa y una ficha." });
        var captchaFailure = await ValidateRecaptchaAsync(request.recaptchaToken, cancellationToken);
        if (captchaFailure is not null) return captchaFailure;
        if (await _loginService.BuscarPorCorreo(email) != null)
            return Conflict(new { mensaje = "El correo ya está registrado." });

        var usuario = new usuario
        {
            nombre_usuario = request.nombre_usuario.Trim(),
            email = email,
            contrasena = request.contrasena,
            id_rol = request.id_rol,
            id_ficha = request.id_ficha,
            documento = request.documento,
            acepta_tratamiento_datos = true,
            fecha_consentimiento = DateTime.UtcNow,
            email_verificado = false
        };

        var creado = await _loginService.Registrar(usuario);
        creado.contrasena = "[protegida]";
        try
        {
            await _emailVerificationService.IssueCodeAsync(creado, cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogError(exception, "No se pudo iniciar la verificación para {Email}.", creado.email);
            return Problem(
                statusCode: StatusCodes.Status503ServiceUnavailable,
                title: "No fue posible enviar el código de verificación.",
                detail: "La cuenta quedó pendiente de verificación. Reintenta solicitar el código en unos minutos.");
        }
        return Accepted(new { mensaje = "Cuenta creada. Ingresa el código enviado a tu correo para activarla.", correo = creado.email });
    }

    [HttpPost]
    [EnableRateLimiting("verification")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        var captchaFailure = await ValidateRecaptchaAsync(request.recaptchaToken, cancellationToken);
        if (captchaFailure is not null) return captchaFailure;

        var usuario = await _loginService.ValidarCredenciales(request.correo, request.contrasena);
        if (usuario == null)
            return Unauthorized(new { mensaje = "Credenciales incorrectas." });
        if (!usuario.email_verificado)
            return StatusCode(StatusCodes.Status403Forbidden, new { mensaje = "Debes verificar tu correo institucional antes de iniciar sesión." });
        var dominioValido = usuario.id_rol switch
        {
            1 => usuario.email.EndsWith("@soy.sena.edu.co", StringComparison.OrdinalIgnoreCase),
            2 => usuario.email.EndsWith("@sena.edu.co", StringComparison.OrdinalIgnoreCase),
            _ => true
        };
        if (!dominioValido)
            return Unauthorized(new { mensaje = "El correo institucional no corresponde al rol de la cuenta." });

        var token = GenerarJwtToken(usuario);
        usuario.contrasena = "[protegida]";
        return Ok(new { token, usuario, mensaje = "Autenticación correcta" });
    }

    [HttpPost("verificar-correo")]
    [EnableRateLimiting("verification")]
    public async Task<IActionResult> VerificarCorreo(
        [FromBody] VerifyEmailRequest request,
        CancellationToken cancellationToken)
    {
        var captchaFailure = await ValidateRecaptchaAsync(request.recaptchaToken, cancellationToken);
        if (captchaFailure is not null) return captchaFailure;
        if (await _emailVerificationService.VerifyCodeAsync(request.email, request.codigo, cancellationToken))
            return Ok(new { mensaje = "Correo verificado. Ya puedes iniciar sesión." });
        return BadRequest(new { mensaje = "El código no es válido o ya expiró. Solicita uno nuevo." });
    }

    [HttpPost("reenviar-verificacion")]
    [EnableRateLimiting("verification")]
    public async Task<IActionResult> ReenviarVerificacion(
        [FromBody] ResendVerificationRequest request,
        CancellationToken cancellationToken)
    {
        var captchaFailure = await ValidateRecaptchaAsync(request.recaptchaToken, cancellationToken);
        if (captchaFailure is not null) return captchaFailure;
        try
        {
            await _emailVerificationService.ResendCodeAsync(request.email, cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogError(exception, "No se pudo reenviar el código de verificación.");
            return Problem(
                statusCode: StatusCodes.Status503ServiceUnavailable,
                title: "No fue posible enviar el código.",
                detail: "Inténtalo nuevamente más tarde.");
        }
        return Accepted(new { mensaje = "Si existe una cuenta pendiente de verificación, enviaremos un código." });
    }

    [Authorize]
    [HttpPost("cambiar-contrasena")]
    public async Task<IActionResult> CambiarContrasena(
        [FromBody] ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        if (!string.Equals(User.FindFirstValue(ClaimTypes.Email), request.correo, StringComparison.OrdinalIgnoreCase))
            return Forbid();
        if (request.contrasenaActual == request.nuevaContrasena)
            return BadRequest(new { mensaje = "La nueva contraseña debe ser diferente a la actual." });

        var cambioRealizado = await _loginService.CambiarContrasena(
            request.correo,
            request.contrasenaActual,
            request.nuevaContrasena);

        return cambioRealizado
            ? Ok(new { mensaje = "Contraseña actualizada correctamente." })
            : Unauthorized(new { mensaje = "El correo o la contraseña actual no son correctos." });
    }

    private string GenerarJwtToken(usuario usuario)
    {
        var secretKey = _config["Jwt:Key"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var nombreRol = usuario.rol?.nombre_rol ?? string.Empty;
        var rol = nombreRol.Contains("admin", StringComparison.OrdinalIgnoreCase)
            ? "Admin"
            : nombreRol.Contains("psic", StringComparison.OrdinalIgnoreCase)
                ? "Psicosocial"
                : "Aprendiz";

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, usuario.nombre_usuario),
            new Claim(ClaimTypes.Email, usuario.email),
            new Claim(ClaimTypes.Role, rol),
            new Claim("id_usuario", usuario.id_usuario.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<IActionResult?> ValidateRecaptchaAsync(string token, CancellationToken cancellationToken)
    {
        try
        {
            return await _recaptchaService.VerifyAsync(
                token,
                HttpContext.Connection.RemoteIpAddress?.ToString(),
                cancellationToken)
                ? null
                : BadRequest(new { mensaje = "No fue posible validar reCAPTCHA. Inténtalo nuevamente." });
        }
        catch (RecaptchaUnavailableException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                mensaje = "El servicio de validación reCAPTCHA no está disponible. Inténtalo más tarde."
            });
        }
    }
}

public sealed record RegisterRequest
{
    [Required, StringLength(50)]
    public required string nombre_usuario { get; init; }

    [Required, EmailAddress, StringLength(150)]
    public required string email { get; init; }

    [Required, MinLength(8), StringLength(255)]
    public required string contrasena { get; init; }

    [Range(1, 2)]
    public int id_rol { get; init; }

    public int? id_programa { get; init; }

    public int? id_ficha { get; init; }

    [StringLength(30)]
    public string? documento { get; init; }

    [Required]
    public bool acepta_tratamiento_datos { get; init; }

    [Required]
    public required string recaptchaToken { get; init; }
}

public sealed record VerifyEmailRequest
{
    [Required, EmailAddress, StringLength(150)]
    public required string email { get; init; }

    [Required, RegularExpression(@"^\d{6}$")]
    public required string codigo { get; init; }

    [Required]
    public required string recaptchaToken { get; init; }
}

public sealed record ResendVerificationRequest
{
    [Required, EmailAddress, StringLength(150)]
    public required string email { get; init; }

    [Required]
    public required string recaptchaToken { get; init; }
}

public sealed record LoginRequest
{
    [Required, EmailAddress]
    public required string correo { get; init; }

    [Required]
    public required string contrasena { get; init; }

    [Required]
    public required string recaptchaToken { get; init; }
}

public sealed record ChangePasswordRequest
{
    [Required, EmailAddress]
    public required string correo { get; init; }

    [Required]
    public required string contrasenaActual { get; init; }

    [Required, MinLength(8)]
    public required string nuevaContrasena { get; init; }
}
