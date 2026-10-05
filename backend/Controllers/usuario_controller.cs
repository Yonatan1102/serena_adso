using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UsuarioController : ControllerBase
{
    private readonly Iusuario usuario_repositorie;

    public UsuarioController(Iusuario usuarioRepository) => this.usuario_repositorie = usuarioRepository;

    [HttpGet]
    public async Task<IActionResult> Listarusuario()
    {
        var todos = await usuario_repositorie.Getusuario();
        var usuarios = User.IsInRole("Admin")
            ? todos
            : User.IsInRole("Psicosocial")
                ? todos.Where(usuario => usuario.id_rol == 1).ToList()
                : todos.Where(usuario => usuario.id_rol == 2).ToList();
        usuarios.ForEach(usuario => Sanitizar(usuario));
        return Ok(usuarios);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Obtenerusuario(int id)
    {
        var usuario = await usuario_repositorie.GetusuarioById(id);
        if (usuario is null) return NotFound();
        var callerId = 0;
        if (!User.IsInRole("Admin") &&
            !int.TryParse(User.FindFirstValue("id_usuario"), out callerId))
            return Unauthorized();
        if (!User.IsInRole("Admin") && usuario.id_usuario != callerId &&
            !(User.IsInRole("Psicosocial") && usuario.id_rol == 1) &&
            !(User.IsInRole("Aprendiz") && usuario.id_rol == 2))
            return Forbid();
        return Ok(Sanitizar(usuario));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Crearusuario([FromBody] usuario usuario)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (await usuario_repositorie.BuscarPorCorreo(usuario.email) != null)
            return Conflict(new { mensaje = "El correo ya está registrado." });
        var creado = await usuario_repositorie.Postusuario(usuario);
        return CreatedAtAction(nameof(Obtenerusuario), new { id = creado.id_usuario }, Sanitizar(creado));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizarusuario(int id, [FromBody] usuario usuario)
    {
        if (id != usuario.id_usuario) return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var actualizado = await usuario_repositorie.Putusuario(usuario);
        return actualizado == null ? NotFound() : Ok(Sanitizar(actualizado));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminarusuario(int id) =>
        await usuario_repositorie.Deleteusuario(id) ? NoContent() : NotFound();

    private static usuario Sanitizar(usuario usuario)
    {
        usuario.contrasena = "[protegida]";
        return usuario;
    }
}
