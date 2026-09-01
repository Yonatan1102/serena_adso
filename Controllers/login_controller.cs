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
    private readonly Iloginservice _loginService;
    private readonly IConfiguration _config;

    public LoginController(Iloginservice loginService, IConfiguration config)
    {
        _loginService = loginService;
        _config = config;
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] usuario usuario)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (await _loginService.BuscarPorCorreo(usuario.email) != null)
            return Conflict(new { mensaje = "El correo ya está registrado." });
            
        var creado = await _loginService.Registrar(usuario);
        creado.contrasena = "[protegida]";
        return Created("api/usuario/" + creado.id_usuario, creado);
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        
        var usuario = await _loginService.ValidarCredenciales(request.correo, request.contrasena);
        if (usuario == null) return Unauthorized(new { mensaje = "Credenciales incorrectas." });

        
        var token = GenerarJwtToken(usuario);

        usuario.contrasena = "[protegida]";
        return Ok(new 
        { 
            token, 
            usuario, 
            mensaje = "Autenticación correcta" 
        });
    }

    private string GenerarJwtToken(usuario usuario)
    {
        var secretKey = _config["Jwt:Key"];
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("id_usuario", usuario.id_usuario.ToString())
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