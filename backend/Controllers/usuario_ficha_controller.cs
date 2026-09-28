using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers;

[ApiController]
[Tags("UsuarioFicha")]
[ApiExplorerSettings(GroupName = "UsuarioFicha")]
[Route("api/usuario-ficha")]
public class usuario_ficha_Controller : ControllerBase
{
    private readonly Iusuario_ficha repository;

    public usuario_ficha_Controller(Iusuario_ficha repository) => this.repository = repository;

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await repository.Getusuario_ficha());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await repository.Getusuario_fichaById(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] usuario_ficha value)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (value == null) return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });

        var item = await repository.Postusuario_ficha(value);
        return CreatedAtAction(nameof(Get), new { id = item.id_usuario_ficha }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] usuario_ficha value)
    {
        if (id != value.id_usuario_ficha) return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var item = await repository.Putusuario_ficha(value);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) => await repository.Deleteusuario_ficha(id) ? NoContent() : NotFound();
}
