using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{
    private readonly Iloginservice loginService;

    public LoginController(Iloginservice loginService) => this.loginService = loginService;

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] usuario usuario)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (await loginService.BuscarPorCorreo(usuario.email) != null)
            return Conflict(new { mensaje = "El correo ya está registrado." });
        var creado = await loginService.Registrar(usuario);
        creado.contrasena = "[protegida]";
        return Created("api/usuario/" + creado.id_usuario, creado);
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var usuario = await loginService.ValidarCredenciales(request.correo, request.contrasena);
        if (usuario == null) return Unauthorized(new { mensaje = "Credenciales incorrectas." });
        usuario.contrasena = "[protegida]";
        return Ok(new { usuario, mensaje = "Autenticación correcta" });
    }
}

public sealed class LoginRequest
{
    [Required, EmailAddress]
    public string correo { get; set; } = string.Empty;

    [Required]
    public string contrasena { get; set; } = string.Empty;
}
