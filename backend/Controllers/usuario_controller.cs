using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuarioController : ControllerBase
{
    private readonly IUsuario usuario_repositorie;

    public UsuarioController(IUsuario usuarioRepository) => this.usuario_repositorie = usuarioRepository;

    [HttpGet]
    public async Task<IActionResult> Listarusuario()
    {
        var usuarios = await usuario_repositorie.Getusuario();
        usuarios.ForEach(Usuario => Sanitizar(Usuario));
        return Ok(usuarios);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Obtenerusuario(int id)
    {
        var Usuario = await usuario_repositorie.GetusuarioById(id);
        return Usuario == null ? NotFound() : Ok(Sanitizar(Usuario));
    }

    [HttpPost]
    public async Task<IActionResult> Crearusuario([FromBody] Usuario Usuario)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (await usuario_repositorie.BuscarPorCorreo(Usuario.email) != null)
            return Conflict(new { mensaje = "El correo ya está registrado." });
        var creado = await usuario_repositorie.Postusuario(Usuario);
        return CreatedAtAction(nameof(Obtenerusuario), new { id = creado.id_usuario }, Sanitizar(creado));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizarusuario(int id, [FromBody] Usuario Usuario)
    {
        if (id != Usuario.id_usuario) return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var actualizado = await usuario_repositorie.Putusuario(Usuario);
        return actualizado == null ? NotFound() : Ok(Sanitizar(actualizado));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminarusuario(int id) =>
        await usuario_repositorie.Deleteusuario(id) ? NoContent() : NotFound();

    private static Usuario Sanitizar(Usuario Usuario)
    {
        Usuario.contrasena = "[protegida]";
        return Usuario;
    }
}
