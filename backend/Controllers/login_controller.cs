using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{
    private readonly ILoginService _loginService;
    private readonly IConfiguration _config;

    public LoginController(ILoginService loginService, IConfiguration config)
    {
        _loginService = loginService;
        _config = config;
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] Usuario Usuario)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (await _loginService.BuscarPorCorreo(Usuario.email) != null)
            return Conflict(new { mensaje = "El correo ya está registrado." });
            
        var creado = await _loginService.Registrar(Usuario);
        creado.contrasena = "[protegida]";
        return Created("api/Usuario/" + creado.id_usuario, creado);
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        
        var Usuario = await _loginService.ValidarCredenciales(request.correo, request.contrasena);
        if (Usuario == null) return Unauthorized(new { mensaje = "Credenciales incorrectas." });

        
        var token = GenerarJwtToken(Usuario);

        Usuario.contrasena = "[protegida]";
        return Ok(new 
        { 
            token, 
            Usuario, 
            mensaje = "Autenticación correcta" 
        });
    }

    [HttpPost("cambiar-contrasena")]
    public async Task<IActionResult> CambiarContrasena([FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
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

    private string GenerarJwtToken(Usuario Usuario)
    {
        var secretKey = _config["Jwt:Key"];
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, Usuario.email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("id_usuario", Usuario.id_usuario.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class LoginRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.EmailAddress]
    public string correo { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    public string contrasena { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.EmailAddress]
    public string correo { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    public string contrasenaActual { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.MinLength(8)]
    public string nuevaContrasena { get; set; } = string.Empty;
}